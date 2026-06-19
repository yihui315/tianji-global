import type { LoveReportLocale } from './report-schema';

type ArchetypeCopy = {
  title: string;
  summary: string;
};

const copy: Record<LoveReportLocale, Record<string, ArchetypeCopy>> = {
  en: {
    'steady-flame': {
      title: 'Steady Flame',
      summary: 'There is warmth here, and the connection grows best when consistency leads intensity.',
    },
    'learning-rhythm': {
      title: 'Learning Rhythm',
      summary: 'The connection has real signals, and the next step is learning each other pace without pressure.',
    },
    'careful-mirror': {
      title: 'Careful Mirror',
      summary: 'This bond reflects useful patterns, and it benefits from slower verification before deeper commitment.',
    },
  },
  zh: {
    'steady-flame': {
      title: 'Steady Flame',
      summary: 'This localized preview keeps the same meaning: warmth is present, and steady consistency matters most.',
    },
    'learning-rhythm': {
      title: 'Learning Rhythm',
      summary: 'This localized preview keeps the same meaning: the signal is real, and the pace needs gentle learning.',
    },
    'careful-mirror': {
      title: 'Careful Mirror',
      summary: 'This localized preview keeps the same meaning: the pattern is useful, and slower verification helps.',
    },
  },
  'zh-Hant': {
    'steady-flame': {
      title: 'Steady Flame',
      summary: 'This localized preview keeps the same meaning: warmth is present, and steady consistency matters most.',
    },
    'learning-rhythm': {
      title: 'Learning Rhythm',
      summary: 'This localized preview keeps the same meaning: the signal is real, and the pace needs gentle learning.',
    },
    'careful-mirror': {
      title: 'Careful Mirror',
      summary: 'This localized preview keeps the same meaning: the pattern is useful, and slower verification helps.',
    },
  },
};

export function chooseLoveArchetype(score: number, locale: LoveReportLocale) {
  const band = score >= 78 ? 'steady-flame' : score >= 58 ? 'learning-rhythm' : 'careful-mirror';

  return {
    key: band,
    ...copy[locale][band],
  };
}
