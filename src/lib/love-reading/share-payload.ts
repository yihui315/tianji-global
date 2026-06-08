import { sanitizePublicSharePayload } from './privacy-mask';
import type { LoveReport } from './report-schema';

export function buildLoveReportSharePayload(report: LoveReport, extra: Record<string, unknown> = {}) {
  return sanitizePublicSharePayload({
    title: report.privacySafeShareSummary.title,
    summary: report.privacySafeShareSummary.summary,
    scoreBand: report.privacySafeShareSummary.scoreBand,
    cta: report.privacySafeShareSummary.cta,
    archetypeTitle: report.relationshipArchetype.title,
    ...extra,
  });
}
