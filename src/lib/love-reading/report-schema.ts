export const LOVE_REPORT_VERSION = 'love-report-v1' as const;

export const LOVE_REPORT_LOCALES = ['zh', 'en', 'zh-Hant'] as const;
export type LoveReportLocale = (typeof LOVE_REPORT_LOCALES)[number];

export type LoveReportVisibility = 'free' | 'premium' | 'public';

export const LOVE_DIMENSION_KEYS = [
  'emotional_connection',
  'communication',
  'values_alignment',
  'growth_support',
  'passion_intimacy',
] as const;

export type LoveDimensionKey = (typeof LOVE_DIMENSION_KEYS)[number];

export type LoveDimension = {
  key: LoveDimensionKey;
  score: number;
  label: string;
  insight: string;
  evidence: string[];
  action: string;
  uncertaintyNote?: string;
};

export type PrivateBirthInput = {
  name?: string;
  birthDate?: string;
  birthTime?: string | null;
  birthPlace?: string | null;
  privateQuestion?: string | null;
  contactInfo?: string | null;
};

export type PublicBirthSummary = {
  displayName?: string;
  zodiacSign?: string;
  birthMonthLabel?: string;
  hasExactTime: false;
  hasBirthPlace: false;
};

export type PrivacySafeShareSummary = {
  title: string;
  summary: string;
  scoreBand: string;
  cta: string;
  archetypeTitle?: string;
};

export type PremiumReportSection = {
  key:
    | 'relationship_summary'
    | 'archetype_detail'
    | 'five_dimensions'
    | 'timing_window'
    | 'communication_repair'
    | 'next_7_days'
    | 'next_30_days'
    | 'strengths'
    | 'friction_points'
    | 'next_best_action'
    | 'closing_summary';
  title: string;
  body: string;
  visibility: 'premium';
};

export type LoveReport = {
  version: typeof LOVE_REPORT_VERSION;
  locale: LoveReportLocale;
  visibility: LoveReportVisibility;
  headline: string;
  oneLiner: string;
  relationshipArchetype: {
    key: string;
    title: string;
    summary: string;
  };
  overallScore: number;
  dimensions: LoveDimension[];
  currentWindow: {
    label: string;
    summary: string;
    recommendedAction: string;
    uncertaintyNote?: string;
  };
  strengths: string[];
  frictionPoints: string[];
  next7Days: string[];
  next30Days: string[];
  premiumTeaser: string;
  premiumSections: PremiumReportSection[];
  privacySafeShareSummary: PrivacySafeShareSummary;
  createdAt: string;
};

export type LoveReportQualityIssue = {
  code:
    | 'missing_headline'
    | 'missing_dimensions'
    | 'invalid_score'
    | 'missing_locale'
    | 'missing_share_summary'
    | 'forbidden_absolute_claim'
    | 'fear_based_cta'
    | 'private_field_leak'
    | 'premium_content_leak';
  message: string;
  path?: string;
};

export function normalizeLoveReportLocale(locale?: string): LoveReportLocale {
  if (locale === 'zh-Hant') return 'zh-Hant';
  if (locale === 'zh' || locale === 'zh-CN' || locale === 'zh-Hans') return 'zh';
  return 'en';
}

export function scoreBand(score: number) {
  if (score >= 80) return '80-100';
  if (score >= 60) return '60-79';
  if (score >= 40) return '40-59';
  return '0-39';
}
