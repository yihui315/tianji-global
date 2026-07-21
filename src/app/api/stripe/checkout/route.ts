/**
 * Stripe Checkout API — TianJi Global
 * Creates a Stripe Checkout Session for subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  stripe,
  PLANS,
  buildSubscriptionMetadata,
  getStripeTestModeReadiness,
} from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { requirePayPerUseEnabled } from '@/lib/pay-per-use';

export async function POST(req: NextRequest) {
  const payPerUseGate = requirePayPerUseEnabled();
  if (payPerUseGate) return payPerUseGate;

  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId } = body as { planId: string };

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (process.env.ENABLE_STRIPE_SUBSCRIPTIONS !== 'true') {
      return NextResponse.json(
        { error: 'Subscription checkout is not ready', code: 'subscription_lifecycle_not_ready' },
        { status: 503 }
      );
    }

    const stripeReadiness = getStripeTestModeReadiness();
    if (!stripeReadiness.ready) {
      return NextResponse.json(
        { error: 'Stripe test mode is not configured', code: stripeReadiness.code },
        { status: 503 }
      );
    }

    if (!plan.priceId?.startsWith('price_')) {
      return NextResponse.json(
        { error: 'Subscription Price is not configured', code: 'subscription_price_id_missing' },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const metadata = buildSubscriptionMetadata(
      user.id as string,
      user.email,
      planId as keyof typeof PLANS
    );

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      metadata: metadata as unknown as Record<string, string>,
      success_url: `${appUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing/cancel`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: metadata as unknown as Record<string, string>,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('[Stripe Checkout Error]', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
