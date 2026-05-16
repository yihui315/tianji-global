/**
 * POST /api/ask/preview
 *
 * Returns a short locked teaser plus an encrypted token carrying only the
 * user question. The paid full answer is generated after Stripe verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  askQuestionInputSchema,
  buildAskPreview,
  encodeAskQuestionId,
  ASK_QUESTION_UNLOCK_PRICE_DISPLAY,
  type AskQuestionLanguage,
} from '@/lib/ask-question';

export const dynamic = 'force-dynamic';

function buildFallbackAnswer(question: string, language: AskQuestionLanguage): string {
  if (language === 'zh') {
    return [
      `局势判断：围绕“${question}”，真正需要看清的不是一个绝对答案，而是你现在被什么拉住、又被什么推着往前。先把情绪和事实分开，局面会立刻清晰一半。`,
      '隐藏张力：你可能正在把“想尽快确定”误当成“已经准备好行动”。如果还没有关键反馈出现，就不要用一次性豪赌替代小规模验证。',
      '时机信号：接下来 24 到 72 小时适合做一个低成本试探，而不是做不可逆决定。下一步：写下一个最小行动、一个观察指标、一个复盘时间。',
      '反思问题：如果只做一件能让局面变清晰的事，那件事是什么？',
    ].join('\n\n');
  }

  return [
    `Situation: around "${question}", the useful signal is not a fixed prediction. It is the difference between the facts you can test and the pressure you are carrying in your head.`,
    'Hidden tension: you may be treating the need for certainty as proof that a big move is required. The reading points toward a smaller proof point before a larger commitment.',
    'Timing: the next 24 to 72 hours favor a low-cost test, not an irreversible decision. Next move: define one action, one observable signal, and one review window.',
    'Reflection: what is the smallest action that would make the situation clearer without forcing the whole outcome today?',
  ].join('\n\n');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = askQuestionInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      );
    }

    const { question, language } = parsed.data;
    const preview = buildAskPreview(buildFallbackAnswer(question, language), language);
    const id = encodeAskQuestionId({
      question,
      fullAnswer: '',
      language,
    });

    return NextResponse.json({
      success: true,
      id,
      answer: null,
      preview,
      locked: true,
      language,
      price: ASK_QUESTION_UNLOCK_PRICE_DISPLAY,
      meta: {
        fallbackReason: 'local-preview',
      },
    });
  } catch (error) {
    console.error('[api/ask/preview] error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
