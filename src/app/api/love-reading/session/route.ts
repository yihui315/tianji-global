import { NextRequest, NextResponse } from 'next/server';
import {
  createLoveReadingCheckout,
  createLoveReadingSession,
  getLoveReadingSession,
  loveReadingSessionSchema,
  verifyLoveReadingUnlock,
  type LoveReadingLanguage,
} from '@/lib/love-reading';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getLanguage(value: unknown): LoveReadingLanguage {
  return value === 'zh' ? 'zh' : 'en';
}

function publicSessionPayload(session: NonNullable<ReturnType<typeof getLoveReadingSession>>, unlocked: boolean) {
  return {
    id: session.id,
    language: session.language,
    mode: session.mode,
    teaser: session.teaser,
    price: session.price,
    unlocked,
    fullReport: unlocked ? session.fullReport : undefined,
    emailRecoveryReady: session.emailRecoveryReady,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body?.action === 'checkout') {
      const id = typeof body.id === 'string' ? body.id : '';
      if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
      }

      const result = await createLoveReadingCheckout({
        id,
        language: getLanguage(body.language),
        origin: process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin,
      });

      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      return NextResponse.json(result);
    }

    const parsed = loveReadingSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid love reading input' },
        { status: 400 }
      );
    }

    if (parsed.data.mode === 'relationship') {
      return NextResponse.json(
        {
          redirectTo: `/relationship/new?source=love-reading-couple&lang=${parsed.data.language}`,
          reason: 'Couple reading needs a second profile.',
        },
        { status: 409 }
      );
    }

    const session = createLoveReadingSession(parsed.data);
    return NextResponse.json({
      id: session.id,
      teaser: session.teaser,
      price: session.price,
      resultUrl: `/love-reading/result/${encodeURIComponent(session.id)}?lang=${session.language}`,
      emailRecoveryReady: session.emailRecoveryReady,
    });
  } catch (error) {
    console.error('[api/love-reading/session] error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Unable to create love reading session' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id') ?? '';
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const session = getLoveReadingSession(id);
    if (!session) {
      return NextResponse.json({ error: 'Love reading session not found or expired' }, { status: 404 });
    }

    const checkoutSessionId = request.nextUrl.searchParams.get('session_id');
    const unlocked = checkoutSessionId
      ? await verifyLoveReadingUnlock({ id, sessionId: checkoutSessionId })
      : false;

    return NextResponse.json(publicSessionPayload(session, unlocked));
  } catch (error) {
    console.error('[api/love-reading/session] read error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Unable to read love reading session' }, { status: 500 });
  }
}
