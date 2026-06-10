import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPool } from '@/lib/db';
import { trafficSourceSchema, trafficStrategySchema } from '@/lib/traffic-evolution';
import { sanitizeAnalyticsPayload } from '@/lib/trust-copy-guard';
import { isSupabaseMutationDisabled } from '@/lib/staging-degraded-mode';

const analyticsEventSchema = z.object({
  event: z.string().min(1).max(80),
  experimentId: z.string().max(120).optional(),
  variant: z.string().max(80).optional(),
  moduleType: z.string().max(40).optional(),
  trafficSource: trafficSourceSchema.optional(),
  strategy: trafficStrategySchema.optional(),
  payload: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.string())]),
  ).optional().default({}),
});

export async function POST(request: NextRequest) {
  try {
    if (isSupabaseMutationDisabled()) {
      return NextResponse.json(
        {
          success: false,
          skipped: true,
          reason: 'supabase_mutation_disabled',
        },
        { status: 202 }
      );
    }

    const body = analyticsEventSchema.parse(await request.json());
    const pool = getPool();

    const payload = sanitizeAnalyticsPayload({
      ...body.payload,
      trafficSource: body.trafficSource ?? null,
      strategy: body.strategy ?? null,
      path: request.nextUrl.pathname,
    });

    await pool.query(
      `
        insert into public.analytics_events (
          event,
          experiment_id,
          variant,
          module_type,
          payload
        )
        values ($1, $2, $3, $4, $5::jsonb)
      `,
      [
        body.event,
        body.experimentId ?? 'love-v1',
        body.variant ?? null,
        body.moduleType ?? null,
        JSON.stringify(payload),
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.warn('[api/analytics/track] skipped', error);
    return NextResponse.json(
      {
        success: false,
        skipped: true,
      },
      { status: 202 }
    );
  }
}
