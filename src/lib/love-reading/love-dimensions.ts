import { LOVE_DIMENSION_KEYS, type LoveDimension, type LoveDimensionKey, type LoveReportLocale } from './report-schema';

type Copy = {
  label: string;
  insight: string;
  action: string;
};

const englishCopy: Record<LoveDimensionKey, Copy> = {
  emotional_connection: {
    label: 'Emotional connection',
    insight: 'The emotional signal is clearest when both people can name what they need without pressure.',
    action: 'Ask one direct but low-pressure question about what feels safe right now.',
  },
  communication: {
    label: 'Communication',
    insight: 'Communication improves when the goal is understanding before persuasion.',
    action: 'Repeat back what you heard before adding your own interpretation.',
  },
  values_alignment: {
    label: 'Values alignment',
    insight: 'Longer-term fit depends on how honestly both people handle expectations and boundaries.',
    action: 'Name one shared value and one difference that deserves patience.',
  },
  growth_support: {
    label: 'Growth support',
    insight: 'This connection works best when support does not become control.',
    action: 'Offer one concrete form of support and let the other person choose the pace.',
  },
  passion_intimacy: {
    label: 'Passion and intimacy',
    insight: 'Attraction is useful when it is matched with emotional steadiness.',
    action: 'Let warmth build through consistency rather than intensity alone.',
  },
};

const copy: Record<LoveReportLocale, Record<LoveDimensionKey, Copy>> = {
  en: englishCopy,
  zh: englishCopy,
  'zh-Hant': englishCopy,
};

export function buildLoveDimensions(
  locale: LoveReportLocale,
  scores: Partial<Record<LoveDimensionKey, number>>,
  uncertaintyNote?: string
): LoveDimension[] {
  return LOVE_DIMENSION_KEYS.map((key) => {
    const score = Math.max(0, Math.min(100, Math.round(scores[key] ?? 66)));
    const item = copy[locale][key];

    return {
      key,
      score,
      label: item.label,
      insight: item.insight,
      evidence: ['Deterministic relationship preview signal', score >= 70 ? 'Strong relative score band' : 'Needs mindful calibration'],
      action: item.action,
      uncertaintyNote,
    };
  });
}
