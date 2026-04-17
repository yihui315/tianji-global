import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPlatformContext, isModuleType } from '@/lib/unified-platform';

const createSessionSchema = z.object({
  profileId: z.string().uuid(),
  moduleType: z.string().refine(isModuleType, 'Invalid moduleType'),
  questionContext: z.string().trim().nullable().optional(),
  relationProfileId: z.string().uuid().nullable().optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = createSessionSchema.parse(await request.json());
    const { data: profile } = await context.supabase
      .from('user_profiles')
      .select('id')
      .eq('id', body.profileId)
      .eq('user_id', context.user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (body.relationProfileId) {
      const { data: relationProfile } = await context.supabase
        .from('user_profiles')
        .select('id')
        .eq('id', body.relationProfileId)
        .eq('user_id', context.user.id)
        .maybeSingle();

      if (!relationProfile) {
        return NextResponse.json({ error: 'Relation profile not found' }, { status: 404 });
      }
    }

    const { data, error } = await context.supabase
      .from('reading_sessions_unified')
      .insert({
        user_id: context.user.id,
        profile_id: body.profileId,
        module_type: body.moduleType,
        question_context: body.questionContext ?? null,
        relation_profile_id: body.relationProfileId ?? null,
        status: body.status ?? 'completed',
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: data.id,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Supabase is not configured.') {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error('[api/readings/session] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
