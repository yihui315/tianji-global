#!/usr/bin/env node
/**
 * KPI entry scanner — autonomous-safe, source-side only.
 *
 * Scans `data/*kpi-entry*.csv` files, classifies each row, and writes a JSON
 * report to `.ai/reports/kpi-entry-scan-<date>.json`.
 *
 * Hard rules (from .ai/SIAS_BLOCKED_REGISTRY_20260723.md):
 *   - Rows whose `notes` include `operator_smoke_visit` are NEVER real Go signal.
 *   - Rows whose `paid_smoke_result` is not `not_run` are NEVER real Go signal.
 *   - Rows that are entirely zero across every numeric KPI column are scaffolded
 *     (zero-scaffolded) and NEVER real Go signal.
 *   - "Real KPI Go candidate" = at least one row with non-zero KPI columns,
 *     no smoke marker in notes, and `paid_smoke_result = not_run`.
 *
 * This script is read-only over CSV files and writes only inside `.ai/reports/`.
 * It does not mutate production data, env, secrets, or remote services.
 *
 * Usage:
 *   node scripts/kpi-entry-scanner.mjs
 *   node scripts/kpi-entry-scanner.mjs --date 2026-07-23
 *   node scripts/kpi-entry-scanner.mjs --data-dir data --out-dir .ai/reports
 *
 * Exit code is always 0 — this is a report, not a gate.
 */

import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT_FROM_FILE = join(__filename, '..', '..');
const REPO_ROOT = REPO_ROOT_FROM_FILE;

export const SMOKE_NOTE_MARKERS = ['operator_smoke_visit', 'fake_visit', 'manual_smoke'];
export const NUMERIC_FIELDS_SCHEMA_A = [
  'impressions',
  'clicks',
  'love_test_starts',
  'result_views',
  'share_card_clicks',
  'share_card_downloads',
  'ask_next_clicks',
  'paid_intent_views',
  'preview_submits',
  'unlock_clicks',
  'checkout_blocked',
  'checkout_ready',
];
export const NUMERIC_FIELDS_SCHEMA_B = [
  'impressions',
  'clicks',
  'leads_captured',
  'revenue_usd',
];

export function detectSchema(headers) {
  if (NUMERIC_FIELDS_SCHEMA_A.every((f) => headers.includes(f))) {
    return { id: 'A', numericFields: NUMERIC_FIELDS_SCHEMA_A };
  }
  if (NUMERIC_FIELDS_SCHEMA_B.every((f) => headers.includes(f))) {
    return { id: 'B', numericFields: NUMERIC_FIELDS_SCHEMA_B };
  }
  return { id: 'unknown', numericFields: [] };
}

export function toNumber(value) {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  values.push(current);
  return values;
}

export function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? '';
    });
    return obj;
  });
  return { headers, rows };
}

export function classifyRow(row, schema) {
  const numericValues = schema.numericFields.map((f) => toNumber(row[f]));
  const nonZeroCount = numericValues.filter((v) => v > 0).length;
  const notes = String(row.notes ?? '').toLowerCase();
  const paidSmoke = String(row.paid_smoke_result ?? '').trim();

  const hasSmokeNote = SMOKE_NOTE_MARKERS.some((m) => notes.includes(m));
  const hasPaidSmokeRun = paidSmoke && paidSmoke !== 'not_run';

  if (hasSmokeNote) {
    return { classification: 'smoke_note', nonZeroCount };
  }
  if (hasPaidSmokeRun) {
    return { classification: 'paid_smoke', nonZeroCount };
  }
  if (nonZeroCount === 0) {
    return { classification: 'zero_scaffolded', nonZeroCount };
  }
  return { classification: 'real_candidate', nonZeroCount };
}

export function listKpiEntryFiles(dir) {
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  return entries
    .filter((name) => /kpi-entry.*\.csv$/i.test(name))
    .map((name) => join(dir, name))
    .sort();
}

