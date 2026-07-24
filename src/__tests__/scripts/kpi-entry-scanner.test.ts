import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  SMOKE_NOTE_MARKERS,
  buildReport,
  classifyRow,
  detectSchema,
  parseCsv,
  parseCsvLine,
  runScan,
  toNumber,
} from '../../../scripts/kpi-entry-scanner.mjs';

/**
 * T0-006 (SIAS High-Throughput H1, 2026-07-23) regression contract.
 *
 * Locks down the KPI entry scanner behaviour so the "is there real KPI Go signal
 * in `data/*kpi-entry*.csv`?" question can never silently flip:
 *
 *   - detectSchema must classify 18-col love-test schema (A) and 9-col compact
 *     schema (B) and refuse unknowns.
 *   - classifyRow must label zero-scaffolded rows (no real Go), smoke-note
 *     rows (operator_smoke_visit / fake_visit / manual_smoke), paid_smoke rows
 *     (paid_smoke_result != not_run), and real_candidate rows.
 *   - runScan must write the report to .ai/reports and reflect totals / verdict.
 *   - The CLI entrypoint must still emit a single JSON line on stdout and a
 *     status line on stderr.
 *
 * Hard rule from .ai/SIAS_BLOCKED_REGISTRY_20260723.md#BLOCKED-005:
 *   the scanner MUST NEVER mark an operator_smoke_visit row as a real candidate.
 */

const SCHEMA_A_HEADERS = [
  'date',
  'channel',
  'content_id',
  'content_type',
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
  'paid_smoke_result',
  'notes',
];

const SCHEMA_B_HEADERS = [
  'date',
  'day',
  'channel',
  'post_type',
  'impressions',
  'clicks',
  'leads_captured',
  'revenue_usd',
  'notes',
];

describe('kpi-entry-scanner schema detection', () => {
  it('classifies the 18-column love-test schema as A', () => {
    const schema = detectSchema(SCHEMA_A_HEADERS);
    expect(schema.id).toBe('A');
    expect(schema.numericFields).toContain('love_test_starts');
    expect(schema.numericFields).toContain('checkout_ready');
  });

  it('classifies the 9-column compact schema as B', () => {
    const schema = detectSchema(SCHEMA_B_HEADERS);
    expect(schema.id).toBe('B');
    expect(schema.numericFields).toContain('leads_captured');
    expect(schema.numericFields).toContain('revenue_usd');
  });

  it('refuses unknown headers instead of guessing', () => {
    const schema = detectSchema(['foo', 'bar', 'baz']);
    expect(schema.id).toBe('unknown');
    expect(schema.numericFields).toEqual([]);
  });
});

describe('kpi-entry-scanner row classification', () => {
  const schemaA = detectSchema(SCHEMA_A_HEADERS);

  it('labels a row with all-zero KPI columns as zero_scaffolded (NOT real_candidate)', () => {
    const row = {
      impressions: '0',
      clicks: '0',
      love_test_starts: '0',
      result_views: '0',
      share_card_clicks: '0',
      share_card_downloads: '0',
      ask_next_clicks: '0',
      paid_intent_views: '0',
      preview_submits: '0',
      unlock_clicks: '0',
      checkout_blocked: '0',
      checkout_ready: '0',
      paid_smoke_result: 'not_run',
      notes: 'manual entry after publish',
    };
    const { classification } = classifyRow(row, schemaA);
    expect(classification).toBe('zero_scaffolded');
  });

  it('labels a row with operator_smoke_visit in notes as smoke_note (NOT real_candidate)', () => {
    const row = {
      impressions: '1200',
      clicks: '88',
      love_test_starts: '40',
      paid_smoke_result: 'not_run',
      notes: 'operator_smoke_visit 2026-06-15 verified entry path',
    };
    const { classification } = classifyRow(row, schemaA);
    expect(classification).toBe('smoke_note');
  });

  it('labels a row with paid_smoke_result != not_run as paid_smoke (NOT real_candidate)', () => {
    const row = {
      impressions: '500',
      clicks: '12',
      love_test_starts: '3',
      paid_smoke_result: 'passed',
      notes: 'verified stripe test paid path',
    };
    const { classification } = classifyRow(row, schemaA);
    expect(classification).toBe('paid_smoke');
  });

  it('labels a clean non-zero row as real_candidate', () => {
    const row = {
      impressions: '200',
      clicks: '15',
      love_test_starts: '4',
      paid_smoke_result: 'not_run',
      notes: 'tiktok organic post 2026-07-22',
    };
    const { classification } = classifyRow(row, schemaA);
    expect(classification).toBe('real_candidate');
  });

  it('blocks every smoke marker from producing a real_candidate classification', () => {
    for (const marker of SMOKE_NOTE_MARKERS) {
      const row = {
        impressions: '999',
        clicks: '99',
        love_test_starts: '10',
        paid_smoke_result: 'not_run',
        notes: `${marker} ${Math.random()}`,
      };
      const { classification } = classifyRow(row, schemaA);
      expect(classification).not.toBe('real_candidate');
    }
  });
});

