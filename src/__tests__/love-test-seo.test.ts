import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { localizedPublicRoutes } from '@/lib/i18n';

/**
 * T0-002 (SIAS Autonomous Evolution L2 round 2, 2026-07-23) regression contract.
 *
 * Locks down the SEO surface added to /love-test so the highest-volume
 * free funnel entry cannot regress to "tracked by analytics but invisible
 * to crawlers":
 *
 *   - localizedPublicRoutes must contain /love-test (it already did
 *     before this round; the test guards against future removal).
 *   - src/app/(main)/love-test/layout.tsx must exist and export a
 *     metadata object with title, description, openGraph, twitter, and
 *     alternates.canonical.
 *   - The layout must render at least one <JsonLd> payload (breadcrumb
 *     + web app + FAQ), each carrying a unique @id.
 *   - The FAQ must contain explicit no-guarantee / no-outcome / reflective
 *     copy to satisfy the privacy / entertainment disclaimer contract.
 */
describe('love-test SEO surface (T0-002)', () => {
  it('registers /love-test in localizedPublicRoutes with priority 0.9 and weekly changeFrequency', () => {
    const entry = localizedPublicRoutes.find((r) => r.path === '/love-test');
    expect(entry).toBeDefined();
    expect(entry?.priority).toBe(0.9);
    expect(entry?.changeFrequency).toBe('weekly');
  });

  it('exposes a server layout.tsx exporting metadata with the expected SEO fields', () => {
    const layoutPath = path.join(
      process.cwd(),
      'src/app/(main)/love-test/layout.tsx'
    );
    expect(fs.existsSync(layoutPath)).toBe(true);

    const source = fs.readFileSync(layoutPath, 'utf8');

    expect(source).toMatch(/export const metadata:\s*Metadata/);
    expect(source).toContain("title:");
    expect(source).toContain("description:");
    expect(source).toContain("openGraph:");
    expect(source).toContain("twitter:");
    expect(source).toContain("alternates:");
    expect(source).toContain("canonical:");
    expect(source).toContain('/love-test');
  });

  it('renders breadcrumb + WebApplication + FAQ JsonLd payloads with unique @ids', () => {
    const layoutPath = path.join(
      process.cwd(),
      'src/app/(main)/love-test/layout.tsx'
    );
    const source = fs.readFileSync(layoutPath, 'utf8');

    // Breadcrumb — produced by buildBreadcrumb(), so the source uses the
    // helper call rather than a literal BreadcrumbList string.
    expect(source).toContain("buildBreadcrumb(");

    // WebApplication + FAQ are inline literals.
    expect(source).toMatch(/['"]@type['"]:\s*['"]WebApplication['"]/);
    expect(source).toMatch(/['"]@type['"]:\s*['"]FAQPage['"]/);

    // Each inline payload must carry a unique @id anchor.
    const ids = source.match(/['"]@id['"]:\s*[`'"][^`'"]+[`'"]/g) ?? [];
    // At minimum: PAGE_URL#webapp + PAGE_URL#faq = 2 unique inline anchors.
    expect(ids.length).toBeGreaterThanOrEqual(2);
    const uniq = new Set(ids);
    expect(uniq.size).toBe(ids.length);

    // The layout must render at least 3 JsonLd components (breadcrumb +
    // web app + FAQ), one per payload.
    const jsonLdCount = (source.match(/<JsonLd\s+data=/g) ?? []).length;
    expect(jsonLdCount).toBeGreaterThanOrEqual(3);
  });

  it('marks the WebApplication as free (isAccessibleForFree: true, price: "0")', () => {
    const layoutPath = path.join(
      process.cwd(),
      'src/app/(main)/love-test/layout.tsx'
    );
    const source = fs.readFileSync(layoutPath, 'utf8');
    expect(source).toContain("isAccessibleForFree: true");
    expect(source).toContain("price: '0'");
  });

  it('contains the no-promised-outcomes / reflective / entertainment disclaimer', () => {
    const layoutPath = path.join(
      process.cwd(),
      'src/app/(main)/love-test/layout.tsx'
    );
    const source = fs.readFileSync(layoutPath, 'utf8').toLowerCase();
    // Match the existing pattern from daily-oracle and pricing layouts.
    expect(source).toMatch(/(does not promise|no guarantee|not promise|non-predictive)/);
    expect(source).toMatch(/(self-reflection|entertainment|for reflection)/);
  });
});