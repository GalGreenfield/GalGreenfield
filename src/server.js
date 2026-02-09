const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { nanoid } = require("nanoid");

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.originalname.toLowerCase().endsWith(".skp")) {
      return callback(new Error("Only .skp SketchUp files are supported."));
    }
    return callback(null, true);
  },
});

const jobs = new Map();
const placeholderModelPath = path.join(__dirname, "..", "data", "placeholder.skp");
const placeholderPreviewPath = path.join(__dirname, "..", "data", "placeholder-preview.svg");

app.use(express.static(path.join(__dirname, "..", "public")));

const ensureFile = (filePath, description) => {
  if (!fs.existsSync(filePath)) {
    const error = new Error(`${description} is missing at ${filePath}.`);
    error.statusCode = 500;
    throw error;
  }
};

app.post("/api/redesign", upload.single("model"), (req, res, next) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ message: "Prompt is required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "SketchUp model is required." });
    }

    ensureFile(placeholderModelPath, "Placeholder model");
    ensureFile(placeholderPreviewPath, "Placeholder preview");

    const jobId = nanoid();
    const outputFileName = `redesign-${jobId}.skp`;
    const outputFilePath = path.join(__dirname, "..", "data", outputFileName);
    const previewFileName = `preview-${jobId}.svg`;
    const previewFilePath = path.join(__dirname, "..", "data", previewFileName);
    const createdAt = new Date().toISOString();

    fs.copyFileSync(placeholderModelPath, outputFilePath);
    fs.copyFileSync(placeholderPreviewPath, previewFilePath);

    jobs.set(jobId, {
      id: jobId,
      prompt,
      originalFile: req.file.originalname,
      outputFileName,
      previewFileName,
      createdAt,
    });

    return res.status(201).json({
      id: jobId,
      status: "complete",
      createdAt,
      message: "Redesign complete. Download the SketchUp file using the link below.",
      downloadUrl: `/api/download/${jobId}`,
      previewUrl: `/api/preview/${jobId}`,
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ message: "Job not found." });
  }
  return res.json(job);
});

app.get("/api/download/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ message: "Job not found." });
  }

  const filePath = path.join(__dirname, "..", "data", job.outputFileName);
  return res.download(filePath, job.outputFileName);
});

app.get("/api/preview/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ message: "Job not found." });
  }

  const filePath = path.join(__dirname, "..", "data", job.previewFileName);
  return res.sendFile(filePath);
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(err.statusCode || 400).json({ message: err.message || "Something went wrong." });
  }
  return next();
});

app.listen(port, () => {
  console.log(`SketchUp redesign app running on http://localhost:${port}`);
});
