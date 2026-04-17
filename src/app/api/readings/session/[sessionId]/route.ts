import { NextResponse } from 'next/server';
import { getPlatformContext, mapModuleResultRow, mapUserProfileRow } from '@/lib/unified-platform';

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const platform = await getPlatformContext();
    if (!platform) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await context.params;
    const { data: session } = await platform.supabase
      .from('reading_sessions_unified')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', platform.user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const [{ data: results }, { data: profile }, { data: relationProfile }] = await Promise.all([
      platform.supabase
        .from('module_results')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', platform.user.id)
        .order('created_at', { ascending: false }),
      platform.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.profile_id)
        .eq('user_id', platform.user.id)
        .maybeSingle(),
      session.relation_profile_id
        ? platform.supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.relation_profile_id)
            .eq('user_id', platform.user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        session,
        profile: profile ? mapUserProfileRow(profile) : null,
        relationProfile: relationProfile ? mapUserProfileRow(relationProfile) : null,
        results: (results ?? []).map(mapModuleResultRow),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Supabase is not configured.') {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    }

    console.error('[api/readings/session/:sessionId] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