describe('kpi-entry-scanner parsing helpers', () => {
  it('parses CSV lines with quoted commas correctly', () => {
    const line = '2026-07-01,xiaohongshu,id1,"hello, world",0,0';
    const fields = parseCsvLine(line);
    expect(fields).toEqual(['2026-07-01', 'xiaohongshu', 'id1', 'hello, world', '0', '0']);
  });

  it('parses a full CSV document into headers + rows', () => {
    const csv =
      'date,channel,impressions,notes\n' +
      '2026-07-01,tiktok,0,manual entry\n' +
      '2026-07-02,tiktok,15,organic post\n';
    const { headers, rows } = parseCsv(csv);
    expect(headers).toEqual(['date', 'channel', 'impressions', 'notes']);
    expect(rows).toHaveLength(2);
    expect(rows[1].impressions).toBe('15');
  });

  it('coerces empty / non-numeric values to 0 without NaN', () => {
    expect(toNumber('')).toBe(0);
    expect(toNumber(undefined)).toBe(0);
    expect(toNumber('not-a-number')).toBe(0);
    expect(toNumber('42')).toBe(42);
    expect(toNumber('3.14')).toBeCloseTo(3.14);
  });
});

describe('kpi-entry-scanner report builder', () => {
  it('reports no_real_candidate when every row is zero_scaffolded', () => {
    const perFile = [
      {
        file: 'data/test-001.csv',
        schema: 'A' as const,
        headers: SCHEMA_A_HEADERS,
        row_count: 2,
        non_zero_rows: 0,
        real_candidate_rows: 0,
        zero_scaffolded_rows: 2,
        smoke_note_rows: 0,
        paid_smoke_rows: 0,
      },
    ];
    const report = buildReport({ dataDir: 'data', reportDate: '2026-07-23', perFile });
    expect(report.verdict).toBe('no_real_candidate');
    expect(report.totals.real_candidate_rows).toBe(0);
    expect(report.totals.zero_scaffolded_rows).toBe(2);
    expect(report.blocked_registry_ref).toContain('BLOCKED-005');
  });

  it('flips verdict to real_candidate_present when any real_candidate row appears', () => {
    const perFile = [
      {
        file: 'data/test-002.csv',
        schema: 'A' as const,
        headers: SCHEMA_A_HEADERS,
        row_count: 1,
        non_zero_rows: 1,
        real_candidate_rows: 1,
        zero_scaffolded_rows: 0,
        smoke_note_rows: 0,
        paid_smoke_rows: 0,
      },
    ];
    const report = buildReport({ dataDir: 'data', reportDate: '2026-07-23', perFile });
    expect(report.verdict).toBe('real_candidate_present');
    expect(report.totals.real_candidate_rows).toBe(1);
  });
});

describe('kpi-entry-scanner runScan end-to-end', () => {
  it('writes a report JSON file with totals from a synthetic data directory', () => {
    const tmpRoot = mkdtempSync(join(tmpdir(), 'kpi-scan-test-'));
    const dataDir = join(tmpRoot, 'data');
    const outDir = join(tmpRoot, '.ai', 'reports');
    try {
      mkdirSync(dataDir, { recursive: true });
      const csv =
        SCHEMA_A_HEADERS.join(',') +
        '\n' +
        '2026-07-01,tiktok,id1,post,0,0,0,0,0,0,0,0,0,0,0,0,not_run,manual entry\n' +
        '2026-07-02,tiktok,id2,post,42,7,3,2,1,0,0,0,0,0,0,0,not_run,organic post\n';
      writeFileSync(join(dataDir, 'demo-kpi-entry.csv'), csv, 'utf8');

      const { report, outPath } = runScan({
        dataDir,
        outDir,
        reportDate: '2026-07-23',
      });

      expect(report.file_count).toBe(1);
      expect(report.totals.row_count).toBe(2);
      expect(report.totals.real_candidate_rows).toBe(1);
      expect(report.totals.zero_scaffolded_rows).toBe(1);
      expect(report.verdict).toBe('real_candidate_present');
      expect(report.blocked_registry_ref).toContain('BLOCKED-005');

      const onDisk = JSON.parse(readFileSync(outPath, 'utf8'));
      expect(onDisk.report_date).toBe('2026-07-23');
      expect(onDisk.totals.real_candidate_rows).toBe(1);
    } finally {
      rmSync(tmpRoot, { recursive: true, force: true });
    }
  });

  it('CLI entrypoint emits one JSON line on stdout and a status line on stderr', () => {
    const stdout = execFileSync('node', ['scripts/kpi-entry-scanner.mjs'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });
    const firstLine = stdout.trim().split('\n')[0];
    expect(() => JSON.parse(firstLine)).not.toThrow();
    const parsed = JSON.parse(firstLine);
    expect(parsed.scanner).toBe('kpi-entry-scanner');
    expect(parsed.verdict).toMatch(/no_real_candidate|real_candidate_present/);
    expect(Array.isArray(parsed.files)).toBe(true);
  });
});