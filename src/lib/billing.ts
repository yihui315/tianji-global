import type Stripe from 'stripe';
import { getPool } from '@/lib/db';

export type BillingProductId =
  | 'solo_love_report'
  | 'compatibility_report';

export const BILLING_PRODUCTS = {
  solo_love_report: {
    productId: 'solo_love_report',
    name: 'Solo Love Report',
    description: 'A private complete love pattern report.',
    unitAmount: 499,
    currency: 'usd',
    mode: 'payment',
    entitlement: 'solo_love_report',
  },
  compatibility_report: {
    productId: 'compatibility_report',
    name: 'Compatibility Report',
    description: 'A private two-person compatibility report.',
    unitAmount: 1299,
    currency: 'usd',
    mode: 'payment',
    entitlement: 'compatibility_report',
  },
} as const;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function optionalUuid(value?: string | null) {
  return value && uuidPattern.test(value) ? value : null;
}

export type BillingProduct = (typeof BILLING_PRODUCTS)[BillingProductId];

export function getBillingProduct(productId: string): BillingProduct | null {
  return (BILLING_PRODUCTS as Record<string, BillingProduct>)[productId] ?? null;
}

export function buildLineItem(product: BillingProduct) {
  return {
    price_data: {
      currency: product.currency,
      unit_amount: product.unitAmount,
      product_data: {
        name: product.name,
        description: product.description,
      },
    },
    quantity: 1,
  };
}

export async function createPendingOrder(input: {
  product: BillingProduct;
  checkoutSessionId: string;
  userId?: string | null;
  readingSessionId?: string | null;
  customerEmail?: string | null;
}) {
  if (!process.env.DATABASE_URL) return;

  await getPool().query(
    `
      insert into orders (
        user_id,
        reading_session_id,
        stripe_checkout_session_id,
        customer_email,
        product_id,
        amount_total,
        currency,
        status,
        entitlement
      )
      values ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
      on conflict (stripe_checkout_session_id) do nothing
    `,
    [
      optionalUuid(input.userId),
      optionalUuid(input.readingSessionId),
      input.checkoutSessionId,
      input.customerEmail ?? null,
      input.product.productId,
      input.product.unitAmount,
      input.product.currency,
      input.product.entitlement,
    ]
  );
}

export async function recordStripeEvent(event: Stripe.Event): Promise<boolean> {
  if (!process.env.DATABASE_URL) return true;

  const result = await getPool().query(
    `
      insert into stripe_events (stripe_event_id, event_type, payload, processed_at)
      values ($1, $2, $3, now())
      on conflict (stripe_event_id) do nothing
      returning id
    `,
    [event.id, event.type, JSON.stringify(event)]
  );

  return result.rowCount === 1;
}

export async function markOrderPaid(input: {
  checkoutSessionId: string;
  stripePaymentIntentId?: string | null;
  customerEmail?: string | null;
}) {
  if (!process.env.DATABASE_URL) return;

  await getPool().query(
    `
      update orders
      set status = 'paid',
          stripe_payment_intent_id = coalesce($2, stripe_payment_intent_id),
          customer_email = coalesce($3, customer_email),
          paid_at = now(),
          updated_at = now()
      where stripe_checkout_session_id = $1
    `,
    [input.checkoutSessionId, input.stripePaymentIntentId ?? null, input.customerEmail ?? null]
  );
}

export async function markOrderRefunded(input: {
  stripePaymentIntentId?: string | null;
  checkoutSessionId?: string | null;
}) {
  if (!process.env.DATABASE_URL) return;
  if (!input.stripePaymentIntentId && !input.checkoutSessionId) return;

  await getPool().query(
    `
      update orders
      set status = 'refunded',
          updated_at = now()
      where ($1 <> '' and stripe_payment_intent_id = $1)
         or ($2 <> '' and stripe_checkout_session_id = $2)
    `,
    [input.stripePaymentIntentId ?? '', input.checkoutSessionId ?? '']
  );
}

export async function grantEntitlement(input: {
  productId: BillingProductId;
  checkoutSessionId?: string | null;
}) {
  if (!process.env.DATABASE_URL || !input.checkoutSessionId) return;
  if (BILLING_PRODUCTS[input.productId]) {
    await markOrderPaid({ checkoutSessionId: input.checkoutSessionId });
  }
}

export async function hasEntitlement(input: {
  userId?: string | null;
  readingSessionId?: string | null;
  entitlement: string;
}): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;

  const result = await getPool().query(
    `
      select exists (
        select 1 from orders
        where status = 'paid'
          and entitlement = $1
          and (
            (
              $2 <> ''
              and reading_session_id::text = $2
              and (user_id is null or ($3 <> '' and user_id::text = $3))
            )
            or (
              $3 <> ''
              and user_id::text = $3
              and reading_session_id is null
            )
          )
      ) as entitled
    `,
    [input.entitlement, input.readingSessionId ?? '', input.userId ?? '']
  );

  return Boolean(result.rows[0]?.entitled);
}

export async function getPaidOrderForCheckoutSession(checkoutSessionId: string): Promise<{
  readingSessionId: string;
  customerEmail: string | null;
  productId: BillingProductId;
} | null> {
  if (!process.env.DATABASE_URL) return null;

  const result = await getPool().query(
    `
      select reading_session_id, customer_email, product_id
      from orders
      where stripe_checkout_session_id = $1
        and status = 'paid'
      limit 1
    `,
    [checkoutSessionId]
  );

  const row = result.rows[0];
  if (!row || !getBillingProduct(row.product_id)) return null;

  return {
    readingSessionId: String(row.reading_session_id),
    customerEmail: row.customer_email ?? null,
    productId: row.product_id,
  };
}
