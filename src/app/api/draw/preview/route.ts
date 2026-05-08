/**
 * POST /api/draw/preview
 *
 * Draws three server-side cards, creates a full reading, and returns a short
 * teaser plus an encrypted token for Stripe unlock.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/ai-orchestrator';
import {
  buildDrawPreview,
  drawThreeCards,
  encodeQuickDrawId,
  expandDrawnCard,
  QUICK_DRAW_SLOTS,
  QUICK_DRAW_UNLOCK_PRICE_DISPLAY,
  quickDrawInputSchema,
  type DrawnSlot,
  type QuickDrawLanguage,
} from '@/lib/quick-draw';
import { interpretCard } from '@/lib/tarot';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT_EN =
  'You are a tarot reader who blends classical card meanings with modern psychology. ' +
  'Read yesterday, today, and tomorrow as one continuous arc. ' +
  'Three short paragraphs, one per card. End with one practical reflection prompt. ' +
  'Do not give medical, legal, or financial advice.';

const SYSTEM_PROMPT_ZH =
  '你是一位融合古典塔罗与现代心理学的解读者。请把昨天、今天、明天三张牌读成一段连续的弧线。' +
  '三段简短解读，每段对应一张牌。结尾给出一个具体可行的反思问题。不要给医疗、法律或财务建议。';

const FOOTER_EN =
  '\n\n- TianJi Global - For self-reflection only - Not professional advice.';

const FOOTER_ZH = '\n\n- 天机全球 - 仅用于自我反思 - 不构成专业建议。';

function buildUserPrompt(
  question: string,
  draw: DrawnSlot[],
  language: QuickDrawLanguage,
): string {
  const lines: string[] = [];
  if (question.trim()) {
    lines.push(language === 'zh' ? `问卜者的问题：${question.trim()}` : `Querent's question: ${question.trim()}`);
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
        ? `${slotLabel}: ${cardName} (${orientation}) - ${interp}`
        : `${slotLabel}: ${cardName} (${orientation}) - ${interp}`,
    );
  }

  return lines.join('\n');
}

function buildMiniReadings(draw: DrawnSlot[], language: QuickDrawLanguage): DrawnSlot[] {
  return draw.map((slot) => {
    const fullCard = expandDrawnCard(slot);
    const interp = fullCard ? interpretCard(fullCard, slot.isReversed, language) : '';
    return { ...slot, miniReading: interp };
  });
}

function buildFallbackReading(question: string, draw: DrawnSlot[], language: QuickDrawLanguage): string {
  const lines = draw.map((slot, index) => {
    const meta = QUICK_DRAW_SLOTS[index];
    const label = language === 'zh' ? meta.labelZh : meta.labelEn;
    const cardName = language === 'zh' ? slot.card.nameChinese : slot.card.name;
    const orientation = slot.isReversed
      ? language === 'zh' ? '逆位' : 'reversed'
      : language === 'zh' ? '正位' : 'upright';
    const meaning = slot.miniReading || (language === 'zh' ? '这张牌提醒你放慢并观察真实信号。' : 'This card asks you to slow down and read the real signal.');

    if (language === 'zh') {
      return `${label} - ${cardName}（${orientation}）：${meaning}`;
    }
    return `${label} - ${cardName} (${orientation}): ${meaning}`;
  });

  if (language === 'zh') {
    return [
      question.trim() ? `围绕“${question.trim()}”，三张牌形成了一条从整理、聚焦到行动的线索。` : '这组三张牌形成了一条从整理、聚焦到行动的线索。',
      ...lines,
      '反思问题：今天你最应该停止消耗哪一件事，把精力交还给真正重要的行动？',
    ].join('\n\n');
  }

  return [
    question.trim() ? `Around "${question.trim()}", the three cards form a movement from clearing, to focusing, to acting.` : 'The three cards form a movement from clearing, to focusing, to acting.',
    ...lines,
    'Reflection prompt: what should you stop feeding today so your energy can return to the action that matters?',
  ].join('\n\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = quickDrawInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      );
    }

    const { question, language } = parsed.data;
    const rawDraw = drawThreeCards();
    const draw = buildMiniReadings(rawDraw, language);
    const systemPrompt = language === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
    const footer = language === 'zh' ? FOOTER_ZH : FOOTER_EN;
    const userPrompt = buildUserPrompt(question, draw, language);

    let content: string;
    let model = 'local-template';
    let provider = 'local-fallback';
    let latencyMs = 0;
    let warning: string | undefined;

    try {
      const started = Date.now();
      const report = await generateReport({
        prompt: userPrompt,
        systemPrompt,
        preferredProvider: 'packy',
        taskType: 'analysis',
        responseFormat: 'text',
        maxTokens: 900,
      });
      content = report.content.trim();
      model = report.model;
      provider = report.provider;
      latencyMs = report.latencyMs ?? Date.now() - started;
    } catch (error) {
      warning = error instanceof Error ? error.message : 'AI provider unavailable';
      content = buildFallbackReading(question, draw, language);
    }

    const fullReading = `${content}${footer}`;
    const preview = buildDrawPreview(fullReading, language);
    const id = encodeQuickDrawId({
      question,
      language,
      draw,
      fullReading,
      model,
      provider,
    });

    const previewDraw = draw.map((slot) => ({
      slot: slot.slot,
      arcana: slot.card.arcana,
    }));

    return NextResponse.json({
      success: true,
      id,
      preview,
      previewDraw,
      language,
      price: QUICK_DRAW_UNLOCK_PRICE_DISPLAY,
      meta: {
        model,
        provider,
        latencyMs,
        warning,
      },
    });
  } catch (error) {
    console.error('[api/draw/preview] error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
