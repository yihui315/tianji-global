/**
 * relationship-events.ts
 *
 * Canonical event types for Relationship module analytics.
 * Phase 2: These feed back into A/B experiment decisions via real user behavior.
 */

export type RelationshipEventName =
  | "relationship_view"
  | "relationship_share_click"
  | "relationship_share_success"
  | "relationship_upgrade_click"
  | "relationship_upgrade_success"
  | "relationship_dimension_expand"
  | "relationship_return_7d";

export type RelationshipVariant = "A" | "B";

export type RelationshipType = "romantic" | "friendship" | "work";

export type RelationshipShareMode = "summary" | "graph" | "one_liner";

export type RelationshipDimension =
  | "attraction"
  | "communication"
  | "conflict"
  | "rhythm"
  | "longTerm";

export interface RelationshipAnalyticsEvent {
  event: RelationshipEventName;
  experiment_id: string;
  variant: RelationshipVariant;
  relation_type?: RelationshipType;
  share_mode?: RelationshipShareMode;
  dimension?: RelationshipDimension;
  is_premium?: boolean;
  timestamp?: string;
  payload?: Record<string, unknown>;
}
