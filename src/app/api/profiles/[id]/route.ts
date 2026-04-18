import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPlatformContext, mapUserProfileRow } from '@/lib/unified-platform';

const updateProfileSchema = z.object({
  profileType: z.enum(['self', 'other']).optional(),
  displayName: z.string().trim().optional(),
  nickname: z.string().trim().optional(),
  birthDate: z.string().min(1).optional(),
  birthTime: z.string().trim().optional(),
  birthLocation: z.string().trim().optional(),
  timezone: z.string().trim().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  language: z.enum(['en', 'zh']).optional(),
  gender: z.string().trim().optional(),
  isPrimary: z.boolean().optional(),
});

function handleRouteError(error: unknown) {
  if (error instanceof Error && error.message === 'Supabase is not configured.') {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.flatten() }, { status: 400 });
  }

  console.error('[api/profiles/:id] error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const platform = await getPlatformContext();
    if (!platform) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = updateProfileSchema.parse(await request.json());
    const { data: existing, error: existingError } = await platform.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .eq('user_id', platform.user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (body.isPrimary) {
      await platform.supabase
        .from('user_profiles')
        .update({ is_primary: false })
        .eq('user_id', platform.user.id)
        .eq('is_primary', true);
    }

    const { data, error } = await platform.supabase
      .from('user_profiles')
      .update({
        profile_type: body.profileType ?? existing.profile_type,
        display_name: body.displayName ?? existing.display_name,
        nickname: body.nickname ?? existing.nickname,
        birth_date: body.birthDate ?? existing.birth_date,
        birth_time: body.birthTime ?? existing.birth_time,
        birth_location: body.birthLocation ?? existing.birth_location,
        timezone: body.timezone ?? existing.timezone,
        lat: body.lat ?? existing.lat,
        lng: body.lng ?? existing.lng,
        language: body.language ?? existing.language,
        gender: body.gender ?? existing.gender,
        is_primary: body.isPrimary ?? existing.is_primary,
      })
      .eq('id', id)
      .eq('user_id', platform.user.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: mapUserProfileRow(data),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const platform = await getPlatformContext();
    if (!platform) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { data: existing, error: existingError } = await platform.supabase
      .from('user_profiles')
      .select('id, is_primary')
      .eq('id', id)
      .eq('user_id', platform.user.id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (existing.is_primary) {
      return NextResponse.json({ error: 'Primary profile cannot be deleted' }, { status: 400 });
    }

    const { error } = await platform.supabase
      .from('user_profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', platform.user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
