import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  SITE_ROOT_ASSETS,
  SOURCE_CONTRACTS,
  buildReport,
  isUnclassified,
} from '../../../scripts/sias-self-monitor.mjs';

/**
 * SIAS self-monitor (H2 PR 2) regression contract.
 *
 * Locks the discovery + classification + classification surface so SIAS can
 * keep finding missing site-root assets without waiting for a user to report
 * them, and without ever fabricating green state.
 *
 * Hard rule (from user 2026-07-23 ruling on the ads.txt follow-up):
 *   The monitor classifies and parks missing human_required assets. It does
 *   NOT create empty placeholder files, NOT invent Contact / Apple Team ID,
 *   NOT add a fake App Router fallback to make the report read 0.
 */

describe('sias-self-monitor asset + contract surface', () => {
  it('covers the four site-root assets SIAS expects today', () => {
    const names = SITE_ROOT_ASSETS.map((a) => a.name).sort();
    expect(names).toEqual(
      ['ads.txt', 'apple-app-site-association', 'humans.txt', 'security.txt'].sort()
    );
  });

  it('every missing-asset entry has a classification + resume_signal + (where applicable) a BLOCKED REGISTRY ref', () => {
    for (const asset of SITE_ROOT_ASSETS) {
      expect(['autonomous_actionable', 'human_required', 'infra_blocked', 'unsafe_for_autonomy']).toContain(
        asset.missingClassification
      );
      expect(typeof asset.missingResumeSignal).toBe('string');
      expect(asset.missingResumeSignal.length).toBeGreaterThan(10);
    }
    // The three human-required assets must point at BLOCKED REGISTRY rows so
    // a future SIAS batch can read them.
    const humanRequired = SITE_ROOT_ASSETS.filter((a) => a.missingClassification === 'human_required');
    expect(humanRequired.length).toBe(3);
    for (const a of humanRequired) {
      expect(a.missingBlockedRegistryRef).toMatch(/^BLOCKED-\d{3}$/);
    }
  });

  it('ads.txt formatCheck rejects a body without a valid 1.0.2 triple', () => {
    const ads = SITE_ROOT_ASSETS.find((a) => a.name === 'ads.txt');
    expect(ads?.formatCheck?.('').ok).toBe(false);
    expect(ads?.formatCheck?.('# comment only\n').ok).toBe(false);
    expect(ads?.formatCheck?.('example.com\n').ok).toBe(false);
    expect(ads?.formatCheck?.('example.com, publisher\n').ok).toBe(false);
    const ok = ads?.formatCheck?.('google.com, pub-2913395948188969, DIRECT, f08c47fec0942fa0\n');
    expect(ok?.ok).toBe(true);
  });

  it('apple-app-site-association formatCheck refuses empty body (no fake-green)', () => {
    const aasa = SITE_ROOT_ASSETS.find((a) => a.name === 'apple-app-site-association');
    expect(aasa?.formatCheck?.('').ok).toBe(false);
    expect(aasa?.formatCheck?.('   \n').ok).toBe(false);
    const ok = aasa?.formatCheck?.('{"applinks":{"apps":[],"details":[{"appIDs":["ABCDE12345.com.example.app"],"components":[{"/":"/ios","comment":"Universal Links"}]}]}}\n');
    expect(ok?.ok).toBe(true);
  });

  it('humans.txt formatCheck refuses empty body (no fake-green)', () => {
    const humans = SITE_ROOT_ASSETS.find((a) => a.name === 'humans.txt');
    expect(humans?.formatCheck?.('').ok).toBe(false);
    const ok = humans?.formatCheck?.('/* TEAM */\n  Site: https://tianji.love\n  Thanks: contributors\n');
    expect(ok?.ok).toBe(true);
  });

  it('security.txt formatCheck requires Contact per RFC 9116 when non-empty, refuses empty', () => {
    const sec = SITE_ROOT_ASSETS.find((a) => a.name === 'security.txt');
    expect(sec?.formatCheck?.('').ok).toBe(false);
    expect(sec?.formatCheck?.('hello world\n').ok).toBe(false);
    const ok = sec?.formatCheck?.('Contact: mailto:security@tianji.love\nExpires: 2027-12-31T23:59:59z\n');
    expect(ok?.ok).toBe(true);
  });

  it('covers robots, sitemap, /api/version, /api/health source contracts', () => {
    const names = SOURCE_CONTRACTS.map((c) => c.name).sort();
    expect(names).toEqual(
      ['/api/health route', '/api/version route', 'robots route', 'sitemap route'].sort()
    );
  });
});

