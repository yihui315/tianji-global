/**
 * analytics.ts
 *
 * Client-side unified tracking function for Cultural Coherence analytics events.
 * Sends events to /api/analytics/coherence which writes to Supabase.
 *
 * Fire-and-forget: failures are swallowed to avoid impacting UX.
 */

import { CoherenceAnalyticsEvent } from './coherence-events';

export async function trackCoherenceEvent(
  input: CoherenceAnalyticsEvent
): Promise<void> {
  try {
    await fetch("/api/analytics/coherence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        timestamp: input.timestamp ?? new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Swallow errors — analytics must never break UX
    console.warn("[analytics] trackCoherenceEvent failed:", error);
  }
}

// Track when a coherence violation is detected
export async function trackCoherenceViolation(
  system: 'bazi' | 'ziwei' | 'qizheng' | 'western',
  violationCount: number,
  errorCount: number,
  warningCount: number
): Promise<void> {
  await trackCoherenceEvent({
    event: 'coherence_violation_detected',
    system,
    violation_count: violationCount,
    error_count: errorCount,
    warning_count: warningCount,
    timestamp: new Date().toISOString()
  });
}
