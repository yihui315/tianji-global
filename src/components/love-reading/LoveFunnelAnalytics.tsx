'use client';

import { useEffect } from 'react';
import type { BillingProductId } from '@/lib/billing';
import { trackClientEvent } from '@/lib/analytics/client';

export function LoveFunnelAnalytics({
  event,
  sessionId,
  productId,
  checkoutStatus,
}: {
  event: 'love_result_view';
  sessionId: string;
  productId: BillingProductId;
  checkoutStatus?: string;
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
  }, [checkoutStatus, event, productId, sessionId]);

  return null;
}
