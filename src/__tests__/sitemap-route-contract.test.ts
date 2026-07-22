import { describe, expect, it } from 'vitest';
import { localizedPublicRoutes } from '@/lib/i18n';

/**
 * PILOT-001 P2 (2026-07-23) sitemap integrity contract.
 *
 * Locks down the public sitemap composition so the SEO fixes from
 * PR #162 (locale-alias redirects) and the localized-public-routes
 * table stay consistent. Specifically:
 *   - Legal pages have one canonical URL each (no locale variant).
 *   - Love Reading has the expected locale variants (/en and /zh-CN).
 *   - Sitemap never advertises the legacy /privacy-center entry.
 *   - Legacy /[locale]/privacy and /[locale]/terms pages still
 *     redirect to the canonical legal routes.
 */
describe('sitemap composition contract', () => {
  it('registers /legal/privacy and /legal/terms as canonical routes without locale variants', () => {
    const legalPrivacy = localizedPublicRoutes.find((r) => r.path === '/legal/privacy');
    const legalTerms = localizedPublicRoutes.find((r) => r.path === '/legal/terms');

    expect(legalPrivacy).toBeDefined();
    expect(legalTerms).toBeDefined();
    expect(legalPrivacy?.hasLocaleVariant).toBeFalsy();
    expect(legalTerms?.hasLocaleVariant).toBeFalsy();
  });

  it('registers /love-reading with the two locale variants', () => {
    const loveReading = localizedPublicRoutes.find((r) => r.path === '/love-reading');
    expect(loveReading).toBeDefined();
    expect(loveReading?.hasLocaleVariant).toBe(true);
  });

  it('does not advertise the legacy /privacy-center entry', () => {
    const legacy = localizedPublicRoutes.find((r) => r.path === '/privacy-center');
    expect(legacy).toBeUndefined();
  });

  it('keeps canonical landing surfaces free of locale variants', () => {
    const home = localizedPublicRoutes.find((r) => r.path === '/');
    const loveTest = localizedPublicRoutes.find((r) => r.path === '/love-test');
    const pricing = localizedPublicRoutes.find((r) => r.path === '/pricing');

    expect(home?.hasLocaleVariant).toBeFalsy();
    expect(loveTest?.hasLocaleVariant).toBeFalsy();
    expect(pricing?.hasLocaleVariant).toBeFalsy();
  });
});

describe('locale-alias redirect pages still funnel to canonical legal routes', () => {
  it('redirects /[locale]/privacy to /legal/privacy with the right lang hint', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const file = path.join(
      process.cwd(),
      'src/app/[locale]/privacy/page.tsx'
    );
    const source = fs.readFileSync(file, 'utf8');

    expect(source).toContain('permanentRedirect(`/legal/privacy?lang=');
    expect(source).toContain("locale === 'zh-CN' ? 'zh' : 'en'");
  });

  it('redirects /[locale]/terms to /legal/terms with the right lang hint', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const file = path.join(
      process.cwd(),
      'src/app/[locale]/terms/page.tsx'
    );
    const source = fs.readFileSync(file, 'utf8');

    expect(source).toContain('permanentRedirect(`/legal/terms?lang=');
    expect(source).toContain("locale === 'zh-CN' ? 'zh' : 'en'");
  });
});