/**
 * Stripe Webhook API — TianJi Global
 * Handles Stripe webhook events for subscription lifecycle
 *
 * Requirements:
 * - Verify Stripe webhook signature using STRIPE_WEBHOOK_SECRET env var
 * - Parse raw request body (array buffer) — do NOT use NextRequest.json()
 * - Use pg Pool for database operations
 * - Handle idempotency (check record existence before insert)
 * - Log all events to audit_log table
 * - Return 200 quickly to Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import type { SubscriptionMetadata } from '@/lib/stripe';
import Stripe from 'stripe';
import { Pool } from 'pg';

// ─── Database Pool ─────────────────────────────────────────────────────────────

let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('Missing DATABASE_URL environment variable');
    }
    _pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    _pool.on('error', (err) => {
      console.error('[DB Pool Error]', err);
    });
  }
  return _pool;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Get user_id from stripe_customer_id.
 */
async function getUserIdByStripeCustomerId(
  pool: Pool,
  stripeCustomerId: string
): Promise<string | null> {
  const result = await pool.query(
    'SELECT id FROM users WHERE stripe_customer_id = $1 LIMIT 1',
    [stripeCustomerId]
  );
  return result.rows[0]?.id ?? null;
}

/**
 * Map Stripe subscription status to our enum.
 */
function mapStripeStatus(status: Stripe.Subscription.Status): string {
  const mapping: Record<string, string> = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    paused: 'paused',
  };
  return mapping[status] ?? 'active';
}

/**
 * Map Stripe price ID to subscription tier.
 * Price IDs come from STRIPE_PRO_MONTHLY_PRICE_ID / STRIPE_PRO_YEARLY_PRICE_ID env vars.
 */
function mapPriceIdToTier(priceId: string): string {
  const monthlyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '';
  const yearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? '';

  if (priceId === yearlyPriceId) return 'premium';
  if (priceId === monthlyPriceId) return 'basic';
  return 'free';
}

/**
 * Upsert subscription — inserts if not exists, updates if exists.
 * Returns the subscription id.
 */
async function upsertSubscription(
  pool: Pool,
  userId: string,
  stripeSubId: string,
  stripePriceId: string,
  status: string,
  tier: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAt: Date | null,
  cancelAtPeriodEnd: boolean
): Promise<string> {
  // Try insert first (idempotent — unique constraint on stripe_subscription_id)
  const insertResult = await pool.query(
    `INSERT INTO subscriptions
       (user_id, stripe_subscription_id, stripe_price_id, status, tier,
        current_period_start, current_period_end, cancel_at, cancel_at_period_end)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (stripe_subscription_id) DO UPDATE SET
       stripe_price_id   = EXCLUDED.stripe_price_id,
       status            = EXCLUDED.status,
       tier              = EXCLUDED.tier,
       current_period_start = EXCLUDED.current_period_start,
       current_period_end   = EXCLUDED.current_period_end,
       cancel_at         = EXCLUDED.cancel_at,
       cancel_at_period_end = EXCLUDED.cancel_at_period_end,
       updated_at        = NOW()
     RETURNING id`,
    [
      userId,
      stripeSubId,
      stripePriceId,
      status,
      tier,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAt,
      cancelAtPeriodEnd,
    ]
  );
  return insertResult.rows[0].id;
}

/**
 * Insert audit log entry.
 */
async function insertAuditLog(
  pool: Pool,
  userId: string | null,
  action: string,
  metadata: Record<string, unknown>
): Promise<void> {
  await pool.query(
    `INSERT INTO audit_log (user_id, action, metadata)
     VALUES ($1, $2::audit_action, $3)`,
    [userId, action, JSON.stringify(metadata)]
  );
}

/**
 * Update user's subscription_status and subscription_tier from the
 * most recent active subscription on record.
 */
