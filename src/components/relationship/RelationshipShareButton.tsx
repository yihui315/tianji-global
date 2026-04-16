"use client";

/**
 * RelationshipShareButton
 *
 * Share button with built-in analytics tracking.
 * Fires `relationship_share_click` on press, `relationship_share_success` on completion.
 *
 * Usage:
 *   <RelationshipShareButton
 *     experimentId="rel-hero-020"
 *     variant="A"
 *     relationType="romantic"
 *     shareMode="summary"
 *     onShare={async () => {
 *       await navigator.clipboard.writeText(text);
 *     }}
 *   />
 */

import { trackRelationshipEvent } from "@/lib/analytics/track";
import type {
  RelationshipShareMode,
  RelationshipVariant,
  RelationshipType,
} from "@/lib/analytics/relationship-events";

interface Props {
  experimentId: string;
  variant: RelationshipVariant;
  relationType: RelationshipType;
  shareMode: RelationshipShareMode;
  children?: React.ReactNode;
  onShare?: () => Promise<void> | void;
  className?: string;
}

export function RelationshipShareButton({
  experimentId,
  variant,
  relationType,
  shareMode,
  children,
  onShare,
  className = "",
}: Props) {
  const handleClick = async () => {
    // Fire click event
    await trackRelationshipEvent({
      event: "relationship_share_click",
      experiment_id: experimentId,
      variant,
      relation_type: relationType,
      share_mode: shareMode,
    });

    // Execute the actual share action
    if (onShare) {
      try {
        await onShare();

        // Fire success event
        await trackRelationshipEvent({
          event: "relationship_share_success",
          experiment_id: experimentId,
          variant,
          relation_type: relationType,
          share_mode: shareMode,
        });
      } catch (err) {
        console.error("[share] Share action failed:", err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {children ?? "Share"}
    </button>
  );
}
