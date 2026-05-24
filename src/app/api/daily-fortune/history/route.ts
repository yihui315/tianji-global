import { NextRequest, NextResponse } from 'next/server';
import { getPlatformContext } from '@/lib/unified-platform';
import {
  getDailyFortuneHistoryForUser,
  isDailyFortuneEnabled,
  normalizeDailyFortuneSystemType,
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
  const rawLimit = Number(searchParams.get('limit') ?? 14);
  const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 14, 1), 90);
  const systemType = searchParams.get('systemType')
    ? normalizeDailyFortuneSystemType(searchParams.get('systemType'))
    : undefined;
  const dateBefore = searchParams.get('dateBefore') ?? searchParams.get('cursor') ?? undefined;

  const result = await getDailyFortuneHistoryForUser({
    supabase: context.supabase,
    userId: context.user.id,
    limit,
    systemType,
    dateBefore,
  });

  if (!result.success) {
    return errorResponse(result.error.code, result.error.message, 500);
  }

  return NextResponse.json({
    success: true,
    data: result.data.map((report) => ({
      reportId: report.id,
      date: report.date,
      systemType: report.systemType,
      scores: report.scores,
      headline: report.headline,
      summary: report.summary,
      disclaimer: report.disclaimer,
      locked: report.locked,
    })),
  });
}
