import fs from "fs";

interface ScoreFile {
  score: number;
}

const BEFORE_PATH = "relationship-score-before.json";
const AFTER_PATH = "relationship-score-after.json";

function readScore(path: string): number {
  if (!fs.existsSync(path)) return 0;
  const data: ScoreFile = JSON.parse(fs.readFileSync(path, "utf8"));
  return data.score;
}

const before = readScore(BEFORE_PATH);
const after = readScore(AFTER_PATH);

// Prevent fake improvements — must improve by at least 2 points
let decision = "discard";
if (after > before + 1) decision = "keep";

const result = {
  before,
  after,
  decision,
  improved: after > before + 1,
  margin: after - before
};

fs.writeFileSync(
  "relationship-decision.json",
  JSON.stringify(result, null, 2)
);

console.log(result);

// exit code controls CI
if (decision === "discard") {
  console.log("❌ Discarding experiment (margin < 2)");
  process.exit(1);
} else {
  console.log("✅ Keeping experiment");
}
