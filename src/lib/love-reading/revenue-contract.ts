export const LOVE_PREMIUM_REPORT_PRODUCT_TYPE = 'love_premium_report';

export const LOVE_PREMIUM_REPORT_PRICE = {
  currency: 'cny',
  amountMinor: 1990,
  display: '¥19.9',
} as const;

export const LOVE_PREMIUM_REPORT_LEGACY_PRODUCT_TYPES = [
  'solo_love_report',
  'compatibility_report',
] as const;

export type LovePremiumReportProductType = typeof LOVE_PREMIUM_REPORT_PRODUCT_TYPE;

export const STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID_ENV =
  'STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID';

export const LOVE_PREMIUM_REPORT_CHECKOUT_READINESS_ERROR =
  'love_premium_report_price_id_missing';

const lovePremiumReportProductTypes = new Set<string>([
  LOVE_PREMIUM_REPORT_PRODUCT_TYPE,
  ...LOVE_PREMIUM_REPORT_LEGACY_PRODUCT_TYPES,
]);

export function normalizeLoveProductType(
  input: string | null | undefined
): LovePremiumReportProductType | null {
  const productType = input?.trim();
  if (!productType || !lovePremiumReportProductTypes.has(productType)) {
    return null;
  }

  return LOVE_PREMIUM_REPORT_PRODUCT_TYPE;
}

export function isLovePremiumReportProduct(input: string | null | undefined): boolean {
  return normalizeLoveProductType(input) !== null;
}

export function getLovePremiumReportStripePriceId(
  env: Record<string, string | undefined> = process.env
): string | null {
  return env[STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID_ENV]?.trim() || null;
}
