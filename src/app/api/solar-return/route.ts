import { NextRequest, NextResponse } from 'next/server';
import { calculateSolarReturn } from '@/lib/solar-return';

// ─── Types ─────────────────────────────────────────────────────────────────

interface SolarReturnRequest {
  birthDate: string;      // YYYY-MM-DD
  birthTime: string;      // HH:MM
  lat: number;            // birth latitude
  lng: number;            // birth longitude
  targetYear: number;     // year for Solar Return calculation
}

// ─── Route Handler ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: SolarReturnRequest = await request.json();
    const { birthDate, birthTime, lat, lng, targetYear } = body;

    // Validate required fields
    if (!birthDate || !birthTime || !targetYear) {
      return NextResponse.json(
        { error: 'birthDate, birthTime, and targetYear are required.' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      return NextResponse.json(
        { error: 'birthDate must be in YYYY-MM-DD format.' },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;
    if (!timeRegex.test(birthTime)) {
      return NextResponse.json(
        { error: 'Time must be in HH:MM or HH:MM:SS format.' },
        { status: 400 }
      );
    }

    // Validate target year
    if (typeof targetYear !== 'number' || targetYear < 1900 || targetYear > 2100) {
      return NextResponse.json(
        { error: 'targetYear must be a number between 1900 and 2100.' },
        { status: 400 }
      );
    }

    // Calculate Solar Return
    const result = calculateSolarReturn(birthDate, birthTime, lat, lng, targetYear);

    // Format response
    const response = {
      birthDate,
      birthTime,
      targetYear,
      birthdayExactTime: result.birthdayExactTime,
      birthdayExactJulianDay: result.birthdayExactJulianDay,
      birthSunLongitude: result.birthSunLongitude,
      chart: {
        planets: result.chart.planets.map(p => ({
          name: p.name,
          longitude: p.longitude,
          latitude: p.latitude,
          sign: p.sign,
          signName: p.signName,
          signSymbol: p.signSymbol,
          degree: p.degree,
          orb: p.orb,
        })),
        houses: {
          houses: result.chart.houses.houses,
          ascendant: result.chart.houses.ascendant,
          midheaven: result.chart.houses.midheaven,
        },
        julianDay: result.chart.julianDay,
      },
      interpretation: result.interpretation,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
        calculationType: 'Solar Return (太阳返照)',
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('Solar Return API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for simple Solar Return time calculation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const birthDate = searchParams.get('birthDate');
    const birthTime = searchParams.get('birthTime') ?? '12:00';
    const targetYearStr = searchParams.get('targetYear');

    if (!birthDate || !targetYearStr) {
      return NextResponse.json(
        { error: 'birthDate and targetYear parameters are required.' },
        { status: 400 }
      );
    }

    const targetYear = parseInt(targetYearStr, 10);
    if (isNaN(targetYear) || targetYear < 1900 || targetYear > 2100) {
      return NextResponse.json(
        { error: 'targetYear must be a valid year between 1900 and 2100.' },
        { status: 400 }
      );
    }

    // Default location (can be overridden with lat/lng params)
    const lat = parseFloat(searchParams.get('lat') ?? '35.6762');
    const lng = parseFloat(searchParams.get('lng') ?? '139.6503');

    const result = calculateSolarReturn(birthDate, birthTime, lat, lng, targetYear);

    return NextResponse.json({
      birthDate,
      birthTime,
      targetYear,
      birthdayExactTime: result.birthdayExactTime,
      birthSunLongitude: result.birthSunLongitude,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
      },
    });
  } catch (err) {
    console.error('Solar Return GET error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
