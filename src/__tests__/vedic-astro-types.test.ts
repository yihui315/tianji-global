import { describe, expect, it, vi } from 'vitest';
import type {
  BirthInput,
  CompatibilityReport,
  RelationshipAstroReport,
  VedicChartData,
} from '@/lib/astro/vedic/types';
import { getVedicReportConfig } from '@/lib/astro/vedic/config';

describe('Vedic astrology domain types and config', () => {
  it('supports relationship and compatibility report contracts without route integration', () => {
    const birth: BirthInput = {
      date: '1990-01-01',
      time: '12:00',
      location: {
        city: 'Test City',
        country: 'Test Country',
        latitude: 12.34,
        longitude: 56.78,
      },
    };

    const chart: VedicChartData = {
      metadata: {
        sourceType: 'manual',
        zodiac: 'sidereal',
        ayanamsa: 'Lahiri',
        warnings: [],
      },
      birth,
      ascendant: { sign: 'Libra', degree: 4.2 },
      moonSign: 'Cancer',
      moonNakshatra: {
        name: 'Pushya',
        pada: 2,
        lord: 'Saturn',
      },
      planets: [
        {
          planet: 'Venus',
          sign: 'Taurus',
          degree: 18.4,
          house: 8,
          nakshatra: { name: 'Rohini', pada: 3, lord: 'Moon' },
        },
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

    const relationshipReport: RelationshipAstroReport = {
      summary: 'A reflective summary.',
      chartSignals: ['Moon in Cancer'],
      emotionalPattern: 'Needs secure bonding.',
      attractionPattern: 'Drawn to steady warmth.',
      relationshipChallenges: ['Avoid testing partners indirectly.'],
      timingWindows: ['Moon dasha can be treated as an emotional growth window.'],
      marriagePotential: 'Discuss long-term bonds as possibility, not certainty.',
      compatibilityNotes: ['Compare repair styles.'],
      practicalGuidance: ['Ask directly for clarity.'],
      disclaimer: 'For entertainment and self-reflection only.',
    };
    const compatibilityReport: CompatibilityReport = {
      summary: 'A reflective compatibility summary.',
      sharedSignals: ['Both charts emphasize water signs.'],
      complementaryPatterns: ['One partner grounds emotional reactivity.'],
      frictionPatterns: ['Different conflict pacing.'],
      timingWindows: ['Use the next month as a conversation window.'],
      practicalGuidance: ['Set a shared repair ritual.'],
      disclaimer: 'For entertainment and self-reflection only.',
    };

    expect(chart.metadata.ayanamsa).toBe('Lahiri');
    expect(relationshipReport).toHaveProperty('timingWindows');
    expect(compatibilityReport).toHaveProperty('sharedSignals');
  });

  it('defaults Vedic feature flags to disabled without requiring env values', () => {
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_TIANJI_VEDIC_ENABLED', '');
    vi.stubEnv('TIANJI_VEDIC_REPORT_MODE', '');

    expect(getVedicReportConfig()).toEqual({
      enabled: false,
      mode: 'disabled',
    });
  });
});
