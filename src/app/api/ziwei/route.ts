import { NextRequest, NextResponse } from 'next/server';
import { generateBySolar, generateByLunar, type BirthdayType, type Gender, type Language } from '@/lib/ziwei-engine';

/**
 * GET /api/ziwei
 *
 * Query parameters:
 *   birthday     — YYYY-MM-DD date string
 *   birthTime    — 0-12 (时辰 index)
 *   gender       — "male" | "female"
 *   birthdayType — "solar" | "lunar" (default: "solar")
 *   leapMonth    — "true" | "false" (default: "false")
 *   language     — "zh-CN" | "zh-TW" | "en-US" | "ja" | "ko" | "vi" (default: "zh-CN")
 *
 * Returns:
 *   JSON ZiweiChart from ziwei-engine
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const birthday = searchParams.get('birthday');
  const birthTimeStr = searchParams.get('birthTime');
  const gender = searchParams.get('gender') as Gender | null;
  const birthdayType = (searchParams.get('birthdayType') || 'solar') as BirthdayType;
  const leapMonth = searchParams.get('leapMonth') === 'true';
  const language = (searchParams.get('language') || 'zh-CN') as Language;

  // Validate required fields
  if (!birthday) {
    return NextResponse.json(
      { error: 'Missing required parameter: birthday' },
      { status: 400 },
    );
  }
  if (!birthTimeStr) {
    return NextResponse.json(
      { error: 'Missing required parameter: birthTime' },
      { status: 400 },
    );
  }
  if (!gender) {
    return NextResponse.json(
      { error: 'Missing required parameter: gender' },
      { status: 400 },
    );
  }

  const birthTime = parseInt(birthTimeStr, 10);
  if (isNaN(birthTime) || birthTime < 0 || birthTime > 12) {
    return NextResponse.json(
      { error: 'Invalid birthTime. Must be an integer between 0 and 12.' },
      { status: 400 },
    );
  }
  if (gender !== 'male' && gender !== 'female') {
    return NextResponse.json(
      { error: 'Invalid gender. Must be "male" or "female".' },
      { status: 400 },
    );
  }

  try {
    let chart;
    if (birthdayType === 'lunar') {
      chart = generateByLunar({
        birthday,
        birthTime,
        gender,
        leapMonth,
        language,
      });
    } else {
      chart = generateBySolar({
        birthday,
        birthTime,
        gender,
        leapMonth,
        language,
      });
    }

    return NextResponse.json(chart, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Ziwei calculation failed: ${message}` },
      { status: 500 },
    );
  }
}
