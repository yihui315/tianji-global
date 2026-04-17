import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPlatformContext, mapUserProfileRow } from '@/lib/unified-platform';

const createProfileSchema = z.object({
  profileType: z.enum(['self', 'other']).default('self'),
  displayName: z.string().trim().optional(),
  nickname: z.string().trim().optional(),
  birthDate: z.string().min(1, 'birthDate is required'),
  birthTime: z.string().trim().optional(),
  birthLocation: z.string().trim().optional(),
  timezone: z.string().trim().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  language: z.enum(['en', 'zh']).default('en'),
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

  console.error('[api/profiles] error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export async function GET() {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await context.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', context.user.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: (data ?? []).map(mapUserProfileRow),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = createProfileSchema.parse(await request.json());
    const { data: existingPrimary } = await context.supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', context.user.id)
      .eq('is_primary', true)
      .maybeSingle();

    const isPrimary = body.isPrimary ?? !existingPrimary;

    if (isPrimary) {
      await context.supabase
        .from('user_profiles')
        .update({ is_primary: false })
        .eq('user_id', context.user.id)
        .eq('is_primary', true);
    }

    const { data, error } = await context.supabase
      .from('user_profiles')
      .insert({
        user_id: context.user.id,
        profile_type: body.profileType,
        display_name: body.displayName ?? null,
        nickname: body.nickname ?? null,
        birth_date: body.birthDate,
        birth_time: body.birthTime ?? null,
        birth_location: body.birthLocation ?? null,
        timezone: body.timezone ?? context.user.timezone ?? null,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        language: body.language,
        gender: body.gender ?? null,
        is_primary: isPrimary,
      })
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
