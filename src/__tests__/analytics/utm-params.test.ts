import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { buildUtmHref } from '@/lib/analytics/utm-params';

/**
 * T0-003 (SIAS High-Throughput H1, 2026-07-23) regression contract.
 *
 * Locks down UTM propagation on /daily-oracle CTAs so the funnel entry cannot
 * silently lose its tracking parameters:
 *
 *   - buildUtmHref adds utm_source / utm_medium / utm_campaign in a
 *     deterministic order, preserving an existing `source=` query parameter.
 *   - The /daily-oracle page source must reference the helper for both
 *     LOVE_TEST_HREF and LOVE_READING_HREF.
 *   - The rendered hrefs must contain utm_source=daily_oracle and
 *     utm_campaign=organic_funnel_h1.
 *
 * Hard rule from .ai/SIAS_BLOCKED_REGISTRY_20260723.md#BLOCKED-005:
 *   The UTM source label must be an in-product surface label. It is NEVER
 *   a fabricated traffic metric.
 */

describe('buildUtmHref (T0-003)', () => {
  it('appends utm_source / utm_medium / utm_campaign when missing', () => {
    const href = buildUtmHref('/love-test', { source: 'daily_oracle' });
    expect(href.startsWith('/love-test?')).toBe(true);
    expect(href).toContain('utm_source=daily_oracle');
    expect(href).toContain('utm_medium=in_product');
    expect(href).toContain('utm_campaign=organic_funnel_h1');
  });

  it('preserves an existing source= parameter and appends UTM after it', () => {
    const href = buildUtmHref('/love-test?source=daily_oracle', { source: 'daily_oracle' });
    expect(href).toContain('source=daily_oracle');
    expect(href).toContain('utm_source=daily_oracle');
    expect(href).toContain('utm_medium=in_product');
    expect(href).toContain('utm_campaign=organic_funnel_h1');
    expect(href.indexOf('source=')).toBeLessThan(href.indexOf('utm_source='));
  });

  it('respects caller-provided medium and campaign overrides', () => {
    const href = buildUtmHref('/love-test', {
      source: 'daily_oracle',
      medium: 'email_newsletter',
      campaign: 'launch_2026_07',
    });
    expect(href).toContain('utm_medium=email_newsletter');
    expect(href).toContain('utm_campaign=launch_2026_07');
  });

  it('does not duplicate utm_* keys if caller already set one', () => {
    const href = buildUtmHref('/love-test?utm_source=existing', { source: 'daily_oracle' });
    const matches = href.match(/utm_source=/g) ?? [];
    expect(matches).toHaveLength(1);
    expect(href).toContain('utm_source=existing');
  });

  it('returns the original path with no query if every utm_* already present', () => {
    const href = buildUtmHref(
      '/love-test?utm_source=x&utm_medium=y&utm_campaign=z',
      { source: 'daily_oracle' }
    );
    expect(href).toBe('/love-test?utm_source=x&utm_medium=y&utm_campaign=z');
  });

  it('does not mutate the input string', () => {
    const original = '/love-test?source=daily_oracle';
    const snapshot = original;
    buildUtmHref(original, { source: 'daily_oracle' });
    expect(original).toBe(snapshot);
  });
});

describe('daily-oracle CTA uses buildUtmHref (T0-003)', () => {
  const pagePath = path.join(process.cwd(), 'src/app/(main)/daily-oracle/page.tsx');
  const source = fs.readFileSync(pagePath, 'utf8');

  it('imports buildUtmHref from @/lib/analytics/utm-params', () => {
    expect(source).toMatch(/import\s*\{[^}]*buildUtmHref[^}]*\}\s*from\s*['"]@\/lib\/analytics\/utm-params['"]/);
  });

  it('builds LOVE_TEST_HREF and LOVE_READING_HREF through the helper', () => {
    expect(source).toMatch(/LOVE_TEST_HREF\s*=\s*buildUtmHref\(/);
    expect(source).toMatch(/LOVE_READING_HREF\s*=\s*buildUtmHref\(/);
    expect(source).toContain('source: \'daily_oracle\'');
  });

  it('renders hrefs that include utm_source=daily_oracle and utm_campaign=organic_funnel_h1', () => {
    const loveTest = source.match(/LOVE_TEST_HREF\s*=\s*buildUtmHref\([^)]+\)/)?.[0] ?? '';
    const loveReading = source.match(/LOVE_READING_HREF\s*=\s*buildUtmHref\([^)]+\)/)?.[0] ?? '';
    expect(loveTest).toContain("'daily_oracle'");
    expect(loveReading).toContain("'daily_oracle'");
    // Both constants surface a "source=daily_oracle" so the helper preserves it.
    expect(source).toContain('/love-test?source=daily_oracle');
    expect(source).toContain('/relationship/new?source=daily_oracle');
  });
});