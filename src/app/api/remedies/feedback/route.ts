import { NextRequest, NextResponse } from 'next/server';
import { getPlatformContext } from '@/lib/unified-platform';
import { getOwnedDailyFortuneReport, isDailyFortuneEnabled } from '@/lib/daily-fortune/service';
import { recordFortuneFeedback } from '@/lib/daily-fortune/repository';

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export async function POST(request: NextRequest) {
  if (!isDailyFortuneEnabled()) {
    return errorResponse('feature_disabled', 'Daily Fortune is not enabled.', 404);
  }

  const context = await getPlatformContext();
  if (!context) {
    return errorResponse('unauthorized', 'Login is required.', 401);
  }

  let body: {
    reportId?: string;
    actionId?: string;
    helpful?: boolean;
    executed?: boolean;
    comment?: string;
  };

  try {
    body = await request.json();
  } catch {
    return errorResponse('invalid_json', 'Request body must be valid JSON.', 400);
  }

  if (!body.reportId) {
    return errorResponse('invalid_request', 'reportId is required.', 400);
  }
  if (body.comment && body.comment.length > 500) {
    return errorResponse('comment_too_long', 'comment must be 500 characters or fewer.', 400);
  }

  const owned = await getOwnedDailyFortuneReport({
    supabase: context.supabase,
    reportId: body.reportId,
    userId: context.user.id,
  });
  if (!owned.success) {
    const status = owned.error.code === 'forbidden' ? 403 : owned.error.code === 'not_found' ? 404 : 500;
    return errorResponse(owned.error.code, owned.error.message, status);
  }

  const feedback = await recordFortuneFeedback({
    supabase: context.supabase,
    input: {
      reportId: body.reportId,
      actionId: body.actionId,
      userId: context.user.id,
      helpful: body.helpful,
      executed: body.executed,
      comment: body.comment,
    },
  });
  if (!feedback.success) {
    return errorResponse(feedback.error.code, feedback.error.message, 500);
  }

  await context.supabase
    .from('analytics_events')
    .insert({
      user_id: context.user.id,
      event: 'daily_fortune_feedback',
      module_type: 'fortune',
      payload: {
        reportId: body.reportId,
        actionId: body.actionId,
        helpful: body.helpful,
        executed: body.executed,
      },
    })
    .then(() => undefined, () => undefined);

  return NextResponse.json({ success: true, data: feedback.data });
}
