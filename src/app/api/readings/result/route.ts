import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getPlatformContext,
  isModuleType,
} from '@/lib/unified-platform';
import { persistUnifiedModuleResult } from '@/lib/unified-write';

const normalizedPayloadSchema = z.object({
  summary: z
    .object({
      headline: z.string().optional(),
      oneLiner: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .default({}),
  structure: z.record(z.string(), z.unknown()).optional(),
  chart: z.record(z.string(), z.unknown()).optional(),
  identity: z.record(z.string(), z.unknown()).optional(),
  relationship: z.record(z.string(), z.unknown()).optional(),
  career: z.record(z.string(), z.unknown()).optional(),
  wealth: z.record(z.string(), z.unknown()).optional(),
  timing: z.record(z.string(), z.unknown()).optional(),
  advice: z.record(z.string(), z.unknown()).optional(),
  risk: z.record(z.string(), z.unknown()).optional(),
  timeline: z
    .object({
      currentPhase: z.string().optional(),
      next30Days: z.string().optional(),
      next90Days: z.string().optional(),
      phases: z
        .array(
          z.object({
            range: z.string(),
            label: z.string(),
            description: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});

const createResultSchema = z.object({
  sessionId: z.string().uuid(),
  moduleType: z.string().refine(isModuleType, 'Invalid moduleType'),
  version: z.string().default('v1'),
  title: z.string().optional(),
  summary: z.string().optional(),
  rawPayload: z.record(z.string(), z.unknown()).default({}),
  normalizedPayload: normalizedPayloadSchema.optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  isPremium: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = createResultSchema.parse(await request.json());
    const { data: session } = await context.supabase
      .from('reading_sessions_unified')
      .select('id, profile_id')
      .eq('id', body.sessionId)
      .eq('user_id', context.user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const result = await persistUnifiedModuleResult({
      context,
      profileId: session.profile_id,
      sessionId: body.sessionId,
      moduleType: body.moduleType,
      version: body.version,
      title: body.title,
      summary: body.summary,
      rawPayload: body.rawPayload,
      normalizedPayload: body.normalizedPayload,
      confidenceScore: body.confidenceScore,
      isPremium: body.isPremium,
      writeLegacyReading: true,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Supabase is not configured.') {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error('[api/readings/result] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
