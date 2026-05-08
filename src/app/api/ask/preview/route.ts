/**
 * POST /api/ask/preview
 *
 * Generates a complete answer for a single user question, returns a short
 * teaser plus an encrypted token carrying the full answer for Stripe unlock.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/ai-orchestrator';
import {
  askQuestionInputSchema,
  buildAskPreview,
  encodeAskQuestionId,
  ASK_QUESTION_UNLOCK_PRICE_DISPLAY,
  type AskQuestionLanguage,
} from '@/lib/ask-question';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT_EN =
  'You are TianJi Oracle, a decision-reading guide blending classical divination, timing awareness, and modern psychology. ' +
  'Give a structured synthesis for the user question with exactly these sections: Situation, Hidden tension, Timing, Next move, Reflection. ' +
  'Keep each section concise and grounded. Do not predict with certainty. Do not give medical, legal, or financial advice.';

const SYSTEM_PROMPT_ZH =
  '你是天机综合解读引路者，融合古典占卜、时机判断与现代心理学。' +
  '请围绕用户问题给出结构化综合判断，并严格使用这些小标题：局势判断、隐藏张力、时机信号、下一步、反思问题。' +
  '每一段都要简洁、具体、可行动。不要做确定性预言，不给医疗、法律或财务建议。';

const FOOTER_EN =
  '\n\n- TianJi Global - For self-reflection only - Not professional advice.';

const FOOTER_ZH = '\n\n- 天机全球 - 仅用于自我反思 - 不构成专业建议。';

function buildFallbackAnswer(question: string, language: AskQuestionLanguage): string {
  if (language === 'zh') {
    return [
      `局势判断：围绕“${question}”，真正需要看清的不是一个绝对答案，而是你现在被什么拉住、又被什么推着往前。先把情绪和事实分开，局面会立刻清楚一半。`,
      '隐藏张力：你可能正在把“想尽快确定”误当成“已经准备好行动”。如果还有关键反馈没有出现，就不要用一次性豪赌替代小规模验证。',
      '时机信号：接下来 24 到 72 小时适合做一个低成本试探，而不是做不可逆决定。下一步：写下一个最小行动、一个观察指标、一个复盘时间。',
      '反思问题：如果只做一件能让局面变清楚的事，那件事是什么？',
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
    const systemPrompt = language === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
    const footer = language === 'zh' ? FOOTER_ZH : FOOTER_EN;

    let content: string;
    let model = 'local-template';
    let provider = 'local-fallback';
    let latencyMs = 0;
    let warning: string | undefined;

    try {
      const started = Date.now();
      const report = await generateReport({
        prompt: question,
        systemPrompt,
        preferredProvider: 'packy',
        taskType: 'analysis',
        responseFormat: 'text',
        maxTokens: 800,
      });
      content = report.content.trim();
      model = report.model;
      provider = report.provider;
      latencyMs = report.latencyMs ?? Date.now() - started;
    } catch (error) {
      warning = error instanceof Error ? error.message : 'AI provider unavailable';
      content = buildFallbackAnswer(question, language);
    }

    const fullAnswer = `${content}${footer}`;
    const preview = buildAskPreview(fullAnswer, language);
    const id = encodeAskQuestionId({
      question,
      fullAnswer,
      language,
      model,
      provider,
    });

    return NextResponse.json({
      success: true,
      id,
      preview,
      language,
      price: ASK_QUESTION_UNLOCK_PRICE_DISPLAY,
      meta: {
        model,
        provider,
        latencyMs,
        warning,
      },
    });
  } catch (error) {
    console.error('[api/ask/preview] error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
