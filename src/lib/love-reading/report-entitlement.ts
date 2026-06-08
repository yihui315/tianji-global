export type LoveReportEntitlementInput = {
  hasEntitlement?: boolean;
  productId?: string | null;
};

const LOVE_REPORT_PRODUCT_IDS = new Set([
  'solo_love_report',
  'compatibility_report',
  'love_premium_report',
]);

export function canViewPremiumLoveReport(input: LoveReportEntitlementInput) {
  if (!input.hasEntitlement) {
    return false;
  }

  if (!input.productId) {
    return true;
  }

  return LOVE_REPORT_PRODUCT_IDS.has(input.productId);
}
