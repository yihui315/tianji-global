import {
  LOVE_DIMENSION_KEYS,
  LOVE_REPORT_LOCALES,
  type LoveDimensionKey,
  type LoveReport,
  type LoveReportQualityIssue,
} from './report-schema';
import {
  containsFearBasedCTA,
  containsForbiddenRelationshipClaim,
  containsPrivateBirthLeak,
} from './privacy-mask';

function issue(code: LoveReportQualityIssue['code'], message: string, path?: string): LoveReportQualityIssue {
  return { code, message, path };
}

export function checkLoveReportQuality(report: Partial<LoveReport>): LoveReportQualityIssue[] {
  const issues: LoveReportQualityIssue[] = [];

  if (!report.headline?.trim()) {
    issues.push(issue('missing_headline', 'Love report is missing a headline.', 'headline'));
  }

  if (!report.locale || !(LOVE_REPORT_LOCALES as readonly string[]).includes(report.locale)) {
    issues.push(issue('missing_locale', 'Love report locale is missing or unsupported.', 'locale'));
  }

  if (!report.privacySafeShareSummary) {
    issues.push(
      issue('missing_share_summary', 'Love report must include a privacy-safe share summary.', 'privacySafeShareSummary')
    );
  }

  const dimensions = report.dimensions ?? [];
  const dimensionKeys = new Set(dimensions.map((dimension) => dimension.key));
  const hasAllDimensions = LOVE_DIMENSION_KEYS.every((key) => dimensionKeys.has(key));
  if (!hasAllDimensions || dimensions.length !== LOVE_DIMENSION_KEYS.length) {
    issues.push(
      issue(
        'missing_dimensions',
        `Love report must include exactly these dimensions: ${LOVE_DIMENSION_KEYS.join(', ')}.`,
        'dimensions'
      )
    );
  }

  for (const dimension of dimensions) {
    if (!Number.isFinite(dimension.score) || dimension.score < 0 || dimension.score > 100) {
      issues.push(
        issue('invalid_score', `Dimension ${dimension.key} score must be from 0 to 100.`, `dimensions.${dimension.key}`)
      );
    }
  }

  if (
    report.overallScore !== undefined &&
    (!Number.isFinite(report.overallScore) || report.overallScore < 0 || report.overallScore > 100)
  ) {
    issues.push(issue('invalid_score', 'Overall score must be from 0 to 100.', 'overallScore'));
  }

  if (containsForbiddenRelationshipClaim(report)) {
    issues.push(issue('forbidden_absolute_claim', 'Report contains an absolute or deterministic relationship claim.'));
  }

  if (containsFearBasedCTA(report.premiumTeaser ?? '') || containsFearBasedCTA(report.privacySafeShareSummary?.cta ?? '')) {
    issues.push(issue('fear_based_cta', 'Report contains a fear-based monetization CTA.'));
  }

  const publicSurface = {
    visibility: report.visibility,
    headline: report.headline,
    oneLiner: report.oneLiner,
    currentWindow: report.currentWindow,
    privacySafeShareSummary: report.privacySafeShareSummary,
  };
  if (containsPrivateBirthLeak(publicSurface)) {
    issues.push(issue('private_field_leak', 'Public/free report surface contains private birth, payment, or raw fields.'));
  }

  if ((report.visibility === 'free' || report.visibility === 'public') && report.premiumSections?.length) {
    issues.push(issue('premium_content_leak', 'Free or public report exposes premium-only sections.', 'premiumSections'));
  }

  return issues;
}

export function assertLoveReportQuality(report: Partial<LoveReport>): asserts report is LoveReport {
  const issues = checkLoveReportQuality(report);
  if (issues.length) {
    throw new Error(`Love report quality failed: ${issues.map((item) => item.code).join(', ')}`);
  }
}

export function hasAllLoveDimensions(keys: LoveDimensionKey[]) {
  const keySet = new Set(keys);
  return LOVE_DIMENSION_KEYS.every((key) => keySet.has(key)) && keySet.size === LOVE_DIMENSION_KEYS.length;
}
