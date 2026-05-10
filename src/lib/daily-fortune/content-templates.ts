import type { DailyFortuneScores, FortuneLanguage } from '@/types/daily-fortune';

export function buildHeadline(scores: DailyFortuneScores, language: FortuneLanguage): string {
  if (language === 'en') {
    if (scores.overall >= 78) return 'A day to move steadily forward';
    if (scores.overall >= 65) return 'A steady day for careful choices';
    return 'A day to slow down and observe';
  }

  if (scores.overall >= 78) return '稳中推进的一天';
  if (scores.overall >= 65) return '先稳后进的一天';
  return '适合放慢和观察的一天';
}

export function buildSummary(scores: DailyFortuneScores, language: FortuneLanguage): string {
  if (language === 'en') {
    return `Overall energy is ${scores.overall}/100. Keep decisions grounded, use relationship and money signals as prompts for reflection, and avoid forcing certainty.`;
  }

  return `今日综合指数 ${scores.overall}/100。适合先稳定节奏，把关系、事业、财富和身心信号当作自我观察线索，不急着做确定性判断。`;
}

export function buildContentSections(scores: DailyFortuneScores, language: FortuneLanguage): Record<string, unknown> {
  const zh = language === 'zh';
  return {
    sections: [
      {
        key: 'love',
        title: zh ? '关系节奏' : 'Relationship rhythm',
        summary: zh ? `关系分项 ${scores.love}/100，先重视边界和表达。` : `Love score ${scores.love}/100. Notice boundaries and tone.`,
      },
      {
        key: 'career',
        title: zh ? '事业节奏' : 'Career rhythm',
        summary: zh ? `事业分项 ${scores.career}/100，优先处理最关键的一步。` : `Career score ${scores.career}/100. Prioritize one key step.`,
      },
      {
        key: 'wealth',
        title: zh ? '财富节奏' : 'Wealth rhythm',
        summary: zh ? `财富分项 ${scores.wealth}/100，适合记录和延后高风险决定。` : `Wealth score ${scores.wealth}/100. Record and defer high-risk choices.`,
      },
      {
        key: 'health',
        title: zh ? '身心节奏' : 'Wellbeing rhythm',
        summary: zh ? `健康分项 ${scores.health}/100，只做休息、补水和观察。` : `Health score ${scores.health}/100. Keep to rest, hydration, and observation.`,
      },
    ],
  };
}
