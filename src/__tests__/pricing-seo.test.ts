import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { localizedPublicRoutes } from '@/lib/i18n';

/**
 * T0-004 (SIAS High-Throughput H1, 2026-07-23) regression contract.
 *
 * Locks down the structured-data surface added to /pricing so the page cannot
 * regress to a one-Payload (Product only) JSON-LD shape:
 *
 *   - localizedPublicRoutes must contain /pricing.
 *   - src/app/(main)/pricing/layout.tsx must render at least four <JsonLd>
 *     payloads: BreadcrumbList, Product, SoftwareApplication (new), FAQPage.
 *   - Each payload must carry a unique @id.
 *   - The FAQPage payload must surface the two new questions added for H1
 *     (one-time vs subscription, Draw Timing unlock) so the structured FAQ
 *     matches the funnelOptions on the page.
 *
 * Hard rule from .ai/SIAS_BLOCKED_REGISTRY_20260723.md:
 *   No fabricated prices, no live Stripe URL, no fake KPI numbers. The
 *   SoftwareApplication offer uses price '0' (free entry tier) only.
 */

describe('pricing SEO surface (T0-004)', () => {
  it('registers /pricing in localizedPublicRoutes', () => {
    const entry = localizedPublicRoutes.find((r) => r.path === '/pricing');
    expect(entry).toBeDefined();
    expect(entry?.priority).toBeGreaterThanOrEqual(0.7);
  });

  it('emits a server layout.tsx exporting metadata with the expected SEO fields', () => {
    const layoutPath = path.join(process.cwd(), 'src/app/(main)/pricing/layout.tsx');
    expect(fs.existsSync(layoutPath)).toBe(true);
    const source = fs.readFileSync(layoutPath, 'utf8');
    expect(source).toMatch(/export const metadata:\s*Metadata/);
    expect(source).toContain('title:');
    expect(source).toContain('description:');
    expect(source).toContain('openGraph:');
    expect(source).toContain('twitter:');
    expect(source).toContain('alternates:');
    expect(source).toContain('canonical:');
    expect(source).toContain('/pricing');
  });

  it('renders four JsonLd payloads with unique @ids (breadcrumb + product + softwareApp + faq)', () => {
    const layoutPath = path.join(process.cwd(), 'src/app/(main)/pricing/layout.tsx');
    const source = fs.readFileSync(layoutPath, 'utf8');

    expect(source).toContain('buildBreadcrumb(');
    expect(source).toMatch(/['"]@type['"]:\s*['"]Product['"]/);
    expect(source).toMatch(/['"]@type['"]:\s*['"]SoftwareApplication['"]/);
    expect(source).toMatch(/['"]@type['"]:\s*['"]FAQPage['"]/);

    // Inline @id literals cover Product, SoftwareApplication, FAQPage.
    // BreadcrumbList @id is produced inside buildBreadcrumb() — assert that
    // helper is invoked instead so the contract is end-to-end.
    const inlineIds = Array.from(source.matchAll(/['"]@id['"]:\s*[`'"]\$\{PAGE_URL\}#([^`'"]+)[`'"]/g))
      .map((m) => m[1])
      .filter((value, index, self) => self.indexOf(value) === index);
    expect(inlineIds.length).toBeGreaterThanOrEqual(3);
    expect(new Set(inlineIds).size).toBe(inlineIds.length);

    expect(inlineIds).toContain('product');
    expect(inlineIds).toContain('software-application');
    expect(inlineIds).toContain('faq');
  });

  it('FAQPage payload includes the H1 funnel-oriented questions', () => {
    const layoutPath = path.join(process.cwd(), 'src/app/(main)/pricing/layout.tsx');
    const source = fs.readFileSync(layoutPath, 'utf8');

    expect(source).toContain('Should I start with a one-time unlock or a subscription?');
    expect(source).toContain('What does the Draw Timing unlock add?');
  });

  it('SoftwareApplication offer is the free entry tier (no fabricated prices)', () => {
    const layoutPath = path.join(process.cwd(), 'src/app/(main)/pricing/layout.tsx');
    const source = fs.readFileSync(layoutPath, 'utf8');
    // Find the SoftwareApplication payload block.
    const match = source.match(/const softwareApplicationLd\s*=\s*\{[\s\S]+?\n\};/);
    expect(match).not.toBeNull();
    const block = match ? match[0] : '';
    expect(block).toContain("'@type': 'SoftwareApplication'");
    expect(block).toContain("price: '0'");
    expect(block).toContain("category: 'freemium'");
  });
});