import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/ai-orchestrator';
import { getPsychologyPrompt, type PsychologyData } from '@/lib/ai-prompts';

const DISCLAIMER_EN =
  'This reading is for entertainment and self-reflection purposes only. ' +
  'It does not constitute medical, legal, or financial advice. ' +
  'Always consult a qualified professional for important life decisions.';

const DISCLAIMER_ZH =
  '本报告仅供娱乐与自我探索，不构成医疗、法律或财务建议。' +
  '重要人生决策请咨询具备资质的专业人士。';

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
    const disclaimer = lang === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;

    // Build psychology prompt from any supplied chart data
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

    const report = await generateReport({
      prompt: userPrompt,
      systemPrompt,
      preferredProvider: 'packy',
      taskType: 'analysis',
      responseFormat: 'text',
      maxTokens: 2048,
    });

    return NextResponse.json({
      language: lang,
      disclaimer,
      result: report.content,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
        provider: report.provider,
        model: report.model,
        latencyMs: report.latencyMs,
        costUSD: report.costUSD,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
