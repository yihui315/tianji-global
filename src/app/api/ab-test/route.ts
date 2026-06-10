import { NextRequest, NextResponse } from 'next/server';

interface ABTest {
  id: string;
  variant: 'A' | 'B';
  assignment: string;
}

const ACTIVE_TESTS: Record<string, { weightA: number; weightB: number }> = {
  'pricing-hero-cta': { weightA: 0.5, weightB: 0.5 },
  'homepage-headline': { weightA: 0.5, weightB: 0.5 },
  'free-preview-length': { weightA: 0.5, weightB: 0.5 },
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function assignVariant(testId: string, userId?: string): 'A' | 'B' {
  const test = ACTIVE_TESTS[testId];
  if (!test) return 'A';
  const seed = userId ?? `${Date.now()}-${Math.random()}`;
  const hash = hashString(seed + testId);
  const normalized = (hash % 100) / 100;
  return normalized < test.weightA ? 'A' : 'B';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testId = searchParams.get('testId');
  const userId = searchParams.get('userId');

  if (!testId) {
    return NextResponse.json({ error: 'Missing testId parameter' }, { status: 400 });
  }

  if (!ACTIVE_TESTS[testId]) {
    return NextResponse.json({ error: `Unknown test: ${testId}` }, { status: 404 });
  }

  const variant = assignVariant(testId, userId ?? undefined);
  const response = NextResponse.json({
    testId,
    variant,
    assigned: true,
  });

  // Persist variant in cookie for consistency
  response.cookies.set(`ab_${testId}`, variant, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
  });

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, variant, event, metadata } = body;

    if (!testId || !event) {
      return NextResponse.json({ error: 'Missing testId or event' }, { status: 400 });
    }

    // Log event for analytics (structured for easy processing)
    const eventLog = {
      timestamp: new Date().toISOString(),
      testId,
      variant,
      event,
      metadata: metadata ?? {},
    };

    console.log(`[ab-test] ${JSON.stringify(eventLog)}`);

    return NextResponse.json({ success: true, event: eventLog });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}