async function refreshUserSubscriptionFields(
  pool: Pool,
  userId: string
): Promise<void> {
  // Pick the most recent non-canceled subscription for this user
  const result = await pool.query(
    `SELECT status, tier FROM subscriptions
     WHERE user_id = $1 AND status != 'canceled'
     ORDER BY current_period_end DESC LIMIT 1`,
    [userId]
  );

  if (result.rows.length > 0) {
    await pool.query(
      `UPDATE users SET subscription_status = $1, subscription_tier = $2
       WHERE id = $3`,
      [result.rows[0].status, result.rows[0].tier, userId]
    );
  } else {
    // No active subscriptions — revert to free
    await pool.query(
      `UPDATE users SET subscription_status = 'active', subscription_tier = 'free'
       WHERE id = $1`,
      [userId]
    );
  }
}

// ─── Event Handlers ─────────────────────────────────────────────────────────────

async function handleCheckoutSessionCompleted(
  pool: Pool,
  session: Stripe.Checkout.Session
): Promise<void> {
  const stripeCustomerId = session.customer as string;
  const userId = session.metadata?.userId;

  if (!userId || !stripeCustomerId) {
    console.warn('[Webhook] checkout.session.completed missing userId or customer', {
      sessionId: session.id,
    });
    return;
  }

  // Only update stripe_customer_id if not already set (idempotent)
  await pool.query(
    `UPDATE users SET stripe_customer_id = $1
     WHERE id = $2 AND stripe_customer_id IS NULL`,
    [stripeCustomerId, userId]
  );

  await insertAuditLog(pool, userId, 'subscription_created', {
    event: 'checkout.session.completed',
    sessionId: session.id,
    stripeCustomerId,
  });

  console.log(`[Webhook] checkout.session.completed — linked customer ${stripeCustomerId} to user ${userId}`);
}

async function handleSubscriptionCreated(
  pool: Pool,
  subscription: Stripe.Subscription
): Promise<void> {
  const stripeCustomerId = subscription.customer as string;
  const userId = await getUserIdByStripeCustomerId(pool, stripeCustomerId);

  if (!userId) {
    console.warn('[Webhook] customer.subscription.created: no user found for customer', {
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
    });
    return;
  }

  const priceId = subscription.items.data[0]?.price.id ?? '';
  const status = mapStripeStatus(subscription.status);
  const tier = mapPriceIdToTier(priceId);
  // Stripe v22: current_period_* lives on SubscriptionItem, not Subscription
  const item = subscription.items.data[0];
  const now = item ? new Date(item.current_period_start * 1000) : new Date();
  const end = item ? new Date(item.current_period_end * 1000) : new Date();
  const cancelAt = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000)
    : null;

  await upsertSubscription(
    pool, userId, subscription.id, priceId,
    status, tier, now, end, cancelAt,
    subscription.cancel_at_period_end ?? false
  );

  await insertAuditLog(pool, userId, 'subscription_created', {
    event: 'customer.subscription.created',
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    status,
    tier,
  });

  await refreshUserSubscriptionFields(pool, userId);

  console.log(`[Webhook] customer.subscription.created — sub ${subscription.id} for user ${userId}`);
}

async function handleSubscriptionUpdated(
  pool: Pool,
  subscription: Stripe.Subscription
): Promise<void> {
  const stripeCustomerId = subscription.customer as string;
  const userId = await getUserIdByStripeCustomerId(pool, stripeCustomerId);

  if (!userId) {
    console.warn('[Webhook] customer.subscription.updated: no user found for customer', {
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
    });
    return;
  }

  const priceId = subscription.items.data[0]?.price.id ?? '';
  const status = mapStripeStatus(subscription.status);
  const tier = mapPriceIdToTier(priceId);
  // Stripe v22: current_period_* lives on SubscriptionItem, not Subscription
  const item = subscription.items.data[0];
  const now = item ? new Date(item.current_period_start * 1000) : new Date();
  const end = item ? new Date(item.current_period_end * 1000) : new Date();
  const cancelAt = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000)
    : null;

  await upsertSubscription(
    pool, userId, subscription.id, priceId,
    status, tier, now, end, cancelAt,
    subscription.cancel_at_period_end ?? false
  );

  const auditAction =
    status === 'canceled' ? 'subscription_canceled' : 'subscription_updated';

  await insertAuditLog(pool, userId, auditAction, {
    event: 'customer.subscription.updated',
    stripeSubscriptionId: subscription.id,
    status,
    tier,
  });

  await refreshUserSubscriptionFields(pool, userId);

  console.log(`[Webhook] customer.subscription.updated — sub ${subscription.id} for user ${userId}`);
}

