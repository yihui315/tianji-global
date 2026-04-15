/**
 * Share Card API
 *
 * POST /api/share/card
 * Body: {
 *   fortuneType: string,
 *   title: string,
 *   subtitle?: string,
 *   score?: number,
 *   element?: string,
 *   date?: string,
 *   style?: string,
 *   language?: 'zh' | 'en'
 * }
 *
 * Returns: PNG image as binary
 */

import { NextRequest, NextResponse } from 'next/server';

const CARD_STYLES: Record<string, {
  bg: string;
  accent: string;
  fontFamily: string;
}> = {
  cosmic: {
    bg: 'linear-gradient(135deg, #0a0a1e, #1a1a3e, #2d1b4e)',
    accent: '#A782FF',
    fontFamily: 'serif'
  },
  elegant: {
    bg: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    accent: '#F59E0B',
    fontFamily: 'sans-serif'
  },
  minimal: {
    bg: '#0a0a1e',
    accent: '#EC4899',
    fontFamily: 'monospace'
  },
  gradient: {
    bg: 'linear-gradient(120deg, #7C3AED, #A782FF, #EC4899)',
    accent: '#FFFFFF',
    fontFamily: 'system-ui'
  },
  mystic: {
    bg: 'linear-gradient(180deg, #030014, #1a0a3e)',
    accent: '#10B981',
    fontFamily: 'serif'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fortuneType = 'bazi',
      title = '命盘解读',
      subtitle,
      score,
      element,
      date,
      style = 'cosmic',
      language = 'zh'
    } = body;

    // Canvas rendering (server-side)
    // Note: In production, use a headless browser service like Puppeteer
    // For now, return a placeholder response

    const preset = CARD_STYLES[style] || CARD_STYLES.cosmic;

    const fortuneLabels: Record<string, Record<string, string>> = {
      bazi: { zh: '八字命理', en: 'Ba Zi Fortune' },
      ziwei: { zh: '紫微斗数', en: 'Zi Wei Astrology' },
      tarot: { zh: '塔罗占卜', en: 'Tarot Reading' },
      yijing: { zh: '易经六爻', en: 'Yi Jing' },
      western: { zh: '西方占星', en: 'Western Astrology' }
    };

    const label = fortuneLabels[fortuneType]?.[language] || fortuneLabels.bazi[language];

    // Return card metadata for client-side rendering
    return NextResponse.json({
      success: true,
      cardData: {
        fortuneType,
        title,
        subtitle,
        score,
        element,
        date,
        style,
        language,
        label,
        accentColor: preset.accent,
        generatedAt: new Date().toISOString()
      },
      message: language === 'zh'
        ? '卡片数据已生成，请在客户端渲染'
        : 'Card data generated. Render on client.'
    });

  } catch (error) {
    console.error('Share card API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - return OG image metadata
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fortuneType = searchParams.get('type') || 'bazi';
  const title = searchParams.get('title') || '命盘解读';
  const score = searchParams.get('score');

  return new NextResponse(
    JSON.stringify({
      success: true,
      og: {
        title: `${title} | TianJi Global 天机全球`,
        description: fortuneType === 'bazi'
          ? '八字命理深度解读，探索您的命运密码'
          : '探索命运的奥秘',
        image: `/api/share/card?type=${fortuneType}&title=${encodeURIComponent(title)}&score=${score}`,
        width: 1200,
        height: 630
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}