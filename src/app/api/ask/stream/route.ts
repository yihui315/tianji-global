/**
 * Streaming AI Ask endpoint — TianJi Global
 * GET /api/ask/stream — SSE stream for real-time AI responses
 */
import { NextRequest, NextResponse } from 'next/server';
import { streamGenerate } from '@/lib/ai-orchestrator';
import { getPsychologyPrompt, type PsychologyData } from '@/lib/ai-prompts';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      language = 'en',
      baziData,
      ziweiData,
      userNotes,
    } = body as {
      prompt?: string;
      language?: 'en' | 'zh';
      baziData?: PsychologyData['baziData'];
      ziweiData?: PsychologyData['ziweiData'];
      userNotes?: string;
    };

    if (!prompt && !baziData && !ziweiData) {
      return NextResponse.json(
        { error: 'At least one of prompt, baziData, or ziweiData is required.' },
        { status: 400 }
      );
    }

    const lang: 'en' | 'zh' = language === 'zh' ? 'zh' : 'en';

    const psychologyData: PsychologyData = {
      baziData,
      ziweiData,
      userNotes: userNotes || prompt,
    };

    const systemPrompt =
      lang === 'zh'
        ? '你是一位融合传统命理学与现代心理学的专业命理师。请用JSON格式回复，确保返回的JSON不含任何markdown代码块。'
        : 'You are a professional astrologer specializing in Chinese metaphysics and modern psychology. Please respond in JSON format only, with no markdown fences.';

    const userPrompt = getPsychologyPrompt(psychologyData, lang);

    // Send initial meta as SSE
    const meta = JSON.stringify({
      type: 'meta',
      language: lang,
      disclaimer: lang === 'zh'
        ? '本报告仅供娱乐与自我探索，不构成医疗、法律或财务建议。重要人生决策请咨询具备资质的专业人士。'
        : 'This reading is for entertainment and self-reflection purposes only. It does not constitute medical, legal, or financial advice.',
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send meta first
        controller.enqueue(encoder.encode(`data: ${meta}\n\n`));

        try {
          for await (const chunk of streamGenerate({
            prompt: userPrompt,
            systemPrompt,
            taskType: 'analysis',
            responseFormat: 'text',
            maxTokens: 4096,
          })) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
