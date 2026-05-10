import type { FortuneLanguage } from '@/types/daily-fortune';

const unsafePatterns = [
  /保证发财/,
  /必定复合/,
  /必然分手/,
  /投资建议/,
  /诊断/,
  /治疗/,
  /法律意见/,
  /你会死亡/,
  /灾祸无法避免/,
  /guaranteed profit/i,
  /medical diagnosis/i,
  /investment advice/i,
  /legal advice/i,
];

export function getDailyFortuneDisclaimer(language: FortuneLanguage): string {
  return language === 'zh'
    ? '仅供娱乐与自我观察，不构成医疗、法律、投资或婚恋决定建议。重要决定请咨询具备资质的专业人士。'
    : 'For entertainment and self-reflection only. This is not medical, legal, investment, or relationship decision advice. Consult qualified professionals for important decisions.';
}

export function hasUnsafeFortuneCopy(value: string): boolean {
  return unsafePatterns.some((pattern) => pattern.test(value));
}

export function sanitizeFortuneCopy(value: string, language: FortuneLanguage): string {
  if (!hasUnsafeFortuneCopy(value)) {
    return value;
  }

  return language === 'zh'
    ? '这条提示已被安全降级：今天只做观察、记录和延后决定。'
    : 'This guidance was safety-limited: observe, record, and defer major decisions today.';
}

export function toLocale(language: FortuneLanguage): 'en-US' | 'zh-CN' {
  return language === 'zh' ? 'zh-CN' : 'en-US';
}
