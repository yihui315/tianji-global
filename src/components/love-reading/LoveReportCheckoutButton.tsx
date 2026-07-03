'use client';

import { useState } from 'react';
import { trackClientEvent } from '@/lib/analytics/client';
import type { BillingProductId } from '@/lib/billing';
import type { Locale } from '@/lib/i18n';

export function LoveReportCheckoutButton({
  sessionId,
  locale,
  productId,
}: {
  sessionId: string;
  locale: Locale;
  productId: BillingProductId;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setIsLoading(true);
    setError(null);
    const amountMap: Record<BillingProductId, number> = {
      solo_love_report: 4.99,
      compatibility_report: 12.99,
      deep_love_report: 29.99,
      love_monthly: 9.99,
      love_yearly: 79.99,
      gift_report: 9.99,
    };
    void trackClientEvent({
      event: 'stripe_checkout_start',
      experimentId: 'love-v1',
      moduleType: 'stripe',
      payload: {
        product_type: (productId === 'compatibility_report' ? 'compatibility' : 'solo_report') as
          | 'solo_report'
          | 'compatibility',
        amount_usd: amountMap[productId] ?? 4.99,
        currency: 'usd',
        mode: 'payment',
      },
    });

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          readingSessionId: sessionId,
          locale,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success || !payload?.data?.url) {
        throw new Error('Checkout is unavailable');
      }

      void trackClientEvent({
        event: 'love_checkout_created',
        experimentId: 'love-v1',
        moduleType: 'love-reading',
        payload: {
          sessionId,
          productId,
          checkoutSessionId: payload.data.checkoutSessionId ?? null,
        },
      });
      window.location.assign(payload.data.url);
    } catch {
      setError('Checkout is unavailable right now. Please try again in a moment.');
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isLoading}
        className="inline-flex rounded-full bg-[rgb(212,175,119)] px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? 'Opening checkout...' : 'Unlock complete relationship report'}
      </button>
      <p className="max-w-md text-xs leading-5 text-white/48">
        One-time premium report. Checkout opens only when the payment gate is configured.
      </p>
      {error && <p className="text-sm text-rose-100">{error}</p>}
    </div>
  );
}
