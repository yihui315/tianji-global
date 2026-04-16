import fs from "fs";
import { calculateRelationshipScore, type RelationshipVariantMetrics } from "./calculate-relationship-score";

interface VariantFile {
  name: string;
  metrics: RelationshipVariantMetrics;
}

function readJson(p: string): VariantFile {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const a: VariantFile = readJson(process.argv[2] || "experiments/relationship/variant-a.json");
const b: VariantFile = readJson(process.argv[3] || "experiments/relationship/variant-b.json");

const scoreA = calculateRelationshipScore(a.metrics);
const scoreB = calculateRelationshipScore(b.metrics);

const winner = scoreA >= scoreB ? "A" : "B";

const result = {
  scoreA,
  scoreB,
  winner,
  chosen: winner === "A" ? a.name : b.name,
  nameA: a.name,
  nameB: b.name,
  margin: Math.abs(scoreA - scoreB)
};

fs.writeFileSync("ab-result.json", JSON.stringify(result, null, 2));
console.log(result);
console.log(winner === "A" ? `✅ Variant A wins (${scoreA} vs ${scoreB})` : `✅ Variant B wins (${scoreB} vs ${scoreA})`);
process.exit(0);
