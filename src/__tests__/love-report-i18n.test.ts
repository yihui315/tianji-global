import { describe, expect, it } from 'vitest';
import { generateFreePreviewReport } from '@/lib/love-reading/free-preview-generator';

describe('LoveReport i18n contract', () => {
  it.each(['zh', 'en', 'zh-Hant'] as const)('generates report for %s', (locale) => {
    const report = generateFreePreviewReport({
      locale,
      personA: { birthDate: '1992-07-18' },
    });

    expect(report.locale).toBe(locale);
    expect(report.headline).toBeTruthy();
    expect(report.dimensions).toHaveLength(5);
  });

  it('keeps generation deterministic for the same input', () => {
    const input = {
      locale: 'en' as const,
      personA: { birthDate: '1992-07-18', birthTime: null, birthPlace: null },
      createdAt: '2026-05-31T00:00:00.000Z',
    };

    expect(generateFreePreviewReport(input)).toEqual(generateFreePreviewReport(input));
  });
});
