import { NextRequest, NextResponse } from 'next/server';
import yijing from '@/lib/yijing';

interface Hexagram {
  number: number;
  name: string;
  pinyin: string;
  english: string;
  judgment: string;
}

// GET /api/yijing - Get all hexagrams or a specific one
// GET /api/yijing?number=1 - Get specific hexagram by number
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const numberStr = searchParams.get('number');

  if (numberStr) {
    const number = parseInt(numberStr, 10);
    if (isNaN(number) || number < 1 || number > 64) {
      return NextResponse.json(
        { error: 'Hexagram number must be between 1 and 64.' },
        { status: 400 },
      );
    }

    const hexagram = yijing.getHexagramByNumber(number);
    if (!hexagram) {
      return NextResponse.json(
        { error: `Hexagram ${number} not found.` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      hexagram,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
      },
    });
  }

  // Return all hexagrams
  return NextResponse.json({
    hexagrams: yijing.HEXAGRAMS,
    count: yijing.HEXAGRAMS.length,
    meta: {
      platform: 'TianJi Global | 天机全球',
      version: '1.0.0',
    },
  });
}

// POST /api/yijing - Cast a new hexagram using three-coins method
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { language = 'zh' } = body;

    const result = yijing.castHexagram();
    const { hexagram, lines, hasChangingLines } = result;

    // Add Chinese names to response
    const hexagramWithDetails = {
      ...hexagram,
      lines,
      hasChangingLines,
    };

    // Build interpretation based on language
    const lineInterpretations = lines.map((line, index) => {
      const lineNum = index + 1;
      let meaning: string;
      if (line === 6) meaning = language === 'zh' ? '老阴 - 动' : 'Old Yin - Changing';
      else if (line === 7) meaning = language === 'zh' ? '少阳' : 'Young Yang';
      else if (line === 8) meaning = language === 'zh' ? '少阴' : 'Young Yin';
      else if (line === 9) meaning = language === 'zh' ? '老阳 - 动' : 'Old Yang - Changing';
      else meaning = '';

      return {
        position: lineNum,
        value: line,
        meaning,
        isChanging: line === 6 || line === 9,
      };
    });

    return NextResponse.json({
      hexagram: hexagramWithDetails,
      lines: lineInterpretations,
      hasChangingLines,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
        method: 'three-coins',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error during divination.' },
      { status: 500 },
    );
  }
}
