/**
 * /api/draw/unlock - Pay-per-draw checkout and unlock verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import {
  decodeQuickDrawId,
  quickDrawLanguageSchema,
  QUICK_DRAW_UNLOCK_PRICE_USD_CENTS,
} from '@/lib/quick-draw';

export const dynamic = 'force-dynamic';

function tokenRef(id: string): string {
  return createHash('sha256').update(id).digest('hex');
}

const postBodySchema = z.object({
  id: z.string().min(20),
  language: quickDrawLanguageSchema.optional(),
});

function payPerUseEnabled(): boolean {
  return process.env.ENABLE_PAY_PER_USE === 'true';
}

function payPerUseDisabledResponse() {
  return NextResponse.json(
    {
      error: 'Paid unlock is temporarily unavailable during launch. Free preview remains available.',
    },
    { status: 503 },
  );
}

export async function POST(request: NextRequest) {
  if (!payPerUseEnabled()) {
    return payPerUseDisabledResponse();
  }

  try {
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
              name:
                lang === 'zh'
                  ? '天机三张牌 - 昨天/今天/明天解锁'
                  : 'TianJi Three Cards - Yesterday/Today/Tomorrow unlock',
              description:
                lang === 'zh'
                  ? '解锁本次抽出的三张塔罗牌与完整解读 - 一次性付费 - 无需订阅'
                  : 'Unlock the three cards drawn for you and the full reading - One-time - No subscription',
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
    console.error('[api/draw/unlock] checkout error:', error);
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!payPerUseEnabled()) {
    return payPerUseDisabledResponse();
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

    return NextResponse.json({
      success: true,
      unlocked: true,
      data: {
        question: decoded.question,
        language: decoded.language,
        draw: decoded.draw,
        fullReading: decoded.fullReading,
        model: decoded.model,
        provider: decoded.provider,
      },
    });
  } catch (error) {
    console.error('[api/draw/unlock] verify error:', error);
    return NextResponse.json({ error: 'Unable to verify payment' }, { status: 500 });
  }
}
