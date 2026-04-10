import { NextRequest, NextResponse } from 'next/server';
import { computeSecondaryProgression, analyzePlanetaryMotion, generateTransitReport } from '@/lib/transit-engine';

// ─── Types ─────────────────────────────────────────────────────────────────

interface TransitRequest {
  birthDate: string;      // YYYY-MM-DD
  birthTime: string;       // HH:MM
  lat: number;             // birth latitude
  lng: number;             // birth longitude
  targetDate: string;      // YYYY-MM-DD
  includeMotion?: boolean;  // include detailed motion analysis
  includeInterpretation?: boolean;
}

// ─── Route Handler ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: TransitRequest = await request.json();
    const { birthDate, birthTime, lat, lng, targetDate, includeMotion = true, includeInterpretation = true } = body;

    // Validate required fields
    if (!birthDate || !birthTime || !targetDate) {
      return NextResponse.json(
        { error: 'birthDate, birthTime, and targetDate are required.' },
        { status: 400 }
      );
    }

    // Validate date formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate) || !dateRegex.test(targetDate)) {
      return NextResponse.json(
        { error: 'Dates must be in YYYY-MM-DD format.' },
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

    // Generate transit report
    const report = generateTransitReport(birthDate, birthTime, lat, lng, targetDate);

    const response: Record<string, unknown> = {
      birthDate,
      birthTime,
      targetDate,
      age: report.progression.age,
      progressedDays: report.progression.progressedDays,
      planets: report.progression.planets.map(p => ({
        name: p.name,
        longitude: p.progressedLongitude,
        natalLongitude: p.natalLongitude,
        sign: p.sign,
        signName: p.signName,
        signSymbol: p.signSymbol,
        degree: p.degree,
        motion: p.motion,
        speed: p.speed,
        isRetrograde: p.isRetrograde,
      })),
      majorTransits: report.majorTransits,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
        calculationType: 'Secondary Progressions (1 day = 1 year)',
      },
    };

    // Include motion analysis if requested
    if (includeMotion) {
      response.motionAnalysis = report.motionAnalysis;
    }

    // Include AI interpretation if requested
    if (includeInterpretation) {
      response.interpretation = report.progression.interpretation;
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error('Transit API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for simple motion status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const time = searchParams.get('time') ?? '12:00';

    if (!date) {
      return NextResponse.json(
        { error: 'date parameter is required (YYYY-MM-DD).' },
        { status: 400 }
      );
    }

    const motionAnalysis = analyzePlanetaryMotion(date, time);

    return NextResponse.json({
      date,
      time,
      planets: motionAnalysis,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
      },
    });
  } catch (err) {
    console.error('Transit GET error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
