import { Pool } from 'pg';
import type Stripe from 'stripe';

export type PayPerUseKind = 'ask' | 'draw' | 'love-reading';
export type PayPerUseStatus = 'pending' | 'paid' | 'canceled' | 'expired' | 'refunded';

export interface PayPerUseOrder {
  id: string;
  kind: PayPerUseKind;
  requestId: string;
  requestRef: string;
  userId?: string | null;
  status: PayPerUseStatus;
  amountCents: number;
  currency: string;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paidAt?: string | null;
}

interface CreatePayPerUseOrderInput {
  kind: PayPerUseKind;
  requestId: string;
  requestRef: string;
  amountCents: number;
  currency?: string;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}

let payPerUsePool: Pool | null = null;

export function getPayPerUsePool(): Pool {
  if (!payPerUsePool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('Missing DATABASE_URL environment variable');
    }

    payPerUsePool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  return payPerUsePool;
}

function mapOrderRow(row: Record<string, unknown>): PayPerUseOrder {
  return {
    id: String(row.id),
    kind: row.kind as PayPerUseKind,
    requestId: String(row.request_id),
    requestRef: String(row.request_ref),
    userId: typeof row.user_id === 'string' ? row.user_id : null,
    status: row.status as PayPerUseStatus,
    amountCents: Number(row.amount_cents),
    currency: String(row.currency),
    stripeCheckoutSessionId:
      typeof row.stripe_checkout_session_id === 'string' ? row.stripe_checkout_session_id : null,
    stripePaymentIntentId:
      typeof row.stripe_payment_intent_id === 'string' ? row.stripe_payment_intent_id : null,
    paidAt: typeof row.paid_at === 'string' ? row.paid_at : null,
  };
}

export async function createPayPerUseOrder(input: CreatePayPerUseOrderInput): Promise<PayPerUseOrder> {
  const pool = getPayPerUsePool();
  const result = await pool.query(
    `INSERT INTO pay_per_use_orders
       (kind, request_id, request_ref, user_id, amount_cents, currency, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
     RETURNING *`,
    [
      input.kind,
      input.requestId,
      input.requestRef,
      input.userId ?? null,
      input.amountCents,
      input.currency ?? 'usd',
      JSON.stringify(input.metadata ?? {}),
    ]
  );

  return mapOrderRow(result.rows[0]);
}

export async function attachCheckoutSessionToOrder(orderId: string, checkoutSessionId: string): Promise<void> {
  const pool = getPayPerUsePool();
  await pool.query(
    `UPDATE pay_per_use_orders
     SET stripe_checkout_session_id = $1, updated_at = NOW()
     WHERE id = $2`,
    [checkoutSessionId, orderId]
  );
}

export async function getPaidPayPerUseOrder(input: {
  kind: PayPerUseKind;
  requestRef: string;
  checkoutSessionId: string;
}): Promise<PayPerUseOrder | null> {
  const pool = getPayPerUsePool();
  const result = await pool.query(
    `SELECT * FROM pay_per_use_orders
     WHERE kind = $1
       AND request_ref = $2
       AND stripe_checkout_session_id = $3
       AND status = 'paid'
     LIMIT 1`,
    [input.kind, input.requestRef, input.checkoutSessionId]
  );

  return result.rows[0] ? mapOrderRow(result.rows[0]) : null;
}

export async function recordStripeWebhookEvent(pool: Pool, event: Stripe.Event): Promise<boolean> {
  const result = await pool.query(
    `INSERT INTO stripe_webhook_events (stripe_event_id, event_type, payload)
     VALUES ($1, $2, $3::jsonb)
     ON CONFLICT (stripe_event_id) DO NOTHING
     RETURNING id`,
    [event.id, event.type, JSON.stringify(event)]
  );

  return result.rows.length > 0;
}

export async function markPayPerUseOrderPaidFromSession(
  pool: Pool,
  session: Stripe.Checkout.Session
): Promise<PayPerUseOrder | null> {
  const orderId = session.metadata?.orderId;
  const requestRef = session.metadata?.requestRef;
  const kind = session.metadata?.kind as PayPerUseKind | undefined;

  if (!orderId || !requestRef || !kind) {
    return null;
  }

  const result = await pool.query(
    `UPDATE pay_per_use_orders
     SET status = 'paid',
         stripe_checkout_session_id = COALESCE(stripe_checkout_session_id, $2),
         stripe_payment_intent_id = COALESCE(stripe_payment_intent_id, $3),
         paid_at = COALESCE(paid_at, NOW()),
         updated_at = NOW()
     WHERE id = $1
       AND kind = $4
       AND request_ref = $5
     RETURNING *`,
    [
      orderId,
      session.id,
      typeof session.payment_intent === 'string' ? session.payment_intent : null,
      kind,
      requestRef,
    ]
  );

  return result.rows[0] ? mapOrderRow(result.rows[0]) : null;
}
