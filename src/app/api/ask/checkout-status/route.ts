/**
 * GET /api/ask/checkout-status
 * Returns whether Stripe checkout is available for Love Test paid intents.
 */
import { NextRequest, NextResponse } from 'next/server';
import { isLoveTestPaidIntent } from '@/lib/love-test';
import { isStagingDegradedMode, isStripePaymentAvailable } from '@/lib/staging-degraded-mode';

export const dynamic = 'force-dynamic';

function getCheckoutGateStatus(intent?: string | null) {
  if (isStagingDegradedMode() && !isStripePaymentAvailable()) {
    return { available: false, code: 'payment_unavailable', message: 'Payment temporarily unavailable' };
  }
  if (!intent || !isLoveTestPaidIntent(intent)) {
    return { available: true, code: 'ok', message: 'Checkout available' };
  }
  const testModeReady = process.env.LOVE_TEST_PAID_INTENT_TEST_MODE_READY === 'true';
  const paidSmokeApproved = process.env.LOVE_TEST_PAID_SMOKE_APPROVED === 'true';
  if (!testModeReady) {
    return { available: false, code: 'test_mode_not_ready', message: 'Checkout not yet enabled' };
  }
  if (!paidSmokeApproved) {
    return { available: false, code: 'approval_required', message: 'Test-mode checkout approved' };
  }
  return { available: true, code: 'go', message: 'Checkout ready' };
}

export async function GET(request: NextRequest) {
  const intent = request.nextUrl.searchParams.get('intent');
  const gate = getCheckoutGateStatus(intent);
  return NextResponse.json(gate, { status: gate.available ? 200 : 403 });
}
