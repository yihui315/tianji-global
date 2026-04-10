import { NextRequest, NextResponse } from 'next/server';
import { findTopCelebrityMatches } from '@/lib/celebrity-matcher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthTime, lat, lng } = body;

    if (!birthDate || !birthTime) {
      return NextResponse.json(
        { error: 'birthDate and birthTime are required' },
        { status: 400 }
      );
    }

    // Default coordinates: if not provided, use a reasonable default (e.g., Beijing)
    const userLat = typeof lat === 'number' ? lat : 39.9042;
    const userLng = typeof lng === 'number' ? lng : 116.4074;

    const matches = findTopCelebrityMatches(
      birthDate,
      birthTime,
      userLat,
      userLng,
      3
    );

    return NextResponse.json({
      matches,
      userInput: { birthDate, birthTime, lat: userLat, lng: userLng },
    });
  } catch (err) {
    console.error('[celebrity-match]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
