import type { NormalizedPayload } from '@/types/module-result';
import type { ModuleNormalizer } from './types';
import { asRecord, asString, asStringArray, compactSection, createTimelinePhases } from './helpers';

export const fortuneNormalizer: ModuleNormalizer = {
  moduleType: 'fortune',
  normalize(raw, options = {}): NormalizedPayload {
    const currentPhase = asString(raw.currentPhase) || 'Current timing window';
    const summary = asString(raw.aiInterpretation) || asString(raw.summary) || options.summary || currentPhase;
    const bestPeriods = asStringArray(raw.bestPeriods);
    const challengingPeriods = asStringArray(raw.challengingPeriods);
    const firstCycle = Array.isArray(raw.fortuneCycles) ? asRecord(raw.fortuneCycles[0]) : {};

    return {
      summary: {
        headline: options.title || 'Fortune reading',
        oneLiner: summary,
        keywords: [currentPhase],
      },
      structure: {
        currentPhase,
        bestPeriods,
        challengingPeriods,
      },
      chart: {
        fortuneCycles: Array.isArray(raw.fortuneCycles) ? raw.fortuneCycles : [],
      },
      timing: compactSection({
        headline: 'Current timing window',
        summary: `${currentPhase}: ${summary}`,
        opportunities: bestPeriods,
        risks: challengingPeriods,
      }),
      career: compactSection({
        headline: 'Career timing',
        summary: typeof firstCycle.career === 'number'
          ? `Your current career score suggests the best progress comes from disciplined positioning rather than scattered moves.`
          : undefined,
      }),
      wealth: compactSection({
        headline: 'Wealth timing',
        summary: typeof firstCycle.wealth === 'number'
          ? `Money improves when you follow your strongest timing windows instead of reacting to every fluctuation.`
          : undefined,
      }),
      advice: compactSection({
        advice: ['Double down on the strongest window', 'Treat lower-score phases as simplification periods'],
      }),
      risk: compactSection({
        risks: challengingPeriods,
      }),
      timeline: {
        currentPhase,
        next30Days: summary,
        phases: createTimelinePhases(bestPeriods),
      },
    };
  },
};
