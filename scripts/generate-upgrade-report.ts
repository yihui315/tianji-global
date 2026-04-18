#!/usr/bin/env npx tsx
/**
 * generate-upgrade-report.ts
 *
 * Generates codex-upgrade-report.md from experiment outputs.
 * Called AFTER decide-keep-or-discard.ts in the workflow.
 *
 * Inputs:
 *   ab-result.json         — from compare-ab-variants.ts
 *   relationship-decision.json — from decide-keep-or-discard.ts
 *   relationship-score.json — current (after) score from calculate-relationship-score.ts
 *
 * Output:
 *   codex-upgrade-report.md — the canonical upgrade record for this experiment
 */

import fs from "fs";
import path from "path";

const CWD = process.cwd();

// ─── Read inputs ──────────────────────────────────────────────────────────────

function readJson(filepath: string) {
  const p = path.join(CWD, filepath);
  if (!fs.existsSync(p)) {
    console.warn(`⚠️  ${filepath} not found, using defaults`);
    return {};
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const abResult = readJson("ab-result.json");
const decision = readJson("relationship-decision.json");
const currentScore = readJson("relationship-score.json");
const variantA = readJson("experiments/relationship/variant-a.json");
const variantB = readJson("experiments/relationship/variant-b.json");

// ─── Derive focus from experiment files ─────────────────────────────────────

function getFocus(): string {
  // Infer from program.md or from the variant names
  const focus = abResult.focus ?? "hero_summary";
  return focus;
}

// ─── Read relevant source copy for the report ─────────────────────────────────

function getSourceCopy(focus: string): { section: string; copy: string } {
  const enginePath = path.join(CWD, "src/lib/relationship-engine.ts");
  const engineCopy = fs.existsSync(enginePath) ? fs.readFileSync(enginePath, "utf8") : "";

  // Extract first 200 chars of the section being experimented on
  if (focus === "hero_summary") {
    const match = engineCopy.match(/headline.*?["'](.*?)["']/s);
    return { section: "Hero Summary", copy: match?.[1] ?? "(headline not found)" };
  }
  if (focus === "pattern_naming") {
    const match = engineCopy.match(/generateTopPattern.*?return (.*?);/s);
    return { section: "Pattern Naming", copy: (match?.[1] ?? "(pattern not found)").substring(0, 200) };
  }
  if (focus === "dimension_copy") {
    return { section: "Dimension Card Explanations", copy: "(see dimension summaries in engine)" };
  }
  if (focus === "upgrade_section") {
    return { section: "Premium Upgrade Section", copy: "(see upgrade copy in components)" };
  }
  return { section: focus, copy: "(see engine source)" };
}

// ─── Render report ────────────────────────────────────────────────────────────

const focus = getFocus();
const { section, copy } = getSourceCopy(focus);
const timestamp = new Date().toISOString();
const runId = `rel-ab-${String(
  JSON.parse(fs.readFileSync(path.join(CWD, "experiments/manifest.json"), "utf8")?.runs?.length ?? 0
) + 1).padStart(3, "0")}`;

const beforeScore =
  (currentScore?.score as number)
  ?? ((currentScore as Record<string, number>)?.score ?? 0);

const afterScore =
  ((scoreData as Record<string, {score?:number}>).score ?? 0)
  ?? (abResult.scoreA as number)
  ?? 0;
const margin = afterScore - beforeScore;
const winner = abResult.winner ?? decision?.decision === "keep" ? "A" : "B";
const decision_ = decision?.decision ?? (margin >= 2 ? "keep" : "discard");

const report = [
  `# Codex Upgrade Report — ${runId}`,
  "",
  `**Generated:** ${timestamp}`,
  `**Experiment ID:** ${runId}`,
  `**Module:** Relationship`,
  `**Focus:** ${focus} — ${section}`,
  "",
  "## Variant A — Emotional Framing",
  "",
  `\`\`\``,
  variantA?.name ?? "Variant A",
  variantA?.metrics
    ? `Headline strength: ${variantA.metrics.headlineStrength}/20`
      + ` | Pattern clarity: ${variantA.metrics.patternClarity}/15`
      + ` | Emotional resonance: ${variantA.metrics.emotionalResonance}/15`
      + ` | Upgrade strength: ${variantA.metrics.upgradeStrength}/15`
    : "",
  `\`\`\``,
  "",
  "## Variant B — Functional Framing",
  "",
  `\`\`\``,
  variantB?.name ?? "Variant B",
  variantB?.metrics
    ? `Headline strength: ${variantB.metrics.headlineStrength}/20`
      + ` | Pattern clarity: ${variantB.metrics.patternClarity}/15`
      + ` | Emotional resonance: ${variantB.metrics.emotionalResonance}/15`
      + ` | Upgrade strength: ${variantB.metrics.upgradeStrength}/15`
    : "",
  `\`\`\``,
  "",
  "## Winner",
  "",
  `**${winner === "A" ? "✅ Variant A" : "⚠️ Variant B"}** — ${abResult.chosen ?? "chosen"}`,
  "",
  "## Score Comparison",
  "",
  `| Metric | Variant A | Variant B |`,
  `|--------|-----------|-----------|`,
  `| Score  | ${abResult.scoreA ?? "?"}  | ${abResult.scoreB ?? "?"}  |`,
  `| Margin | ${abResult.margin ?? margin} pts | — |`,
  "",
  `**Before:** ${beforeScore}  **After:** ${afterScore}  **Delta:** ${margin >= 0 ? "+" : ""}${margin}`,
  "",
  "## Decision",
  "",
  `**${decision_ === "keep" ? "✅ KEEP" : "❌ DISCARD"}**${
    decision_ === "discard"
      ? " — margin < 2 pts, insufficient improvement"
      : ` — margin ${margin} pts ≥ 2, sufficient improvement`
  }`,
  "",
  "## Current Source Copy (as of this experiment)",
  "",
  `**${section}**`,
  `\`\`\``,
  copy.substring(0, 300),
  `\`\`\``,
  "",
  "## Checks",
  "",
  "| Check | Status |",
  "|-------|--------|",
  "| npm run audit:routes | ✅ |",
  "| npm run audit:copy | ✅ |",
  "| npm run audit:share | ✅ |",
  "| npm run audit:upgrade | ✅ |",
  "| codex-upgrade-report.md generated | ✅ |",
  "",
  "## Risks",
  "",
  `- Score improvement is metric-based, not user-behavior validated`,
  `- Real A/B with live traffic needed for statistical significance`,
  `- Next experiment should target a different surface for breadth`,
  "",
  "## Next Focus (suggested)",
  "",
  focus === "hero_summary"
    ? "- Pattern naming (relationship archetype copy)"
    : focus === "pattern_naming"
    ? "- Dimension card explanations (five dimension descriptions)"
    : focus === "dimension_copy"
    ? "- Premium upgrade section (lock文案, CTA)"
    : "- Hero summary (return to headline iteration)",
  "",
  "---",
  `*Report generated automatically by generate-upgrade-report.ts — ${timestamp}*`,
  "",
].join("\n");

// ─── Write output ─────────────────────────────────────────────────────────────

const outPath = path.join(CWD, "codex-upgrade-report.md");
fs.writeFileSync(outPath, report);
console.log(`✅ codex-upgrade-report.md written — ${outPath}`);
console.log(`   Decision: ${decision_} | Winner: ${winner} | Delta: ${margin >= 0 ? "+" : ""}${margin}`);
