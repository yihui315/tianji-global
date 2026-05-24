import { describe, expect, it } from 'vitest';
import { generateRemedyActions } from '@/lib/daily-fortune/remedy-engine';
import type { FortuneRemedyRule, FortuneRiskTag } from '@/types/daily-fortune';

const rules: FortuneRemedyRule[] = [
  {
    id: 'rule-wealth',
    dimension: 'wealth',
    riskTag: 'impulse_spending',
    condition: { scoreBelow: 70 },
    priority: 10,
    templateKey: 'wealth_impulse_spending_pause',
    titleTemplate: '延后冲动消费',
    bodyTemplate: '今天先把想买的项目写下来，至少等二十四小时再决定。',
    reasonTemplate: '财富分项出现冲动消费信号。',
    actionType: 'action',
    minTier: 'free',
    isActive: true,
  },
  {
    id: 'rule-health',
    dimension: 'health',
    riskTag: 'low_energy',
    condition: { scoreBelow: 70 },
    priority: 20,
    templateKey: 'health_low_energy_observe',
    titleTemplate: '观察低能量时段',
    bodyTemplate: '记录疲惫时段，补水并安排短暂休息。',
    reasonTemplate: '健康分项出现低能量信号。',
    actionType: 'self_observation',
    minTier: 'free',
    isActive: true,
  },
  {
    id: 'rule-love',
    dimension: 'love',
    riskTag: 'communication_tension',
    condition: { scoreBelow: 72 },
    priority: 30,
    templateKey: 'love_communication_tension_boundary',
    titleTemplate: '先确认边界再沟通',
    bodyTemplate: '只陈述感受和边界，不急着要求对方立刻回应。',
    reasonTemplate: '关系分项出现沟通压力。',
    actionType: 'action',
    minTier: 'free',
    isActive: true,
  },
];

const riskTags: FortuneRiskTag[] = [
  { dimension: 'wealth', tag: 'impulse_spending', severity: 'medium', reason: 'spending signal' },
  { dimension: 'health', tag: 'low_energy', severity: 'medium', reason: 'energy signal' },
  { dimension: 'love', tag: 'communication_tension', severity: 'medium', reason: 'communication signal' },
];

describe('remedy engine', () => {
  it('matches wealth impulse spending to delayed spending guidance', () => {
    const remedies = generateRemedyActions({
      riskTags,
      scores: { overall: 60, love: 68, career: 80, wealth: 61, health: 65 },
      tier: 'free',
      activeRules: rules,
    });

    expect(remedies[0]?.title).toContain('延后');
    expect(remedies[0]?.body).toContain('二十四小时');
  });

  it('does not output treatment or deterministic relationship claims', () => {
    const remedies = generateRemedyActions({
      riskTags,
      scores: { overall: 60, love: 68, career: 80, wealth: 61, health: 65 },
      tier: 'premium',
      activeRules: rules,
    });

    expect(JSON.stringify(remedies)).not.toMatch(/诊断|治疗|必分手|必复合|投资建议/);
  });

  it('limits free tier to two remedies and premium/pro to five remedies', () => {
    const manyRules = [
      ...rules,
      ...rules.map((rule, index) => ({
        ...rule,
        id: `${rule.id}-premium-${index}`,
        templateKey: `${rule.templateKey}_premium_${index}`,
        priority: rule.priority + 50 + index,
        minTier: 'premium' as const,
      })),
    ];

    expect(
      generateRemedyActions({
        riskTags,
        scores: { overall: 60, love: 68, career: 80, wealth: 61, health: 65 },
        tier: 'free',
        activeRules: manyRules,
      })
    ).toHaveLength(2);

    expect(
      generateRemedyActions({
        riskTags,
        scores: { overall: 60, love: 68, career: 80, wealth: 61, health: 65 },
        tier: 'premium',
        activeRules: manyRules,
      })
    ).toHaveLength(5);

    expect(
      generateRemedyActions({
        riskTags,
        scores: { overall: 60, love: 68, career: 80, wealth: 61, health: 65 },
        tier: 'pro',
        activeRules: manyRules,
      })
    ).toHaveLength(5);
  });

  it('returns a low-risk fallback when no rule matches', () => {
    const remedies = generateRemedyActions({
      riskTags: [],
      scores: { overall: 80, love: 80, career: 80, wealth: 80, health: 80 },
      tier: 'free',
      activeRules: [],
    });

    expect(remedies).toHaveLength(1);
    expect(remedies[0]?.type).toBe('self_observation');
    expect(remedies[0]?.reason).toContain('没有明显风险');
  });
});
