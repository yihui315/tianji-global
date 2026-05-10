import { NextRequest, NextResponse } from 'next/server';
import { getPlatformContext } from '@/lib/unified-platform';
import {
  getOrCreateDailyFortuneReport,
  isDailyFortuneEnabled,
  normalizeDailyFortuneLanguage,
  normalizeDailyFortuneSystemType,
  todayIsoDate,
} from '@/lib/daily-fortune/service';

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export async function GET(request: NextRequest) {
  if (!isDailyFortuneEnabled()) {
    return errorResponse('feature_disabled', 'Daily Fortune is not enabled.', 404);
  }

  const context = await getPlatformContext();
  if (!context) {
    return errorResponse('unauthorized', 'Login is required.', 401);
  }

  const { searchParams } = new URL(request.url);
  const systemType = normalizeDailyFortuneSystemType(searchParams.get('systemType'));
  const date = searchParams.get('date') || todayIsoDate();

  const result = await getOrCreateDailyFortuneReport({
    supabase: context.supabase,
    userId: context.user.id,
    date,
    systemType,
    timezone: context.user.timezone ?? undefined,
    language: normalizeDailyFortuneLanguage((context.user as { language?: unknown }).language),
  });

  if (!result.success) {
    return errorResponse(result.error.code, result.error.message, 500);
  }

  return NextResponse.json({
    success: true,
    data: {
      reportId: result.data.id,
      date: result.data.date,
      scores: result.data.scores,
      headline: result.data.headline,
      summary: result.data.summary,
      drivers: result.data.drivers,
      riskTags: result.data.riskTags,
      remedies: result.data.remedies,
      disclaimer: result.data.disclaimer,
      locked: result.data.locked,
    },
  });
}
