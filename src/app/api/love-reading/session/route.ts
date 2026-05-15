import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { trackLoveFunnelEvent } from '@/lib/love-funnel-analytics';
import { createLoveReadingSession } from '@/lib/love-reading-store';

const createSessionSchema = z.object({
  locale: z.enum(['en', 'zh-CN']).default('en'),
  readingMode: z.enum(['solo', 'compatibility']).default('solo'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().trim().max(12).optional(),
  birthPlace: z.string().trim().max(120).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = createSessionSchema.parse(await request.json());
    const session = await createLoveReadingSession(body);
    await trackLoveFunnelEvent('love_session_created', {
      sessionId: session.sessionId,
      readingMode: body.readingMode,
      locale: body.locale,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          sessionId: session.sessionId,
          redirectUrl: `/${body.locale}/love-reading/result/${session.sessionId}`,
          teaser: {
            summary: session.teaser.summary,
            emotionalInsight: session.teaser.emotionalInsight,
            actionableSuggestion: session.teaser.actionableSuggestion,
            patternTags: session.teaser.patternTags,
            lockedSectionsCount: session.teaser.lockedSections.length,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.flatten() }, { status: 400 });
    }

    console.error('[love-reading/session] create failed', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create reading session' },
      { status: 500 }
    );
  }
}
