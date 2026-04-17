import { NextResponse } from 'next/server';
import { getPlatformContext, mapModuleResultRow } from '@/lib/unified-platform';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const platform = await getPlatformContext();
    if (!platform) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { data: moduleResult } = await platform.supabase
      .from('module_results')
      .select('*')
      .eq('id', id)
      .eq('user_id', platform.user.id)
      .maybeSingle();

    if (moduleResult) {
      return NextResponse.json({
        success: true,
        data: mapModuleResultRow(moduleResult),
      });
    }

    const { data: reading } = await platform.supabase
      .from('readings')
      .select('*')
      .eq('id', id)
      .eq('user_id', platform.sessionUserId || platform.user.id)
      .maybeSingle();

    if (!reading) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: reading,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Supabase is not configured.') {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    }

    console.error('[api/readings/:id] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const platform = await getPlatformContext();
    if (!platform) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { data: moduleResult } = await platform.supabase
      .from('module_results')
      .select('id')
      .eq('id', id)
      .eq('user_id', platform.user.id)
      .maybeSingle();

    if (moduleResult) {
      const { error } = await platform.supabase
        .from('module_results')
        .delete()
        .eq('id', id)
        .eq('user_id', platform.user.id);

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true, kind: 'unified' });
    }

    const { data: reading } = await platform.supabase
      .from('readings')
      .select('id')
      .eq('id', id)
      .eq('user_id', platform.sessionUserId || platform.user.id)
      .maybeSingle();

    if (!reading) {
      return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
    }

    const { error } = await platform.supabase
      .from('readings')
      .delete()
      .eq('id', id)
      .eq('user_id', platform.sessionUserId || platform.user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, kind: 'legacy' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Supabase is not configured.') {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    }

    console.error('[api/readings/:id] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
