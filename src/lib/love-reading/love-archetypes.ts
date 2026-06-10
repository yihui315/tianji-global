import type { LoveReportLocale } from './report-schema';

const archetypeCopy = {
  en: {
    steady: {
      title: 'Steady Flame',
      summary: 'There is warmth here, and the relationship grows best when consistency leads intensity.',
    },
    learning: {
      title: 'Learning Rhythm',
      summary: 'The connection has real signals, and the next step is learning each other pace without pressure.',
    },
    careful: {
      title: 'Careful Mirror',
      summary: 'This bond reflects useful patterns, but it needs slower verification before deeper commitment.',
    },
  },
  zh: {
    steady: {
      title: 'Steady Flame',
      summary: 'This connection has warmth; use steady actions before strong promises.',
    },
    learning: {
      title: 'Learning Rhythm',
      summary: 'The connection is real, and the next step is learning each other pace with low pressure.',
    },
    careful: {
      title: 'Careful Mirror',
      summary: 'The bond reflects useful patterns and should be verified slowly before deeper commitment.',
    },
  },
  'zh-Hant': {
    steady: {
      title: 'Steady Flame',
      summary: 'This connection has warmth; use steady actions before strong promises.',
    },
    learning: {
      title: 'Learning Rhythm',
      summary: 'The connection is real, and the next step is learning each other pace with low pressure.',
    },
    careful: {
      title: 'Careful Mirror',
      summary: 'The bond reflects useful patterns and should be verified slowly before deeper commitment.',
    },
  },
} as const;

export function chooseLoveArchetype(score: number, locale: LoveReportLocale) {
  const band = score >= 78 ? 'steady' : score >= 58 ? 'learning' : 'careful';

  return {
    key: band,
    ...archetypeCopy[locale][band],
  };
}
