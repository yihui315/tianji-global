/**
 * analytics.ts
 *
 * TypeScript types for TianJi relationship analytics events.
 * These events track real user behavior and feed back into A/B experiment decisions.
 *
 * Phase 2: Once Supabase + analytics pipeline is connected,
 * these types will validate event payloads before writing to the database.
 */

// ─── Event Names ─────────────────────────────────────────────────────────────

export type RelationshipEventName =
  | "relationship_view"
  | "relationship_share_click"
  | "relationship_share_success"
  | "relationship_upgrade_click"
  | "relationship_upgrade_success"
  | "relationship_dimension_expand"
  | "relationship_return_7d";

// ─── Dimension Types ─────────────────────────────────────────────────────────

export type RelationshipDimension =
  | "attraction"
  | "communication"
  | "conflict"
  | "rhythm"
  | "longTerm";

// ─── Share Mode Types ────────────────────────────────────────────────────────

export type ShareMode = "summary" | "graph" | "one_liner";

// ─── Relation Types ──────────────────────────────────────────────────────────

export type RelationType = "romantic" | "friendship" | "work";

// ─── Variant Type ────────────────────────────────────────────────────────────

export type VariantLabel = "A" | "B";

// ─── Analytics Event ─────────────────────────────────────────────────────────

export interface RelationshipAnalyticsEvent {
  /** Event name */
  event: RelationshipEventName;
  /** Experiment run ID (e.g. rel-hero-020) */
  experiment_id: string;
  /** A or B variant */
  variant: VariantLabel;
  /** Type of relationship being analyzed */
  relation_type?: RelationType;
  /** Share output format (for share events) */
  share_mode?: ShareMode;
  /** Which dimension was expanded (for dimension_expand events) */
  dimension?: RelationshipDimension;
  /** Whether the user is on a free or premium plan */
  is_premium?: boolean;
  /** ISO timestamp */
  timestamp: string;
  /** Additional context (optional, for future extension) */
  payload?: Record<string, unknown>;
}

// ─── Experiment Result Metrics ────────────────────────────────────────────────

export interface ExperimentMetrics {
  /** Click-through rate on premium upgrade CTA */
  upgradeClickRate: number | null;
  /** Click-through rate on share button */
  shareClickRate: number | null;
  /** Average time spent on results page (seconds) */
  dwellTime: number | null;
  /** Rate of dimension card expansions (per view) */
  dimensionExpandRate: number | null;
  /** 7-day return rate */
  return7dRate: number | null;
}

// ─── Manifest Run Metrics (extends experiment metrics) ───────────────────────

export interface ManifestMetrics extends ExperimentMetrics {
  upgradeClickRate: number | null;
  shareClickRate: number | null;
  dwellTime: number | null;
}

// ─── Analytics Query Result ──────────────────────────────────────────────────

export interface VariantMetricsSummary {
  experiment_id: string;
  variant: VariantLabel;
  total_views: number;
  upgrade_clicks: number;
  upgrade_rate: number;
  share_clicks: number;
  share_rate: number;
  dimension_expands: number;
  expand_rate: number;
  return_7d: number;
  return_7d_rate: number;
}

// ─── A/B Decision with Real Data ────────────────────────────────────────────

export interface RealDataDecision {
  experiment_id: string;
  winner: VariantLabel;
  confidence: "low" | "medium" | "high";
  p_value?: number;
  sample_size: number;
  metrics: {
    upgradeClickRate: { A: number; B: number; delta: number; winner: VariantLabel };
    shareClickRate: { A: number; B: number; delta: number; winner: VariantLabel };
  };
  decision: "A" | "B" | "inconclusive";
}
