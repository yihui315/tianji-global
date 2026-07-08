/**
 * CJ Affiliate (Commission Junction) conversion tracking utilities.
 *
 * CJ Affiliate uses post-back URLs (also called "conversion pixels") that fire
 * when an affiliate conversion is confirmed. The post-back can be:
 *   1. A 1x1 pixel image tag (client-side, fires automatically)
 *   2. A server-to-server post-back URL (more reliable, fires on our backend)
 *
 * CJ conversion post-back format:
 *   https://www.emjcd.com/tags/c?containerTagId={CID}&ORDER_ID={order}&amount={total}&currency={currency}
 *
 * Setup required:
 *   1. Join CJ Affiliate: https://www.cj.com/affiliate
 *   2. Find your Advertiser CID (container tag ID) in CJ dashboard
 *   3. Set NEXT_PUBLIC_CJ_CONTAINER_TAG_ID in env
 *   4. For ShareASale (alternative): set NEXT_PUBLIC_SSAS_AFFILIATE_ID
 *
 * Chinese-content alternatives:
 *   - ShareASale: https://www.shareasale.com — has Chinese-language merchants
 *   - CJ Affiliate: primarily English-language advertisers
 */

export interface CJConversionPayload {
  orderId: string;
  amountUsd: number;
  currency?: string;
  advertiserName?: string;
}

function getCJContainerTagId(): string | null {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_CJ_CONTAINER_TAG_ID ?? null;
  }
  return process.env.CJ_CONTAINER_TAG_ID ?? null;
}

/**
 * Build a CJ Affiliate post-back URL for server-side firing.
 * Returns null if container tag ID is not configured.
 *
 * Usage (server-side):
 *   const url = buildCJPostbackUrl({ orderId: 'ORD-123', amountUsd: 12.99 });
 *   if (url) await fetch(url);
 */
export function buildCJPostbackUrl(payload: CJConversionPayload): string | null {
  const cid = getCJContainerTagId();
  if (!cid) return null;

  const params = new URLSearchParams({
    containerTagId: cid,
    ORDER_ID: payload.orderId,
    amount: payload.amountUsd.toFixed(2),
    currency: payload.currency ?? 'USD',
    ...(payload.advertiserName ? { advertiserName: payload.advertiserName } : {}),
  });

  return `https://www.emjcd.com/tags/c?${params.toString()}`;
}

/**
 * Fire a CJ Affiliate conversion pixel (client-side image tag approach).
 * Creates a hidden 1x1 img element that triggers the post-back.
 * The browser caches the response (200 OK with 1x1 transparent gif).
 *
 * Note: The 1x1 pixel approach is less reliable than server-to-server.
 * Prefer buildCJPostbackUrl() for server-side firing where possible.
 */
export function fireCJConversionPixel(payload: CJConversionPayload): void {
  const url = buildCJPostbackUrl(payload);
  if (!url) return;

  try {
    const img = new Image();
    img.style.display = 'none';
    img.src = url;
    img.alt = '';
    document.body?.appendChild(img);
    // Remove after a short delay to avoid DOM pollution
    setTimeout(() => img.remove(), 5000);
  } catch {
    // Silently fail — conversion tracking should never interrupt user experience
  }
}

// ─── ShareASale (alternative affiliate network) ───────────────────────────────

export interface ShareASaleConversionPayload {
  affiliateId: string;
  orderId: string;
  amountUsd: number;
  currency?: string;
}

function getShareASaleAffiliateId(): string | null {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SSAS_AFFILIATE_ID ?? null;
  }
  return process.env.SSAS_AFFILIATE_ID ?? null;
}

/**
 * Build a ShareASale pixel URL for server-side firing.
 * ShareASale uses: https://www.shareasale.com/i/55/{AFFILIATE_ID}/{ORDER_ID}/{AMOUNT}/{CURRENCY}
 */
export function buildShareASalePixelUrl(payload: ShareASaleConversionPayload): string | null {
  const affId = getShareASaleAffiliateId();
  if (!affId) return null;

  return (
    `https://www.shareasale.com/i/55/${affId}/${payload.orderId}/` +
    `${payload.amountUsd.toFixed(2)}/${payload.currency ?? 'USD'}`
  );
}
