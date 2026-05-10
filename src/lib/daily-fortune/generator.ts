import {
  buildContentSections,
  buildHeadline,
  buildSummary,
} from '@/lib/daily-fortune/content-templates';
import { calculateDailyFortuneScores } from '@/lib/daily-fortune/scoring';
import { getDailyFortuneDisclaimer } from '@/lib/daily-fortune/safety';
import type {
  DailyFortuneReport,
  FortuneDimension,
  FortuneDriver,
  FortuneRiskTag,
  GenerateDailyFortuneInput,
} from '@/types/daily-fortune';

export function buildDailyFortuneCacheKey(params: {
  userId: string;
  profileId?: string;
  date: string;
  systemType: string;
  language: string;
  tier: string;
}): string {
  return [
    'daily_fortune',
    params.userId,
    params.profileId || 'none',
    params.date,
    params.systemType,
    params.language,
    params.tier,
  ].join(':');
}

function makeRisk(
  dimension: FortuneDimension,
  tag: string,
  severity: FortuneRiskTag['severity'],
  reason: string
): FortuneRiskTag {
  return { dimension, tag, severity, reason };
}

function addContextRisks(input: GenerateDailyFortuneInput, risks: FortuneRiskTag[]): void {
  input.destinyProfile?.relationshipRisk?.forEach((tag) => {
    risks.push(makeRisk('love', tag, 'medium', 'Profile signal suggests relationship pacing should stay gentle.'));
  });
  input.destinyProfile?.careerRisk?.forEach((tag) => {
    risks.push(makeRisk('career', tag, 'medium', 'Profile signal suggests narrowing career focus.'));
  });
  input.destinyProfile?.wealthRisk?.forEach((tag) => {
    risks.push(makeRisk('wealth', tag, tag === 'high_risk_decision' ? 'high' : 'medium', 'Profile signal suggests conservative money pacing.'));
  });
  input.destinyProfile?.healthRisk?.forEach((tag) => {
    risks.push(makeRisk('health', tag, 'medium', 'Profile signal suggests rest and self-observation.'));
  });
}

function deriveScoreRisks(input: GenerateDailyFortuneInput, risks: FortuneRiskTag[]): void {
  const scores = calculateDailyFortuneScores({
    seed: buildDailyFortuneCacheKey(input),
    context: input.destinyProfile,
  });

  if (scores.love < 72 && !risks.some((risk) => risk.dimension === 'love')) {
    risks.push(makeRisk('love', 'communication_tension', 'medium', 'Love score is asking for slower communication.'));
  }
  if (scores.career < 68 && !risks.some((risk) => risk.dimension === 'career')) {
    risks.push(makeRisk('career', 'overload', 'medium', 'Career score suggests protecting attention.'));
  }
  if (scores.wealth < 70 && !risks.some((risk) => risk.dimension === 'wealth')) {
    risks.push(makeRisk('wealth', 'impulse_spending', 'medium', 'Wealth score suggests delaying optional spending.'));
  }
  if (scores.health < 70 && !risks.some((risk) => risk.dimension === 'health')) {
    risks.push(makeRisk('health', 'low_energy', 'medium', 'Health score suggests rest and observation.'));
  }
}

function buildDrivers(input: GenerateDailyFortuneInput): FortuneDriver[] {
  const drivers: FortuneDriver[] = [
    {
      key: 'daily_seed',
      label: input.language === 'zh' ? '每日节奏' : 'Daily cadence',
      description: input.language === 'zh' ? '基于日期和系统类型生成稳定日节奏。' : 'Stable date and system cadence.',
      weight: 0.3,
    },
  ];

  if (input.destinyProfile?.profileSignals?.length) {
    drivers.push({
      key: 'profile_signal',
      label: input.language === 'zh' ? '画像信号' : 'Profile signal',
      description: input.language === 'zh' ? '已参考统一画像中的近期倾向。' : 'Unified profile signals are included.',
      weight: 0.4,
    });
  }

  return drivers;
}

export function generateDailyFortuneReport(input: GenerateDailyFortuneInput): DailyFortuneReport {
  const cacheKey = buildDailyFortuneCacheKey(input);
  const scores = calculateDailyFortuneScores({ seed: cacheKey, context: input.destinyProfile });
  const riskTags: FortuneRiskTag[] = [];
  addContextRisks(input, riskTags);
  deriveScoreRisks(input, riskTags);

  return {
    userId: input.userId,
    profileId: input.profileId,
    date: input.date,
    timezone: input.timezone,
    systemType: input.systemType,
    language: input.language,
    tier: input.tier,
    scores,
    headline: buildHeadline(scores, input.language),
    summary: buildSummary(scores, input.language),
    drivers: buildDrivers(input),
    riskTags,
    remedies: [],
    disclaimer: getDailyFortuneDisclaimer(input.language),
    generatedBy: 'rules_v1',
    cacheKey,
    content: buildContentSections(scores, input.language),
  };
}
