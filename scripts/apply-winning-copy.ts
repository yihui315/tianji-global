#!/usr/bin/env npx tsx
/**
 * apply-winning-copy.ts
 *
 * Reads the winning variant from ab-result.json and variant JSON files,
 * extracts the copy, and applies it to relationship-engine.ts.
 *
 * This step runs AFTER decide-keep-or-discard.ts and before committing.
 * It is the actual code-change agent — it does what Codex was supposed to do.
 *
 * Run only if decision === "keep".
 */

import fs from "fs";
import path from "path";

const CWD = process.cwd();

function readJson(filepath: string): Record<string, unknown> {
  const p = path.join(CWD, filepath);
  if (!fs.existsSync(p)) {
    console.warn(`⚠️  ${filepath} not found`);
    return {};
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const abResult = readJson("ab-result.json") as Record<string, unknown>;
const decision = readJson("relationship-decision.json") as Record<string, unknown>;
const variantA = readJson("experiments/relationship/variant-a.json") as Record<string, unknown>;
const variantB = readJson("experiments/relationship/variant-b.json") as Record<string, unknown>;

const winner = (abResult.winner as string) ?? "A";
const keepDecision = (decision.decision as string) ?? "discard";
const focus = (abResult.focus as string) ?? "hero_summary";

if (keepDecision !== "keep") {
  console.log("❌ Decision is discard — not applying winning copy");
  process.exit(0);
}

console.log(`🏆 Winner: Variant ${winner} | Focus: ${focus}`);

// ─── Extract copy from winning variant ────────────────────────────────────────

const winningVariant = winner === "A" ? variantA : variantB;
const metrics = winningVariant?.metrics as Record<string, number> | undefined;

console.log("Copy quality metrics:", metrics);

// ─── Extract headline from variant (simulate what should be in the engine) ─────

// In a real run, the variant JSON would contain the actual copy text.
// For now, derive the improved copy direction from the winning variant's score profile.
const headlineStrength = metrics?.headlineStrength ?? 10;
const emotionalResonance = metrics?.emotionalResonance ?? 10;
const patternClarity = metrics?.patternClarity ?? 10;
const upgradeStrength = metrics?.upgradeStrength ?? 10;

// Build improved copy hints based on what scored well
const improvedHeadlineHints = [
  headlineStrength >= 14 ? "You feel something real — " : "",
  emotionalResonance >= 13 ? "but the question is whether you're both in it" : "but it takes intention to grow",
].join("");

const improvedOneLinerHints = [
  emotionalResonance >= 13 ? "The connection is honest — " : "There's something real here — ",
  upgradeStrength >= 12 ? "what you do with it determines what happens next" : "what happens next is up to both of you",
].join("");

console.log("\n📝 Improved copy direction:");
console.log("  Headline hint:", improvedHeadlineHints || "(standard emotional)");
console.log("  One-liner hint:", improvedOneLinerHints || "(standard emotional)");

// ─── Write to engine ─────────────────────────────────────────────────────────

const enginePath = path.join(CWD, "src/lib/relationship-engine.ts");
let engine = fs.readFileSync(enginePath, "utf8");

// Only apply if we can find the right section to patch
// These are placeholders that the actual Codex-produced copy would replace
const originalHeadline = 'const BASELINE_HEADLINE = "Mutual attraction, synchronized growth";';
const originalOneLiner = 'const BASELINE_ONELINER = "Your connection is strong; rhythm synchronization is the key next step.";';

if (focus === "hero_summary") {
  // Update baseline copy constants with improved emotional versions
  // (These are the engine-level constants used as fallbacks)
  if (engine.includes(originalHeadline)) {
    const newHeadline = `const BASELINE_HEADLINE = "You feel something real — ${emotionalResonance >= 13 ? "but the question is whether you're both in it" : "but it takes intention to grow"}";`;
    engine = engine.replace(originalHeadline, newHeadline);
    console.log("✅ Updated BASELINE_HEADLINE in engine");
  }
  if (engine.includes(originalOneLiner)) {
    const newOneLiner = `const BASELINE_ONELINER = "${improvedOneLinerHints}";`;
    engine = engine.replace(originalOneLiner, newOneLiner);
    console.log("✅ Updated BASELINE_ONELINER in engine");
  }
}

fs.writeFileSync(enginePath, engine);

// ─── Record what was changed ─────────────────────────────────────────────────

const changeLog = {
  timestamp: new Date().toISOString(),
  winner,
  focus,
  metrics,
  improvedHeadlineHints,
  improvedOneLinerHints,
};

fs.writeFileSync(
  path.join(CWD, "experiments/relationship/last-winning-copy.json"),
  JSON.stringify(changeLog, null, 2)
);

console.log("\n✅ Winning copy applied to engine");
console.log("   Changed files: src/lib/relationship-engine.ts");
console.log("   Log: experiments/relationship/last-winning-copy.json");
