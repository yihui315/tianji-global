"use client";

/**
 * RelationshipUpgradeButton
 *
 * Premium upgrade CTA with built-in analytics tracking.
 * Fires `relationship_upgrade_click` on press, `relationship_upgrade_success` on completion.
 *
 * Usage:
 *   <RelationshipUpgradeButton
 *     experimentId="rel-hero-020"
 *     variant="A"
 *     relationType="romantic"
 *     onUpgrade={async () => {
 *       await stripe.redirectToCheckout({ sessionId });
 *     }}
 *   >
 *     Unlock Full Reading
 *   </RelationshipUpgradeButton>
 */

import { trackRelationshipEvent } from "@/lib/analytics/track";
import type {
  RelationshipVariant,
  RelationshipType,
} from "@/lib/analytics/relationship-events";

interface Props {
  experimentId: string;
  variant: RelationshipVariant;
  relationType: RelationshipType;
  children?: React.ReactNode;
  onUpgrade?: () => Promise<void> | void;
  className?: string;
}

export function RelationshipUpgradeButton({
  experimentId,
  variant,
  relationType,
  children,
  onUpgrade,
  className = "",
}: Props) {
  const handleUpgrade = async () => {
    // Fire click event
    await trackRelationshipEvent({
      event: "relationship_upgrade_click",
      experiment_id: experimentId,
      variant,
      relation_type: relationType,
      is_premium: false,
    });

    // Execute the upgrade flow (e.g. Stripe redirect)
    if (onUpgrade) {
      try {
        await onUpgrade();

        // Fire success event — only fires if onUpgrade() does NOT throw
        await trackRelationshipEvent({
          event: "relationship_upgrade_success",
          experiment_id: experimentId,
          variant,
          relation_type: relationType,
          is_premium: true,
        });
      } catch (err) {
        console.error("[upgrade] Upgrade flow failed:", err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      className={className}
    >
      {children ?? "Unlock Full Reading"}
    </button>
  );
}
