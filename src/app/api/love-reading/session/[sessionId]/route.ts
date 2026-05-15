import { NextResponse } from 'next/server';
import { getLoveReadingSession } from '@/lib/love-reading-store';

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const session = await getLoveReadingSession(sessionId);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        locale: session.locale,
        readingMode: session.readingMode,
        status: session.status,
        teaser: {
          summary: session.teaser.summary,
          emotionalInsight: session.teaser.emotionalInsight,
          actionableSuggestion: session.teaser.actionableSuggestion,
          patternTags: session.teaser.patternTags,
        },
        lockedSections: session.teaser.lockedSections,
      },
    });
  } catch (error) {
    console.error('[love-reading/session] load failed', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load reading session' },
      { status: 500 }
    );
  }
}
