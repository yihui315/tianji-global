import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('async love report generator contract', () => {
  it('generates the required structured report without deterministic claims', async () => {
    process.env.DATABASE_URL = '';
    const { generateLoveReport } = await import('../lib/love-report-generator');
    const report = await generateLoveReport({
      sessionId: '00000000-0000-4000-8000-000000000001',
      readingMode: 'solo',
    });

    expect(Object.keys(report)).toEqual([
      'summary',
      'karmicPatterns',
      'relationshipDynamics',
      'futureTiming',
      'emotionalCompatibility',
      'actionableGuidance',
      'privateReportLink',
      'disclaimer',
      'generationMeta',
    ]);
    expect(report.actionableGuidance.length).toBeGreaterThanOrEqual(3);
    expect(['ai', 'fallback']).toContain(report.generationMeta.source);

    const serialized = JSON.stringify(report);
    expect(serialized).toContain('self-reflection');
    expect(serialized).not.toMatch(/will happen|guaranteed|destined to|exactly when/i);
  });

  it('exposes report job APIs, polling component, and report_jobs schema', () => {
    const createRoute = read('src/app/api/report-jobs/create/route.ts');
    const getRoute = read('src/app/api/report-jobs/[id]/route.ts');
    const jobs = read('src/lib/report-jobs.ts');
    const poller = read('src/components/love-reading/ReportJobPoller.tsx');
    const migration = read('supabase/migrations/20260507_report_jobs.sql');

    expect(createRoute).toContain('hasEntitlement');
    expect(createRoute).toContain('ensureReportJobForSession');
    expect(createRoute).toContain('runReportJob');
    expect(getRoute).toContain('getReportJob');
    expect(getRoute).toContain('Report is locked');
    expect(jobs).toContain('status:');
    expect(jobs).toContain('generateLoveReport');
    expect(jobs).toContain('getReportJobBySession');
    expect(jobs).toContain('aiCostUSD');
    expect(poller).toContain("fetch(`/api/report-jobs/${jobId}`)");
    expect(poller).toContain('setTimeout');
    expect(poller).toContain('your order is still safe');

    expect(migration).toContain('create table if not exists public.report_jobs');
    expect(migration).toContain('result jsonb');
    expect(migration).toContain('ai_provider text');
    expect(migration).toContain('ai_cost_usd numeric');
    expect(migration).toContain('unique index if not exists report_jobs_session_id_unique_idx');
    expect(migration).toContain('alter table public.report_jobs enable row level security');
  });
});
