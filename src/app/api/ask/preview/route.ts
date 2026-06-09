/**
 * POST /api/ask/preview
 *
 * Returns a short locked teaser plus an encrypted token carrying only the
 * user question. Also returns loveReportSections for the paywall preview.
 * The paid full answer is generated after Stripe verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  askQuestionInputSchema,
  buildAskPreview,
  encodeAskQuestionId,
  ASK_QUESTION_UNLOCK_PRICE_DISPLAY,
  type AskQuestionLanguage,
} from '@/lib/ask-question';
import { buildAskEvidence } from '@/lib/divination/evidence';
import { LOVE_TEST_PAID_INTENT_META, isLoveTestPaidIntent, type LoveTestPaidIntent } from '@/lib/love-test';
import { buildLoveReportSections, type LoveReportInput } from '@/lib/love-report-sections';
import { generateTianjiModelResponse } from '@/lib/tianji-model-gateway';

export const dynamic = 'force-dynamic';

function buildFallbackAnswer(question: string, language: AskQuestionLanguage): string {
  if (language === 'zh') {
    return [
      `局势判断：围绕"${question}"，真正需要看清的不是一个绝对答案，而是你现在被什么拉住、又被什么推着往前。先把情绪和事实分开，局面会立刻清晰一半。`,
      '隐藏张力：你可能正在把"想尽快确定"误当成"已经准备好行动"。如果还没有关键反馈出现，就不要用一次性豪赌替代小规模验证。',
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

function buildLoveTestPaidIntentFallback(
  question: string,
  language: AskQuestionLanguage,
  intent: LoveTestPaidIntent,
): string {
  const meta = LOVE_TEST_PAID_INTENT_META[intent];
  if (language === 'zh') {
    return buildFallbackAnswer(question, language);
  }

  return [
    `${meta.title} ${meta.previewPromise}`,
    'Emotional state: this reads like a connection where curiosity and self-protection are both active.',
    'Likely communication pattern: watch whether replies become warmer after low-pressure clarity, not after chasing.',
    'One safe next step: ask one calm, specific question and leave room for an honest answer.',
    'Locked full answer: deeper interpretation, timing plan, 3-message suggestion, and what not to do stay locked until checkout readiness is approved.',
  ].join('\n\n');
}

/**
 * Extract love report JSON from AI response.
 * Returns null if parsing fails — the readable answer is still usable.
 */
function extractLoveReportData(
  rawResponse: string,
  language: AskQuestionLanguage,
): LoveReportInput | null {
  const jsonMatch = rawResponse.match(/```json\n([\s\S]+?)\n```/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[1]);
    const validEnergies = ['warm', 'blocked', 'uncertain', 'fading', 'magnetic'];
    const validBlockages = ['fear', 'pride', 'distance', 'third-party', 'emotional-exhaustion'];
    const validPotential = ['low', 'medium', 'high'];
    const validSteps = ['text', 'wait', 'clarify', 'move-on', 'observe'];

    if (
      typeof parsed.relationshipEnergy === 'string' &&
      validEnergies.includes(parsed.relationshipEnergy) &&
      typeof parsed.whatTheyMayBeFeeling === 'string' &&
      typeof parsed.whatTheyAreNotSaying === 'string' &&
      typeof parsed.mainBlockage === 'string' &&
      validBlockages.includes(parsed.mainBlockage) &&
      typeof parsed.reconciliationPotential === 'string' &&
      validPotential.includes(parsed.reconciliationPotential) &&
      typeof parsed.timingGuidance === 'string' &&
      typeof parsed.bestNextStep === 'string' &&
      validSteps.includes(parsed.bestNextStep) &&
      typeof parsed.finalMessage === 'string'
    ) {
      return {
        relationshipEnergy: parsed.relationshipEnergy,
        whatTheyMayBeFeeling: parsed.whatTheyMayBeFeeling,
        whatTheyAreNotSaying: parsed.whatTheyAreNotSaying,
        mainBlockage: parsed.mainBlockage,
        reconciliationPotential: parsed.reconciliationPotential,
        timingGuidance: parsed.timingGuidance,
        bestNextStep: parsed.bestNextStep,
        finalMessage: parsed.finalMessage,
        language,
      };
    }
  } catch {
    // malformed JSON — skip
  }
  return null;
}

function buildPreviewSystemPrompt(language: AskQuestionLanguage): string {
  const answerLanguage = language === 'zh' ? 'Answer in Simplified Chinese.' : 'Answer in English.';
  return [
    'You are TianJi Love, a careful relationship reflection guide.',
    answerLanguage,
    'Generate the preview Ask reading with practical sections. Use grounded relationship guidance, not deterministic fortune-telling.',
    'Do not claim certainty, guarantee outcomes, or use fear-based payment urgency.',
    'Do not provide medical, legal, financial, or crisis advice.',
    'After the readable answer, include a JSON block with these fields: relationshipEnergy, whatTheyMayBeFeeling, whatTheyAreNotSaying, mainBlockage, reconciliationPotential, timingGuidance, bestNextStep, finalMessage.',
    'relationshipEnergy must be one of: warm | blocked | uncertain | fading | magnetic.',
    'mainBlockage must be one of: fear | pride | distance | third-party | emotional-exhaustion.',
    'reconciliationPotential must be one of: low | medium | high.',
    'bestNextStep must be one of: text | wait | clarify | move-on | observe.',
    'timingGuidance must be a string like "7-30 days" or "2 weeks".',
    'finalMessage must be a warm, encouraging closing sentence of 1-2 lines.',
    'Format the JSON as: ```json\n{...}\n``` at the end of your response.',
  ].join(' ');
}

function buildPreviewPrompt(question: string): string {
  return [
    'Generate the preview TianJi Love Ask reading for this user question.',
    '',
    question,
  ].join('\n');
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

    const { question, language, source, intent } = parsed.data;

    // Try to call AI gateway for structured preview with love report sections
    let loveReportSections = null;
    let fullPreviewAnswer = '';
    try {
      const gatewayResponse = await generateTianjiModelResponse({
        intent: 'ask_preview',
        prompt: buildPreviewPrompt(question),
        systemPrompt: buildPreviewSystemPrompt(language),
        maxTokens: 600,
        temperature: 0.65,
        responseFormat: 'text',
      });
      const rawAnswer = gatewayResponse.content.trim();
      fullPreviewAnswer = rawAnswer.replace(/```json\n[\s\S]+?\n```/g, '').trim();
      const reportInput = extractLoveReportData(rawAnswer, language);
      if (reportInput) {
        loveReportSections = buildLoveReportSections(reportInput);
      }
    } catch {
      // Fall back to simple answer if AI fails
    }

    // Fall back to simple answer if AI didn't produce content
    if (!fullPreviewAnswer) {
      fullPreviewAnswer =
        source === 'love_test' && isLoveTestPaidIntent(intent)
          ? buildLoveTestPaidIntentFallback(question, language, intent)
          : buildFallbackAnswer(question, language);
    }

    const preview = buildAskPreview(fullPreviewAnswer, language);
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
      evidence: buildAskEvidence({
        question,
        answer: fullPreviewAnswer,
        language,
        paid: false,
      }),
      locked: true,
      language,
      price: ASK_QUESTION_UNLOCK_PRICE_DISPLAY,
      loveReportSections: loveReportSections ?? undefined,
      meta: {
        fallbackReason: loveReportSections ? undefined : 'local-preview',
      },
    });
  } catch (error) {
    console.error('[api/ask/preview] error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
