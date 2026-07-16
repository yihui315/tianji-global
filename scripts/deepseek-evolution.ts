/**
 * scripts/deepseek-evolution.ts
 * DeepSeek-powered AB experiment runner for Relationship module.
 * Uses DeepSeek Chat API to generate A/B variants, writes them to disk,
 * then runs the comparison pipeline.
 *
 * Usage: DEEPSEEK_API_KEY=*** npx tsx scripts/deepseek-evolution.ts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { resolve } from "path";

const API_KEY = process.env.DEEPSEEK_API_KEY;
if (!API_KEY) {
  console.error("DEEPSEEK_API_KEY env var not set");
  process.exit(1);
}

const BASE_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com";
const MODEL = process.env.MODEL || "deepseek-chat";
const TMP_DIR = "/tmp/deepseek-evolution";
mkdirSync(TMP_DIR, { recursive: true });

const surfaces = ["hero_summary", "dimension_cards", "pattern_naming", "current_window", "share_card"];

function getNextSurface(): string {
  try {
    const manifest = JSON.parse(readFileSync("experiments/manifest.json", "utf8"));
    const runs = manifest.runs || [];
    const lastFocus = runs.length > 0 ? runs[runs.length - 1].focus : null;
    const lastIdx = surfaces.indexOf(lastFocus ?? "");
    return surfaces[(lastIdx + 1) % surfaces.length];
  } catch {
    return surfaces[0];
  }
}

const SURFACE = getNextSurface();

// ── Helpers ──────────────────────────────────────────────────────────────────

async function callDeepSeek(messages: { role: string; content: string }[]): Promise<string> {
  const url = `${BASE_URL}/chat/completions`;
  const body = JSON.stringify({ model: MODEL, messages, temperature: 0.7 });
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body,
    signal: AbortSignal.timeout(60000), // 60s timeout
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`DeepSeek API error ${resp.status}: ${text}`);
  }
  const json = await resp.json() as { choices: { message: { content: string } }[] };
  return json.choices[0]?.message?.content ?? "";
}

function runCmd(cmd: string, cwd = "."): void {
  console.log(`  $ ${cmd}`);
  try {
    execSync(cmd, { cwd, stdio: "inherit" });
  } catch (e: unknown) {
    const err = e as { status?: number };
    console.warn(`  ⚠ Command exited with code ${err.status}`);
  }
}

function cleanJSON(text: string): string {
  // Remove code fences
  let cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
  // Convert single-quoted keys/values to double-quoted (common LLM mistake)
  cleaned = cleaned.replace(/([{,]\s*)'([^'{}]+)'(\s*:)/g, '$1"$2"$3');   // keys
  cleaned = cleaned.replace(/:(\s*)'([^']*)'(?=[,\s\}])/g, ': "$2"');      // values
  // Remove trailing commas (illegal in JSON)
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  return cleaned;
}

function getSurfaceDescription(surface: string): string {
  const descriptions: Record<string, string> = {
    hero_summary: "Hero Summary: headline, one-liner, and CTA button copy. Max impact, drives upgrade click.",
    dimension_cards: "Five Dimension Cards: titles and descriptions for each dimension. Clarity and tone.",
    pattern_naming: "Pattern Naming: relationship archetype label, one-liner, and tags. Shareability focus.",
    current_window: "Current Window: time expression, urgency, and action guidance. Drives immediate action.",
    share_card: "Share Card: one-liner for social sharing, visual style guidance, emotional intensity.",
  };
  return descriptions[surface] || surface;
}

// ── Variant generation ───────────────────────────────────────────────────────

async function generateVariant(
  variant: "a" | "b",
  focus: string,
  engineContent: string,
): Promise<object> {
  const label = variant.toUpperCase();
  const framing = variant === "a"
    ? "emotional framing — speaks to the heart, uses evocative language"
    : "functional framing — analytical, practical, outcome-oriented";

  const systemPrompt = readFileSync("AGENTS.md", "utf8");

  const userPrompt = `You are running an AB experiment for the TianJi Relationship module.

## Current engine state (src/lib/relationship-engine.ts)
\`\`\`
${engineContent.slice(0, 4000)}
\`\`\`

## Experiment surface: ${focus}
${getSurfaceDescription(focus)}

## Your task
Generate a ${label} variant with ${framing}.

## Output format
Return ONLY a valid JSON object like this (no markdown, no explanation):
{
  "name": "Variant A: Emotional Hero Summary",
  "focus": "${focus}",
  "metrics": {
    "hasHeroSummary": true,
    "hasPattern": true,
    "hasFiveDimensions": true,
    "hasCurrentWindow": true,
    "hasPracticalGuidance": true,
    "hasPremiumSection": true,
    "shareModes": 2,
    "headlineStrength": 18,
    "patternClarity": 14,
    "emotionalResonance": 12,
    "upgradeStrength": 10
  },
  "copy": {
    "headline": "...",
    "oneLiner": "...",
    "cta": "...",
    "patternLabel": "...",
    "dimensionTitles": ["...", "..."],
    "dimensionDescriptions": ["...", "..."],
    "currentWindowText": "...",
    "shareCardText": "..."
  },
  "reasoning": "Why this variant wins on this surface"
}

Rules:
- Focus ONLY on the ${focus} surface
- Do NOT expose birthDate, birthTime, birthLocation, or timezone
- Copy must be in the same language as the engine content
- Output ONLY the JSON object, no code fences, no extra text`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  console.log(`  Calling DeepSeek for Variant ${label}...`);
  let raw: string;
  try {
    raw = await callDeepSeek(messages);
  } catch (e: unknown) {
    const err = e as Error;
    console.error(`  ❌ DeepSeek call failed: ${err.message}`);
    throw e;
  }
  writeFileSync(`${TMP_DIR}/variant-${variant}-raw.txt`, raw);
  console.log(`  Raw response (first 200 chars): ${raw.slice(0, 200).replace(/\n/g, " ")}`);

  const cleaned = cleanJSON(raw);
  console.log(`  Cleaned JSON (first 100 chars): ${cleaned.slice(0, 100).replace(/\n/g, " ")}`);
  try {
    return JSON.parse(cleaned);
  } catch (e: unknown) {
    const err = e as Error;
    const jsonMatch = cleaned.match(/\{[\s\S]+\}/);
    if (jsonMatch) {
      console.log(`  Fallback JSON match succeeded`);
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error(`Variant ${label} JSON parse failed: ${err.message}\nCleaned preview: ${cleaned.slice(0, 300)}`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n========================================`);
  console.log(`DeepSeek Evolution Run | Surface: ${SURFACE}`);
  console.log(`========================================\n`);

  const enginePath = resolve("src/lib/relationship-engine.ts");
  const engineContent = readFileSync(enginePath, "utf8");
  console.log(`Engine loaded: ${engineContent.length} chars\n`);

  mkdirSync("experiments/relationship", { recursive: true });

  console.log(`[1/5] Generating Variant A (emotional)...`);
  const variantA = await generateVariant("a", SURFACE, engineContent);
  writeFileSync("experiments/relationship/variant-a.json", JSON.stringify(variantA, null, 2));
  console.log(`  ✓ Variant A saved\n`);

  console.log(`[2/5] Generating Variant B (functional)...`);
  const variantB = await generateVariant("b", SURFACE, engineContent);
  writeFileSync("experiments/relationship/variant-b.json", JSON.stringify(variantB, null, 2));
  console.log(`  ✓ Variant B saved\n`);

  console.log(`[3/5] Running comparison...`);
  runCmd(`npx tsx scripts/compare-ab-variants.ts experiments/relationship/variant-a.json experiments/relationship/variant-b.json`);

  console.log(`[4/5] Running decision...`);
  runCmd(`npx tsx scripts/decide-keep-or-discard.ts`);

  const decisionFile = "relationship-decision.json";
  if (existsSync(decisionFile)) {
    try {
      const decision = JSON.parse(readFileSync(decisionFile, "utf8"));
      if (decision.decision === "keep") {
        console.log(`[5/5] Applying winning copy...`);
        runCmd(`npx tsx scripts/apply-winning-copy.ts`);
      } else {
        console.log(`[5/5] Decision = discard, skipping apply.`);
      }
    } catch (e: unknown) {
      console.warn(`  Could not read decision file: ${(e as Error).message}`);
    }
  } else {
    console.log(`[5/5] Decision file not found, skipping apply.`);
  }

  console.log(`\n[Final] Generating upgrade report...`);
  runCmd(`npx tsx scripts/generate-upgrade-report.ts`);

  console.log(`\n========================================`);
  console.log(`Output check:`);
  const outputs = [
    "experiments/relationship/variant-a.json",
    "experiments/relationship/variant-b.json",
    "codex-upgrade-report.md",
  ];
  for (const f of outputs) {
    console.log(`  ${existsSync(f) ? "✓" : "✗"} ${f}`);
  }
  console.log(`========================================\n`);
  console.log(`Done.`);
}

main().catch((err) => {
  console.error(`\n❌ Fatal: ${err.message}`);
  process.exit(1);
});