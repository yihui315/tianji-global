/**
 * coherence-events.ts
 *
 * Canonical event types for Cultural Coherence Checker analytics.
 * Tracks when contamination/violations are detected in AI-generated reports.
 */

export type CoherenceEventName = 'coherence_violation_detected';

export interface CoherenceAnalyticsEvent {
  event: CoherenceEventName;
  system: 'bazi' | 'ziwei' | 'qizheng' | 'western';
  violation_count: number;
  error_count: number;
  warning_count: number;
  timestamp: string;
}
