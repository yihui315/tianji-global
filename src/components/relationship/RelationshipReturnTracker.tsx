"use client";

/**
 * RelationshipReturnTracker
 *
 * Fires `relationship_return_7d` when a user revisits the same experiment
 * within 7 days of their first view.
 *
 * Uses localStorage as a lightweight approximation.
 * For production, this should query Supabase directly to check real visit history.
 *
 * Usage:
 *   <RelationshipReturnTracker
 *     experimentId="rel-hero-020"
 *     variant="A"
 *   />
 */

import { useEffect } from "react";
import { trackRelationshipEvent } from "@/lib/analytics/track";
import type { RelationshipVariant } from "@/lib/analytics/relationship-events";

interface Props {
  experimentId: string;
  variant: RelationshipVariant;
}

export function RelationshipReturnTracker({ experimentId, variant }: Props) {
  useEffect(() => {
    const key = `rel_first_view_${experimentId}`;
    const stored = localStorage.getItem(key);
    const now = Date.now();

    if (stored) {
      const diffDays = (now - Number(stored)) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7) {
        trackRelationshipEvent({
          event: "relationship_return_7d",
          experiment_id: experimentId,
          variant,
        });
      }
    }

    // Set or refresh first-view timestamp
    if (!stored) {
      localStorage.setItem(key, String(now));
    }
  }, [experimentId, variant]);

  return null;
}
