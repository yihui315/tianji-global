import type { NormalizedPayload } from '@/types/module-result';
import type { ModuleNormalizer } from './types';
import { asRecord, asString, compactSection, unique } from './helpers';

function summarizePillars(chart: Record<string, unknown>) {
  const pillars = ['year', 'month', 'day', 'hour']
    .map((key) => {
      const pillar = asRecord(chart[key]);
      const stem = asString(pillar.heavenlyStem);
      const branch = asString(pillar.earthlyBranch);
      const element = asString(pillar.element);

      if (!stem && !branch && !element) {
        return undefined;
      }

      return [stem, branch, element].filter(Boolean).join(' ');
    })
    .filter((item): item is string => Boolean(item));

  return pillars.length > 0 ? pillars : undefined;
}

export const baziNormalizer: ModuleNormalizer = {
  moduleType: 'bazi',
  normalize(raw, options = {}): NormalizedPayload {
    const chart = asRecord(raw.chart);
    const dayMasterElement =
      asString(chart.dayMasterElement) ||
      asString(asRecord(chart.day).element) ||
      'Unknown';
    const interpretation =
      asString(raw.aiInterpretation) ||
      asString(raw.interpretation) ||
      options.summary ||
      `${dayMasterElement} personalities grow through structure and timing.`;

    const keywords = unique([
      dayMasterElement,
      asString(asRecord(chart.year).element),
      asString(asRecord(chart.month).element),
      asString(asRecord(chart.hour).element),
    ]);

    return {
      summary: {
        headline: options.title || `${dayMasterElement} Day Master`,
        oneLiner: interpretation,
        keywords,
      },
      structure: {
        dayMasterElement,
        pillars: summarizePillars(chart),
      },
      chart,
      identity: compactSection({
        headline: `${dayMasterElement} Day Master`,
        summary: interpretation,
        strengths: unique([
          `${dayMasterElement.toLowerCase()} discipline`,
          'pattern recognition',
          'long-range judgment',
        ]),
      }),
      career: compactSection({
        headline: 'Judgment compounds faster than speed',
        summary: `${interpretation} Your work path rewards judgment, structure, and a longer operating horizon.`,
        opportunities: ['fewer but higher-conviction commitments'],
      }),
      wealth: compactSection({
        headline: 'Wealth follows pace and structure',
        summary: 'Money stabilizes when pace, structure, and timing stay aligned instead of forcing fast expansion.',
        risks: ['rushing the compounding phase'],
      }),
      timing: compactSection({
        headline: 'Best timing comes after alignment',
        summary: 'Your strongest gains show up once preparation and timing move together.',
      }),
      advice: compactSection({
        advice: ['Choose depth over scattered effort', 'Let timing confirm the next move before forcing it'],
      }),
      risk: compactSection({
        risks: ['overextending before the structure is ready'],
      }),
      timeline: {},
    };
  },
};
