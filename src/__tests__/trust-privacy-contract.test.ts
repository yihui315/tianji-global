import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function exists(relativePath: string) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

describe('trust and privacy foundation contract', () => {
  it('blocks deterministic trust copy and strips sensitive analytics fields', async () => {
    const guard = await import('../lib/trust-copy-guard');

    expect(() => guard.assertSafeTrustCopy('Discover patterns. Make clearer relationship choices.')).not.toThrow();
    expect(() => guard.assertSafeTrustCopy('We predict your future.')).toThrow(/guaranteed/i);
    expect(() => guard.assertSafeTrustCopy('Find your soulmate.')).toThrow(/guaranteed/i);
    expect(() => guard.assertSafeTrustCopy('This is medical advice.')).toThrow(/professional/i);

    const sanitized = guard.sanitizeAnalyticsPayload({
      event: 'started',
      birthTime: '09:30',
      birth_place: 'Paris',
      relationshipAnswers: 'raw private answer',
      safeLabel: 'love-funnel',
      score: 42,
    });

    expect(sanitized).toEqual({ event: 'started', safeLabel: 'love-funnel', score: 42 });
  });

  it('adds consent and privacy request tables with RLS', () => {
    const migration = read('supabase/migrations/20260507_trust_privacy.sql');
    const analyticsMigration = read('supabase/migrations/20260416_analytics_events.sql');

    expect(migration).toContain('create table if not exists public.consent_records');
    expect(migration).toContain('create table if not exists public.deletion_requests');
    expect(migration).toContain('request_type');
    expect(migration).toContain('alter table public.consent_records enable row level security');
    expect(migration).toContain('alter table public.deletion_requests enable row level security');
    expect(analyticsMigration).toContain('alter table analytics_events enable row level security');
  });

  it('adds privacy center, request APIs, disclaimer component, and guarded analytics', () => {
    [
      'src/app/(main)/privacy-center/page.tsx',
      'src/app/api/privacy/export-request/route.ts',
      'src/app/api/privacy/deletion-request/route.ts',
      'src/components/trust/Disclaimer.tsx',
    ].forEach((relativePath) => expect(exists(relativePath), `${relativePath} should exist`).toBe(true));

    const page = read('src/app/(main)/privacy-center/page.tsx');
    const exportRoute = read('src/app/api/privacy/export-request/route.ts');
    const deletionRoute = read('src/app/api/privacy/deletion-request/route.ts');
    const analyticsRoute = read('src/app/api/analytics/track/route.ts');
    const disclaimer = read('src/components/trust/Disclaimer.tsx');

    expect(page).toContain('/api/privacy/export-request');
    expect(page).toContain('/api/privacy/deletion-request');
    expect(exportRoute).toContain("requestType: 'export'");
    expect(deletionRoute).toContain("requestType: 'deletion'");
    expect(analyticsRoute).toContain('sanitizeAnalyticsPayload');
    expect(disclaimer).toContain('self-reflection');
    expect(disclaimer).toContain('not medical, legal, or financial advice');
  });

  it('prevents birth data from public relationship share payloads', () => {
    const shareRoute = read('src/app/api/relationship/share/route.ts');

    expect(shareRoute).toContain('sanitizeRelationshipSharePayload');
    expect(shareRoute).toContain('includeBirthData: false');
    expect(shareRoute).not.toContain('includeBirthData: shareSettings?.includeBirthData');
  });
});
