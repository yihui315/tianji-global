import { canViewPremiumLoveReport, type LoveReportEntitlementInput } from './report-entitlement';
import { PREMIUM_SECTION_KEYS, premiumTitle } from './premium-report-template';
import { assertLoveReportQuality } from './report-quality-check';
import type { LoveReport, PremiumReportSection } from './report-schema';

function sectionBody(report: LoveReport, key: PremiumReportSection['key']) {
  switch (key) {
    case 'relationship_summary':
      return `${report.headline} ${report.oneLiner}`;
    case 'archetype_detail':
      return report.relationshipArchetype.summary;
    case 'five_dimensions':
      return report.dimensions.map((dimension) => `${dimension.label}: ${dimension.insight}`).join(' ');
    case 'timing_window':
      return `${report.currentWindow.summary} ${report.currentWindow.recommendedAction}`;
    case 'communication_repair':
      return 'Use a simple repair loop: name the feeling, name the need, ask for one small behavior, then pause for the other person to respond.';
    case 'next_7_days':
      return report.next7Days.join(' ');
    case 'next_30_days':
      return report.next30Days.length
        ? report.next30Days.join(' ')
        : 'Use the next 30 days to observe consistency, repair speed, and whether both people can talk without pressure.';
    case 'strengths':
      return report.strengths.join(' ');
    case 'friction_points':
      return report.frictionPoints.join(' ');
    case 'next_best_action':
      return report.currentWindow.recommendedAction;
    case 'closing_summary':
      return 'Treat this report as a structured mirror for relationship decisions, not a fixed prediction.';
  }
}

export function generatePremiumLoveReport(
  baseReport: LoveReport,
  entitlement: LoveReportEntitlementInput
): LoveReport {
  if (!canViewPremiumLoveReport(entitlement)) {
    return {
      ...baseReport,
      visibility: 'free',
      premiumSections: [],
    };
  }

  const premiumReport: LoveReport = {
    ...baseReport,
    visibility: 'premium',
    next30Days: baseReport.next30Days.length
      ? baseReport.next30Days
      : [
          'Observe whether communication stays kind under pressure.',
          'Choose one shared ritual that can be repeated weekly.',
          'Avoid major promises until small consistency is proven.',
        ],
    premiumSections: PREMIUM_SECTION_KEYS.map((key) => ({
      key,
      title: premiumTitle(baseReport.locale, key),
      body: sectionBody(baseReport, key),
      visibility: 'premium',
    })),
  };

  assertLoveReportQuality(premiumReport);
  return premiumReport;
}
