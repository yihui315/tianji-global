import { NextRequest, NextResponse } from 'next/server';
import { getBestElectionalDates, getHourlyBreakdown } from '@/lib/electional-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, startDate, endDate, birthData } = body;

    if (!eventType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, startDate, endDate' },
        { status: 400 }
      );
    }

    const validEventTypes = ['business_launch', 'marriage', 'travel', 'surgery', 'legal', 'education'];
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: `eventType must be one of: ${validEventTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const candidates = getBestElectionalDates(
      eventType,
      new Date(startDate),
      new Date(endDate)
    );

    // Get hourly breakdown for the top candidate
    let hourlyBreakdown = null;
    if (candidates.length > 0) {
      hourlyBreakdown = getHourlyBreakdown(candidates[0].date);
    }

    return NextResponse.json({
      success: true,
      candidates,
      bestDate: candidates[0] || null,
      hourlyBreakdown,
      eventType,
    });
  } catch (error) {
    console.error('Electional error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Electional Astrology API',
    description: 'Find the most auspicious dates for specific events using real ephemeris',
    routes: {
      POST: {
        eventType: 'business_launch | marriage | travel | surgery | legal | education',
        startDate: 'YYYY-MM-DD',
        endDate: 'YYYY-MM-DD (max 90 days)',
        birthData: '(optional) BaZi birth data for personalization',
      },
    },
  });
}
