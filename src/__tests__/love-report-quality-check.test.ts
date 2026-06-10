import { describe, expect, it } from 'vitest';
import { generateFreePreviewReport } from '@/lib/love-reading/free-preview-generator';
import { generatePremiumLoveReport } from '@/lib/love-reading/premium-report-generator';
import { checkLoveReportQuality } from '@/lib/love-reading/report-quality-check';

describe('LoveReport quality check', () => {
  it('passes a valid deterministic free preview report', () => {
    const report = generateFreePreviewReport({
      locale: 'en',
      personA: { birthDate: '1992-07-18' },
    });

    expect(checkLoveReportQuality(report)).toEqual([]);
  });

  it('fails absolute claims, fear-based CTA, missing dimensions, invalid score, and private leaks', () => {
    const report = generateFreePreviewReport({
      locale: 'en',
      personA: { birthDate: '1992-07-18' },
    });
    const issues = checkLoveReportQuality({
      ...report,
      headline: 'You will definitely marry',
      dimensions: report.dimensions.slice(0, 2),
      overallScore: 150,
      premiumTeaser: 'Pay now or miss your true love',
      privacySafeShareSummary: {
        ...report.privacySafeShareSummary,
        summary: '1992-07-18 21:30 Los Angeles',
      },
    });

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'missing_dimensions',
        'invalid_score',
        'forbidden_absolute_claim',
        'fear_based_cta',
        'private_field_leak',
      ])
    );
  });

  it('requires entitlement before adding premium sections', () => {
    const report = generateFreePreviewReport({
      locale: 'en',
      personA: { birthDate: '1992-07-18' },
    });

    expect(generatePremiumLoveReport(report, { hasEntitlement: false }).premiumSections).toHaveLength(0);

    const premium = generatePremiumLoveReport(report, {
      hasEntitlement: true,
      productId: 'solo_love_report',
    });

    expect(premium.visibility).toBe('premium');
    expect(premium.premiumSections.length).toBeGreaterThan(0);
    expect(checkLoveReportQuality(premium)).toEqual([]);
  });
});
