import fs from "fs";
import path from "path";

export interface RelationshipMetrics {
  hasFiveDimensions: boolean;
  hasPattern: boolean;
  hasCurrentWindow: boolean;
  hasPracticalGuidance: boolean;
  shareModes: number;
  hasPremiumSection: boolean;
  hasStrongCopy: boolean;
}

export function calculateRelationshipScore(m: RelationshipMetrics) {
  let score = 0;

  score += m.hasFiveDimensions ? 20 : 0;
  score += m.hasPattern ? 15 : 0;
  score += m.hasCurrentWindow ? 15 : 0;
  score += m.hasPracticalGuidance ? 10 : 0;
  score += Math.min(m.shareModes, 3) * 5;
  score += m.hasPremiumSection ? 15 : 0;
  score += m.hasStrongCopy ? 20 : 0;

  return score;
}

// Copy quality scoring (core evolution weapon)
export function scoreCopy(text: string): number {
  let score = 0;
  if (!text) return 0;
  if (text.length > 40) score += 5;
  if (text.toLowerCase().includes("you")) score += 5;
  if (text.toLowerCase().includes("but")) score += 5;
  if (text.toLowerCase().includes("because")) score += 5;
  if (text.includes("feel")) score += 3;
  if (text.includes("real")) score += 3;
  if (text.includes("?")) score += 2;
  return score;
}

// Auto-collect metrics from codebase
export function collectRelationshipMetrics(): RelationshipMetrics {
  const base = "src/components/relationship";
  const libBase = "src/lib";

  function exists(f: string) {
    return fs.existsSync(path.join(process.cwd(), f));
  }
  function read(f: string) {
    const p = path.join(process.cwd(), f);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
  }

  const resultFile = read(`${base}/RelationshipResult.tsx`);
  const dimensionFile = read(`${base}/RelationshipDimensionCard.tsx`);
  const engineFile = read(`${libBase}/relationship-engine.ts`);

  const hasFiveDimensions = (resultFile.match(/DIMENSION_KEYS|dimension/g) || []).length > 5;
  const hasPattern = /pattern|matchingPattern|relationshipPattern/i.test(resultFile + engineFile);
  const hasCurrentWindow = /currentWindow|current.*window|now.*period/i.test(resultFile + engineFile);
  const hasPracticalGuidance = /guidance|advice|action.*item/i.test(resultFile + dimensionFile);
  const shareModes = (resultFile.match(/shareMode|shareSettings|sharePanel/i) || []).length;
  const hasPremiumSection = /premium|upgrade.*section|unlock/i.test(resultFile + dimensionFile);

  // Score all copy blocks
  const allCopy = [
    ...(resultFile.match(/summary\.(headline|oneLiner|keywords)/g) || []),
    ...(dimensionFile.match(/data\.(summary|label|description)/g) || []),
  ];
  const hasStrongCopy = allCopy.length >= 4;

  return {
    hasFiveDimensions,
    hasPattern,
    hasCurrentWindow,
    hasPracticalGuidance,
    shareModes,
    hasPremiumSection,
    hasStrongCopy,
  };
}

// CLI
if (require.main === module) {
  const metrics = collectRelationshipMetrics();
  const score = calculateRelationshipScore(metrics);

  fs.writeFileSync(
    "relationship-score.json",
    JSON.stringify({ metrics, score }, null, 2)
  );

  console.log("Relationship score:", score);
}
