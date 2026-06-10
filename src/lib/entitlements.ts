import { getPool } from '@/lib/db';

export type EntitlementProduct =
  | 'solo_love_report'
  | 'compatibility_report'
  | 'monthly_pass'
  | 'deep_love_report';

interface GrantEntitlementInput {
  userId?: string | null;
  customerEmail?: string | null;
  productId: string;
  stripeSubscriptionId?: string | null;
  expiresAt?: Date;
}

export async function grantEntitlement(input: GrantEntitlementInput) {
  if (!process.env.DATABASE_URL) {
    console.log('[entitlements] DB not configured, skipping grant', input.productId);
    return;
  }

  const { userId, customerEmail, productId, stripeSubscriptionId, expiresAt } = input;

  try {
    await getPool().query(
      `
      INSERT INTO entitlements (user_id, customer_email, entitlement, product_id, is_active, stripe_subscription_id, expires_at)
      VALUES ($1, $2, $3, $4, true, $5, $6)
      ON CONFLICT (user_id, product_id, is_active) WHERE is_active = true
      DO UPDATE SET is_active = true, stripe_subscription_id = COALESCE($5, entitlements.stripe_subscription_id), expires_at = $6, updated_at = NOW()
    `,
      [userId ?? null, customerEmail ?? null, productId, productId, stripeSubscriptionId ?? null, expiresAt ?? null]
    );
    console.log('[entitlements] granted:', productId, 'to user:', userId ?? customerEmail);
  } catch (error) {
    console.error('[entitlements] grant failed:', error);
  }
}

interface RevokeEntitlementInput {
  userId?: string | null;
  stripeSubscriptionId?: string | null;
  productId?: string;
}

export async function revokeEntitlement(input: RevokeEntitlementInput) {
  if (!process.env.DATABASE_URL) {
    console.log('[entitlements] DB not configured, skipping revoke');
    return;
  }

  const { userId, stripeSubscriptionId, productId } = input;

  try {
    if (stripeSubscriptionId) {
      await getPool().query(
        `UPDATE entitlements SET is_active = false, updated_at = NOW() WHERE stripe_subscription_id = $1 AND is_active = true`,
        [stripeSubscriptionId]
      );
    }
    if (userId && productId) {
      await getPool().query(
        `UPDATE entitlements SET is_active = false, updated_at = NOW() WHERE user_id = $1 AND product_id = $2 AND is_active = true`,
        [userId, productId]
      );
    }
    console.log('[entitlements] revoked:', productId ?? stripeSubscriptionId);
  } catch (error) {
    console.error('[entitlements] revoke failed:', error);
  }
}