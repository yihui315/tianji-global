export type FortuneDimension = 'love' | 'career' | 'wealth' | 'health';

export type DailyFortuneSystemType = 'bazi' | 'relationship' | 'tarot' | 'integrated';

export type FortuneTier = 'free' | 'premium' | 'pro';

export type FortuneLanguage = 'en' | 'zh';

export interface DailyFortuneScores {
  overall: number;
  love: number;
  career: number;
  wealth: number;
  health: number;
}

export interface FortuneDriver {
  key: string;
  label: string;
  description: string;
  weight?: number;
}

export interface FortuneRiskTag {
  dimension: FortuneDimension;
  tag: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
}

export interface RemedyAction {
  id?: string;
  ruleId?: string;
  type: 'action' | 'ritual_copy' | 'self_observation' | 'resource' | 'disclaimer_guard';
  dimension: FortuneDimension;
  title: string;
  body: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  sortOrder?: number;
  cta?: {
    label?: string;
    href?: string;
    paywalled?: boolean;
  };
  locked?: boolean;
}

export interface DailyFortuneReport {
  id?: string;
  userId: string;
  profileId?: string;
  date: string;
  timezone: string;
  systemType: DailyFortuneSystemType;
  language: FortuneLanguage;
  tier: FortuneTier;
  scores: DailyFortuneScores;
  headline: string;
  summary: string;
  drivers: FortuneDriver[];
  riskTags: FortuneRiskTag[];
  remedies: RemedyAction[];
  disclaimer: string;
  generatedBy: string;
  cacheKey: string;
  content?: Record<string, unknown>;
  locked?: {
    drivers?: boolean;
    remedies?: boolean;
    sections?: boolean;
    reason: 'premium_required';
  };
}

export interface DailyFortuneContextSignals {
  relationshipRisk?: string[];
  careerRisk?: string[];
  wealthRisk?: string[];
  healthRisk?: string[];
  profileSignals?: string[];
  timingWindow?: 'supportive' | 'neutral' | 'pressure';
  monthlyOverlay?: 'supportive' | 'neutral' | 'pressure';
}

export interface GenerateDailyFortuneInput {
  userId: string;
  profileId?: string;
  date: string;
  timezone: string;
  systemType: DailyFortuneSystemType;
  language: FortuneLanguage;
  tier: FortuneTier;
  destinyProfile?: DailyFortuneContextSignals;
  recentModuleResults?: Array<Record<string, unknown>>;
  recentEvents?: Array<Record<string, unknown>>;
}

export interface FortuneRemedyRule {
  id: string;
  dimension: FortuneDimension;
  riskTag: string;
  condition: Record<string, unknown>;
  priority: number;
  templateKey: string;
  titleTemplate: string;
  bodyTemplate: string;
  reasonTemplate: string;
  actionType: RemedyAction['type'];
  minTier: FortuneTier;
  isActive: boolean;
}

export interface DailyFortuneError {
  code: string;
  message: string;
}

export type DailyFortuneResult<T> =
  | { success: true; data: T }
  | { success: false; error: DailyFortuneError };
