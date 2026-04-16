import fs from "fs";

const manifestPath = "experiments/manifest.json";
const resultPath = process.argv[2] || "ab-result.json";

const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  : { runs: [] };

const result = JSON.parse(fs.readFileSync(resultPath, "utf8"));

const run = {
  id: `rel-ab-${String(manifest.runs.length + 1).padStart(3, "0")}`,
  timestamp: new Date().toISOString(),
  ...result
};

manifest.runs.push(run);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log("Experiment recorded:", run.id);
