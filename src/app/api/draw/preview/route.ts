/**
 * POST /api/draw/preview
 *
 * Draws three server-side cards, returns a limited locked preview, and stores
 * only the card/question context for later paid unlock generation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAiPreviewTimeoutMs, resolvePreviewWithin } from '@/lib/ai-preview-timeout';
import { buildDrawEvidence } from '@/lib/divination/evidence';
import {
  buildDrawPreview,
  drawThreeCards,
  encodeQuickDrawId,
  expandDrawnCard,
  QUICK_DRAW_SLOTS,
  QUICK_DRAW_UNLOCK_PRICE_DISPLAY,
  quickDrawInputSchema,
  toDrawGatewayCards,
  type DrawAiMeta,
  type DrawnSlot,
  type QuickDrawLanguage,
} from '@/lib/quick-draw';
import { interpretCard } from '@/lib/tarot';
import { generateTianjiModelResponse } from '@/lib/tianji-model-gateway';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT_EN = [
  'You are TianJi Love, a careful tarot relationship reflection guide.',
  'Return a useful but limited free three-card reading.',
  'Use three short paragraphs, one for each card, then one practical next step.',
  'Do not include a paid/pro seven-day plan or report-ready section.',
  'Do not claim certainty, guarantee outcomes, or use fear-based payment urgency.',
  'Treat the reading as reflection, not prediction.',
].join(' ');

const SYSTEM_PROMPT_ZH = [
  'You are TianJi Love, a careful tarot relationship reflection guide.',
  'Answer in Simplified Chinese.',
  'Return a useful but limited free three-card reading.',
  'Use three short paragraphs, one for each card, then one practical next step.',
  'Do not include a paid/pro seven-day plan or report-ready section.',
  'Do not claim certainty, guarantee outcomes, or use fear-based payment urgency.',
  'Treat the reading as reflection, not prediction.',
].join(' ');

const FOOTER_EN = '\n\n- TianJi Love - For self-reflection only - Not professional advice.';
const FOOTER_ZH = '\n\n- TianJi Love - 仅供自我反思 - 不构成专业建议。';

function buildUserPrompt(
  question: string,
  draw: DrawnSlot[],
  language: QuickDrawLanguage,
): string {
  const lines: string[] = [];

  if (question.trim()) {
    lines.push(language === 'zh' ? `用户问题：${question.trim()}` : `Querent question: ${question.trim()}`);
  } else {
    lines.push(
      language === 'zh'
        ? '用户没有提出具体问题，请围绕三张牌的关系能量给出简短反思。'
        : 'The querent did not state a specific question; read the three-card relationship pattern holistically.',
    );
  }

  lines.push('');
  lines.push(
    language === 'zh'
      ? 'Cards:'
      : 'Cards:',
  );

  for (let i = 0; i < draw.length; i++) {
    const slot = draw[i];
    const slotMeta = QUICK_DRAW_SLOTS[i];
    const fullCard = expandDrawnCard(slot);
    const interpretation = fullCard ? interpretCard(fullCard, slot.isReversed, language) : '';
    const slotLabel = language === 'zh' ? slotMeta.labelZh : slotMeta.labelEn;
    const cardName = language === 'zh' ? slot.card.nameChinese : slot.card.name;
    const orientation = slot.isReversed
      ? language === 'zh' ? '逆位' : 'Reversed'
      : language === 'zh' ? '正位' : 'Upright';

    lines.push(`${slotLabel}: ${cardName} (${orientation}) - ${interpretation}`);
  }

  return lines.join('\n');
}

function buildMiniReadings(draw: DrawnSlot[], language: QuickDrawLanguage): DrawnSlot[] {
  return draw.map((slot) => {
    const fullCard = expandDrawnCard(slot);
    const interpretation = fullCard ? interpretCard(fullCard, slot.isReversed, language) : '';
    return { ...slot, miniReading: interpretation };
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
    const meaning = slot.miniReading ||
      (language === 'zh' ? '这张牌提醒你放慢速度，观察真实信号。' : 'This card asks you to slow down and read the real signal.');

    if (language === 'zh') {
      return `${label} - ${cardName}（${orientation}）：${meaning}`;
    }
    return `${label} - ${cardName} (${orientation}): ${meaning}`;
  });

  if (language === 'zh') {
    return [
      question.trim()
        ? `这组三张牌围绕「${question.trim()}」形成了一条从整理、聚焦到行动的线索。`
        : '这组三张牌形成了一条从整理、聚焦到行动的线索。',
      ...lines,
      '实际下一步：先观察一个可验证的信号，再决定是否推进。把这当作反思，而不是确定预言。',
    ].join('\n\n');
  }

  return [
    question.trim()
      ? `Around "${question.trim()}", the three cards form a movement from clearing, to focusing, to acting.`
      : 'The three cards form a movement from clearing, to focusing, to acting.',
    ...lines,
    'Practical next step: wait for one observable signal before deciding whether to move closer. Treat this as reflection, not certainty.',
  ].join('\n\n');
}

function toDrawAiMeta(response: Awaited<ReturnType<typeof generateTianjiModelResponse>>): DrawAiMeta {
  return {
    provider: response.audit.provider,
    model: response.audit.model,
    fallbackUsed: response.audit.fallback,
    safetyRewritten: response.audit.safetyRewriteApplied,
    latencyMs: response.audit.latencyMs,
    route: 'tarot_draw',
  };
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
    let aiMeta: DrawAiMeta | undefined;
    let warning: string | undefined;
    let fallbackReason: 'timeout' | 'error' | undefined;
    let timeoutMs: number | undefined;

    try {
      const started = Date.now();
      const previewTimeoutMs = getAiPreviewTimeoutMs();
      const result = await resolvePreviewWithin(
        generateTianjiModelResponse({
          intent: 'tarot_draw',
          prompt: userPrompt,
          systemPrompt,
          responseFormat: 'text',
          maxTokens: 650,
          temperature: 0.65,
        }),
        previewTimeoutMs,
      );

      if (result.status === 'timed-out') {
        fallbackReason = 'timeout';
        timeoutMs = result.timeoutMs;
        warning = `AI preview timed out after ${result.timeoutMs}ms; returned local fallback reading.`;
        latencyMs = Date.now() - started;
        content = buildFallbackReading(question, draw, language);
      } else {
        const report = result.value;
        content = report.content.trim();
        model = report.audit.model;
        provider = report.audit.provider;
        latencyMs = report.audit.latencyMs ?? Date.now() - started;
        aiMeta = toDrawAiMeta(report);
      }
    } catch (error) {
      warning = error instanceof Error ? error.message : 'AI provider unavailable';
      fallbackReason = 'error';
      content = buildFallbackReading(question, draw, language);
    }

    const reading = `${content}${footer}`;
    const preview = buildDrawPreview(reading, language);
    const id = encodeQuickDrawId({
      question,
      language,
      draw,
      fullReading: '',
    });

    const previewDraw = draw.map((slot) => ({
      slot: slot.slot,
      arcana: slot.card.arcana,
    }));

    return NextResponse.json({
      success: true,
      id,
      reading,
      preview,
      evidence: buildDrawEvidence({
        question,
        draw,
        language,
        paid: false,
      }),
      locked: true,
      cards: toDrawGatewayCards(draw, language),
      previewDraw,
      language,
      price: QUICK_DRAW_UNLOCK_PRICE_DISPLAY,
      aiMeta,
      meta: {
        model,
        provider,
        latencyMs,
        warning,
        fallbackReason,
        timeoutMs,
      },
    });
  } catch (error) {
    console.error('[api/draw/preview] error:', error instanceof Error ? error.message : 'unknown');
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
