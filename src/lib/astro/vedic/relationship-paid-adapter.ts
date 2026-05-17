import { getVedicReportConfig, type VedicReportMode } from './config';
import { assertVedicOutputSafe, VEDIC_ENTERTAINMENT_DISCLAIMER } from './safety';
import type { RelationshipAstroReport, VedicChartData } from './types';

export type VedicRelationshipPaidStatus = 'skipped' | 'preview' | 'locked' | 'generated';
export type VedicRelationshipPaidReason =
  | 'disabled'
  | 'missing_entitlement'
  | 'missing_chart_data';

export interface VedicRelationshipPaidEntitlement {
  paid?: boolean;
  pro?: boolean;
  product?: 'solo_love_report' | 'compatibility_report' | string;
}

export interface VedicRelationshipPaidReportInput {
  chartData?: VedicChartData | null;
  entitlement?: VedicRelationshipPaidEntitlement | null;
  env?: Record<string, string | undefined>;
  generateReport?: (chartData: VedicChartData) => RelationshipAstroReport | Promise<RelationshipAstroReport>;
}

export interface VedicRelationshipPaidReportResult {
  status: VedicRelationshipPaidStatus;
  mode: VedicReportMode;
  locked: boolean;
  reason?: VedicRelationshipPaidReason;
  publicSummary: string | null;
  internalPreview: string | null;
  fullReportMarkdown: string | null;
  sections: string[];
  warnings: string[];
  aiMeta: {
    engine: 'vedic';
    route: 'relationship_paid_vedic';
    mode: VedicReportMode;
    liveCall: false;
    generated: boolean;
  };
}

const PAID_SECTIONS = [
  'Core Love Signature',
  'Emotional Attachment Pattern',
  'Attraction & Compatibility Pattern',
  'Love Timing Windows',
  'Relationship Challenges',
  'Practical Next Steps',
  'Ask Follow-up Suggestions',
  'Draw Three Cards Follow-up Suggestions',
] as const;

function hasPaidEntitlement(entitlement?: VedicRelationshipPaidEntitlement | null) {
  return Boolean(entitlement?.paid || entitlement?.pro);
}

function findPlanet(chartData: VedicChartData, planet: string) {
  return chartData.planets.find((position) => position.planet.toLowerCase() === planet.toLowerCase());
}

function seventhHouseSignal(chartData: VedicChartData) {
  const seventhHouse = chartData.houses.find((house) => house.house === 7);
  if (!seventhHouse) return '7th house: not provided';
  return `7th house: ${seventhHouse.sign}${seventhHouse.lord ? `, lord ${seventhHouse.lord}` : ''}`;
}

function planetSignal(chartData: VedicChartData, planet: string) {
  const position = findPlanet(chartData, planet);
  if (!position) return `${planet}: not provided`;
  return `${planet}: ${position.sign}${position.house ? `, house ${position.house}` : ''}`;
}

function dashaSignal(chartData: VedicChartData) {
  const firstDasha = chartData.dashaPeriods[0];
  if (!firstDasha) return 'Dasha: not provided';
  return `${firstDasha.system} dasha signal: ${firstDasha.planet}`;
}

function buildChartSignals(chartData: VedicChartData) {
  return [
    `Ascendant: ${chartData.ascendant?.sign ?? 'not provided'}`,
    `Moon sign: ${chartData.moonSign ?? 'not provided'}`,
    `Moon nakshatra: ${chartData.moonNakshatra?.name ?? 'not provided'}`,
    seventhHouseSignal(chartData),
    planetSignal(chartData, 'Venus'),
    planetSignal(chartData, 'Mars'),
    planetSignal(chartData, 'Jupiter'),
    dashaSignal(chartData),
  ];
}

function buildDefaultRelationshipReport(chartData: VedicChartData): RelationshipAstroReport {
  const moonSignal = chartData.moonNakshatra?.name
    ? `Moon nakshatra ${chartData.moonNakshatra.name}`
    : `Moon sign ${chartData.moonSign ?? 'not provided'}`;
  const venus = findPlanet(chartData, 'Venus');
  const mars = findPlanet(chartData, 'Mars');

  return {
    summary:
      'This Vedic relationship reading points to possible love patterns, emotional pacing, and timing windows for reflection.',
    chartSignals: buildChartSignals(chartData),
    emotionalPattern: `${moonSignal} can be read as a possible emotional pattern. Treat sensitivity, attachment needs, and repair pacing as observable themes rather than fixed fate.`,
    attractionPattern: `Venus${venus?.sign ? ` in ${venus.sign}` : ''} and Mars${mars?.sign ? ` in ${mars.sign}` : ''} suggest a possible attraction pattern around warmth, initiative, and consistency. Use this as a lens for reflection, not certainty.`,
    relationshipChallenges: [
      'Avoid turning silence, delayed replies, or timing pressure into proof of a final outcome.',
      'Watch for repeated conflict patterns, then look for observable repair behavior.',
    ],
    timingWindows: [
      `${dashaSignal(chartData)} can be used as a relationship timing window for reflection and planning.`,
      'A practical window is strongest when chart symbolism aligns with consistent real-world communication.',
    ],
    marriagePotential:
      'Long-term bond potential is best framed as compatibility practice, shared values, and repair capacity, not a fixed outcome.',
    compatibilityNotes: [
      'Compatibility should be read through mutual effort, communication, and emotional safety.',
      'Use the chart signals to ask better questions rather than to force a conclusion.',
    ],
    practicalGuidance: [
      'Name one emotional need clearly instead of testing the other person indirectly.',
      'Track consistent actions over the next seven days before making a final relationship decision.',
    ],
    disclaimer: VEDIC_ENTERTAINMENT_DISCLAIMER,
  };
}

