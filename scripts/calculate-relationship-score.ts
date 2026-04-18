import fs from "fs";
import path from "path";

export interface RelationshipVariantMetrics {
  hasHeroSummary: boolean;
  hasPattern: boolean;
  hasFiveDimensions: boolean;
  hasCurrentWindow: boolean;
  hasPracticalGuidance: boolean;
  hasPremiumSection: boolean;
  shareModes: number;

  headlineStrength: number;     // 0-20
  patternClarity: number;       // 0-15
  emotionalResonance: number;   // 0-15
  upgradeStrength: number;      // 0-15
}

export function calculateRelationshipScore(m: RelationshipVariantMetrics): number {
  let score = 0;

  score += m.hasHeroSummary ? 10 : 0;
  score += m.hasPattern ? 10 : 0;
  score += m.hasFiveDimensions ? 15 : 0;
  score += m.hasCurrentWindow ? 10 : 0;
  score += m.hasPracticalGuidance ? 10 : 0;
  score += m.hasPremiumSection ? 10 : 0;
  score += Math.min(m.shareModes, 3) * 3;

  score += m.headlineStrength;
  score += m.patternClarity;
  score += m.emotionalResonance;
  score += m.upgradeStrength;

  return score;
}

// Copy quality scoring (core evolution weapon)
export function scoreCopy(text: string): number {
  if (!text) return 0;
  let s = 0;
  if (text.length > 40) s += 5;
  const lower = text.toLowerCase();
  if (lower.includes("you")) s += 5;
  if (lower.includes("but")) s += 5;
  if (lower.includes("because")) s += 5;
  if (lower.includes("feel")) s += 3;
  if (lower.includes("real")) s += 3;
  if (text.includes("?")) s += 2;
  return s;
}

// Auto-collect from current Relationship module
export function collectRelationshipMetrics(): RelationshipVariantMetrics {
  const base = "src/components/relationship";
  const libBase = "src/lib";

  function read(f: string) {
    const p = path.join(process.cwd(), f);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
  }

  const resultFile = read(`${base}/RelationshipResult.tsx`);
  const dimensionFile = read(`${base}/RelationshipDimensionCard.tsx`);
  const engineFile = read(`${libBase}/relationship-engine.ts`);
  const formFile = read(`${base}/RelationshipForm.tsx`);

  const allCopy = [
    ...(resultFile.match(/headline[^;]*['"`](.*?)['"`]/s) || []),
    ...(resultFile.match(/oneLiner[^;]*['"`](.*?)['"`]/s) || []),
    ...(dimensionFile.match(/summary[^;]*['"`](.*?)['"`]/s) || []),
  ];

  const avgHeadline = allCopy.length > 0
    ? Math.min(20, Math.round(allCopy.reduce((a, b) => a + scoreCopy(b), 0) / allCopy.length))
    : 5;

  return {
    hasHeroSummary: /headline|oneLiner/i.test(resultFile),
    hasPattern: /pattern|matchingPattern|relationshipPattern/i.test(resultFile + engineFile),
    hasFiveDimensions: (resultFile.match(/DIMENSION_KEYS|dimension/gi) || []).length > 5,
    hasCurrentWindow: /currentWindow|current.*window|now.*period/i.test(resultFile + engineFile),
    hasPracticalGuidance: /guidance|advice|action/i.test(resultFile + dimensionFile),
    hasPremiumSection: /premium|upgrade.*section|unlock/i.test(resultFile + dimensionFile),
    shareModes: Math.min(3, (resultFile.match(/shareMode|shareSettings|sharePanel/gi) || []).length),

    headlineStrength: avgHeadline,
    patternClarity: /pattern/i.test(resultFile) ? 8 : 3,
    emotionalResonance: /feel|real|connect/i.test(resultFile) ? 10 : 5,
    upgradeStrength: /premium|upgrade|unlock/i.test(resultFile) ? 8 : 4,
  };
}

if (require.main === module) {
  const metrics = collectRelationshipMetrics();
  const score = calculateRelationshipScore(metrics);
  fs.writeFileSync("relationship-score.json", JSON.stringify({ metrics, score }, null, 2));
  console.log("Relationship score:", score);
}