export function scanFile(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const { headers, rows } = parseCsv(text);
  const schema = detectSchema(headers);
  let zeroScaffolded = 0;
  let smokeNote = 0;
  let paidSmoke = 0;
  let realCandidates = 0;
  let nonZeroTotal = 0;
  for (const row of rows) {
    const { classification, nonZeroCount } = classifyRow(row, schema);
    if (nonZeroCount > 0) nonZeroTotal += 1;
    if (classification === 'zero_scaffolded') zeroScaffolded += 1;
    else if (classification === 'smoke_note') smokeNote += 1;
    else if (classification === 'paid_smoke') paidSmoke += 1;
    else if (classification === 'real_candidate') realCandidates += 1;
  }
  return {
    file: relative(REPO_ROOT, filePath).replaceAll('\\', '/'),
    schema: schema.id,
    headers,
    row_count: rows.length,
    non_zero_rows: nonZeroTotal,
    real_candidate_rows: realCandidates,
    zero_scaffolded_rows: zeroScaffolded,
    smoke_note_rows: smokeNote,
    paid_smoke_rows: paidSmoke,
  };
}

export function buildReport({ dataDir, reportDate, perFile }) {
  const totals = perFile.reduce(
    (acc, f) => {
      acc.row_count += f.row_count;
      acc.non_zero_rows += f.non_zero_rows;
      acc.real_candidate_rows += f.real_candidate_rows;
      acc.zero_scaffolded_rows += f.zero_scaffolded_rows;
      acc.smoke_note_rows += f.smoke_note_rows;
      acc.paid_smoke_rows += f.paid_smoke_rows;
      return acc;
    },
    {
      row_count: 0,
      non_zero_rows: 0,
      real_candidate_rows: 0,
      zero_scaffolded_rows: 0,
      smoke_note_rows: 0,
      paid_smoke_rows: 0,
    }
  );

  const verdict =
    totals.real_candidate_rows > 0 ? 'real_candidate_present' : 'no_real_candidate';

  return {
    scanner: 'kpi-entry-scanner',
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    report_date: reportDate,
    data_dir: relative(REPO_ROOT, dataDir).replaceAll('\\', '/'),
    file_count: perFile.length,
    totals,
    verdict,
    blocked_registry_ref: '.ai/SIAS_BLOCKED_REGISTRY_20260723.md#BLOCKED-005',
    files: perFile,
  };
}

export function resolvePath(value) {
  if (!value) return value;
  if (value.startsWith('/')) return value;
  if (value.startsWith('~')) return value;
  return join(REPO_ROOT, value);
}

export function runScan({ dataDir = 'data', outDir = '.ai/reports', reportDate } = {}) {
  const absDataDir = resolvePath(dataDir);
  const files = listKpiEntryFiles(absDataDir);
  const perFile = files.map(scanFile);
  const date = reportDate || new Date().toISOString().slice(0, 10);
  const report = buildReport({ dataDir: absDataDir, reportDate: date, perFile });

  const absOutDir = resolvePath(outDir);
  mkdirSync(absOutDir, { recursive: true });
  const outPath = join(absOutDir, `kpi-entry-scan-${date}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  return { report, outPath };
}

function arg(name, fallback) {
  const flag = `--${name}`;
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  return process.argv[idx + 1];
}

function isCliEntrypoint() {
  if (typeof process === 'undefined') return false;
  if (!process.argv?.[1]) return false;
  try {
    return fileURLToPath(import.meta.url) === process.argv[1];
  } catch {
    return false;
  }
}

if (isCliEntrypoint()) {
  const DATA_DIR = arg('data-dir', 'data');
  const OUT_DIR = arg('out-dir', '.ai/reports');
  const REPORT_DATE =
    arg('date', null) ||
    process.env.KPI_SCAN_DATE ||
    new Date().toISOString().slice(0, 10);

  const { report, outPath } = runScan({
    dataDir: DATA_DIR,
    outDir: OUT_DIR,
    reportDate: REPORT_DATE,
  });

  process.stdout.write(JSON.stringify(report) + '\n');

  console.error(
    `[kpi-entry-scanner] files=${report.file_count} rows=${report.totals.row_count} real_candidates=${report.totals.real_candidate_rows} verdict=${report.verdict} -> ${relative(
      REPO_ROOT,
      outPath
    ).replaceAll('\\', '/')}`
  );
}