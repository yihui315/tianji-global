import { isLovePremiumReportProduct } from './revenue-contract';

export type LoveReportEntitlementInput = {
  hasEntitlement: boolean;
  productId?: 'solo_love_report' | 'compatibility_report' | string;
};

export function canViewPremiumLoveReport(input: LoveReportEntitlementInput) {
  return Boolean(
    input.hasEntitlement &&
      isLovePremiumReportProduct(input.productId)
  );
}
