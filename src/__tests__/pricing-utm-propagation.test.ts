import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * T0-005 (SIAS High-Throughput H3, 2026-07-24) regression contract.
 *
 * Locks down the pricing-page CTA UTM propagation pattern so the
 * deterministic in-product UTM triplet (`utm_source=pricing`,
 * `utm_medium=in_product`, `utm_campaign=organic_funnel_h1`) cannot
 * regress to a bare `?source=pricing` or a missing UTM triplet.
 *
 * Why this matters: the funnel events `pricing_viewed`, `unlock_click`,
 * and `login_started` need an upstream `utm_source` to attribute the
 * visit. The daily-oracle page already uses this pattern (see
 * `src/__tests__/analytics/utm-params.test.ts`); pricing is the next
 * mirror surface.
 *
 * Hard rule from `.ai/SIAS_BLOCKED_REGISTRY_20260723.md#BLOCKED-005`:
 *   No fabricated traffic. UTM values here are in-product surface
 *   labels, not fabricated campaign metrics.
 *
 * Boundaries:
 *   - Does NOT modify PLANS, PRODUCT_CATALOG, stripe.ts, or any
 *     payment/checkout logic.
 *   - Does NOT change prices, currency, or billing intervals.
 *   - Does NOT add any external image / tracking service.
 *   - Does NOT change the OG image contract (still the static
 *     `/api/og?title=Tianji+Love+Pricing&...` URL — no user data).
 */

describe('pricing CTA UTM propagation (T0-005)', () => {
  const pagePath = path.join(
    process.cwd(),
    'src/app/(main)/pricing/page.tsx'
  );

  it('imports buildUtmHref from the shared analytics helper', () => {
    const source = fs.readFileSync(pagePath, 'utf8');

    expect(source).toContain(
      "import { buildUtmHref } from '@/lib/analytics/utm-params'"
    );
  });

  it('threads buildUtmHref through the in-component href() wrapper', () => {
    const source = fs.readFileSync(pagePath, 'utf8');

    // The href() wrapper must wrap buildUtmHref with the pricing surface
    // BEFORE the withLanguageParam layer so the lang param stays at the
    // end of the query string (matches the H1 daily-oracle pattern).
    expect(source).toMatch(/const\s+href\s*=\s*\(path:\s*string\)\s*=>\s*[\s\S]{0,200}?buildUtmHref\([\s\S]{0,80}?source:\s*['"]pricing['"][\s\S]{0,40}?\)/);
    expect(source).toMatch(/withLanguageParam\(buildUtmHref/);
  });

  it('keeps the pricing_viewed, unlock_click, login_started tracking intact (no analytics regression)', () => {
    const source = fs.readFileSync(pagePath, 'utf8');

    // Three funnel events must remain wired so the UTM triplet actually
    // has downstream events to attribute.
    expect(source).toMatch(/trackRevenueFunnelEvent\(['"]pricing_viewed['"]/);
    expect(source).toMatch(/trackRevenueFunnelEvent\(['"]unlock_click['"]/);
    expect(source).toMatch(/trackRevenueFunnelEvent\(['"]login_started['"]/);
  });

  it('does NOT modify PLANS / PRODUCT_CATALOG / stripe imports (price surface locked)', () => {
    const source = fs.readFileSync(pagePath, 'utf8');

    // Pricing source of truth must still be imported from the same place.
    expect(source).toContain("import { PLANS, type PlanId } from '@/lib/stripe'");
    expect(source).toContain("import { PRODUCT_CATALOG } from '@/config/products'");

    // No new Stripe / checkout mutation paths added.
    expect(source).not.toMatch(/import\s+\{[^}]*checkout[^}]*\}\s+from\s+['"]@\/lib\/stripe['"]/);
    expect(source).not.toMatch(/processCheckout|createCheckoutSession|stripe\.(checkout|redirectToCheckout)/);
  });

  it('does NOT modify the OG image URL — still the static pricing OG, no user data', () => {
    const layoutPath = path.join(
      process.cwd(),
      'src/app/(main)/pricing/layout.tsx'
    );
    const layoutSource = fs.readFileSync(layoutPath, 'utf8');

    // The H3 UTM work must not touch the OG contract. The OG image URL
    // remains a hard-coded constant with only title / subtitle / module.
    expect(layoutSource).toContain(
      '/api/og?title=Tianji+Love+Pricing'
    );
    // No user data fields leaked into the OG image.
    expect(layoutSource).not.toMatch(/birthDate|birthTime|birthLocation|birthPlace|timezone/);
  });

  it('does NOT introduce new external tracking / analytics endpoints', () => {
    const source = fs.readFileSync(pagePath, 'utf8');

    // No Segment / Mixpanel / Amplitude / GA / Plausible scripts.
    expect(source).not.toMatch(/segment\.com|mixpanel\.com|amplitude\.com|google-analytics\.com|plausible\.io/);
    // No new fetch to /api/analytics or /api/track.
    expect(source).not.toMatch(/fetch\(['"]\/api\/(analytics|track|telemetry)/);
  });

  it('preserves the existing CTA destinations (no URL rewrites that change where users land)', () => {
    const source = fs.readFileSync(pagePath, 'utf8');

    // The seven CTA destinations from H1 must still appear, unchanged.
    // buildUtmHref only ADDS query parameters; it never rewrites the path.
    const destinations = [
      '/relationship/new', // FinalCta + hero secondary + header nav + footer nav
      '/ask',              // header nav + footer nav
      '/draw',             // header nav + footer nav
      '/pricing',          // header nav (mobile) + footer nav
      '/about',            // header nav + footer nav
      '/login',            // header nav (mobile) + footer nav
      '/legal/privacy',    // footer nav
    ];
    for (const dest of destinations) {
      expect(source).toContain(dest);
    }

    // The `#plans` anchor must still be the primary CTA on the hero.
    expect(source).toContain('<TianjiLoveButton href="#plans">');
  });
});