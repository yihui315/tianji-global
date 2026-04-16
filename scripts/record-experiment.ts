#!/usr/bin/env npx tsx
/**
 * record-experiment.ts
 *
 * Records an experiment run into experiments/manifest.json.
 * Called AFTER decide-keep-or-discard.ts in the workflow.
 *
 * Reads from:
 *   ab-result.json              — from compare-ab-variants.ts
 *   relationship-decision.json   — from decide-keep-or-discard.ts
 *   relationship-score.json      — (before + current score)
 *   experiments/manifest.json     — existing manifest
 *
 * Writes to:
 *   experiments/manifest.json    — appends a new run entry
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

// ─── Load all sources ─────────────────────────────────────────────────────────

const abResult = readJson("ab-result.json");
const decision = readJson("relationship-decision.json");
const scoreData = readJson("relationship-score.json");

// ─── Determine before/after ──────────────────────────────────────────────────

const beforeScore =
  (scoreData as Record<string, unknown>).before as number
  ?? (scoreData as Record<string, {score?:number}>).metrics
  ? ((scoreData as Record<string, {score?:number}>).score ?? 0)
  : 0;

const afterScore =
  (scoreData as Record<string, unknown>).score as number
  ?? (abResult as Record<string, unknown>).scoreA as number
  ?? 0;

// ─── Load manifest ───────────────────────────────────────────────────────────

const manifestPath = path.join(CWD, "experiments/manifest.json");

interface ManifestRun {
  id: string;
  timestamp: string;
  before?: number;
  after?: number;
  decision?: string;
  focus?: string;
  winner?: string;
  notes?: string;
  scoreA?: number;
  scoreB?: number;
  margin?: number;
  [key: string]: unknown;
}

interface Manifest {
  version?: number;
  module?: string;
  runs: ManifestRun[];
  experimentFaces?: Record<string, string>;
}

let manifest: Manifest;
if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    manifest = { runs: [] };
  }
} else {
  manifest = { runs: [] };
}

// ─── Build run entry ──────────────────────────────────────────────────────────

const runId = `rel-ab-${String(manifest.runs.length + 1).padStart(3, "0")}`;
const decisionStr = (decision as Record<string, string>).decision ?? "discard";
const margin = afterScore - beforeScore;

const run: ManifestRun = {
  id: runId,
  timestamp: new Date().toISOString(),
  before: beforeScore,
  after: afterScore,
  decision: decisionStr,
  focus: (abResult as Record<string, unknown>).focus as string
    ?? (decision as Record<string, unknown>).focus as string
    ?? "hero_summary",
  winner: (abResult as Record<string, unknown>).winner as string
    ?? (decisionStr === "keep" ? "A" : "discarded"),
  notes: (decisionStr === "keep")
    ? `Score improved by ${margin} pts — winning copy committed`
    : `Score improved by ${margin} pts (< 2pt threshold) — experiment discarded`,
  scoreA: abResult && typeof abResult === "object" ? (abResult.scoreA as number) : undefined,
  scoreB: abResult && typeof abResult === "object" ? (abResult.scoreB as number) : undefined,
  margin,
};

// ─── Append and save ──────────────────────────────────────────────────────────

manifest.runs.push(run);

const manifestJson = JSON.stringify(manifest, null, 2);
fs.writeFileSync(manifestPath, manifestJson);

// ─── Output for CI log ────────────────────────────────────────────────────────

console.log(`✅ Experiment recorded: ${runId}`);
console.log(`   Before: ${beforeScore} | After: ${afterScore} | Delta: ${margin >= 0 ? "+" : ""}${margin}`);
console.log(`   Decision: ${decisionStr.toUpperCase()} | Winner: ${run.winner}`);
console.log(`   Total runs in manifest: ${manifest.runs.length}`);
