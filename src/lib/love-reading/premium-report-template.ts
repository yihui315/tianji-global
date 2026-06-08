import type { LoveReportLocale, PremiumReportSection } from './report-schema';

const titles: Record<LoveReportLocale, Record<PremiumReportSection['key'], string>> = {
  en: {
    relationship_summary: 'Relationship summary',
    archetype_detail: 'Archetype detail',
    five_dimensions: 'Five-dimension analysis',
    timing_window: 'Current timing window',
    communication_repair: 'Communication repair script',
    next_7_days: 'Next 7 days',
    next_30_days: 'Next 30 days',
    strengths: 'Strengths',
    friction_points: 'Friction points',
    next_best_action: 'Next best action',
    closing_summary: 'Closing summary',
  },
  zh: {
    relationship_summary: 'Relationship summary',
    archetype_detail: 'Archetype detail',
    five_dimensions: 'Five-dimension analysis',
    timing_window: 'Current timing window',
    communication_repair: 'Communication repair script',
    next_7_days: 'Next 7 days',
    next_30_days: 'Next 30 days',
    strengths: 'Strengths',
    friction_points: 'Friction points',
    next_best_action: 'Next best action',
    closing_summary: 'Closing summary',
  },
  'zh-Hant': {
    relationship_summary: 'Relationship summary',
    archetype_detail: 'Archetype detail',
    five_dimensions: 'Five-dimension analysis',
    timing_window: 'Current timing window',
    communication_repair: 'Communication repair script',
    next_7_days: 'Next 7 days',
    next_30_days: 'Next 30 days',
    strengths: 'Strengths',
    friction_points: 'Friction points',
    next_best_action: 'Next best action',
    closing_summary: 'Closing summary',
  },
};

export const PREMIUM_SECTION_KEYS: PremiumReportSection['key'][] = [
  'relationship_summary',
  'archetype_detail',
  'five_dimensions',
  'timing_window',
  'communication_repair',
  'next_7_days',
  'next_30_days',
  'strengths',
  'friction_points',
  'next_best_action',
  'closing_summary',
];

export function premiumTitle(locale: LoveReportLocale, key: PremiumReportSection['key']) {
  return titles[locale][key];
}
