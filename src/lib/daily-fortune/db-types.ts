import type { DailyFortuneReport, FortuneRemedyRule, RemedyAction } from '@/types/daily-fortune';

export interface DailyFortuneReportRow {
  id: string;
  user_id: string;
  profile_id: string | null;
  date: string;
  timezone: string;
  system_type: string;
  language: string;
  tier: string;
  overall_score: number;
  scores_json: Record<string, unknown>;
  headline: string;
  summary: string;
  drivers_json: unknown[];
  content_json: Record<string, unknown>;
  disclaimer: string;
  status: string;
  cache_key: string;
  generated_by: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface FortuneRemedyRuleRow {
  id: string;
  dimension: string;
  risk_tag: string;
  condition_json: Record<string, unknown>;
  priority: number;
  template_key: string;
  title_template: string;
  body_template: string;
  reason_template: string;
  action_type: string;
  min_tier: string;
  is_active: boolean;
}

export interface FortuneRemedyActionRow {
  id: string;
  report_id: string;
  rule_id: string | null;
  type: string;
  title: string;
  body: string;
  reason: string;
  priority: string;
  cta_json: Record<string, unknown>;
  sort_order: number;
}

export interface PersistedDailyFortuneReport extends DailyFortuneReport {
  remedies: RemedyAction[];
}

export type { DailyFortuneReport, FortuneRemedyRule, RemedyAction };
