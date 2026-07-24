import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * T0-012 (SIAS High-Throughput H4, 2026-07-24) regression contract.
 *
 * Locks the pricing-page funnel-event `surface` payload values to the
 * canonical labels exported from `src/lib/analytics/pricing-surface.ts`.
 * Before H4, the pricing page used bare string literals
 * (`'pricing_page'`, `'pricing_plan'`, `'pricing_plan_click'`) in
 * three different call sites. A typo in any one of them would silently
 * break attribution without breaking the build.
 *
 * This contract enforces:
 *   1. `src/lib/analytics/pricing-surface.ts` exports the four
 *      constants used downstream (PRICING_UTM_SOURCE,
 *      PRICING_UTM_CAMPAIGN, PRICING_UTM_MEDIUM,
 *      PRICING_SURFACE_LABELS).
 *   2. `src/app/(main)/pricing/page.tsx` does NOT contain bare string
 *      literals for the three funnel-event surfaces (it must import
 *      from `pricing-surface.ts`).
 *   3. `src/app/(main)/pricing/page.tsx` does NOT contain a bare
 *      `'pricing'` literal in its `buildUtmHref` call (it must import
 *      `PRICING_UTM_SOURCE`).
 *   4. The four constants have the expected values, so downstream
 *      classification keeps working.
 *   5. The funnel surface labels are distinct from the UTM source
 *      (the historical separation between URL attribution and in-app
 *      event attribution is intentional and must be preserved).
 *
 * Hard rule from `.ai/SIAS_BLOCKED_REGISTRY_20260723.md#BLOCKED-005`:
 *   No fabricated traffic. These labels are in-product surface labels.
 *
 * Boundaries:
 *   - Does NOT change PLANS / PRODUCT_CATALOG / stripe.ts.
 *   - Does NOT change the pricing page text / FAQ / prices.
 *   - Does NOT change the Stripe checkout endpoint.
 *   - Does NOT change the funnel event names themselves.
 */

const REPO_ROOT = process.cwd();

const SURFACE_FILE = path.join(
  REPO_ROOT,
  'src/lib/analytics/pricing-surface.ts'
);

const PAGE_FILE = path.join(
  REPO_ROOT,
  'src/app/(main)/pricing/page.tsx'
);

