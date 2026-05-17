import { describe, expect, it, vi } from 'vitest';
import {
  buildVedicRelationshipPaidReport,
  type VedicRelationshipPaidEntitlement,
} from '@/lib/astro/vedic/relationship-paid-adapter';
import type { RelationshipAstroReport, VedicChartData } from '@/lib/astro/vedic/types';

const chartData: VedicChartData = {
  metadata: {
    sourceType: 'manual',
    zodiac: 'sidereal',
    ayanamsa: 'Lahiri',
    warnings: [],
  },
  birth: {
    date: '1994-04-18',
    time: '12:34',
    timezone: 'Asia/Shanghai',
    location: {
      city: 'Synthetic City',
      region: 'Test Region',
      country: 'Exampleland',
    },
  },
  ascendant: { sign: 'Libra', degree: 4 },
  moonSign: 'Cancer',
  moonNakshatra: { name: 'Pushya', pada: 2, lord: 'Saturn' },
  planets: [
    { planet: 'Moon', sign: 'Cancer', degree: 11, house: 10 },
    { planet: 'Venus', sign: 'Taurus', degree: 18, house: 8 },
    { planet: 'Mars', sign: 'Aries', degree: 6, house: 7 },
    { planet: 'Jupiter', sign: 'Pisces', degree: 20, house: 6 },
  ],
  houses: [{ house: 7, sign: 'Aries', lord: 'Mars' }],
  dashaPeriods: [
    {
      system: 'Vimshottari',
      planet: 'Moon',
      startDate: '2025-01-01',
      endDate: '2035-01-01',
    },
  ],
  warnings: [],
};

const paidEntitlement: VedicRelationshipPaidEntitlement = {
  paid: true,
  product: 'solo_love_report',
};

function customReport(): RelationshipAstroReport {
  return {
    summary:
      'Moon and Venus signals point to a tender love signature that benefits from steady pacing.',
    chartSignals: ['Ascendant: Libra', 'Moon: Cancer', 'Moon Nakshatra: Pushya'],
    emotionalPattern: 'Emotional security matters more than dramatic proof of devotion.',
    attractionPattern: 'Warmth, reliability, and patient repair are stronger than instant intensity.',
    relationshipChallenges: ['Avoid treating silence as a final answer.'],
    timingWindows: ['Moon dasha can be read as a reflective timing window for emotional repair.'],
    marriagePotential:
      'Long-term bond potential should be treated as possibility and practice, not certainty.',
    compatibilityNotes: ['Look for observable consistency before escalating commitment.'],
    practicalGuidance: ['Ask one direct question before withdrawing.'],
    disclaimer: 'This report is for entertainment and self-reflection only.',
  };
}

describe('Vedic paid relationship report integration', () => {
  it('returns skipped in disabled mode and does not generate a report', async () => {
    const generateReport = vi.fn(() => customReport());

    const result = await buildVedicRelationshipPaidReport({
      chartData,
      entitlement: paidEntitlement,
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'false',
        TIANJI_VEDIC_REPORT_MODE: 'paid',
      },
      generateReport,
    });

    expect(result.status).toBe('skipped');
    expect(result.locked).toBe(true);
    expect(result.reason).toBe('disabled');
    expect(result.fullReportMarkdown).toBeNull();
    expect(generateReport).not.toHaveBeenCalled();
  });

  it('generates preview mode as internal preview only', async () => {
    const result = await buildVedicRelationshipPaidReport({
      chartData,
      entitlement: { paid: false },
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'true',
        TIANJI_VEDIC_REPORT_MODE: 'preview',
      },
    });

    expect(result.status).toBe('preview');
    expect(result.locked).toBe(true);
    expect(result.internalPreview).toEqual(expect.stringContaining('Core Love Signature'));
    expect(result.fullReportMarkdown).toBeNull();
    expect(result.publicSummary).not.toMatch(/12:34|Synthetic City|Asia\/Shanghai/i);
  });

  it('requires paid or pro entitlement in paid mode', async () => {
    const result = await buildVedicRelationshipPaidReport({
      chartData,
      entitlement: { paid: false, pro: false },
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'true',
        TIANJI_VEDIC_REPORT_MODE: 'paid',
      },
    });

    expect(result.status).toBe('locked');
    expect(result.locked).toBe(true);
    expect(result.reason).toBe('missing_entitlement');
    expect(result.fullReportMarkdown).toBeNull();
  });

  it('does not allow unpaid users to access the full Vedic report', async () => {
    const result = await buildVedicRelationshipPaidReport({
      chartData,
      entitlement: undefined,
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'true',
        TIANJI_VEDIC_REPORT_MODE: 'paid',
      },
    });

    expect(result.locked).toBe(true);
    expect(result.fullReportMarkdown).toBeNull();
    expect(JSON.stringify(result)).not.toMatch(/12:34|Synthetic City|Asia\/Shanghai/i);
  });

  it('generates a paid report with required sections when entitlement is present', async () => {
    const result = await buildVedicRelationshipPaidReport({
      chartData,
      entitlement: paidEntitlement,
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'true',
        TIANJI_VEDIC_REPORT_MODE: 'paid',
      },
      generateReport: customReport,
    });

    expect(result.status).toBe('generated');
    expect(result.locked).toBe(false);
    expect(result.fullReportMarkdown).toEqual(expect.any(String));
    expect(result.fullReportMarkdown).toContain('## Core Love Signature');
    expect(result.fullReportMarkdown).toContain('## Emotional Attachment Pattern');
    expect(result.fullReportMarkdown).toContain('## Attraction & Compatibility Pattern');
    expect(result.fullReportMarkdown).toContain('## Love Timing Windows');
    expect(result.fullReportMarkdown).toContain('## Relationship Challenges');
    expect(result.fullReportMarkdown).toContain('## Practical Next Steps');
    expect(result.fullReportMarkdown).toContain('## Ask Follow-up Suggestions');
    expect(result.fullReportMarkdown).toContain('## Draw Three Cards Follow-up Suggestions');
  });

  it('keeps generated output away from guaranteed predictions and raw public birth details', async () => {
    const result = await buildVedicRelationshipPaidReport({
      chartData,
      entitlement: paidEntitlement,
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'true',
        TIANJI_VEDIC_REPORT_MODE: 'paid',
      },
    });

    expect(result.fullReportMarkdown).not.toMatch(
      /guarantee|definitely|destined|will marry|will divorce|pay now|disaster/i
    );
    expect(result.publicSummary).not.toMatch(/12:34|Synthetic City|Asia\/Shanghai|birthTime|birthLocation|timezone/i);
    expect(JSON.stringify(result.aiMeta)).not.toMatch(/12:34|Synthetic City|Asia\/Shanghai|raw|prompt|requestBody/i);
  });
});
