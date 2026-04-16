import fs from "fs";

interface ScoreFile {
  score: number;
}

const BEFORE_PATH = "upgrade-score-before.json";
const AFTER_PATH = "upgrade-score-after.json";

function readScore(path: string): number {
  if (!fs.existsSync(path)) return 0;
  const data: ScoreFile = JSON.parse(fs.readFileSync(path, "utf8"));
  return data.score;
}

const before = readScore(BEFORE_PATH);
const after = readScore(AFTER_PATH);

let decision = "discard";

if (after > before) decision = "keep";

const result = {
  before,
  after,
  decision,
  improved: after > before
};

fs.writeFileSync(
  "upgrade-decision.json",
  JSON.stringify(result, null, 2)
);

console.log(result);

// exit code 控制 CI
if (decision === "discard") {
  console.log("❌ Discarding experiment");
  process.exit(1);
} else {
  console.log("✅ Keeping experiment");
}
