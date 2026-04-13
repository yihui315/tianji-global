/**
 * GET  /api/readings          — list recent readings for current user
 * POST /api/readings           — save a new reading
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ readings: [] });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('readings')
      .select('id, reading_type, title, summary, created_at')
      .eq('user_id', session.user.id!)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ readings: data ?? [] });
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
      // Store in localStorage on client as fallback
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
    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('[api/readings] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
