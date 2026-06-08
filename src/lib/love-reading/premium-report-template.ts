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
    relationship_summary: '关系总览',
    archetype_detail: '关系原型',
    five_dimensions: '五维度分�?,
    timing_window: '当前关系窗口',
    communication_repair: '沟通修复脚�?,
    next_7_days: '未来7�?,
    next_30_days: '未来30�?,
    strengths: '关系优势',
    friction_points: '容易卡住的位�?,
    next_best_action: '下一步最佳行�?,
    closing_summary: '总结',
  },
  'zh-Hant': {
    relationship_summary: '關係總覽',
    archetype_detail: '關係原型',
    five_dimensions: '五維度分�?,
    timing_window: '當前關係窗口',
    communication_repair: '溝通修復腳�?,
    next_7_days: '未來7�?,
    next_30_days: '未來30�?,
    strengths: '關係優勢',
    friction_points: '容易卡住的位�?,
    next_best_action: '下一步最佳行�?,
    closing_summary: '總結',
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
