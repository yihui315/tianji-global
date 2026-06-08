import { describe, expect, it } from 'vitest';
import { generateFreePreviewReport } from '@/lib/love-reading/report-generator';
import { LOVE_DIMENSION_KEYS, LOVE_REPORT_LOCALES } from '@/lib/love-reading/report-schema';
import { hasAllLoveDimensions } from '@/lib/love-reading/report-quality-check';

describe('canonical LoveReport schema contract', () => {
  it('creates a complete free preview report with all five dimensions', () => {
    const report = generateFreePreviewReport({
      locale: 'en',
      readingMode: 'solo',
      personA: { birthDate: '1992-07-18', birthTime: null, birthPlace: null },
      createdAt: '2026-05-31T00:00:00.000Z',
    });

    expect(report.version).toBe('love-report-v1');
    expect(report.visibility).toBe('free');
    expect(report.locale).toBe('en');
    expect(report.currentWindow.recommendedAction).toBeTruthy();
    expect(report.next7Days.length).toBeGreaterThan(0);
    expect(report.privacySafeShareSummary).toMatchObject({
      title: expect.any(String),
      summary: expect.any(String),
      scoreBand: expect.any(String),
      cta: expect.any(String),
    });
    expect(report.dimensions.map((dimension) => dimension.key)).toEqual(LOVE_DIMENSION_KEYS);
    expect(hasAllLoveDimensions(report.dimensions.map((dimension) => dimension.key))).toBe(true);

    for (const dimension of report.dimensions) {
      expect(dimension.score).toBeGreaterThanOrEqual(0);
      expect(dimension.score).toBeLessThanOrEqual(100);
      expect(dimension.action).toBeTruthy();
    }
  });

  it('supports the canonical locales', () => {
    expect(LOVE_REPORT_LOCALES).toEqual(['zh', 'en', 'zh-Hant']);
  });
});
