import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { hasEntitlement } from '@/lib/billing';
import { ensureReportJobForSession, runReportJob } from '@/lib/report-jobs';

const createSchema = z.object({
  sessionId: z.string().uuid(),
  readingMode: z.enum(['solo', 'compatibility']).default('solo'),
});

export async function POST(request: NextRequest) {
  try {
    const input = createSchema.parse(await request.json());
    const session = await auth();
    const entitlement =
      input.readingMode === 'compatibility' ? 'compatibility_report' : 'solo_love_report';
    const isPaid = await hasEntitlement({
      userId: session?.user?.id ?? null,
      readingSessionId: input.sessionId,
      entitlement,
    });

    if (!isPaid) {
      return NextResponse.json(
        { success: false, error: 'Report is locked until payment is confirmed' },
        { status: 403 }
      );
    }

    const job = await ensureReportJobForSession({
      ...input,
      userId: session?.user?.id ?? null,
      vedicEntitlement: {
        paid: true,
        product: entitlement,
      },
    });

    void runReportJob(job.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          jobId: job.id,
          status: job.status,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.flatten() }, { status: 400 });
    }

    console.error('[report-jobs/create] failed', error);
    return NextResponse.json({ success: false, error: 'Unable to create report job' }, { status: 500 });
  }
}
