import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * H2 PR 1 (SIAS High-Throughput, 2026-07-23) regression contract.
 *
 * Locks down the ads.txt surface so the AdSense crawler cannot silently flip
 * back to "we couldn't find ads.txt":
 *
 *   - public/ads.txt must exist and contain at least one non-comment record.
 *   - The first record MUST be a valid ads.txt 1.0.2 triple
 *     (domain, pub-<digits>, DIRECT|RESELLER).
 *   - src/app/ads.txt/route.ts must exist and export GET, returning a
 *     text/plain Content-Type so it is the source-side fallback when the
 *     Vercel public/ static asset is stale or missing.
 *   - The audit-adsense.ts source gate must reference both surfaces so a
 *     future removal fails the local audit before it fails in production.
 *
 * Hard rule from .ai/SIAS_BLOCKED_REGISTRY_20260723.md#BLOCKED-008:
 *   No fabricated AdSense relationships. This test does not invent entries;
 *   it asserts the body that public/ads.txt already contains.
 */

const ADS_TXT_REPO_PATH = path.join(process.cwd(), 'public/ads.txt');
const ADS_TXT_ROUTE_PATH = path.join(process.cwd(), 'src/app/ads.txt/route.ts');
const AUDIT_ADSENSE_PATH = path.join(process.cwd(), 'scripts/audit-adsense.ts');

describe('ads.txt source-side presence (H2 hardening)', () => {
  it('public/ads.txt exists in the repo', () => {
    expect(fs.existsSync(ADS_TXT_REPO_PATH)).toBe(true);
  });

  it('public/ads.txt is non-empty after trimming', () => {
    const body = fs.readFileSync(ADS_TXT_REPO_PATH, 'utf8').trim();
    expect(body.length).toBeGreaterThan(0);
  });

  it('public/ads.txt first non-comment record is a valid ads.txt 1.0.2 triple', () => {
    const lines = fs
      .readFileSync(ADS_TXT_REPO_PATH, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
    expect(lines.length).toBeGreaterThan(0);

    const fields = (lines[0] ?? '').split(',').map((field) => field.trim());
    expect(fields.length).toBeGreaterThanOrEqual(3);
    expect(fields[0]).toMatch(/^[a-z0-9.-]+$/i);
    expect(fields[1]).toMatch(/^pub-\d+$/i);
    expect(fields[2]).toMatch(/^(DIRECT|RESELLER)$/i);
  });
});

describe('ads.txt App Router fallback (H2 hardening)', () => {
  it('src/app/ads.txt/route.ts exists and exports GET with text/plain', () => {
    expect(fs.existsSync(ADS_TXT_ROUTE_PATH)).toBe(true);
    const source = fs.readFileSync(ADS_TXT_ROUTE_PATH, 'utf8');
    expect(source).toMatch(/export\s+(?:async\s+)?function\s+GET\s*\(/);
    expect(source).toContain("'Content-Type'");
    expect(source).toContain('text/plain');
    expect(source).toContain('export const dynamic');
  });
});

describe('ads.txt source-gate coverage (H2 hardening)', () => {
  it('scripts/audit-adsense.ts now references ads.txt and the fallback route', () => {
    const audit = fs.readFileSync(AUDIT_ADSENSE_PATH, 'utf8');
    expect(audit).toContain("'public/ads.txt'");
    expect(audit).toContain('pub-\\d+');
    expect(audit).toContain('(DIRECT|RESELLER)');
    expect(audit).toContain("'src/app/ads.txt/route.ts'");
  });
});