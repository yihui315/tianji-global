import { trackClientEvent } from "@/lib/analytics/client";
import {
  sanitizeEvidenceForAnalytics,
  type DivinationEvidence,
  type DivinationEvidenceConfidence,
  type DivinationEvidenceSource,
  type DivinationRoute,
} from "@/lib/divination/evidence";

export type DivinationAnalyticsEvent =
  | "divination_evidence_viewed"
  | "divination_evidence_expand_clicked"
  | "divination_accuracy_feedback_submitted"
  | "paid_unlock_from_evidence_clicked"
  | "checkout_start_from_free_preview";

export type AccuracyFeedbackRating = "yes_very" | "somewhat" | "not_really";

export type DivinationAnalyticsPayload = {
  route: DivinationRoute;
  paid: boolean;
  confidence: DivinationEvidenceConfidence;
  evidenceSignalCount: number;
  sourceTypes: DivinationEvidenceSource[];
};

export type AccuracyFeedbackAnalyticsPayload = {
  route: DivinationRoute;
  paid: boolean;
  confidence: DivinationEvidenceConfidence;
  rating: AccuracyFeedbackRating;
};

export function buildDivinationAnalyticsPayload(input: {
  route: DivinationRoute;
  paid?: boolean;
  evidence: DivinationEvidence;
}): DivinationAnalyticsPayload {
  return {
    route: input.route,
    paid: Boolean(input.paid),
    ...sanitizeEvidenceForAnalytics(input.evidence),
  };
}

export function buildAccuracyFeedbackAnalyticsPayload(input: {
  route: DivinationRoute;
  paid?: boolean;
  confidence: DivinationEvidenceConfidence;
  rating: AccuracyFeedbackRating;
}): AccuracyFeedbackAnalyticsPayload {
  return {
    route: input.route,
    paid: Boolean(input.paid),
    confidence: input.confidence,
    rating: input.rating,
  };
}

export async function trackDivinationEvent(
  event: DivinationAnalyticsEvent,
  payload: DivinationAnalyticsPayload | AccuracyFeedbackAnalyticsPayload
) {
  await trackClientEvent({
    event,
    experimentId: "tianji-love-evidence-layer-20260525",
    moduleType: `divination-${payload.route}`,
    payload,
  });
}

export function trackDivinationEvidenceViewed(input: {
  route: DivinationRoute;
  paid?: boolean;
  evidence: DivinationEvidence;
}) {
  return trackDivinationEvent(
    "divination_evidence_viewed",
    buildDivinationAnalyticsPayload(input)
  );
}

export function trackDivinationEvidenceExpandClicked(input: {
  route: DivinationRoute;
  paid?: boolean;
  evidence: DivinationEvidence;
}) {
  return trackDivinationEvent(
    "divination_evidence_expand_clicked",
    buildDivinationAnalyticsPayload(input)
  );
}

export function trackPaidUnlockFromEvidenceClicked(input: {
  route: DivinationRoute;
  paid?: boolean;
  evidence: DivinationEvidence;
}) {
  return trackDivinationEvent(
    "paid_unlock_from_evidence_clicked",
    buildDivinationAnalyticsPayload(input)
  );
}

export function trackCheckoutStartFromFreePreview(input: {
  route: DivinationRoute;
  confidence: DivinationEvidenceConfidence;
  sourceTypes?: DivinationEvidenceSource[];
}) {
  return trackDivinationEvent("checkout_start_from_free_preview", {
    route: input.route,
    paid: false,
    confidence: input.confidence,
    evidenceSignalCount: input.sourceTypes?.length ?? 0,
    sourceTypes: input.sourceTypes ?? [],
  });
}

export function trackDivinationAccuracyFeedbackSubmitted(input: {
  route: DivinationRoute;
  paid?: boolean;
  confidence: DivinationEvidenceConfidence;
  rating: AccuracyFeedbackRating;
}) {
  return trackDivinationEvent(
    "divination_accuracy_feedback_submitted",
    buildAccuracyFeedbackAnalyticsPayload(input)
  );
}
