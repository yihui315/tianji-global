'use client';

import { useEffect } from 'react';
import type { BillingProductId } from '@/lib/billing';
import { trackClientEvent } from '@/lib/analytics/client';

export function LoveFunnelAnalytics({
  event,
  sessionId,
  productId,
  checkoutStatus,
  isPaid,
}: {
  event: 'love_result_view';
  sessionId: string;
  productId: BillingProductId;
  checkoutStatus?: string;
  isPaid?: boolean;
}) {
  useEffect(() => {
    void trackClientEvent({
      event,
      experimentId: 'love-v1',
      moduleType: 'love-reading',
      payload: {
        sessionId,
        productId,
        checkoutStatus: checkoutStatus ?? null,
      },
    });

    if (checkoutStatus === 'success') {
      void trackClientEvent({
        event: 'love_checkout_success',
        experimentId: 'love-v1',
        moduleType: 'love-reading',
        payload: { sessionId, productId },
      });
    }
    if (checkoutStatus === 'cancelled') {
      void trackClientEvent({
        event: 'checkout_cancel',
        experimentId: 'love-v1',
        moduleType: 'love-reading',
        payload: { sessionId, productId },
      });
    }
    if (isPaid) {
      void trackClientEvent({
        event: 'premium_report_view',
        experimentId: 'love-v1',
        moduleType: 'love-reading',
        payload: { sessionId, productId },
      });
    }
  }, [checkoutStatus, event, isPaid, productId, sessionId]);

  return null;
}
