import { NextRequest, NextResponse } from 'next/server';
import { buildDestinyScan, decodeDestinyScanId } from '@/lib/destiny-scan';
import { getStripe } from '@/lib/stripe';

const DESTINY_UNLOCK_PRICE = 990;

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const input = decodeDestinyScanId(id);
  if (!input) {
    return NextResponse.json({ error: 'Invalid destiny scan id' }, { status: 400 });
  }

  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const paid = session.payment_status === 'paid' || session.status === 'complete';

      if (!paid || session.metadata?.scanId !== id) {
        return NextResponse.json({ error: 'Payment not verified' }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        unlocked: true,
        data: buildDestinyScan(input, id),
      });
    } catch (error) {
      console.error('[api/destiny/unlock] verify error:', error);
      return NextResponse.json({ error: 'Unable to verify payment' }, { status: 500 });
    }
  }

  try {
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
              name: 'Full Destiny Reading',
              description: 'Unlock relationship, wealth cycle, and action plan',
            },
            unit_amount: DESTINY_UNLOCK_PRICE,
          },
          quantity: 1,
        },
      ],
      metadata: {
        scanId: id,
        flow: 'destiny-scan',
      },
      success_url: `${appUrl}/destiny/result?id=${id}&success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/destiny/result?id=${id}`,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 500 });
    }

    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    console.error('[api/destiny/unlock] checkout error:', error);
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 });
  }
}