describe('pricing funnel surface alignment (T0-012)', () => {
  describe('pricing-surface.ts constants', () => {
    it('exports PRICING_UTM_SOURCE === "pricing" (matches H3 buildUtmHref source)', () => {
      const source = fs.readFileSync(SURFACE_FILE, 'utf8');
      expect(source).toMatch(
        /export\s+const\s+PRICING_UTM_SOURCE\s*=\s*['"]pricing['"]\s*as\s+const/
      );
    });

    it('exports PRICING_UTM_CAMPAIGN === "organic_funnel_h1"', () => {
      const source = fs.readFileSync(SURFACE_FILE, 'utf8');
      expect(source).toMatch(
        /export\s+const\s+PRICING_UTM_CAMPAIGN\s*=\s*['"]organic_funnel_h1['"]\s*as\s+const/
      );
    });

    it('exports PRICING_UTM_MEDIUM === "in_product"', () => {
      const source = fs.readFileSync(SURFACE_FILE, 'utf8');
      expect(source).toMatch(
        /export\s+const\s+PRICING_UTM_MEDIUM\s*=\s*['"]in_product['"]\s*as\s+const/
      );
    });

    it('exports PRICING_SURFACE_LABELS with the three historical funnel surfaces', () => {
      const source = fs.readFileSync(SURFACE_FILE, 'utf8');
      expect(source).toMatch(
        /pricingViewed:\s*['"]pricing_page['"]/
      );
      expect(source).toMatch(
        /unlockClick:\s*['"]pricing_plan['"]/
      );
      expect(source).toMatch(
        /loginStarted:\s*['"]pricing_plan_click['"]/
      );
    });

    it('exports PRICING_SURFACE_LABELS_ARE_DISTINCT_FROM_UTM_SOURCE sanity guard', () => {
      const source = fs.readFileSync(SURFACE_FILE, 'utf8');
      expect(source).toContain('PRICING_SURFACE_LABELS_ARE_DISTINCT_FROM_UTM_SOURCE');
      // The guard must be a boolean const (used as a build-time check).
      expect(source).toMatch(
        /export\s+const\s+PRICING_SURFACE_LABELS_ARE_DISTINCT_FROM_UTM_SOURCE/
      );
    });
  });

  describe('pricing page imports the constants', () => {
    it('imports PRICING_UTM_SOURCE and PRICING_SURFACE_LABELS from pricing-surface', () => {
      const source = fs.readFileSync(PAGE_FILE, 'utf8');

      expect(source).toContain(
        "from '@/lib/analytics/pricing-surface'"
      );
      expect(source).toMatch(/PRICING_UTM_SOURCE/);
      expect(source).toMatch(/PRICING_SURFACE_LABELS/);
    });
  });

  describe('pricing page does NOT contain bare string literals for funnel surfaces', () => {
    it('no bare "pricing_page" literal as a surface value', () => {
      const source = fs.readFileSync(PAGE_FILE, 'utf8');

      // The page must not embed `'pricing_page'` as a bare string anywhere
      // — it must reference `PRICING_SURFACE_LABELS.pricingViewed` instead.
      // Allow the string to appear in comments or documentation.
      const codeLines = source
        .split('\n')
        .filter((l) => !l.trim().startsWith('*') && !l.trim().startsWith('//'));

      const bareLiterals = codeLines.filter(
        (l) => /['"]pricing_page['"]/.test(l) && !/PRICING_SURFACE_LABELS/.test(l)
      );
      expect(
        bareLiterals,
        `pricing page still embeds bare 'pricing_page' literals: ${bareLiterals.join(' | ')}`
      ).toEqual([]);
    });

    it('no bare "pricing_plan" literal as a surface value', () => {
      const source = fs.readFileSync(PAGE_FILE, 'utf8');

      const codeLines = source
        .split('\n')
        .filter((l) => !l.trim().startsWith('*') && !l.trim().startsWith('//'));

      const bareLiterals = codeLines.filter(
        (l) => /['"]pricing_plan['"]/.test(l) && !/PRICING_SURFACE_LABELS/.test(l)
      );
      expect(
        bareLiterals,
        `pricing page still embeds bare 'pricing_plan' literals: ${bareLiterals.join(' | ')}`
      ).toEqual([]);
    });

    it('no bare "pricing_plan_click" literal as a source value', () => {
      const source = fs.readFileSync(PAGE_FILE, 'utf8');

      const codeLines = source
        .split('\n')
        .filter((l) => !l.trim().startsWith('*') && !l.trim().startsWith('//'));

      const bareLiterals = codeLines.filter(
        (l) => /['"]pricing_plan_click['"]/.test(l) && !/PRICING_SURFACE_LABELS/.test(l)
      );
      expect(
        bareLiterals,
        `pricing page still embeds bare 'pricing_plan_click' literals: ${bareLiterals.join(' | ')}`
      ).toEqual([]);
    });
  });

  describe('pricing page uses PRICING_UTM_SOURCE for buildUtmHref (not bare "pricing")', () => {
    it('buildUtmHref call uses PRICING_UTM_SOURCE, not a bare string literal', () => {
      const source = fs.readFileSync(PAGE_FILE, 'utf8');

      // Find the buildUtmHref call site.
      const callMatch = source.match(/buildUtmHref\([^)]+\)/);
      expect(callMatch, 'pricing page must call buildUtmHref').toBeTruthy();

      // The call must pass `PRICING_UTM_SOURCE` (or a constant expression
      // derived from it) — never a bare 'pricing' string literal.
      expect(callMatch![0]).toMatch(/source:\s*PRICING_UTM_SOURCE/);
      expect(callMatch![0]).not.toMatch(/source:\s*['"]pricing['"]/);
    });
  });

  describe('pricing surface contract is consistent with H3 buildUtmHref', () => {
    it('PRICING_UTM_SOURCE is in the UtmSurface union type (so buildUtmHref accepts it)', () => {
      const utmParams = fs.readFileSync(
        path.join(REPO_ROOT, 'src/lib/analytics/utm-params.ts'),
        'utf8'
      );

      // The UtmSurface union must include 'pricing'. (H3 added it.)
      expect(utmParams).toMatch(/UtmSurface\s*=[\s\S]*?['"]pricing['"]/);
    });
  });
});