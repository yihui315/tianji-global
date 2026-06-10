import type { LoveReportLocale } from './report-schema';

export function buildCurrentLoveWindow(score: number, _locale: LoveReportLocale, uncertaintyNote?: string) {
  const high = score >= 75;
  const low = score < 50;

  return {
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
    uncertaintyNote,
  };
}
