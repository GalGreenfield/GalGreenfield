const form = document.getElementById("redesign-form");
const statusBox = document.getElementById("status");
const previewImage = document.getElementById("preview-image");
const historyList = document.getElementById("history");

let cachedModelFile = null;

const setStatus = (message, type = "info") => {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`.trim();
  statusBox.style.display = "block";
};

const addHistoryItem = (job) => {
  const item = document.createElement("li");
  const title = document.createElement("strong");
  const meta = document.createElement("span");
  const download = document.createElement("a");

  title.textContent = job.prompt;
  meta.textContent = `Job ${job.id} • ${new Date(job.createdAt).toLocaleString()}`;
  meta.className = "meta";
  download.href = job.downloadUrl;
  download.textContent = "Download redesigned model";

  item.append(title, meta, download);

  if (historyList.querySelector(".empty")) {
    historyList.innerHTML = "";
  }

  historyList.prepend(item);
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusBox.style.display = "none";

  const formData = new FormData();
  const fileInput = form.querySelector("input[type='file']");
  const selectedFile = fileInput.files[0];
  const prompt = form.querySelector("textarea[name='prompt']").value.trim();

  if (!prompt) {
    setStatus("Please enter a redesign prompt.", "error");
    return;
  }

  if (selectedFile) {
    cachedModelFile = selectedFile;
  }

  if (!cachedModelFile) {
    setStatus("Upload a SketchUp model before requesting a redesign.", "error");
    return;
  }

  formData.append("model", cachedModelFile);
  formData.append("prompt", prompt);

  try {
    setStatus("Uploading model and generating redesign...");

    const response = await fetch("/api/redesign", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || "Unable to generate redesign.");
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = payload.downloadUrl;
    downloadLink.textContent = "Download redesigned SketchUp model";
    downloadLink.className = "download-link";

    statusBox.innerHTML = "";
    statusBox.append(
      document.createTextNode(`${payload.message} `),
      downloadLink
    );
    statusBox.className = "status";
    statusBox.style.display = "block";

    previewImage.src = payload.previewUrl;

    addHistoryItem({
      id: payload.id,
      prompt,
      createdAt: new Date().toISOString(),
      downloadUrl: payload.downloadUrl,
    });
  } catch (error) {
    setStatus(error.message, "error");
  }
});
