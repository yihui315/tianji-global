import type { LoveReportLocale } from './report-schema';

export function buildCurrentLoveWindow(score: number, locale: LoveReportLocale, uncertaintyNote?: string) {
  const high = score >= 75;
  const low = score < 50;

  const copy = {
    en: {
      label: high ? 'Alignment window' : low ? 'Observation window' : 'Calibration window',
      summary: high
        ? 'The next few weeks are better for steady action than dramatic promises.'
        : low
          ? 'This stage is better for observing communication quality before pushing for certainty.'
          : 'The current window favors gentle calibration, honest check-ins, and practical consistency.',
      recommendedAction: high
        ? 'Choose one concrete shared plan and keep it simple.'
        : low
          ? 'Ask for one clear conversation and watch whether repair is possible.'
          : 'Name one expectation and one boundary before the next emotional decision.',
    },
    zh: {
      label: high ? '对齐窗口' : low ? '观察窗口' : '校准窗口',
      summary: high ? '未来几周更适合稳定行动，而不是强烈承诺�? : low ? '这个阶段更适合观察沟通质量，不急着追求确定答案�? : '当前窗口适合温和校准、诚实确认和持续的小行动�?,
      recommendedAction: high ? '安排一个具体但简单的共同计划�? : low ? '发起一次清晰对话，并观察双方是否愿意修复�? : '在下一次情绪决定前，说清一个期待和一个边界�?,
    },
    'zh-Hant': {
      label: high ? '對齊窗口' : low ? '觀察窗�? : '校準窗口',
      summary: high ? '未來幾週更適合穩定行動，而不是強烈承諾�? : low ? '這個階段更適合觀察溝通品質，不急著追求確定答案�? : '當前窗口適合溫和校準、誠實確認和持續的小行動�?,
      recommendedAction: high ? '安排一個具體但簡單的共同計畫�? : low ? '發起一次清晰對話，並觀察雙方是否願意修復�? : '在下一次情緒決定前，說清一個期待和一個邊界�?,
    },
  } as const;

  return {
    ...copy[locale],
    uncertaintyNote,
  };
}
