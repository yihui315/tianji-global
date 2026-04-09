import { NextRequest, NextResponse } from 'next/server';
import { getBestElectionalDates } from '@/lib/electional-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, startDate, endDate, birthData, enhanceWithAI } = body;

    if (!eventType || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields: eventType, startDate, endDate' }, { status: 400 });
    }

    const candidates = getBestElectionalDates(
      eventType,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      success: true,
      candidates,
      bestDate: candidates[0] || null,
      eventType,
    });
  } catch (error) {
    console.error('Electional error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Electoral Astrology API',
    description: 'Find the most auspicious dates for specific events',
    routes: {
      POST: {
        eventType: 'business_launch | marriage | travel | surgery | legal | education',
        startDate: 'YYYY-MM-DD',
        endDate: 'YYYY-MM-DD',
        birthData: '(optional) BaZi birth data for personalization',
        enhanceWithAI: '(optional) AI interpretation',
      },
    },
  });
}
