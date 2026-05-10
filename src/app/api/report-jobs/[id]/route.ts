import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasEntitlement } from '@/lib/billing';
import { getReportJob } from '@/lib/report-jobs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const job = await getReportJob(id);

  if (!job) {
    return NextResponse.json({ success: false, error: 'Report job not found' }, { status: 404 });
  }

  const session = await auth();
  const isPaid = await hasEntitlement({
    userId: session?.user?.id ?? null,
    readingSessionId: job.sessionId,
    entitlement: job.readingMode === 'compatibility' ? 'compatibility_report' : 'solo_love_report',
  });

  if (!isPaid) {
    return NextResponse.json({ success: false, error: 'Report is locked' }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    data: job,
  });
}
