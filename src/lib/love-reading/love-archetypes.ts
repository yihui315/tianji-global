import type { LoveReportLocale } from './report-schema';

export function chooseLoveArchetype(score: number, locale: LoveReportLocale) {
  const band = score >= 78 ? 'steady-flame' : score >= 58 ? 'learning-rhythm' : 'careful-mirror';

  const copy = {
    en: {
      'steady-flame': {
        title: 'Steady Flame',
        summary: 'There is warmth here, but the relationship grows best when consistency leads intensity.',
      },
      'learning-rhythm': {
        title: 'Learning Rhythm',
        summary: 'The connection has real signals, and the next step is learning each other pace without pressure.',
      },
      'careful-mirror': {
        title: 'Careful Mirror',
        summary: 'This bond reflects useful patterns, but it needs slower verification before deeper commitment.',
      },
    },
    zh: {
      'steady-flame': {
        title: '稳定火光�?,
        summary: '这段关系有温度，但最适合让稳定感走在强烈情绪前面�?,
      },
      'learning-rhythm': {
        title: '节奏学习�?,
        summary: '连接感是真实的，下一步是低压力地学习彼此节奏�?,
      },
      'careful-mirror': {
        title: '谨慎镜像�?,
        summary: '这段关系能照见有用模式，但需要更慢地验证真实相处质量�?,
      },
    },
    'zh-Hant': {
      'steady-flame': {
        title: '穩定火光�?,
        summary: '這段關係有溫度，但最適合讓穩定感走在強烈情緒前面�?,
      },
      'learning-rhythm': {
        title: '節奏學習型',
        summary: '連結感是真實的，下一步是低壓力地學習彼此節奏�?,
      },
      'careful-mirror': {
        title: '謹慎鏡像�?,
        summary: '這段關係能照見有用模式，但需要更慢地驗證真實相處品質�?,
      },
    },
  } as const;

  return {
    key: band,
    ...copy[locale][band],
  };
}
