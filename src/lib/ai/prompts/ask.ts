import type { AskQuestionLanguage } from '@/lib/ask-question';

export const ASK_SYSTEM_PROMPT_EN =
  'You are TianJi Oracle, a decision-reading guide blending classical divination, timing awareness, and modern psychology. ' +
  'Give a structured synthesis for the user question with exactly these sections: Situation, Hidden tension, Timing, Next move, Reflection. ' +
  'Keep each section concise and grounded.';

export const ASK_SYSTEM_PROMPT_ZH =
  '你是天机综合解读引路者，融合古典占卜、时机判断与现代心理学。' +
  '请围绕用户问题给出结构化综合判断，并严格使用这些小标题：局势判断、隐藏张力、时机信号、下一步、反思问题。' +
  '每一段都要简洁、具体、可行动。';

export const ASK_FOOTER_EN =
  '- TianJi Global - For self-reflection only - Not professional advice.';

export const ASK_FOOTER_ZH =
  '- TianJi Global - 仅用于自我反思 - 不构成专业建议。';

export function getAskSystemPrompt(language: AskQuestionLanguage): string {
  return language === 'zh' ? ASK_SYSTEM_PROMPT_ZH : ASK_SYSTEM_PROMPT_EN;
}

export function getAskFooter(language: AskQuestionLanguage): string {
  return language === 'zh' ? ASK_FOOTER_ZH : ASK_FOOTER_EN;
}

export function buildAskFallbackAnswer(question: string, language: AskQuestionLanguage): string {
  if (language === 'zh') {
    return [
      `局势判断：围绕「${question}」，真正需要看清的不是一个绝对答案，而是你现在被什么拉住、又被什么推着往前。`,
      '隐藏张力：你可能正在把“想尽快确定”误当成“已经准备好行动”。如果关键反馈还没有出现，先用小规模验证代替一次性豪赌。',
      '时机信号：接下来 24 到 72 小时适合做一个低成本试探，而不是做不可逆决定。',
      '下一步：写下一个最小行动、一个观察指标、一个复盘时间。',
      '反思问题：如果只做一件能让局面变清晰的事，那件事是什么？',
    ].join('\n\n');
  }

  return [
    `Situation: around "${question}", the useful signal is not a fixed prediction. It is the difference between the facts you can test and the pressure you are carrying in your head.`,
    'Hidden tension: you may be treating the need for certainty as proof that a big move is required. The reading points toward a smaller proof point before a larger commitment.',
    'Timing: the next 24 to 72 hours favor a low-cost test, not an irreversible decision.',
    'Next move: define one action, one observable signal, and one review window.',
    'Reflection: what is the smallest action that would make the situation clearer without forcing the whole outcome today?',
  ].join('\n\n');
}
