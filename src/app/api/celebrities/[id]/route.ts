import { NextRequest, NextResponse } from 'next/server';
import { celebrities } from '@/data/celebrities';
import { calculateBaZi } from '@/lib/bazi';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const celeb = celebrities.find(c => c.id === id);
  if (!celeb) {
    return NextResponse.json({ error: 'Celebrity not found' }, { status: 404 });
  }

  const [year, month, day] = celeb.birthDate.split('-').map(Number);
  const [hour, minute] = celeb.birthTime.split(':').map(Number);
  const chart = calculateBaZi({ year, month, day, hour });

  return NextResponse.json({ ...celeb, chart });
}
