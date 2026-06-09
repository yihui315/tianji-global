import { NextResponse } from 'next/server';

import { BILLING_PRODUCTS } from '@/lib/billing';

export const PAY_PER_USE_DISABLED_ERROR = 'Paid unlock is disabled';

export function isPayPerUseEnabled(): boolean {
  return process.env.ENABLE_PAY_PER_USE === 'true';
}

export function requirePayPerUseEnabled() {
  if (isPayPerUseEnabled()) return null;

  return NextResponse.json(
    { error: PAY_PER_USE_DISABLED_ERROR },
    { status: 403 }
  );
}

/**
 * Returns true if a product is enabled for pay-per-use checkout.
 * Only solo_love_question, solo_love_report, and compatibility_report are supported
 * when ENABLE_PAY_PER_USE is true.
 */
export function isProductEnabled(productId: string): boolean {
  if (!isPayPerUseEnabled()) return false;
  const validProducts = ['solo_love_question', 'solo_love_report', 'compatibility_report'];
  return validProducts.includes(productId) && productId in BILLING_PRODUCTS;
}
