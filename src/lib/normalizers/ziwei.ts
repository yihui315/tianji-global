import type { NormalizedPayload } from '@/types/module-result';
import type { ModuleNormalizer } from './types';
import { asRecord, asString, compactSection, unique } from './helpers';

export const ziweiNormalizer: ModuleNormalizer = {
  moduleType: 'ziwei',
  normalize(raw, options = {}): NormalizedPayload {
    const lifePalaceName = asString(raw.lifePalaceName) || 'Life Palace';
    const bodyPalaceName = asString(raw.bodyPalaceName) || 'Body Palace';
    const interpretation =
      asString(raw.aiInterpretation) ||
      options.summary ||
      `${lifePalaceName} points to a life path built around synthesis and deliberate emotional timing.`;

    return {
      summary: {
        headline: options.title || `${lifePalaceName} Reading`,
        oneLiner: interpretation,
        keywords: unique([
          lifePalaceName,
          bodyPalaceName,
          asString(raw.soul),
          asString(raw.sign),
        ]),
      },
      structure: {
        lifePalaceName,
        bodyPalaceName,
        fiveElementsClass: asString(raw.fiveElementsClass),
        soul: asString(raw.soul),
        body: asString(raw.body),
        sign: asString(raw.sign),
        zodiac: asString(raw.zodiac),
      },
      chart: asRecord(raw.raw),
      identity: compactSection({
        headline: `Life Palace: ${lifePalaceName}`,
        summary: interpretation,
        strengths: unique([asString(raw.soul), asString(raw.body), 'synthesis']),
      }),
      relationship: compactSection({
        headline: `Body Palace: ${bodyPalaceName}`,
        summary: interpretation.includes('trust')
          ? interpretation
          : `${interpretation} Trust grows when you make emotional pacing more explicit.`,
        opportunities: ['steady trust', 'clearer pacing'],
      }),
      career: compactSection({
        headline: 'Work style favors synthesis',
        summary: `${lifePalaceName} and ${bodyPalaceName} suggest stronger outcomes when strategy and execution stay aligned.`,
      }),
      advice: compactSection({
        advice: ['Name the long-term pattern before reacting to short-term noise'],
      }),
      risk: compactSection({
        risks: ['drifting into over-analysis without a decision window'],
      }),
      timeline: {},
    };
  },
};
