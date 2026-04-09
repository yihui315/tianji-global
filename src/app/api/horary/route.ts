import { NextRequest, NextResponse } from 'next/server';
import { castHoraryChart, evaluateQuestion } from '@/lib/horary-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, enhanceWithAI } = body;

    if (!question || question.trim().length < 3) {
      return NextResponse.json({ error: 'A meaningful question is required' }, { status: 400 });
    }

    const castTime = new Date();
    const chart = castHoraryChart(question, castTime);
    const judgment = evaluateQuestion(question, chart);

    return NextResponse.json({
      success: true,
      chart,
      judgment,
      castTime: castTime.toISOString(),
      question,
    });
  } catch (error) {
    console.error('Horary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Horary Astrology API',
    description: 'Cast a chart for the exact moment a question is asked',
    routes: {
      POST: {
        question: 'Your question (min 3 characters)',
        enhanceWithAI: '(optional) Get AI-enhanced interpretation',
      },
    },
  });
}
