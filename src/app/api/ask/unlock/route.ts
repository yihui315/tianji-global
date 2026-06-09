/**
 * /api/ask/unlock - Pay-per-question checkout and unlock verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import {
  decodeAskQuestionId,
  askQuestionLanguageSchema,
  ASK_QUESTION_UNLOCK_PRICE_USD_CENTS,
  type AskAiMeta,
  type AskQuestionLanguage,
} from '@/lib/ask-question';
import { buildAskEvidence } from '@/lib/divination/evidence';
import {
  buildPaymentUnavailableBody,
  isStagingDegradedMode,
  isStripePaymentAvailable,
} from '@/lib/staging-degraded-mode';
import { generateTianjiModelResponse } from '@/lib/tianji-model-gateway';
import { LOVE_TEST_ASK_INTENTS, isLoveTestPaidIntent } from '@/lib/love-test';
import { buildLoveReportSections, type LoveReportInput } from '@/lib/love-report-sections';

export const dynamic = 'force-dynamic';

function tokenRef(id: string): string {
  return createHash('sha256').update(id).digest('hex');
}

function buildPaidAskSystemPrompt(language: AskQuestionLanguage): string {
  const answerLanguage =
    language === 'zh'
      ? 'Answer in Simplified Chinese.'
      : 'Answer in English.';

  return [
    'You are TianJi Love, a careful relationship reflection guide.',
    answerLanguage,
    'Generate the complete paid Ask reading with practical sections for situation, hidden tension, timing, next move, and reflection.',
    'Use grounded relationship guidance, not deterministic fortune-telling.',
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

function buildPaidAskPrompt(question: string): string {
  return [
    'Generate the paid TianJi Love Ask reading for this user question.',
    '',
    question,
  ].join('\n');
}

function toAskAiMeta(response: Awaited<ReturnType<typeof generateTianjiModelResponse>>): AskAiMeta {
  return {
    provider: response.audit.provider,
    model: response.audit.model,
    fallbackUsed: response.audit.fallback,
    safetyRewritten: response.audit.safetyRewriteApplied,
    latencyMs: response.audit.latencyMs,
    route: 'paid_ask',
  };
}

/**
 * Extract a JSON block from the AI response and parse it into LoveReportInput.
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
    // Validate and coerce required fields
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

function getLoveTestPaidIntentCheckoutGate() {
  const testModeReady = process.env.LOVE_TEST_PAID_INTENT_TEST_MODE_READY === 'true';
  const paidSmokeApproved = process.env.LOVE_TEST_PAID_SMOKE_APPROVED === 'true';

  if (!testModeReady) {
    return {
      status: 'blocked',
      message: 'Checkout readiness required',
      code: 'love_test_checkout_readiness_required',
    } as const;
  }

  if (!paidSmokeApproved) {
    return {
      status: 'approval_required',
      message: 'Test-mode checkout ready - awaiting approval',
      code: 'love_test_paid_smoke_approval_required',
    } as const;
  }

  return {
    status: 'go',
    message: 'Test-mode checkout approved',
    code: 'love_test_checkout_go',
  } as const;
}

function buildLoveTestCheckoutGateResponse(gate: ReturnType<typeof getLoveTestPaidIntentCheckoutGate>) {
  return NextResponse.json(
    {
      error: gate.message,
      code: gate.code,
      checkoutReadiness: gate.status,
    },
    { status: gate.status === 'blocked' ? 423 : 403 },
  );
}

const postBodySchema = z.object({
  id: z.string().min(20),
  language: askQuestionLanguageSchema.optional(),
  source: z.enum(['love_test']).optional(),
  intent: z.enum(LOVE_TEST_ASK_INTENTS).optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (isStagingDegradedMode() && !isStripePaymentAvailable()) {
      return NextResponse.json(buildPaymentUnavailableBody(), { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = postBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { id, language, source: askSource, intent: askIntent } = parsed.data;
    const decoded = decodeAskQuestionId(id);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired question id' }, { status: 400 });
    }

    const lang = language ?? decoded.language ?? 'en';
    if (askSource === 'love_test' && isLoveTestPaidIntent(askIntent)) {
      const loveTestCheckoutGate = getLoveTestPaidIntentCheckoutGate();
      if (loveTestCheckoutGate.status !== 'go') {
        return buildLoveTestCheckoutGateResponse(loveTestCheckoutGate);
      }
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const sourceParam = askSource ? `&source=${askSource}` : '';
    const intentParam = askIntent ? `&intent=${askIntent}` : '';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: lang === 'zh' ? '天机综合解读 - 单题完整解锁' : 'TianJi Oracle - Complete decision reading',
              description:
                lang === 'zh'
                  ? '解锁本次问题的局势、隐变量、时机、下一步与反思问题 - 一次付费 - 无需订阅'
                  : 'Unlock the situation map, hidden tension, timing, next move, and reflection prompt - One-time - No subscription',
            },
            unit_amount: ASK_QUESTION_UNLOCK_PRICE_USD_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        flow: 'ask-question',
        productType: 'pay-per-use',
        amount: String(ASK_QUESTION_UNLOCK_PRICE_USD_CENTS),
        currency: 'usd',
        askQuestionRef: tokenRef(id),
        language: lang,
        source: askSource ?? 'ask',
        intent: askIntent ?? 'none',
      },
      success_url: `${appUrl}/ask?lang=${lang}${sourceParam}${intentParam}&id=${encodeURIComponent(id)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/ask?lang=${lang}${sourceParam}${intentParam}&cancelled=1`,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[api/ask/unlock] checkout error:', error);
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (isStagingDegradedMode() && !isStripePaymentAvailable()) {
    return NextResponse.json(buildPaymentUnavailableBody(), { status: 503 });
  }

  const sessionId = request.nextUrl.searchParams.get('session_id');
  const queryId = request.nextUrl.searchParams.get('id');
  const askSource = request.nextUrl.searchParams.get('source');
  const askIntent = request.nextUrl.searchParams.get('intent');
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
  }

  if (askSource === 'love_test' && isLoveTestPaidIntent(askIntent)) {
    const loveTestCheckoutGate = getLoveTestPaidIntentCheckoutGate();
    if (loveTestCheckoutGate.status !== 'go') {
      return buildLoveTestCheckoutGateResponse(loveTestCheckoutGate);
    }
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.payment_status === 'paid' || session.status === 'complete';
    if (!paid) {
      return NextResponse.json({ error: 'Payment not verified' }, { status: 403 });
    }

    if (session.metadata?.flow !== 'ask-question') {
      return NextResponse.json({ error: 'Unexpected session flow' }, { status: 400 });
    }

    const id = queryId || session.metadata?.askQuestionId;
    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Question id missing on session' }, { status: 400 });
    }

    const decoded = decodeAskQuestionId(id);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired question id' }, { status: 400 });
    }

    const gatewayResponse = await generateTianjiModelResponse({
      intent: 'paid_ask',
      prompt: buildPaidAskPrompt(decoded.question),
      systemPrompt: buildPaidAskSystemPrompt(decoded.language),
      maxTokens: 900,
      temperature: 0.65,
      responseFormat: 'text',
    });
    const rawAnswer = gatewayResponse.content.trim();

    // Extract structured data for love report sections
    const reportInput = extractLoveReportData(rawAnswer, decoded.language);
    const loveReportSections = reportInput ? buildLoveReportSections(reportInput) : null;

    // Strip the JSON block from the readable answer if present
    const answer = rawAnswer.replace(/```json\n[\s\S]+?\n```/g, '').trim();

    return NextResponse.json({
      success: true,
      unlocked: true,
      data: {
        question: decoded.question,
        language: decoded.language,
        answer,
        preview: null,
        locked: false,
        fullAnswer: answer,
        evidence: buildAskEvidence({
          question: decoded.question,
          answer,
          language: decoded.language,
          paid: true,
        }),
        aiMeta: toAskAiMeta(gatewayResponse),
        loveReportSections: loveReportSections ?? undefined,
      },
    });
  } catch (error) {
    console.error('[api/ask/unlock] verify error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Unable to verify payment' }, { status: 500 });
  }
}
