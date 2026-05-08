import { NextRequest, NextResponse } from 'next/server';
import { generateGatewayText } from '@/lib/ai/gateway';
import { appendReflectionFooter } from '@/lib/ai/normalize';
import {
  buildAskFallbackAnswer,
  getAskFooter,
  getAskSystemPrompt,
} from '@/lib/ai/prompts/ask';
import { createPreviewRecord, type AiUsage } from '@/lib/ai/usage';
import {
  ASK_QUESTION_UNLOCK_PRICE_DISPLAY,
  askQuestionInputSchema,
  buildAskPreview,
} from '@/lib/ask-question';

export const dynamic = 'force-dynamic';

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
    const footer = getAskFooter(language);

    let content: string;
    let usage: AiUsage;

    try {
      const result = await generateGatewayText({
        prompt: question,
        systemPrompt: getAskSystemPrompt(language),
        preferredProvider: 'packy',
        taskType: 'analysis',
        maxTokens: 800,
      });
      content = result.content;
      usage = result.usage;
    } catch (error) {
      content = buildAskFallbackAnswer(question, language);
      usage = {
        provider: 'local-fallback',
        model: 'local-template',
        latencyMs: 0,
        warning: error instanceof Error ? error.message : 'AI provider unavailable',
      };
    }

    const fullAnswer = appendReflectionFooter(content, footer);
    const preview = buildAskPreview(fullAnswer, language);
    const id = createPreviewRecord({
      kind: 'ask',
      question,
      language,
      preview,
      fullAnswer,
      usage,
    });

    return NextResponse.json({
      id,
      preview,
      price: ASK_QUESTION_UNLOCK_PRICE_DISPLAY,
    });
  } catch (error) {
    console.error('[api/ask/preview] error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
