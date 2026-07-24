import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { localizedPublicRoutes } from '@/lib/i18n';

/**
 * T0-016 (SIAS High-Throughput H6, 2026-07-24).
 *
 * Daily Oracle has one canonical /daily-oracle page. It has no [locale]
 * implementation, locale-specific metadata, or hreflang route surface, so
 * hasLocaleVariant must remain unset/false until those pages are real.
 */
describe('T0-016 daily-oracle locale variant contract', () => {
  const repoRoot = process.cwd();
  const i18nSource = fs.readFileSync(path.join(repoRoot, 'src/lib/i18n.ts'), 'utf8');
  const dailyOracleLayout = fs.readFileSync(
    path.join(repoRoot, 'src/app/(main)/daily-oracle/layout.tsx'),
    'utf8'
  );

  it('keeps daily-oracle as a canonical non-localized route', () => {
    const route = localizedPublicRoutes.find((entry) => entry.path === '/daily-oracle');
    expect(route).toBeDefined();
    expect(route?.hasLocaleVariant).toBeFalsy();
    expect(i18nSource).toMatch(/path:\s*['"]\/daily-oracle['"][^\n]*priority:/);
    expect(i18nSource).not.toMatch(/path:\s*['"]\/daily-oracle['"][^\n]*hasLocaleVariant:\s*true/);
  });

  it('has no locale page directory or locale metadata surface to justify a variant', () => {
    expect(fs.existsSync(path.join(repoRoot, 'src/app/[locale]/daily-oracle'))).toBe(false);
    expect(dailyOracleLayout).toContain("canonical: PAGE_URL");
    expect(dailyOracleLayout).not.toContain('absoluteLocalizedAlternates');
    expect(dailyOracleLayout).not.toContain('languages:');
  });
});
