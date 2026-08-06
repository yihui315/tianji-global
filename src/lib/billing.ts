import type Stripe from 'stripe';
import { getPool } from '@/lib/db';
import {
  LOVE_PREMIUM_REPORT_CHECKOUT_READINESS_ERROR,
  LOVE_PREMIUM_REPORT_LEGACY_PRODUCT_TYPES,
  LOVE_PREMIUM_REPORT_PRICE,
  LOVE_PREMIUM_REPORT_PRODUCT_TYPE,
  STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID_ENV,
  ASK_UNLOCK_PRODUCT_TYPE,
  DRAW_UNLOCK_PRODUCT_TYPE,
  getLovePremiumReportStripePriceId,
  normalizeLoveProductType,
  normalizeOneTimeProductType,
  type LovePremiumReportProductType,
  type AskUnlockProductType,
  type DrawUnlockProductType,
} from '@/lib/love-reading/revenue-contract';

export type LegacyLoveReportProductId =
  (typeof LOVE_PREMIUM_REPORT_LEGACY_PRODUCT_TYPES)[number];

export type OneTimeProductId = AskUnlockProductType | DrawUnlockProductType;

export type BillingProductId =
  | LovePremiumReportProductType
  | LegacyLoveReportProductId
  | OneTimeProductId;

export type PremiumReportBillingProduct = {
  productId: LovePremiumReportProductType;
  kind: 'premium_report';
  legacyProductIds: readonly LegacyLoveReportProductId[];
  name: string;
  description: string;
  unitAmount: number;
  currency: string;
  mode: 'payment';
  entitlement: LovePremiumReportProductType;
  stripePriceIdEnv: typeof STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID_ENV;
};

export type OneTimeUnlockBillingProduct = {
  productId: OneTimeProductId;
  kind: 'one_time_unlock';
  name: string;
  nameZh: string;
  description: string;
  unitAmount: number;
  currency: string;
  mode: 'payment';
  entitlement: OneTimeProductId;
};

export type BillingProduct = PremiumReportBillingProduct | OneTimeUnlockBillingProduct;

export const BILLING_PRODUCTS = {
  [LOVE_PREMIUM_REPORT_PRODUCT_TYPE]: {
    productId: LOVE_PREMIUM_REPORT_PRODUCT_TYPE,
    kind: 'premium_report',
    legacyProductIds: LOVE_PREMIUM_REPORT_LEGACY_PRODUCT_TYPES,
    name: 'TianJi Love Premium Relationship Report',
    description: 'A private premium relationship report.',
    unitAmount: LOVE_PREMIUM_REPORT_PRICE.amountMinor,
    currency: LOVE_PREMIUM_REPORT_PRICE.currency,
    mode: 'payment',
    entitlement: LOVE_PREMIUM_REPORT_PRODUCT_TYPE,
    stripePriceIdEnv: STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID_ENV,
  },
  [ASK_UNLOCK_PRODUCT_TYPE]: {
    productId: ASK_UNLOCK_PRODUCT_TYPE,
    kind: 'one_time_unlock',
    name: 'Ask One Question Unlock',
    nameZh: 'Ask 单次解锁',
    description: 'Unlock deeper AI interpretation for a single Ask reading.',
    unitAmount: 199, // $1.99 USD
    currency: 'usd',
    mode: 'payment',
    entitlement: ASK_UNLOCK_PRODUCT_TYPE,
  },
  [DRAW_UNLOCK_PRODUCT_TYPE]: {
    productId: DRAW_UNLOCK_PRODUCT_TYPE,
    kind: 'one_time_unlock',
    name: 'Draw Timing Reading Unlock',
    nameZh: '时机抽牌完整解读',
    description: 'Unlock the full interpretation for a Draw Timing reading.',
    unitAmount: 299, // $2.99 USD
    currency: 'usd',
    mode: 'payment',
    entitlement: DRAW_UNLOCK_PRODUCT_TYPE,
  },
} as const satisfies Partial<Record<BillingProductId, BillingProduct>>;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function optionalUuid(value?: string | null) {
  return value && uuidPattern.test(value) ? value : null;
}

export function getBillingProduct(productId: string | null | undefined): BillingProduct | null {
  const normalized = normalizeLoveProductType(productId);
  if (normalized) return BILLING_PRODUCTS[normalized];

  const normalizedOneTime = normalizeOneTimeProductType(productId);
  if (normalizedOneTime) return BILLING_PRODUCTS[normalizedOneTime];

  return null;
}

export function getLovePremiumReportCheckoutPriceId(
  env: Record<string, string | undefined> = process.env
): string | null {
  return getLovePremiumReportStripePriceId(env);
}

export function getCheckoutPriceIdReadiness(
  product: BillingProduct,
  env: Record<string, string | undefined> = process.env
):
  | { ready: true; priceId: string | null }
  | {
      ready: false;
      code: typeof LOVE_PREMIUM_REPORT_CHECKOUT_READINESS_ERROR;
      error: string;
    } {
  if (product.kind === 'one_time_unlock') {
    // One-time unlocks use inline price_data, no Stripe Price ID needed
    return { ready: true, priceId: null };
  }

  const priceId = env[product.stripePriceIdEnv]?.trim() || null;
  if (priceId) return { ready: true, priceId };

  return {
    ready: false,
    code: LOVE_PREMIUM_REPORT_CHECKOUT_READINESS_ERROR,
    error: 'Love premium report checkout is not configured',
  };
}

