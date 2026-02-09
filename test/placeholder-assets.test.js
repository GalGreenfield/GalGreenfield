const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.join(__dirname, "..");

const requiredAssets = [
  path.join(projectRoot, "data", "placeholder.skp"),
  path.join(projectRoot, "data", "placeholder-preview.svg"),
  path.join(projectRoot, "public", "placeholder-preview.svg"),
];

test("required placeholder assets exist and are non-empty", () => {
  requiredAssets.forEach((assetPath) => {
    assert.ok(fs.existsSync(assetPath), `Missing asset: ${assetPath}`);
    const stats = fs.statSync(assetPath);
    assert.ok(stats.size > 0, `Asset is empty: ${assetPath}`);
  });
});
