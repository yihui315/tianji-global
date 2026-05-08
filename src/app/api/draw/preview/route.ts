import { NextRequest, NextResponse } from 'next/server';
import { generateGatewayText } from '@/lib/ai/gateway';
import { appendReflectionFooter } from '@/lib/ai/normalize';
import {
  buildDrawFallbackReading,
  buildDrawUserPrompt,
  buildMiniReadings,
  getDrawFooter,
  getDrawSystemPrompt,
} from '@/lib/ai/prompts/draw';
import { createPreviewRecord, type AiUsage } from '@/lib/ai/usage';
import {
  QUICK_DRAW_UNLOCK_PRICE_DISPLAY,
  buildDrawPreview,
  drawThreeCards,
  quickDrawInputSchema,
} from '@/lib/quick-draw';

export const dynamic = 'force-dynamic';

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
    const draw = buildMiniReadings(drawThreeCards(), language);
    const footer = getDrawFooter(language);
    const userPrompt = buildDrawUserPrompt(question, draw, language);

    let content: string;
    let usage: AiUsage;

    try {
      const result = await generateGatewayText({
        prompt: userPrompt,
        systemPrompt: getDrawSystemPrompt(language),
        preferredProvider: 'packy',
        taskType: 'analysis',
        maxTokens: 900,
      });
      content = result.content;
      usage = result.usage;
    } catch (error) {
      content = buildDrawFallbackReading(question, draw, language);
      usage = {
        provider: 'local-fallback',
        model: 'local-template',
        latencyMs: 0,
        warning: error instanceof Error ? error.message : 'AI provider unavailable',
      };
    }

    const fullReading = appendReflectionFooter(content, footer);
    const preview = buildDrawPreview(fullReading, language);
    const id = createPreviewRecord({
      kind: 'draw',
      question,
      language,
      preview,
      draw,
      fullReading,
      usage,
    });

    const previewDraw = draw.map((slot) => ({
      slot: slot.slot,
      arcana: slot.card.arcana,
    }));

    return NextResponse.json({
      id,
      preview,
      previewDraw,
      price: QUICK_DRAW_UNLOCK_PRICE_DISPLAY,
    });
  } catch (error) {
    console.error('[api/draw/preview] error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
