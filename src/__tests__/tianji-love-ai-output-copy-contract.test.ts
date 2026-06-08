import { describe, expect, it } from 'vitest';

import { getFortuneReportPrompt, type FortuneData } from '@/lib/ai-prompts';

describe('Tianji Love AI output copy contract', () => {
  it('keeps the Chinese lite fortune prompt readable before model generation', () => {
    const data: FortuneData = {
      date: '2026-05-23',
      type: 'love',
      birthYear: 1992,
      birthMonth: 5,
      birthDay: 23,
      gender: 'unspecified',
      currentAge: 34,
      currentPhase: '青年',
      currentPhaseEn: 'Young Adult',
      fortuneCycles: [],
      bestPeriods: [],
      challengingPeriods: [],
    };

    const prompt = getFortuneReportPrompt(data, 'zh');

    expect(prompt).toContain('你是一位融合传统命理与现代心理学的专业命理师。');
    expect(prompt).toContain('用户当前运势上下文：');
    expect(prompt).toContain('请提供一份简洁的每日运势解读');
    expect(prompt).not.toMatch(/浣犳槸|鐢ㄦ埛|璇锋彁渚|鍛界悊|�|€\?/);
  });
});
