/**
 * /api/analytics/relationship/route.ts
 *
 * Receives Relationship analytics events and writes to Supabase.
 * Called by the client-side trackRelationshipEvent() function.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const ALLOWED_EVENTS = new Set([
  "relationship_view",
  "relationship_share_click",
  "relationship_share_success",
  "relationship_upgrade_click",
  "relationship_upgrade_success",
  "relationship_dimension_expand",
  "relationship_return_7d",
] as const);

export async function POST(req: NextRequest) {
  // ── Validate Supabase configuration ──────────────────────────────────────
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { success: false, error: "Analytics not configured" },
      { status: 503 }
    );
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  // ── Validate event ────────────────────────────────────────────────────────
  const event = body.event as string;
  if (!event || !ALLOWED_EVENTS.has(event as typeof ALLOWED_EVENTS extends Set<infer T> ? T : never)) {
    return NextResponse.json({ success: false, error: "Invalid event type" }, { status: 400 });
  }

  // ── Validate required fields ───────────────────────────────────────────────
  if (!body.experiment_id || !body.variant) {
    return NextResponse.json(
      { success: false, error: "Missing experiment_id or variant" },
      { status: 400 }
    );
  }

  // ── Build row ──────────────────────────────────────────────────────────────
  const row = {
    event,
    experiment_id: body.experiment_id as string,
    variant: body.variant as string,
    relation_type: (body.relation_type as string) ?? null,
    share_mode: (body.share_mode as string) ?? null,
    dimension: (body.dimension as string) ?? null,
    is_premium: (body.is_premium as boolean) ?? null,
    payload: (body.payload as Record<string, unknown>) ?? {},
    created_at: (body.timestamp as string) ?? new Date().toISOString(),
  };

  // ── Insert ─────────────────────────────────────────────────────────────────
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("analytics_events").insert(row);

    if (error) {
      console.error("[analytics] Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: "Insert failed" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[analytics] Unexpected error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
