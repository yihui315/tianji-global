import type { LoveReportLocale } from './report-schema';

type WindowCopy = {
  label: string;
  summary: string;
  recommendedAction: string;
};

function buildEnglishWindow(score: number): WindowCopy {
  const high = score >= 75;
  const low = score < 50;

  if (high) {
    return {
      label: 'Alignment window',
      summary: 'The next few weeks are better for steady action than dramatic promises.',
      recommendedAction: 'Choose one concrete shared plan and keep it simple.',
    };
  }

  if (low) {
    return {
      label: 'Observation window',
      summary: 'This stage is better for observing communication quality before pushing for certainty.',
      recommendedAction: 'Ask for one clear conversation and watch whether repair is possible.',
    };
  }

  return {
    label: 'Calibration window',
    summary: 'The current window favors gentle calibration, honest check-ins, and practical consistency.',
    recommendedAction: 'Name one expectation and one boundary before the next emotional decision.',
  };
}

export function buildCurrentLoveWindow(score: number, locale: LoveReportLocale, uncertaintyNote?: string) {
  const copy: Record<LoveReportLocale, WindowCopy> = {
    en: buildEnglishWindow(score),
    zh: buildEnglishWindow(score),
    'zh-Hant': buildEnglishWindow(score),
  };

  return {
    ...copy[locale],
    uncertaintyNote,
  };
}
