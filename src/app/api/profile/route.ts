/**
 * PATCH /api/profile
 * Update user profile fields: name, timezone.
 * 
 * With JWT strategy (no DB), timezone is stored in localStorage on the client.
 * Once Supabase is connected, this migrates to users table.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getPlatformContext } from '@/lib/unified-platform';

const updateProfileSchema = z.object({
  name: z.string().trim().optional(),
  timezone: z.string().trim().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = updateProfileSchema.parse(await req.json());
    const { name, timezone } = body;

    // Validate timezone
    const validTimezones = Intl.supportedValuesOf('timeZone');
    if (timezone && !validTimezones.includes(timezone)) {
      return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
    }

    await context.supabase
      .from('users')
      .update({
        name: name ?? context.user.name ?? null,
        timezone: timezone ?? context.user.timezone ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', context.user.id);

    const { data: primaryProfile } = await context.supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', context.user.id)
      .eq('is_primary', true)
      .maybeSingle();

    if (primaryProfile) {
      await context.supabase
        .from('user_profiles')
        .update({
          display_name: name ?? null,
          timezone: timezone ?? context.user.timezone ?? null,
        })
        .eq('id', primaryProfile.id)
        .eq('user_id', context.user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'Supabase is not configured.') {
      return NextResponse.json({ success: true, local: true });
    }

    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }

    console.error('[api/profile] PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: primaryProfile } = await context.supabase
      .from('user_profiles')
      .select('display_name, timezone, language')
      .eq('user_id', context.user.id)
      .eq('is_primary', true)
      .maybeSingle();

    return NextResponse.json({
      name: primaryProfile?.display_name ?? context.user.name ?? null,
      email: context.sessionUserEmail,
      image: context.user.avatar_url ?? null,
      timezone: primaryProfile?.timezone ?? context.user.timezone ?? null,
      language: primaryProfile?.language ?? 'en',
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Supabase is not configured.') {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      return NextResponse.json({
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
        timezone: null,
        language: 'en',
      });
    }

    console.error('[api/profile] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
