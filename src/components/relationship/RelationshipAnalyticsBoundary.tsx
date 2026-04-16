"use client";

/**
 * RelationshipAnalyticsBoundary
 *
 * Invisible wrapper component that fires `relationship_view` on mount.
 * Drop this at the top of your Relationship results page.
 *
 * Usage:
 *   <RelationshipAnalyticsBoundary
 *     experimentId="rel-hero-020"
 *     variant="A"
 *     relationType="romantic"
 *     isPremium={false}
 *   />
 */

import { useEffect, useRef } from "react";
import { trackRelationshipEvent } from "@/lib/analytics/track";
import type {
  RelationshipVariant,
  RelationshipType,
} from "@/lib/analytics/relationship-events";

interface Props {
  experimentId: string;
  variant: RelationshipVariant;
  relationType: RelationshipType;
  isPremium: boolean;
}

export function RelationshipAnalyticsBoundary({
  experimentId,
  variant,
  relationType,
  isPremium,
}: Props) {
  const fired = useRef(false);

  useEffect(() => {
    // Guard against double-fire in React StrictMode
    if (fired.current) return;
    fired.current = true;

    trackRelationshipEvent({
      event: "relationship_view",
      experiment_id: experimentId,
      variant,
      relation_type: relationType,
      is_premium: isPremium,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — only fire once on mount

  return null; // this component is invisible
}
