import { NextRequest, NextResponse } from 'next/server';
import {
  calculateLifePath,
  calculateDestiny,
  calculateSoulUrge,
  calculateFullReading,
  type NumerologyRequest,
  type NumerologyReading,
} from '@/lib/numerology';
import { filterSensitiveContent } from '@/lib/content-moderation';

// POST handler — full numerology reading
export async function POST(req: NextRequest) {
  try {
    const body: NumerologyRequest = await req.json();
    const { name, birthdate, language = 'en' } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!birthdate || typeof birthdate !== 'string' || birthdate.replace(/\D/g, '').length < 8) {
      return NextResponse.json(
        { error: 'Valid birthdate is required (YYYY-MM-DD or MM/DD/YYYY format)', code: 'INVALID_BIRTHDATE' },
        { status: 400 }
      );
    }

    // Content safety check on name
    const check = filterSensitiveContent(name);
    if (!check.safe) {
      return NextResponse.json(
        { error: 'Content flagged', code: 'CONTENT_FLAGGED' },
        { status: 400 }
      );
    }

    // Calculate full reading
    let reading: NumerologyReading;
    try {
      reading = calculateFullReading(name.trim(), birthdate);
    } catch (calcErr) {
      return NextResponse.json(
        { error: calcErr instanceof Error ? calcErr.message : 'Calculation failed', code: 'CALCULATION_ERROR' },
        { status: 422 }
      );
    }

    const response = {
      ...reading,
      language,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
        method: 'pythagorean-numerology',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Numerology reading failed: ${message}` },
      { status: 500 }
    );
  }
}

// GET handler — quick single-number calculation
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'lifePath' | 'destiny' | 'soulUrge';
    const value = searchParams.get('value') || '';

    if (!type || !['lifePath', 'destiny', 'soulUrge'].includes(type)) {
      return NextResponse.json(
        { error: 'Query param type must be: lifePath, destiny, or soulUrge', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    if (!value) {
      return NextResponse.json(
        { error: 'Query param "value" is required', code: 'MISSING_VALUE' },
        { status: 400 }
      );
    }

    let result: Record<string, unknown>;

    if (type === 'lifePath') {
      const reading = calculateLifePath(value);
      result = { type, ...reading };
    } else if (type === 'destiny') {
      const reading = calculateDestiny(value);
      result = { type, ...reading };
    } else {
      const reading = calculateSoulUrge(value);
      result = { type, ...reading };
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Numerology calculation failed: ${message}` },
      { status: 500 }
    );
  }
}
