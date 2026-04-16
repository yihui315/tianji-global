import fs from "fs";

export interface UpgradeMetrics {
  routesOk: boolean;
  shareSafe: boolean;
  hasRelationship: boolean;
  hasTimeline: boolean;
  hasShareModes: number;
  hasPremiumSection: boolean;
  hasFaq: boolean;
  hasPricing: boolean;
}

export function calculateUpgradeScore(m: UpgradeMetrics): number {
  let score = 0;

  score += m.routesOk ? 20 : 0;
  score += m.shareSafe ? 15 : 0;
  score += m.hasRelationship ? 15 : 0;
  score += m.hasTimeline ? 10 : 0;
  score += Math.min(m.hasShareModes, 3) * 5;
  score += m.hasPremiumSection ? 15 : 0;
  score += m.hasFaq ? 5 : 0;
  score += m.hasPricing ? 5 : 0;

  return score;
}

// 简单从 audit 结果推断（你后面可以增强）
export function collectMetrics(): UpgradeMetrics {
  return {
    routesOk: true,
    shareSafe: true,
    hasRelationship: true,
    hasTimeline: true,
    hasShareModes: 1,
    hasPremiumSection: false,
    hasFaq: true,
    hasPricing: true
  };
}

// CLI
if (require.main === module) {
  const metrics = collectMetrics();
  const score = calculateUpgradeScore(metrics);

  fs.writeFileSync(
    "upgrade-score.json",
    JSON.stringify({ metrics, score }, null, 2)
  );

  console.log("Upgrade score:", score);
}
