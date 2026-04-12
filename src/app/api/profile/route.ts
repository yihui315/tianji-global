/**
 * PATCH /api/profile
 * Update user profile fields: name, timezone.
 * 
 * With JWT strategy (no DB), timezone is stored in localStorage on the client.
 * Once Supabase is connected, this migrates to users table.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, timezone } = body;

    // Validate timezone
    const validTimezones = Intl.supportedValuesOf('timeZone');
    if (timezone && !validTimezones.includes(timezone)) {
      return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
    }

    // With Supabase: update users table
    // Without Supabase: just acknowledge (client stores in localStorage)
    const { isSupabaseConfigured, getSupabaseAdmin } = await import('@/lib/supabase');
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('users')
        .update({ 
          name: name ?? null,
          timezone: timezone ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('email', session.user.email!);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/profile] PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isSupabaseConfigured, getSupabaseAdmin } = await import('@/lib/supabase');
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('users')
        .select('name, timezone, avatar_url')
        .eq('email', session.user.email!)
        .single();

      if (!error && data) {
        return NextResponse.json(data);
      }
    }

    // Fallback: return session data
    return NextResponse.json({
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
      timezone: null,
    });
  } catch (err) {
    console.error('[api/profile] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