export function buildLineItem(product: BillingProduct, stripePriceId?: string | null) {
  if (stripePriceId) {
    return {
      price: stripePriceId,
      quantity: 1,
    };
  }

  // One-time unlocks always use inline price_data
  if (product.kind === 'one_time_unlock') {
    return {
      price_data: {
        currency: product.currency,
        unit_amount: product.unitAmount,
        product_data: {
          name: product.name,
          description: product.description ?? '',
        },
      },
      quantity: 1,
    };
  }

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

function entitlementCandidates(entitlement: string): string[] {
  const normalized = normalizeLoveProductType(entitlement);
  if (!normalized) return [entitlement];

  return [normalized, ...LOVE_PREMIUM_REPORT_LEGACY_PRODUCT_TYPES];
}

export async function createPendingOrder(input: {
  product: BillingProduct;
  checkoutSessionId: string;
  userId?: string | null;
  readingSessionId?: string | null;
  resourceRef?: string | null;
  customerEmail?: string | null;
}) {
  if (!process.env.DATABASE_URL) return false;

  await getPool().query(
    `
      insert into orders (
        user_id,
        reading_session_id,
        resource_ref,
        stripe_checkout_session_id,
        customer_email,
        product_id,
        amount_total,
        currency,
        status,
        entitlement
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
      on conflict (stripe_checkout_session_id) do nothing
    `,
    [
      optionalUuid(input.userId),
      optionalUuid(input.readingSessionId),
      input.resourceRef ?? null,
      input.checkoutSessionId,
      input.customerEmail ?? null,
      input.product.productId,
      input.product.unitAmount,
      input.product.currency,
      input.product.entitlement,
    ]
  );

  return true;
}

export function isBillingPersistenceConfigured(
  env: Record<string, string | undefined> = process.env
): boolean {
  return Boolean(env.DATABASE_URL?.trim());
}

export async function claimStripeEvent(event: import('@/types/stripe-api').StripeEvent): Promise<boolean> {
  if (!process.env.DATABASE_URL) return true;

  const result = await getPool().query(
    `
      insert into stripe_events (
        stripe_event_id,
        event_type,
        payload,
        processing_started_at,
        processed_at
      )
      values ($1, $2, $3, now(), null)
      on conflict (stripe_event_id) do update
      set processing_started_at = now(),
          payload = excluded.payload
      where stripe_events.processed_at is null
        and (
          stripe_events.processing_started_at is null
          or stripe_events.processing_started_at < now() - interval '5 minutes'
        )
      returning id
    `,
    [event.id, event.type, JSON.stringify(event)]
  );

  return result.rowCount === 1;
}

export async function markStripeEventProcessed(stripeEventId: string) {
  if (!process.env.DATABASE_URL) return;

  await getPool().query(
    `
      update stripe_events
      set processed_at = now(),
          processing_started_at = null
      where stripe_event_id = $1
    `,
    [stripeEventId]
  );
}

export async function markStripeEventFailed(stripeEventId: string) {
  if (!process.env.DATABASE_URL) return;

  await getPool().query(
    `
      update stripe_events
      set processing_started_at = null
      where stripe_event_id = $1
        and processed_at is null
    `,
    [stripeEventId]
  );
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
  if (getBillingProduct(input.productId)) {
    await markOrderPaid({ checkoutSessionId: input.checkoutSessionId });
  }
}

export async function hasEntitlement(input: {
  userId?: string | null;
  readingSessionId?: string | null;
  entitlement: string;
}): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  const entitlements = entitlementCandidates(input.entitlement);

  const result = await getPool().query(
    `
      select exists (
        select 1 from orders
        where status = 'paid'
          and entitlement = any($1::text[])
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
    [entitlements, input.readingSessionId ?? '', input.userId ?? '']
  );

  return Boolean(result.rows[0]?.entitled);
}

export async function getPaidOrderForCheckoutSession(checkoutSessionId: string): Promise<{
  readingSessionId: string | null;
  resourceRef: string | null;
  customerEmail: string | null;
  productId: BillingProductId;
} | null> {
  if (!process.env.DATABASE_URL) return null;

  const result = await getPool().query(
    `
      select reading_session_id, resource_ref, customer_email, product_id
      from orders
      where stripe_checkout_session_id = $1
        and status = 'paid'
      limit 1
    `,
    [checkoutSessionId]
  );

  const row = result.rows[0];
  const product = getBillingProduct(row?.product_id);
  if (!row || !product) return null;

  return {
    readingSessionId: row.reading_session_id ? String(row.reading_session_id) : null,
    resourceRef: row.resource_ref ? String(row.resource_ref) : null,
    customerEmail: row.customer_email ?? null,
    productId: product.productId,
  };
}
