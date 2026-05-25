/**
 * relationship-events.ts
 *
 * Canonical event types for Relationship module analytics.
 * Phase 2: These feed back into A/B experiment decisions via real user behavior.
 */

export type RelationshipEventName =
  | "relationship_page_view"
  | "relationship_form_start"
  | "relationship_form_submit"
  | "relationship_analysis_success"
  | "relationship_result_view"
  | "relationship_view"
  | "relationship_share_click"
  | "relationship_share_success"
  | "relationship_copy_success"
  | "relationship_unlock_click"
  | "relationship_checkout_start"
  | "relationship_checkout_blocked_missing_persisted_reading"
  | "relationship_checkout_success"
  | "relationship_error"
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
