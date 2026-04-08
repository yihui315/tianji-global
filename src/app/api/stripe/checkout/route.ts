/**
 * Stripe Checkout API — TianJi Global
 * Creates a Stripe Checkout Session for subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS, buildSubscriptionMetadata } from '@/lib/stripe';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
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
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.name} — ${plan.nameZh}`,
              description: `${plan.description} | ${plan.descriptionZh}`,
            },
            unit_amount: Math.round(plan.price * 100), // cents
            recurring: {
              interval: plan.interval,
            },
          },
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
