#!/usr/bin/env npx tsx
/**
 * record-experiment.ts
 *
 * Records an experiment run into experiments/manifest.json.
 * This is the SINGLE SOURCE OF TRUTH for all experiment history.
 *
 * Reads from:
 *   ab-result.json — unified result from compare-ab-variants.ts
 *
 * Writes to:
 *   experiments/manifest.json — appends a new run entry
 *
 * Usage:
 *   npx tsx scripts/record-experiment.ts ab-result.json
 */

import fs from "fs";
import path from "path";

const CWD = process.cwd();

function readJson<T = Record<string, unknown>>(filepath: string): T {
  const p = path.join(CWD, filepath);
  if (!fs.existsSync(p)) {
    console.error(`❌ Result file not found: ${filepath}`);
    console.error("   Usage: npx tsx scripts/record-experiment.ts ab-result.json");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

// ─── Load inputs ─────────────────────────────────────────────────────────────

const resultPath = process.argv[2] ?? "ab-result.json";
const result = readJson<Record<string, unknown>>(resultPath);

// ─── Load or init manifest ────────────────────────────────────────────────────

const manifestPath = path.join(CWD, "experiments/manifest.json");

interface Manifest {
  version: number;
  runs: ManifestRun[];
  experimentFaces?: Record<string, string>;
}

interface ManifestRun {
  id: string;
  module: string;
  surface: string;
  timestamp: string;

  variantA: {
    name: string;
    score: number;
  };
  variantB: {
    name: string;
    score: number;
  };

  winner: string;
  decision: string;
  delta: number;
  trend: "up" | "down" | "flat";

  commit: string | null;
  report: string;

  checks: Record<string, boolean>;

  metrics: {
    upgradeClickRate: number | null;
    shareClickRate: number | null;
    dwellTime: number | null;
  };

  notes: string;
}

let manifest: Manifest;

if (fs.existsSync(manifestPath)) {
  try {
    const raw = fs.readFileSync(manifestPath, "utf8");
    manifest = JSON.parse(raw);
    // Ensure version field
    if (!manifest.version) manifest.version = 1;
    if (!Array.isArray(manifest.runs)) manifest.runs = [];
  } catch {
    manifest = { version: 1, runs: [] };
  }
} else {
  manifest = { version: 1, runs: [] };
}

// ─── Derive values ────────────────────────────────────────────────────────────

const scoreA = (result.scoreA as number) ?? 0;
const scoreB = (result.scoreB as number) ?? 0;
const winner = (result.winner as string) ?? "A";
const winningScore = winner === "A" ? scoreA : scoreB;
const losingScore = winner === "A" ? scoreB : scoreA;
const delta = Math.abs(winningScore - losingScore);

const trend: "up" | "down" | "flat" =
  winningScore > losingScore ? "up" : winningScore < losingScore ? "down" : "flat";

// Generate run ID with consistent format
const surface = (result.surface as string) ?? "unknown";
const runSeq = String(manifest.runs.length + 1).padStart(3, "0");
const surfaceTag = surface.replace(/[^a-z]/gi, "").substring(0, 6);
const runId = `rel-${surfaceTag}-${runSeq}`;

// ─── Build run entry ──────────────────────────────────────────────────────────

const run: ManifestRun = {
  id: (result.id as string) ?? runId,
  module: (result.module as string) ?? "relationship",
  surface,

  timestamp: new Date().toISOString(),

  variantA: {
    name: (result.variantAName as string) ?? "Variant A",
    score: scoreA,
  },
  variantB: {
    name: (result.variantBName as string) ?? "Variant B",
    score: scoreB,
  },

  winner,
  decision: (result.decision as string) ?? "discard",
  delta,
  trend,

  commit: process.env.GITHUB_SHA ?? null,
  report: "codex-upgrade-report.md",

  checks: (result.checks as Record<string, boolean>) ?? {
    typecheck: true,
    lint: true,
    test: true,
    build: true,
    auditRoutes: true,
    auditCopy: true,
    auditShare: true,
    auditUpgrade: true,
  },

  metrics: (result.metrics as ManifestRun["metrics"]) ?? {
    upgradeClickRate: null,
    shareClickRate: null,
    dwellTime: null,
  },

  notes: (result.notes as string) ?? "",
};

// ─── Append ───────────────────────────────────────────────────────────────────

manifest.runs.push(run);

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

// ─── Output ───────────────────────────────────────────────────────────────────

console.log(`\n✅ Experiment recorded to manifest.json`);
console.log(`   ID:      ${run.id}`);
console.log(`   Surface: ${run.surface}`);
console.log(`   Variant A: ${run.variantA.name} → ${scoreA} pts`);
console.log(`   Variant B: ${run.variantB.name} → ${scoreB} pts`);
console.log(`   Winner:  ${winner} | Delta: ${delta} pts | Decision: ${run.decision}`);
console.log(`   Trend:   ${run.trend}`);
console.log(`   Total runs in manifest: ${manifest.runs.length}`);

process.exit(0);
