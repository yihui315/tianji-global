import type { NormalizedPayload } from '@/types/module-result';
import type { ModuleNormalizer } from './types';
import { asRecord, asString, asStringArray, compactSection, unique } from './helpers';

function collectDimensionValues(dimensions: Record<string, unknown>, key: 'strengths' | 'risks' | 'advice') {
  return unique(
    Object.values(dimensions).flatMap((value) => {
      const record = asRecord(value);
      return asStringArray(record[key]) ?? [];
    })
  );
}

export const relationshipNormalizer: ModuleNormalizer = {
  moduleType: 'relationship',
  normalize(raw, options = {}): NormalizedPayload {
    const reading = asRecord(raw.data ?? raw);
    const summaryRecord = asRecord(reading.summary);
    const dimensions = asRecord(reading.dimensions);
    const timeline = asRecord(reading.timeline);
    const headline = asString(summaryRecord.headline) || options.title || 'Relationship reading';
    const oneLiner = asString(summaryRecord.oneLiner) || options.summary || headline;
    const timingSummary =
      asString(timeline.next30Days) ||
      asString(timeline.currentPhase) ||
      'The next 30 days decide whether the connection deepens with clarity or drifts into ambiguity.';

    return {
      summary: {
        headline: options.title || headline,
        oneLiner,
        keywords: asStringArray(summaryRecord.keywords),
      },
      structure: {
        overallScore: reading.overallScore,
      },
      chart: {
        dimensions,
      },
      relationship: compactSection({
        headline,
        summary: oneLiner,
        strengths: collectDimensionValues(dimensions, 'strengths'),
        risks: collectDimensionValues(dimensions, 'risks'),
        advice: collectDimensionValues(dimensions, 'advice'),
      }),
      timing: compactSection({
        headline: asString(timeline.currentPhase) || 'Current 30-day window',
        summary: timingSummary,
      }),
      advice: compactSection({
        advice: collectDimensionValues(dimensions, 'advice'),
      }),
      risk: compactSection({
        risks: collectDimensionValues(dimensions, 'risks'),
      }),
      timeline: {
        currentPhase: asString(timeline.currentPhase),
        next30Days: asString(timeline.next30Days),
        next90Days: asString(timeline.next90Days),
      },
    };
  },
};
