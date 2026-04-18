/**
 * GET  /api/readings          — list recent readings for current user
 * POST /api/readings           — save a new reading
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getPlatformContext, mapModuleResultRow } from '@/lib/unified-platform';
import { persistLegacyReadingCompat } from '@/lib/unified-write';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ readings: [], results: [] });
    }

    const supabase = getSupabaseAdmin();
    const platformContext = await getPlatformContext().catch(() => null);
    if (platformContext) {
      const { data: moduleResults, error: moduleResultsError } = await supabase
        .from('module_results')
        .select('*')
        .eq('user_id', platformContext.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!moduleResultsError && moduleResults && moduleResults.length > 0) {
        const results = moduleResults.map(mapModuleResultRow);
        return NextResponse.json({
          readings: results.map((result) => ({
            id: result.id,
            reading_type: result.moduleType,
            title: result.title ?? `${result.moduleType} reading`,
            summary: result.summary ?? result.normalizedPayload.summary.oneLiner ?? '',
            created_at: result.createdAt,
          })),
          results,
        });
      }
    }

    const { data, error } = await supabase
      .from('readings')
      .select('id, reading_type, title, summary, created_at')
      .eq('user_id', session.user.id!)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ readings: data ?? [], results: [] });
  } catch (err) {
    console.error('[api/readings] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { reading_type, title, summary, reading_data } = body;

    if (!reading_type || !title) {
      return NextResponse.json({ error: 'reading_type and title are required' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, local: true });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('readings')
      .insert({
        user_id: session.user.id!,
        reading_type,
        title,
        summary: summary ?? '',
        reading_data: reading_data ?? {},
      })
      .select('id, created_at')
      .single();

    if (error) throw error;

    const platformContext = await getPlatformContext().catch(() => null);
    if (platformContext) {
      await persistLegacyReadingCompat({
        context: platformContext,
        readingType: reading_type,
        title,
        summary,
        readingData: reading_data,
      }).catch((persistError) => {
        console.warn('[api/readings] unified compatibility persist skipped:', persistError);
      });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('[api/readings] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('readings')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id!);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/readings] DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
