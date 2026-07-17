import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CONSENT_PREFERENCES,
  createConsentPreferences,
  parseConsentPreferences,
  serializeConsentPreferences,
} from '@/lib/consent';
import { PRODUCT_CATALOG } from '@/config/products';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('AdSense source readiness contract', () => {
  it('defaults optional consent to denied and preserves explicit choices', () => {
    expect(DEFAULT_CONSENT_PREFERENCES).toMatchObject({
      necessary: true,
      analytics: false,
      advertising: false,
    });

    const accepted = createConsentPreferences(true, true, '2026-07-17T00:00:00.000Z');
    expect(parseConsentPreferences(serializeConsentPreferences(accepted))).toEqual(accepted);
    expect(parseConsentPreferences('accepted')).toMatchObject({ analytics: true, advertising: false });
    expect(parseConsentPreferences('invalid')).toBeNull();
  });

  it('offers accept, reject, manage, withdrawal, and a working privacy path', () => {
    const consent = read('src/components/CookieConsent.tsx');
    const rootLayout = read('src/app/layout.tsx');

    expect(consent).toContain('Accept all');
    expect(consent).toContain('Reject non-essential');
    expect(consent).toContain('Manage options');
    expect(consent).toContain('Privacy settings');
    expect(consent).toContain('/legal/privacy');
    expect(rootLayout).toContain("analytics_storage:'denied'");
    expect(rootLayout).toContain("ad_storage:'denied'");
  });

  it('keeps public pricing and checkout contracts on the same catalog', () => {
    expect(PRODUCT_CATALOG.ASK_UNLOCK.amountMinor).toBe(199);
    expect(PRODUCT_CATALOG.DRAW_UNLOCK.amountMinor).toBe(299);
    expect(PRODUCT_CATALOG.PRO_MONTHLY.amountMinor).toBe(999);
    expect(PRODUCT_CATALOG.PRO_YEARLY.amountMinor).toBe(9999);
    expect(PRODUCT_CATALOG.LOVE_PREMIUM_REPORT).toMatchObject({
      amountMinor: 1990,
      availability: 'coming_soon',
    });

    for (const file of [
      'src/lib/ask-question.ts',
      'src/lib/quick-draw.ts',
      'src/lib/stripe.ts',
      'src/lib/love-reading/revenue-contract.ts',
      'src/app/(main)/pricing/page.tsx',
      'src/app/(main)/pricing/layout.tsx',
    ]) {
      expect(read(file), file).toContain('@/config/products');
    }
  });

  it('keeps sitemap CTAs valid and collapses duplicate canonical pages', () => {
    const loveReading = read('src/app/[locale]/love-reading/page.tsx');
    const routeConfig = read('src/lib/i18n.ts');

    expect(loveReading).toContain("`/relationship/new?lang=${locale === 'zh-CN' ? 'zh' : 'en'}`");
    expect(loveReading).not.toContain("getLocalizedPath(locale, '/relationship')");
    expect(routeConfig).not.toContain("{ path: '/privacy-center'");
    expect(routeConfig).toContain("{ path: '/legal/privacy'");
    expect(routeConfig).toContain("{ path: '/legal/terms'");

    expect(read('src/app/[locale]/pricing/page.tsx')).toContain('permanentRedirect(`/pricing?lang=');
    expect(read('src/app/[locale]/privacy/page.tsx')).toContain('permanentRedirect(`/legal/privacy?lang=');
    expect(read('src/app/[locale]/terms/page.tsx')).toContain('permanentRedirect(`/legal/terms?lang=');
  });

  it('keeps AdSense audit in the release gate and Vercel out of CI', () => {
    const packageJson = read('package.json');
    const ci = read('.github/workflows/ci.yml');

    expect(packageJson).toContain('npm run audit:adsense');
    expect(ci).not.toMatch(/vercel/i);
    expect(read('.github/workflows/deploy-us-server.yml')).toContain('npm run release:check');
  });
});
