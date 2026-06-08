import { isUuidReadingId } from '@/lib/reading-id';
import type { BillingProductId } from '@/lib/billing';

export type CheckoutMetadataSource = 'love_reading' | 'relationship';

export type ValidCheckoutMetadata = {
  productId: BillingProductId;
  source: CheckoutMetadataSource;
  readingSessionId: string;
  relationshipReadingId: string | null;
  locale: 'en' | 'zh-CN';
  userId: string | null;
};

export type CheckoutMetadataValidation =
  | { ok: true; metadata: ValidCheckoutMetadata }
  | {
      ok: false;
      reason:
        | 'missing_product_id'
        | 'invalid_product_id'
        | 'missing_source'
        | 'invalid_source'
        | 'missing_reading_session_id'
        | 'unsafe_reading_session_id'
        | 'invalid_relationship_product'
        | 'missing_relationship_reading_id'
        | 'unsafe_relationship_reading_id';
    };

function isBillingProductId(value: unknown): value is BillingProductId {
  return value === 'solo_love_report' || value === 'compatibility_report';
}

function normalizeSource(value: unknown): CheckoutMetadataSource | null {
  if (value === 'love_reading' || value === 'relationship') return value;
  return null;
}

function normalizeLocale(value: unknown): 'en' | 'zh-CN' {
  return value === 'zh-CN' ? 'zh-CN' : 'en';
}

export function validateCheckoutSessionMetadata(
  metadata: Record<string, string> | null | undefined,
): CheckoutMetadataValidation {
  const productId = metadata?.productId;
  if (!productId) return { ok: false, reason: 'missing_product_id' };
  if (!isBillingProductId(productId)) return { ok: false, reason: 'invalid_product_id' };

  if (!metadata?.source) return { ok: false, reason: 'missing_source' };
  const source = normalizeSource(metadata.source);
  if (!source) return { ok: false, reason: 'invalid_source' };

  const readingSessionId = metadata.readingSessionId;
  if (!readingSessionId) return { ok: false, reason: 'missing_reading_session_id' };
  if (!isUuidReadingId(readingSessionId)) {
    return { ok: false, reason: 'unsafe_reading_session_id' };
  }

  let relationshipReadingId: string | null = null;
  if (source === 'relationship') {
    if (productId !== 'compatibility_report') {
      return { ok: false, reason: 'invalid_relationship_product' };
    }

    relationshipReadingId = metadata.relationshipReadingId || readingSessionId;
    if (!relationshipReadingId) {
      return { ok: false, reason: 'missing_relationship_reading_id' };
    }
    if (!isUuidReadingId(relationshipReadingId)) {
      return { ok: false, reason: 'unsafe_relationship_reading_id' };
    }
  }

  if (source === 'love_reading' && productId !== 'solo_love_report') {
    return { ok: false, reason: 'invalid_relationship_product' };
  }

  return {
    ok: true,
    metadata: {
      productId,
      source,
      readingSessionId,
      relationshipReadingId,
      locale: normalizeLocale(metadata.locale),
      userId: metadata.userId || null,
    },
  };
}
