'use client';

import { useState } from 'react';
import { trackCheckoutStartFromFreePreview } from '@/lib/analytics/divination';
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
    void trackClientEvent({
      event: 'love_unlock_click',
      experimentId: 'love-v1',
      moduleType: 'love-reading',
      payload: { sessionId, productId, locale },
    });
    void trackCheckoutStartFromFreePreview({
      route: 'relationship',
      confidence: 'medium',
      sourceTypes: ['relationship', 'timing', 'safety'],
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
        {isLoading ? 'Opening checkout...' : 'Unlock full report'}
      </button>
      {error && <p className="text-sm text-rose-100">{error}</p>}
    </div>
  );
}
