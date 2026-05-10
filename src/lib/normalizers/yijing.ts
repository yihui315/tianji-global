import type { NormalizedPayload } from '@/types/module-result';
import { asNumber, asRecord, asRecordArray, asString, compactSection } from './helpers';
import type { ModuleNormalizer } from './types';

export const yijingNormalizer: ModuleNormalizer = {
  moduleType: 'yijing',
  normalize(raw, options = {}): NormalizedPayload {
    const hexagram = asRecord(raw.hexagram);
    const lines = asRecordArray(raw.lines);
    const number = asNumber(hexagram.number);
    const name = asString(hexagram.english) ?? asString(hexagram.name) ?? 'Hexagram';
    const judgement = asString(hexagram.judgementEn) ?? asString(hexagram.judgement) ?? asString(hexagram.judgementZh);
    const image = asString(hexagram.imageEn) ?? asString(hexagram.image) ?? asString(hexagram.imageZh);
    const aiInterpretation = asString(raw.aiInterpretation);
    const question = asString(raw.question);
    const changingLineRisks = lines
      .filter((line) => line.isChanging === true)
      .map((line) => asString(line.meaningEn) ?? asString(line.meaning))
      .filter((item): item is string => Boolean(item));
    const headline = number ? `Hexagram ${number}: ${name}` : name;

    return {
      summary: {
        headline: options.title ?? headline,
        oneLiner: aiInterpretation ?? options.summary ?? judgement,
        keywords: [name, number ? `Hexagram ${number}` : undefined].filter((item): item is string => Boolean(item)),
      },
      structure: {
        hexagram,
        question,
        hasChangingLines: raw.hasChangingLines,
      },
      chart: {
        lines,
      },
      timing: compactSection({
        headline,
        summary: aiInterpretation ?? judgement,
        opportunities: image ? [image] : undefined,
      }),
      advice: compactSection({
        headline: 'Oracle guidance',
        summary: aiInterpretation ?? judgement,
        advice: [judgement, image].filter((item): item is string => Boolean(item)).slice(0, 4),
      }),
      risk: compactSection({
        headline: changingLineRisks.length ? 'Changing-line cautions' : undefined,
        risks: changingLineRisks,
      }),
      timeline: {
        currentPhase: number ? `Hexagram ${number}` : name,
      },
    };
  },
};
