import type { NormalizedPayload, TimelinePhase } from '@/types/module-result';
import { asRecord, asRecordArray, asString, compactSection, unique } from './helpers';
import type { ModuleNormalizer } from './types';

function cardName(card: Record<string, unknown>): string | undefined {
  return asString(asRecord(card.card).name) ?? asString(card.name);
}

export const tarotNormalizer: ModuleNormalizer = {
  moduleType: 'tarot',
  normalize(raw, options = {}): NormalizedPayload {
    const spread = asRecord(raw.spread);
    const drawnCards = asRecordArray(raw.drawnCards);
    const question = asString(raw.question);
    const aiInterpretation = asString(raw.aiInterpretation);
    const spreadName = asString(spread.name) ?? 'Tarot spread';
    const cardNames = unique(drawnCards.map(cardName));
    const cardInterpretations = drawnCards
      .map((card) => asString(card.interpretation))
      .filter((item): item is string => Boolean(item));
    const reversedRisks = drawnCards
      .filter((card) => card.isReversed === true)
      .map((card) => `${cardName(card) ?? asString(card.positionName) ?? 'Card'} reversed`);
    const phases: TimelinePhase[] = drawnCards
      .map((card, index) => {
        const label = asString(card.positionName) ?? cardName(card) ?? `Card ${index + 1}`;
        const description = asString(card.interpretation) ?? cardName(card) ?? label;
        return {
          range: String(card.position ?? index + 1),
          label,
          description,
        };
      })
      .filter((phase) => Boolean(phase.description));
    const relationshipQuestion = /relationship|love|partner|romance|connection|感情|关系|伴侣|恋/i.test(
      `${question ?? ''} ${aiInterpretation ?? ''}`
    );

    return {
      summary: {
        headline: options.title ?? `${spreadName} reading`,
        oneLiner: aiInterpretation ?? options.summary ?? cardInterpretations[0],
        keywords: cardNames.length ? cardNames : undefined,
      },
      structure: {
        spreadName,
        question,
        totalCards: raw.totalCards,
      },
      chart: {
        cards: drawnCards,
      },
      relationship: relationshipQuestion
        ? compactSection({
            headline: 'Relationship pattern from the spread',
            summary: aiInterpretation ?? question,
            advice: cardInterpretations.slice(0, 4),
          })
        : {},
      advice: compactSection({
        headline: 'Practical card guidance',
        summary: aiInterpretation ?? question ?? options.summary,
        advice: cardInterpretations.slice(0, 5),
      }),
      risk: compactSection({
        headline: reversedRisks.length ? 'Reversal warnings' : undefined,
        risks: reversedRisks,
      }),
      timeline: {
        phases: phases.length ? phases : undefined,
      },
    };
  },
};
