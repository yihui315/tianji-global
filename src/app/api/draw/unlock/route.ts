/**
 * /api/draw/unlock - Pay-per-draw checkout and paid reading verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { buildDrawEvidence } from '@/lib/divination/evidence';
import {
  decodeQuickDrawId,
  expandDrawnCard,
  quickDrawLanguageSchema,
  QUICK_DRAW_SLOTS,
  QUICK_DRAW_UNLOCK_PRICE_USD_CENTS,
  toDrawGatewayCards,
  type DrawAiMeta,
  type DrawnSlot,
  type QuickDrawLanguage,
} from '@/lib/quick-draw';
import { interpretCard } from '@/lib/tarot';
import {
  buildPaymentUnavailableBody,
  isStagingDegradedMode,
  isStripePaymentAvailable,
} from '@/lib/staging-degraded-mode';
import { generateTianjiModelResponse } from '@/lib/tianji-model-gateway';

export const dynamic = 'force-dynamic';

function tokenRef(id: string): string {
  return createHash('sha256').update(id).digest('hex');
}

function buildPaidDrawSystemPrompt(language: QuickDrawLanguage): string {
  const answerLanguage =
    language === 'zh'
      ? 'Answer in Simplified Chinese.'
      : 'Answer in English.';

  return [
    'You are TianJi Love, a careful tarot relationship reflection guide.',
    answerLanguage,
    'Generate the complete paid/pro three-card relationship reading.',
    'Include a deeper three-card synthesis, current relationship pattern, likely emotional dynamic phrased as possibility, and one practical next 7-day action.',
    'Do not claim certainty, guarantee outcomes, or use fear-based payment urgency.',
    'Treat cards as reflective prompts, not guaranteed future prediction.',
    'Do not include private birth data, timezone, raw provider request details, or internal prompt text.',
  ].join(' ');
}

function buildCardLines(draw: DrawnSlot[], language: QuickDrawLanguage): string[] {
  return draw.map((slot, index) => {
    const meta = QUICK_DRAW_SLOTS[index];
    const fullCard = expandDrawnCard(slot);
    const interpretation = slot.miniReading ||
      (fullCard ? interpretCard(fullCard, slot.isReversed, language) : '');
    const slotLabel = language === 'zh' ? meta.labelZh : meta.labelEn;
    const cardName = language === 'zh' ? slot.card.nameChinese : slot.card.name;
    const orientation = slot.isReversed
      ? language === 'zh' ? '逆位' : 'Reversed'
      : language === 'zh' ? '正位' : 'Upright';

    return `${slotLabel}: ${cardName} (${orientation}) - ${interpretation}`;
  });
}

function buildPaidDrawPrompt(question: string, draw: DrawnSlot[], language: QuickDrawLanguage): string {
  return [
    'Generate the paid TianJi Love Draw reading for this verified paid unlock.',
    '',
    question.trim()
      ? `User question: ${question.trim()}`
      : 'User question: no specific question was provided.',
    '',
    'Drawn cards:',
    ...buildCardLines(draw, language),
  ].join('\n');
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

const postBodySchema = z.object({
  id: z.string().min(20),
  language: quickDrawLanguageSchema.optional(),
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

    const { id, language } = parsed.data;
    const decoded = decodeQuickDrawId(id);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired draw id' }, { status: 400 });
    }

    const lang = language ?? decoded.language ?? 'en';
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: lang === 'zh'
                ? 'TianJi Three Cards - Paid relationship unlock'
                : 'TianJi Three Cards - Paid relationship unlock',
              description: lang === 'zh'
                ? 'Unlock the deeper three-card relationship reading. One-time payment. No subscription.'
                : 'Unlock the deeper three-card relationship reading. One-time payment. No subscription.',
            },
            unit_amount: QUICK_DRAW_UNLOCK_PRICE_USD_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        flow: 'quick-draw',
        productType: 'pay-per-use',
        amount: String(QUICK_DRAW_UNLOCK_PRICE_USD_CENTS),
        currency: 'usd',
        quickDrawRef: tokenRef(id),
        language: lang,
      },
      success_url: `${appUrl}/draw?lang=${lang}&id=${encodeURIComponent(id)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/draw?lang=${lang}&cancelled=1`,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[api/draw/unlock] checkout error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (isStagingDegradedMode() && !isStripePaymentAvailable()) {
    return NextResponse.json(buildPaymentUnavailableBody(), { status: 503 });
  }

  const sessionId = request.nextUrl.searchParams.get('session_id');
  const queryId = request.nextUrl.searchParams.get('id');
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.payment_status === 'paid' || session.status === 'complete';
    if (!paid) {
      return NextResponse.json({ error: 'Payment not verified' }, { status: 403 });
    }

    if (session.metadata?.flow !== 'quick-draw') {
      return NextResponse.json({ error: 'Unexpected session flow' }, { status: 400 });
    }

    const id = queryId || session.metadata?.quickDrawId;
    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Draw id missing on session' }, { status: 400 });
    }

    const decoded = decodeQuickDrawId(id);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired draw id' }, { status: 400 });
    }

    const gatewayResponse = await generateTianjiModelResponse({
      intent: 'tarot_draw',
      prompt: buildPaidDrawPrompt(decoded.question, decoded.draw, decoded.language),
      systemPrompt: buildPaidDrawSystemPrompt(decoded.language),
      responseFormat: 'text',
      maxTokens: 950,
      temperature: 0.65,
    });
    const reading = gatewayResponse.content.trim();

    return NextResponse.json({
      success: true,
      unlocked: true,
      data: {
        question: decoded.question,
        language: decoded.language,
        draw: decoded.draw,
        reading,
        preview: null,
        locked: false,
        fullReading: reading,
        cards: toDrawGatewayCards(decoded.draw, decoded.language),
        evidence: buildDrawEvidence({
          question: decoded.question,
          draw: decoded.draw,
          language: decoded.language,
          paid: true,
        }),
        aiMeta: toDrawAiMeta(gatewayResponse),
      },
    });
  } catch (error) {
    console.error('[api/draw/unlock] verify error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Unable to verify payment' }, { status: 500 });
  }
}