describe('sias-self-monitor classification (no fake-green)', () => {
  it('isUnclassified returns true ONLY for autonomous_actionable', () => {
    expect(isUnclassified({ classification: 'autonomous_actionable' })).toBe(true);
    expect(isUnclassified({ classification: 'human_required' })).toBe(false);
    expect(isUnclassified({ classification: 'autonomous_possible_but_blocked_by_missing_content' })).toBe(false);
    expect(isUnclassified({ classification: 'infra_blocked' })).toBe(false);
    expect(isUnclassified({ classification: 'unsafe_for_autonomy' })).toBe(false);
    expect(isUnclassified({ classification: 'known_blocked' })).toBe(false);
  });

  it('buildReport produces 0 fresh unclassified + 0 autonomous_actionable when the BLOCKED REGISTRY covers every human_required item', () => {
    const { report } = buildReport();
    // No fresh unclassified: every missing item is already human_required or
    // autonomous_possible_but_blocked_by_missing_content.
    expect(report.summary.fresh_unclassified_count).toBe(0);
    // No autonomous_actionable items in this initial scan (the four assets and
    // four contracts are either present or human_required).
    expect(report.summary.autonomous_actionable_count).toBe(0);
    // The 6 known-blocked items map 1:1 to BLOCKED-011 / BLOCKED-012 / BLOCKED-013.
    expect(report.summary.known_blocked_count).toBeGreaterThanOrEqual(3);
    // Every BLOCKED REGISTRY reference that appears in issues must be a real
    // entry the registry carries today.
    const refs = new Set(
      report.issues
        .map((i) => i.blocked_registry_ref)
        .filter((r) => r && r.startsWith('BLOCKED-'))
    );
    for (const ref of refs) {
      const registry = readFileSync(join(process.cwd(), '.ai/SIAS_BLOCKED_REGISTRY_20260723.md'), 'utf8');
      expect(registry).toContain(`## ${ref}`);
    }
  });
});

describe('sias-self-monitor CLI entrypoint', () => {
  it('emits one JSON line on stdout, writes both .json + .md reports, exit 0', () => {
    const stdout = execFileSync('node', ['scripts/sias-self-monitor.mjs'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });
    const firstLine = stdout.trim().split('\n')[0];
    expect(() => JSON.parse(firstLine)).not.toThrow();
    const parsed = JSON.parse(firstLine);
    expect(parsed.scanner).toBe('sias-self-monitor');
    expect(parsed.assets.length).toBe(SITE_ROOT_ASSETS.length);
    expect(parsed.contracts.length).toBe(SOURCE_CONTRACTS.length);
    expect(parsed.summary.fresh_unclassified_count).toBe(0);

    const jsonPath = join(process.cwd(), '.ai/reports', `sias-self-monitor-${parsed.report_date}.json`);
    const mdPath = join(process.cwd(), '.ai', `SIAS_SELF_MONITOR_${parsed.report_date}.md`);
    expect(() => JSON.parse(readFileSync(jsonPath, 'utf8'))).not.toThrow();
    const md = readFileSync(mdPath, 'utf8');
    expect(md).toContain('# SIAS Self-Monitor');
    expect(md).toContain('Why no fake-green paths');
  });
});