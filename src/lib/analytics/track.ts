/**
 * track.ts
 *
 * Client-side unified tracking function for Relationship analytics events.
 * Sends events to /api/analytics/relationship which writes to Supabase.
 *
 * Fire-and-forget: failures are swallowed to avoid impacting UX.
 */

import { RelationshipAnalyticsEvent } from "./relationship-events";

export async function trackRelationshipEvent(
  input: RelationshipAnalyticsEvent
): Promise<void> {
  try {
    await fetch("/api/analytics/relationship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        timestamp: input.timestamp ?? new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Swallow errors — analytics must never break UX
    console.warn("[analytics] trackRelationshipEvent failed:", error);
  }
}
