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
    });

    const accepted = createConsentPreferences(true, '2026-07-17T00:00:00.000Z');
    expect(parseConsentPreferences(serializeConsentPreferences(accepted))).toEqual(accepted);
    expect(parseConsentPreferences('accepted')).toMatchObject({ analytics: true });
    expect(parseConsentPreferences(JSON.stringify({
      version: 2,
      necessary: true,
      analytics: true,
      advertising: true,
      updatedAt: '2026-07-16T00:00:00.000Z',
    }))).toEqual({
      version: 3,
      necessary: true,
      analytics: true,
      updatedAt: '2026-07-16T00:00:00.000Z',
    });
    expect(parseConsentPreferences('invalid')).toBeNull();
  });

  it('offers accept, reject, manage, withdrawal, and a working privacy path', () => {
    const consent = read('src/components/CookieConsent.tsx');
    const rootLayout = read('src/app/layout.tsx');

    expect(consent).toContain('Accept analytics');
    expect(consent).toContain('Reject non-essential');
    expect(consent).toContain('Manage options');
    expect(consent).toContain('Privacy settings');
    expect(consent).toContain('/legal/privacy');
    expect(consent).toContain('Google-certified consent provider');
    expect(consent).not.toContain('ad_storage:');
    expect(consent).not.toContain('ad_user_data:');
    expect(consent).not.toContain('ad_personalization:');
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

    expect(read('src/app/[locale]/pricing/page.tsx')).toContain('permanentRedirect(buildRedirectHref(`/pricing?lang=');
    expect(read('src/app/[locale]/privacy/page.tsx')).toContain('permanentRedirect(buildRedirectHref(`/legal/privacy?lang=');
    expect(read('src/app/[locale]/terms/page.tsx')).toContain('permanentRedirect(buildRedirectHref(`/legal/terms?lang=');
  });

  it('keeps AdSense audit in the release gate and Vercel out of CI', () => {
    const packageJson = read('package.json');
    const ci = read('.github/workflows/ci.yml');

    expect(packageJson).toContain('npm run audit:adsense');
    expect(ci).not.toMatch(/vercel/i);
    const deploy = read('.github/workflows/deploy-us-server.yml');
    expect(deploy).toContain('commit_sha:');
    expect(deploy).toContain('test "$REMOTE_MAIN_COMMIT" = "$DEPLOY_COMMIT"');
    expect(deploy).toContain('git checkout --detach "$DEPLOY_COMMIT"');
    expect(deploy).toContain('SERVICE_VERSION_COMMIT=');
    expect(deploy).toContain('SERVICE_VERSION_BUILT_AT=');
    expect(deploy).toContain('npm run release:check');
    expect(deploy).toContain('ADSENSE_AUDIT_BASE_URL=');
    expect(deploy).toContain('ADSENSE_EXPECTED_COMMIT=');
  });

  it('keeps /api/version and /api/health from hard-500ing on missing build metadata', () => {
    // PILOT-001 P2 recovery (2026-07-23): version/health routes must
    // surface degraded status with explicit reasons instead of returning
    // HTTP 500, so smoke probes can distinguish "misconfigured build"
    // from "service fully broken". The full response contract is covered
    // by src/__tests__/api/version-health-route.test.ts.
    const versionRoute = read('src/app/api/version/route.ts');
    const healthRoute = read('src/app/api/health/route.ts');

    // Forbid a literal JS/TS `status: 500` shape (NextResponse options).
    // The narrative mentions of "HTTP 500" in JSDoc are allowed and helpful.
    expect(versionRoute).not.toMatch(/status:\s*500\b/);
    expect(versionRoute).not.toMatch(/NextResponse\.json\([^)]*\{[^}]*status:\s*500/);
    // Status values are produced via a ternary assignment, so we assert
    // the literal strings appear in the source rather than expecting a
    // specific object-literal shape.
    expect(versionRoute).toContain("'ok'");
    expect(versionRoute).toContain("'degraded'");
    expect(versionRoute).toContain('degradedReasons');

    expect(healthRoute).toContain("'ok'");
    expect(healthRoute).toContain("'degraded'");
    expect(healthRoute).toContain('checks:');
  });
});
