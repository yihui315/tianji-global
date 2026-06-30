/**
 * scripts/deepseek-evolution.ts
 * Calls DeepSeek Chat API (OpenAI-compatible endpoint) to run one AB experiment
 * surface for the Relationship module.
 *
 * Usage: DEEPSEEK_API_KEY=sk-... npx tsx scripts/deepseek-evolution.ts
 */

import { readFileSync, writeFileSync, existsSync } from "fs";

const API_KEY = process.env.DEEPSEEK_API_KEY;
if (!API_KEY) {
  console.error("DEEPSEEK_API_KEY env var not set");
  process.exit(1);
}

const BASE_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com";
const MODEL = process.env.MODEL || "deepseek-chat";

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

const USER_PROMPT = `Read AGENTS.md and program.md.

Run one A/B experiment for the Relationship module.

## Your task
Improve the "${SURFACE}" surface in the Relationship module.

## Instructions
1. Read src/lib/relationship-engine.ts
2. Create TWO variants:
   - experiments/relationship/variant-a.json
   - experiments/relationship/variant-b.json
   Each with { name, focus, metrics, copy, reasoning }

3. Run: npx tsx scripts/compare-ab-variants.ts experiments/relationship/variant-a.json experiments/relationship/variant-b.json

4. Run: npx tsx scripts/decide-keep-or-discard.ts

5. If decision === "keep": run npx tsx scripts/apply-winning-copy.ts

6. Run: npx tsx scripts/generate-upgrade-report.ts

## Rules
- Do NOT touch auth, billing, .env, or deployment configs
- Keep changes small, max 5 files
- Run npm run audit:share && npm run audit:copy after changes
- Output ALL required files even if experiment is discarded
`;

async function callDeepSeek(messages: { role: string; content: string }[]): Promise<string> {
  const url = `${BASE_URL}/chat/completions`;
  const body = JSON.stringify({ model: MODEL, messages, temperature: 0.7 });
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body,
  });
  if (!resp.ok) throw new Error(`DeepSeek API error ${resp.status}: ${await resp.text()}`);
  const json = await resp.json() as { choices: { message: { content: string } }[] };
  return json.choices[0]?.message?.content ?? "";
}

async function main() {
  console.log(`Starting DeepSeek evolution run for surface: ${SURFACE}`);
  const messages = [
    { role: "system", content: readFileSync("AGENTS.md", "utf8") },
    { role: "user", content: USER_PROMPT },
  ];
  console.log("Calling DeepSeek API...");
  const response = await callDeepSeek(messages);
  console.log("Response received, length:", response.length);
  writeFileSync("/tmp/deepseek-response.txt", response);
  console.log("Response saved to /tmp/deepseek-response.txt");
  const outputs = [
    "experiments/relationship/variant-a.json",
    "experiments/relationship/variant-b.json",
    "codex-upgrade-report.md",
  ];
  for (const f of outputs) {
    console.log(`  ${existsSync(f) ? "OK" : "MISSING"} ${f}`);
  }
  console.log("Done.");
}

main().catch((err) => { console.error("Fatal:", err.message); process.exit(1); });