async function handleSubscriptionDeleted(
  pool: Pool,
  subscription: Stripe.Subscription
): Promise<void> {
  const stripeCustomerId = subscription.customer as string;
  const userId = await getUserIdByStripeCustomerId(pool, stripeCustomerId);

  if (!userId) {
    console.warn('[Webhook] customer.subscription.deleted: no user found for customer', {
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
    });
    return;
  }

  // Mark subscription as canceled
  await pool.query(
    `UPDATE subscriptions SET status = 'canceled', updated_at = NOW()
     WHERE stripe_subscription_id = $1`,
    [subscription.id]
  );

  await insertAuditLog(pool, userId, 'subscription_canceled', {
    event: 'customer.subscription.deleted',
    stripeSubscriptionId: subscription.id,
  });

  await refreshUserSubscriptionFields(pool, userId);

  console.log(`[Webhook] customer.subscription.deleted — sub ${subscription.id} for user ${userId}`);
}

async function handleInvoicePaymentSucceeded(
  pool: Pool,
  invoice: Stripe.Invoice
): Promise<void> {
  const stripeCustomerId = invoice.customer as string;
  // Stripe v22: subscription ID is at invoice.parent.subscription_details.subscription
  const subscriptionId = invoice.parent?.subscription_details?.subscription as string | undefined;

  if (!subscriptionId) return;

  const userId = await getUserIdByStripeCustomerId(pool, stripeCustomerId);

  await pool.query(
    `UPDATE subscriptions SET status = 'active', updated_at = NOW()
     WHERE stripe_subscription_id = $1`,
    [subscriptionId]
  );

  if (userId) {
    await insertAuditLog(pool, userId, 'subscription_updated', {
      event: 'invoice.payment_succeeded',
      stripeSubscriptionId: subscriptionId,
      invoiceId: invoice.id,
      status: 'active',
    });

    await refreshUserSubscriptionFields(pool, userId);
  }

  console.log(`[Webhook] invoice.payment_succeeded — sub ${subscriptionId}`);
}

async function handleInvoicePaymentFailed(
  pool: Pool,
  invoice: Stripe.Invoice
): Promise<void> {
  const stripeCustomerId = invoice.customer as string;
  // Stripe v22: subscription ID is at invoice.parent.subscription_details.subscription
  const subscriptionId = invoice.parent?.subscription_details?.subscription as string | undefined;

  if (!subscriptionId) return;

  const userId = await getUserIdByStripeCustomerId(pool, stripeCustomerId);

  await pool.query(
    `UPDATE subscriptions SET status = 'past_due', updated_at = NOW()
     WHERE stripe_subscription_id = $1`,
    [subscriptionId]
  );

  if (userId) {
    await insertAuditLog(pool, userId, 'subscription_updated', {
      event: 'invoice.payment_failed',
      stripeSubscriptionId: subscriptionId,
      invoiceId: invoice.id,
      status: 'past_due',
    });

    await refreshUserSubscriptionFields(pool, userId);
  }

  console.log(`[Webhook] invoice.payment_failed — sub ${subscriptionId}`);
}

// ─── Route Handler ──────────────────────────────────────────────────────────────

export const runtime = 'nodejs';

// Must use dynamic export to prevent Next.js from caching route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Webhook] Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    );
  }

  // ── Read raw body as text (required for Stripe signature verification) ──
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // ── Process event with DB pool ─────────────────────────────────────────────
  const pool = getPool();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(pool, session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(pool, subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(pool, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(pool, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(pool, invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(pool, invoice);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // Return 200 quickly — Stripe will retry on non-2xx
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Webhook] Processing error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
