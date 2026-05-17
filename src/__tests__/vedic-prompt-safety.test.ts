import { describe, expect, it } from 'vitest';
import {
  buildBirthTimeRectificationPrompt,
  buildFiveYearLoveForecastPrompt,
  buildVedicCompatibilityPrompt,
  buildVedicRelationshipPrompt,
  buildWealthCareerVedicPrompt,
} from '@/lib/astro/vedic/prompts';
import type { VedicChartData } from '@/lib/astro/vedic/types';

const chart: VedicChartData = {
  metadata: {
    sourceType: 'manual',
    zodiac: 'sidereal',
    ayanamsa: 'Lahiri',
    warnings: [],
  },
  ascendant: { sign: 'Libra', degree: 4 },
  moonSign: 'Cancer',
  moonNakshatra: { name: 'Pushya', pada: 2, lord: 'Saturn' },
  planets: [
    { planet: 'Moon', sign: 'Cancer', degree: 11, house: 10 },
    { planet: 'Venus', sign: 'Taurus', degree: 18, house: 8 },
    { planet: 'Mars', sign: 'Aries', degree: 6, house: 7 },
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

describe('Vedic prompt safety builders', () => {
  it('builds relationship prompts with chart facts, timing-window language, and disclaimer', () => {
    const prompt = buildVedicRelationshipPrompt(chart);
    const serialized = `${prompt.systemPrompt}\n${prompt.userPrompt}`;

    expect(serialized).toContain('separate calculation facts from interpretation');
    expect(serialized).toContain('cite exact chart fields used');
    expect(serialized).toContain('timing windows');
    expect(serialized).toContain('practical relationship guidance');
    expect(serialized).toContain('entertainment disclaimer');
    expect(serialized).toContain('Moon');
    expect(serialized).toContain('Pushya');
    expect(serialized).not.toMatch(/100%|guarantee|definitely|destined|must marry|will marry|disaster/i);
  });

  it('builds compatibility and forecast prompts without external API or secret needs', () => {
    const compatibility = buildVedicCompatibilityPrompt(chart, chart);
    const rectification = buildBirthTimeRectificationPrompt(chart, [
      { date: '2020-01-01', label: 'Started a relationship' },
    ]);
    const forecast = buildFiveYearLoveForecastPrompt(chart);
    const wealthCareer = buildWealthCareerVedicPrompt(chart);
    const serialized = [
      compatibility.systemPrompt,
      compatibility.userPrompt,
      rectification.systemPrompt,
      rectification.userPrompt,
      forecast.systemPrompt,
      forecast.userPrompt,
      wealthCareer.systemPrompt,
      wealthCareer.userPrompt,
    ].join('\n');

    expect(serialized).toContain('entertainment disclaimer');
    expect(serialized).toContain('observable signals');
    expect(serialized).not.toMatch(/API_KEY|STRIPE|SUPABASE|RESEND|birthTime secret/i);
    expect(serialized).not.toMatch(/100%|guarantee|definitely|destined|disaster/i);
  });
});
