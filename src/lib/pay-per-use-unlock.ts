import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getPreviewRecord, type PreviewRecord } from '@/lib/ai/usage';
import {
  attachCheckoutSessionToOrder,
  createPayPerUseOrder,
  getPaidPayPerUseOrder,
  type PayPerUseKind,
} from '@/lib/pay-per-use-orders';

export interface PayPerUseConfig {
  kind: Exclude<PayPerUseKind, 'love-reading'>;
  priceCents: number;
  productName: { en: string; zh: string };
  productDescription: { en: string; zh: string };
  returnPath: '/ask' | '/draw';
}

export function tokenRef(id: string): string {
  return createHash('sha256').update(id).digest('hex');
}

export function payPerUseEnabled(): boolean {
  return process.env.ENABLE_PAY_PER_USE === 'true';
}

export function payPerUseDisabledResponse() {
  return NextResponse.json(
    {
      error: 'Paid unlock is temporarily unavailable during launch. Free preview remains available.',
    },
    { status: 503 }
  );
}

function previewMatchesKind(record: PreviewRecord | null, kind: PayPerUseConfig['kind']): record is PreviewRecord {
  return Boolean(record && record.kind === kind);
}

function getLanguage(record: PreviewRecord, fallback?: string): 'en' | 'zh' {
  if (fallback === 'zh' || fallback === 'en') {
    return fallback;
  }
  return record.language === 'zh' ? 'zh' : 'en';
}

export async function createPayPerUseCheckout(request: NextRequest, config: PayPerUseConfig) {
  if (!payPerUseEnabled()) {
    return payPerUseDisabledResponse();
  }

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : '';
  const record = getPreviewRecord(id);
  if (!id || !previewMatchesKind(record, config.kind)) {
    return NextResponse.json({ error: 'Invalid or expired preview id' }, { status: 400 });
  }

  const language = getLanguage(record, typeof body.language === 'string' ? body.language : undefined);
  const requestRef = tokenRef(id);
  const order = await createPayPerUseOrder({
    kind: config.kind,
    requestId: id,
    requestRef,
    amountCents: config.priceCents,
    currency: 'usd',
    metadata: {
      source: `${config.kind}-unlock`,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: language === 'zh' ? config.productName.zh : config.productName.en,
            description:
              language === 'zh' ? config.productDescription.zh : config.productDescription.en,
          },
          unit_amount: config.priceCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      flow: 'pay-per-use',
      productType: 'pay-per-use',
      kind: config.kind,
      orderId: order.id,
      requestId: id,
      requestRef,
      amount: String(config.priceCents),
      currency: 'usd',
      language,
    },
    success_url: `${appUrl}${config.returnPath}?lang=${language}&id=${encodeURIComponent(id)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}${config.returnPath}?lang=${language}&cancelled=1`,
  });

  if (!session.url) {
    return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 500 });
  }

  await attachCheckoutSessionToOrder(order.id, session.id);
  return NextResponse.json({ url: session.url, orderId: order.id });
}

export async function verifyPayPerUseUnlock(request: NextRequest, config: PayPerUseConfig) {
  if (!payPerUseEnabled()) {
    return { response: payPerUseDisabledResponse() };
  }

  const sessionId = request.nextUrl.searchParams.get('session_id');
  const id = request.nextUrl.searchParams.get('id');
  if (!sessionId || !id) {
    return {
      response: NextResponse.json({ error: 'session_id and id are required' }, { status: 400 }),
    };
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const requestRef = tokenRef(id);
  const paid = session.payment_status === 'paid' || session.status === 'complete';
  const metadataMatches =
    session.metadata?.flow === 'pay-per-use' &&
    session.metadata?.kind === config.kind &&
    session.metadata?.requestRef === requestRef;

  if (!paid || !metadataMatches) {
    return { response: NextResponse.json({ error: 'Payment not verified' }, { status: 403 }) };
  }

  const paidOrder = await getPaidPayPerUseOrder({
    kind: config.kind,
    requestRef,
    checkoutSessionId: sessionId,
  });
  if (!paidOrder) {
    return {
      response: NextResponse.json({ error: 'Payment is still being verified' }, { status: 403 }),
    };
  }

  const record = getPreviewRecord(id);
  if (!previewMatchesKind(record, config.kind)) {
    return { response: NextResponse.json({ error: 'Preview has expired' }, { status: 410 }) };
  }

  return { record };
}
