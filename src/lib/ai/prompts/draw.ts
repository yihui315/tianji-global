import type { DrawnSlot, QuickDrawLanguage } from '@/lib/quick-draw';
import { QUICK_DRAW_SLOTS, expandDrawnCard } from '@/lib/quick-draw';
import { interpretCard } from '@/lib/tarot';

export const DRAW_SYSTEM_PROMPT_EN =
  'You are a tarot reader who blends classical card meanings with modern psychology. ' +
  'Read yesterday, today, and tomorrow as one continuous arc. Three short paragraphs, one per card. End with one practical reflection prompt.';

export const DRAW_SYSTEM_PROMPT_ZH =
  '你是一位融合古典塔罗与现代心理学的自我反思引路者。' +
  '请把昨天、今天、明天三张牌读成一段连续的弧线。' +
  '三段简短解读，每段对应一张牌，结尾给出一个具体可行的反思问题。';

export const DRAW_FOOTER_EN =
  '- TianJi Global - For self-reflection only - Not professional advice.';

export const DRAW_FOOTER_ZH =
  '- TianJi Global - 仅用于自我反思 - 不构成专业建议。';

export function getDrawSystemPrompt(language: QuickDrawLanguage): string {
  return language === 'zh' ? DRAW_SYSTEM_PROMPT_ZH : DRAW_SYSTEM_PROMPT_EN;
}

export function getDrawFooter(language: QuickDrawLanguage): string {
  return language === 'zh' ? DRAW_FOOTER_ZH : DRAW_FOOTER_EN;
}

export function buildDrawUserPrompt(
  question: string,
  draw: DrawnSlot[],
  language: QuickDrawLanguage,
): string {
  const lines: string[] = [];
  if (question.trim()) {
    lines.push(language === 'zh' ? `问卜者的问题：${question.trim()}` : `Querent question: ${question.trim()}`);
  } else {
    lines.push(
      language === 'zh'
        ? '问卜者没有提出具体问题，请围绕这三天的整体气氛作答。'
        : 'The querent has not stated a specific question; read the three-day arc holistically.',
    );
  }
  lines.push('');

  for (let i = 0; i < draw.length; i++) {
    const slot = draw[i];
    const slotMeta = QUICK_DRAW_SLOTS[i];
    const fullCard = expandDrawnCard(slot);
    const orientation = slot.isReversed
      ? language === 'zh' ? '逆位' : 'Reversed'
      : language === 'zh' ? '正位' : 'Upright';
    const interp = fullCard ? interpretCard(fullCard, slot.isReversed, language) : '';
    const slotLabel = language === 'zh' ? slotMeta.labelZh : slotMeta.labelEn;
    const cardName = language === 'zh' ? slot.card.nameChinese : slot.card.name;

    lines.push(
      language === 'zh'
        ? `${slotLabel}：${cardName}（${orientation}）- ${interp}`
        : `${slotLabel}: ${cardName} (${orientation}) - ${interp}`,
    );
  }

  return lines.join('\n');
}

export function buildMiniReadings(draw: DrawnSlot[], language: QuickDrawLanguage): DrawnSlot[] {
  return draw.map((slot) => {
    const fullCard = expandDrawnCard(slot);
    const interp = fullCard ? interpretCard(fullCard, slot.isReversed, language) : '';
    return { ...slot, miniReading: interp };
  });
}

export function buildDrawFallbackReading(
  question: string,
  draw: DrawnSlot[],
  language: QuickDrawLanguage,
): string {
  const lines = draw.map((slot, index) => {
    const meta = QUICK_DRAW_SLOTS[index];
    const label = language === 'zh' ? meta.labelZh : meta.labelEn;
    const cardName = language === 'zh' ? slot.card.nameChinese : slot.card.name;
    const orientation = slot.isReversed
      ? language === 'zh' ? '逆位' : 'reversed'
      : language === 'zh' ? '正位' : 'upright';
    const meaning =
      slot.miniReading ||
      (language === 'zh'
        ? '这张牌提醒你放慢并观察真实信号。'
        : 'This card asks you to slow down and read the real signal.');

    if (language === 'zh') {
      return `${label} - ${cardName}（${orientation}）：${meaning}`;
    }
    return `${label} - ${cardName} (${orientation}): ${meaning}`;
  });

  if (language === 'zh') {
    return [
      question.trim()
        ? `围绕「${question.trim()}」，三张牌形成了一条从整理、聚焦到行动的线索。`
        : '这组三张牌形成了一条从整理、聚焦到行动的线索。',
      ...lines,
      '反思问题：今天你最应该停止消耗哪一件事，把精力交还给真正重要的行动？',
    ].join('\n\n');
  }

  return [
    question.trim()
      ? `Around "${question.trim()}", the three cards form a movement from clearing, to focusing, to acting.`
      : 'The three cards form a movement from clearing, to focusing, to acting.',
    ...lines,
    'Reflection: what should you stop feeding today so your energy can return to the action that matters?',
  ].join('\n\n');
}
