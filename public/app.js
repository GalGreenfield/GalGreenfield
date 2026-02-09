const form = document.getElementById("redesign-form");
const statusBox = document.getElementById("status");

const setStatus = (message, type = "info") => {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`.trim();
  statusBox.style.display = "block";
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusBox.style.display = "none";

  const formData = new FormData(form);

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
  } catch (error) {
    setStatus(error.message, "error");
  }
});
