import { trackClientEvent } from '@/lib/analytics/client';
import { buildDivinationEvidenceAnalyticsPayload } from '@/lib/divination/evidence';
import type {
  DivinationAccuracyFeedback,
  DivinationEvidence,
  DivinationEvidenceRoute,
} from '@/types/divination';

export { buildDivinationEvidenceAnalyticsPayload };

export const DIVINATION_EVIDENCE_CLIENT_EVENTS = [
  'divination_evidence_viewed',
  'divination_evidence_expand_clicked',
  'divination_accuracy_feedback_submitted',
  'paid_unlock_from_evidence_clicked',
] as const;

export const DIVINATION_EVIDENCE_SAFE_PAYLOAD_FIELDS = [
  'route',
  'paid',
  'confidence',
  'evidenceSignalCount',
  'sourceTypes',
  'feedback',
] as const;

export type DivinationEvidenceClientEvent = (typeof DIVINATION_EVIDENCE_CLIENT_EVENTS)[number];

export function trackDivinationEvidenceEvent(
  event: DivinationEvidenceClientEvent,
  input: {
    route: DivinationEvidenceRoute;
    paid: boolean;
    evidence: DivinationEvidence;
    feedback?: DivinationAccuracyFeedback;
  },
) {
  return trackClientEvent({
    event,
    experimentId: 'tianji-love-divination-evidence-20260525',
    moduleType: 'tianji_love',
    payload: buildDivinationEvidenceAnalyticsPayload(input),
  });
}
