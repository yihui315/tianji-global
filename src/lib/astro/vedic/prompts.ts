import type { VedicChartData, VedicPrompt } from './types';

type LifeEvent = {
  date?: string;
  label: string;
};

function chartFacts(chartData: VedicChartData) {
  return {
    zodiac: chartData.metadata.zodiac,
    ayanamsa: chartData.metadata.ayanamsa,
    ascendant: chartData.ascendant,
    moonSign: chartData.moonSign,
    moonNakshatra: chartData.moonNakshatra,
    planets: chartData.planets.map((planet) => ({
      planet: planet.planet,
      sign: planet.sign,
      degree: planet.degree,
      house: planet.house,
      nakshatra: planet.nakshatra,
      retrograde: planet.retrograde,
    })),
    houses: chartData.houses,
    dashaPeriods: chartData.dashaPeriods,
    warnings: chartData.warnings,
  };
}

function baseSystemPrompt(task: string) {
  return [
    `You write ${task} for TianJi Love using Vedic/Jyotish chart data.`,
    'Use sidereal zodiac assumptions and Lahiri ayanamsa unless source data says otherwise.',
    'Always separate calculation facts from interpretation.',
    'Always cite exact chart fields used.',
    'Use possible-pattern and timing windows language.',
    'Provide practical relationship guidance tied to observable signals.',
    'Include an entertainment disclaimer.',
    'Do not use certainty claims, fear-based sales, remedy pressure, or medical, legal, or financial advice.',
    'Do not expose raw birth time, birth location, timezone, private prompts, provider request bodies, payment IDs, or secrets.',
  ].join(' ');
}

function buildPrompt(task: string, payload: Record<string, unknown>): VedicPrompt {
  return {
    systemPrompt: baseSystemPrompt(task),
    userPrompt: JSON.stringify(
      {
        task,
        outputRules: [
          'separate calculation facts from interpretation',
          'cite exact chart fields used',
          'use timing windows, possible patterns, and observable signals',
          'provide practical relationship guidance',
          'include entertainment disclaimer',
          'avoid deterministic prediction framing',
          'avoid fear-based or manipulative language',
        ],
        ...payload,
      },
      null,
      2
    ),
  };
}

export function buildVedicRelationshipPrompt(chartData: VedicChartData): VedicPrompt {
  return buildPrompt('Vedic relationship destiny report', {
    chartFields: chartFacts(chartData),
    requiredSections: [
      'Core Love Signature',
      'Emotional Attachment Pattern',
      'Attraction Type & Relationship Magnetism',
      'Love Lessons and Repeating Patterns',
      'Dasha-Based Timing Windows',
      'Long-Term Bond Potential',
      'Red Flags and Emotional Triggers',
      'Practical Next Steps',
    ],
  });
}

export function buildVedicCompatibilityPrompt(chartA: VedicChartData, chartB: VedicChartData): VedicPrompt {
  return buildPrompt('Vedic compatibility report', {
    chartAFields: chartFacts(chartA),
    chartBFields: chartFacts(chartB),
    compareSignals: ['Moon sign', 'Moon Nakshatra', 'Ascendant', '7th house', 'Venus', 'Mars', 'Jupiter'],
  });
}

export function buildBirthTimeRectificationPrompt(chartData: VedicChartData, lifeEvents: LifeEvent[]): VedicPrompt {
  return buildPrompt('Vedic birth time rectification support', {
    chartFields: chartFacts(chartData),
    lifeEvents: lifeEvents.map((event) => ({
      date: event.date,
      label: event.label,
    })),
    boundary:
      'Offer questions and chart-consistency checks only; do not claim an exact corrected birth time.',
  });
}

export function buildFiveYearLoveForecastPrompt(chartData: VedicChartData): VedicPrompt {
  return buildPrompt('Vedic five-year love forecast', {
    chartFields: chartFacts(chartData),
    forecastRules: [
      'organize by relationship timing windows',
      'name likely emotional themes as possibilities',
      'include observable signals for each window',
      'include practical relationship choices',
    ],
  });
}

export function buildWealthCareerVedicPrompt(chartData: VedicChartData): VedicPrompt {
  return buildPrompt('Vedic wealth and career reflection', {
    chartFields: chartFacts(chartData),
    boundary:
      'Frame wealth and career themes as reflective planning prompts only, with no financial advice.',
  });
}
