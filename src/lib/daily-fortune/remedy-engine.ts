import { sanitizeFortuneCopy } from '@/lib/daily-fortune/safety';
import type {
  DailyFortuneScores,
  FortuneRemedyRule,
  FortuneRiskTag,
  FortuneTier,
  RemedyAction,
} from '@/types/daily-fortune';

const tierRank: Record<FortuneTier, number> = {
  free: 0,
  premium: 1,
  pro: 2,
};

function scoreForDimension(scores: DailyFortuneScores, dimension: keyof Omit<DailyFortuneScores, 'overall'>): number {
  return scores[dimension];
}

function ruleMatches(rule: FortuneRemedyRule, riskTags: FortuneRiskTag[], scores: DailyFortuneScores, tier: FortuneTier): boolean {
  if (!rule.isActive || tierRank[tier] < tierRank[rule.minTier]) {
    return false;
  }

  const riskMatch = riskTags.some((risk) => risk.dimension === rule.dimension && risk.tag === rule.riskTag);
  if (!riskMatch) {
    return false;
  }

  const scoreBelow = Number(rule.condition.scoreBelow);
  if (Number.isFinite(scoreBelow) && scoreForDimension(scores, rule.dimension) >= scoreBelow) {
    return false;
  }

  return true;
}

function toPriority(severity: FortuneRiskTag['severity'] | undefined): RemedyAction['priority'] {
  if (severity === 'high') return 'high';
  if (severity === 'low') return 'low';
  return 'medium';
}

export function generateRemedyActions(params: {
  riskTags: FortuneRiskTag[];
  scores: DailyFortuneScores;
  tier: FortuneTier;
  activeRules: FortuneRemedyRule[];
}): RemedyAction[] {
  const { riskTags, scores, tier, activeRules } = params;
  const maxActions = tier === 'free' ? 2 : 5;
  const language = 'zh';

  const actions = activeRules
    .filter((rule) => ruleMatches(rule, riskTags, scores, tier))
    .sort((left, right) => left.priority - right.priority)
    .slice(0, maxActions)
    .map((rule, index): RemedyAction => {
      const matchedRisk = riskTags.find((risk) => risk.dimension === rule.dimension && risk.tag === rule.riskTag);
      return {
        ruleId: rule.id,
        type: rule.actionType,
        dimension: rule.dimension,
        title: sanitizeFortuneCopy(rule.titleTemplate, language),
        body: sanitizeFortuneCopy(rule.bodyTemplate, language),
        reason: sanitizeFortuneCopy(rule.reasonTemplate || matchedRisk?.reason || '规则命中当前风险标签。', language),
        priority: toPriority(matchedRisk?.severity),
        sortOrder: index,
      };
    });

  if (actions.length > 0) {
    return actions;
  }

  return [
    {
      type: 'self_observation',
      dimension: 'health',
      title: '记录今日节奏',
      body: '今天没有明显风险命中，记录一个支持你的时刻和一个消耗你的时刻即可。',
      reason: '没有明显风险，使用低风险通用自我观察建议。',
      priority: 'low',
      sortOrder: 0,
    },
  ];
}
