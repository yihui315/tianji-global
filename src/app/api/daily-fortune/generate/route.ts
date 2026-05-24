import { NextRequest, NextResponse } from 'next/server';
import { getPlatformContext } from '@/lib/unified-platform';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import {
  getOrCreateDailyFortuneReport,
  isDailyFortuneEnabled,
  normalizeDailyFortuneSystemType,
} from '@/lib/daily-fortune/service';

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

async function resolveInternalUser(profileId: string | undefined): Promise<{
  supabase: ReturnType<typeof getSupabaseAdmin>;
  userId: string;
} | null> {
  if (!profileId || !isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('user_profiles').select('user_id').eq('id', profileId).maybeSingle();
  const userId = typeof data?.user_id === 'string' ? data.user_id : undefined;
  return userId ? { supabase, userId } : null;
}

export async function POST(request: NextRequest) {
  if (!isDailyFortuneEnabled()) {
    return errorResponse('feature_disabled', 'Daily Fortune is not enabled.', 404);
  }

  let body: {
    profileId?: string;
    date?: string;
    systemType?: string;
    forceRegenerate?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return errorResponse('invalid_json', 'Request body must be valid JSON.', 400);
  }

  const context = await getPlatformContext();
  const authHeader = request.headers.get('authorization');
  const cronAuthorized = Boolean(process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`);
  const internal = context ? null : cronAuthorized ? await resolveInternalUser(body.profileId) : null;

  if (!context && !internal) {
    return errorResponse('unauthorized', 'Login or cron authorization is required.', 401);
  }

  const result = await getOrCreateDailyFortuneReport({
    supabase: context?.supabase ?? internal!.supabase,
    userId: context?.user.id ?? internal!.userId,
    profileId: body.profileId,
    date: body.date,
    systemType: normalizeDailyFortuneSystemType(body.systemType),
    forceRegenerate: body.forceRegenerate === true,
  });

  if (!result.success) {
    return errorResponse(result.error.code, result.error.message, 500);
  }

  return NextResponse.json({ success: true, data: result.data });
}
