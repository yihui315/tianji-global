/**
 * Stripe Customer Portal API — TianJi Global
 * Creates a Stripe Billing Portal session for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';

export async function POST(_req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // In production: look up the Stripe customer ID from your database
    // For now, we create a portal session without a customer ID
    // which requires the customer to enter their email in the portal
    const portalSession = await stripe.billingPortal.sessions.create({
      return_url: `${appUrl}/dashboard`,
      // customer: customerIdFromDatabase, // Add when you have customer IDs stored
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('[Stripe Portal Error]', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