function buildPublicSummary(report: RelationshipAstroReport) {
  const summary = [
    report.summary,
    'This should be treated as reflection, not certainty.',
  ].join(' ');
  assertVedicOutputSafe(summary);
  return summary;
}

function buildInternalPreview(report: RelationshipAstroReport) {
  const preview = [
    '## Core Love Signature',
    '',
    report.summary,
    '',
    '## Emotional Attachment Pattern',
    '',
    report.emotionalPattern,
    '',
    '## Practical Next Steps',
    '',
    report.practicalGuidance.map((item) => `- ${item}`).join('\n'),
  ].join('\n');
  assertVedicOutputSafe(preview);
  return preview;
}

function renderPaidRelationshipMarkdown(report: RelationshipAstroReport) {
  const markdown = [
    '# TianJi Love Vedic Relationship Destiny Report',
    '',
    '## Core Love Signature',
    '',
    report.summary,
    '',
    'Chart Signals:',
    report.chartSignals.map((item) => `- ${item}`).join('\n'),
    '',
    '## Emotional Attachment Pattern',
    '',
    report.emotionalPattern,
    '',
    '## Attraction & Compatibility Pattern',
    '',
    report.attractionPattern,
    '',
    '## Love Timing Windows',
    '',
    report.timingWindows.map((item) => `- ${item}`).join('\n'),
    '',
    '## Relationship Challenges',
    '',
    report.relationshipChallenges.map((item) => `- ${item}`).join('\n'),
    '',
    '## Practical Next Steps',
    '',
    report.practicalGuidance.map((item) => `- ${item}`).join('\n'),
    '',
    '## Ask Follow-up Suggestions',
    '',
    '- Ask one focused question about the strongest relationship pattern in this report.',
    '- Ask what practical next step supports emotional clarity without forcing an outcome.',
    '',
    '## Draw Three Cards Follow-up Suggestions',
    '',
    '- Draw three cards to reflect on the current pattern, the next observable signal, and a grounded action.',
    '- Treat the cards as symbolic reflection, not certainty.',
    '',
    '## Disclaimer',
    '',
    report.disclaimer || VEDIC_ENTERTAINMENT_DISCLAIMER,
    '',
  ].join('\n');
  assertVedicOutputSafe(markdown);
  return markdown;
}

function emptyResult(input: {
  status: VedicRelationshipPaidStatus;
  mode: VedicReportMode;
  locked: boolean;
  reason?: VedicRelationshipPaidReason;
  warnings?: string[];
}): VedicRelationshipPaidReportResult {
  return {
    status: input.status,
    mode: input.mode,
    locked: input.locked,
    reason: input.reason,
    publicSummary: null,
    internalPreview: null,
    fullReportMarkdown: null,
    sections: [...PAID_SECTIONS],
    warnings: input.warnings ?? [],
    aiMeta: {
      engine: 'vedic',
      route: 'relationship_paid_vedic',
      mode: input.mode,
      liveCall: false,
      generated: false,
    },
  };
}

export async function buildVedicRelationshipPaidReport(
  input: VedicRelationshipPaidReportInput
): Promise<VedicRelationshipPaidReportResult> {
  const config = getVedicReportConfig(input.env);

  if (!config.enabled || config.mode === 'disabled') {
    return emptyResult({
      status: 'skipped',
      mode: 'disabled',
      locked: true,
      reason: 'disabled',
    });
  }

  if (!input.chartData) {
    return emptyResult({
      status: 'locked',
      mode: config.mode,
      locked: true,
      reason: 'missing_chart_data',
    });
  }

  if (config.mode === 'paid' && !hasPaidEntitlement(input.entitlement)) {
    return emptyResult({
      status: 'locked',
      mode: config.mode,
      locked: true,
      reason: 'missing_entitlement',
      warnings: ['Vedic paid report requires paid or pro entitlement.'],
    });
  }

  const report = await (input.generateReport ?? buildDefaultRelationshipReport)(input.chartData);
  const publicSummary = buildPublicSummary(report);

  if (config.mode === 'preview') {
    return {
      status: 'preview',
      mode: config.mode,
      locked: true,
      publicSummary,
      internalPreview: buildInternalPreview(report),
      fullReportMarkdown: null,
      sections: [...PAID_SECTIONS],
      warnings: input.chartData.warnings,
      aiMeta: {
        engine: 'vedic',
        route: 'relationship_paid_vedic',
        mode: config.mode,
        liveCall: false,
        generated: true,
      },
    };
  }

  return {
    status: 'generated',
    mode: config.mode,
    locked: false,
    publicSummary,
    internalPreview: null,
    fullReportMarkdown: renderPaidRelationshipMarkdown(report),
    sections: [...PAID_SECTIONS],
    warnings: input.chartData.warnings,
    aiMeta: {
      engine: 'vedic',
      route: 'relationship_paid_vedic',
      mode: config.mode,
      liveCall: false,
      generated: true,
    },
  };
}
