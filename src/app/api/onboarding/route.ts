/**
 * Onboarding API
 *
 * POST /api/onboarding
 * Body: {
 *   fortuneType: string,
 *   birthday: string,
 *   birthTime: string,
 *   gender: string,
 *   name?: string,
 *   goal: string
 * }
 *
 * Returns: onboarding session with recommended actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateNarrativeScript } from '@/lib/narrative-engine';

interface OnboardingRequest {
  fortuneType: 'bazi' | 'ziwei' | 'tarot' | 'yijing' | 'western' | 'synastry';
  birthday: string;
  birthTime: string;
  gender: 'male' | 'female';
  name?: string;
  goal: string;
  language?: 'zh' | 'en';
}

interface OnboardingRecommendation {
  action: string;
  actionEn: string;
  priority: number;
  reason: string;
  reasonEn: string;
}

// 引导完成后的推荐动作
const FORTUNE_TYPE_RECOMMENDATIONS: Record<string, OnboardingRecommendation[]> = {
  bazi: [
    {
      action: '八字命理深度解读',
      actionEn: 'BaZi Deep Reading',
      priority: 1,
      reason: '基于您的出生信息，生成完整八字命盘',
      reasonEn: 'Generate complete BaZi chart based on your birth info'
    },
    {
      action: '年度运势分析',
      actionEn: 'Yearly Fortune Analysis',
      priority: 2,
      reason: '了解您今年的整体运势和吉凶变化',
      reasonEn: 'Understand your yearly fortune and changes'
    },
    {
      action: '事业发展专项',
      actionEn: 'Career Guidance',
      priority: 3,
      reason: '根据八字分析最适合您的职业方向',
      reasonEn: 'Analyze the best career direction for you'
    }
  ],
  ziwei: [
    {
      action: '紫微斗数命盘',
      actionEn: 'Zi Wei Chart',
      priority: 1,
      reason: '生成您的紫微斗数十二宫命盘',
      reasonEn: 'Generate your Zi Wei 12-palace chart'
    },
    {
      action: '大限流年分析',
      actionEn: 'Transit Analysis',
      priority: 2,
      reason: '分析您的大限和流年运势',
      reasonEn: 'Analyze your major and annual cycles'
    }
  ],
  tarot: [
    {
      action: '今日塔罗指引',
      actionEn: "Today's Tarot",
      priority: 1,
      reason: '获取今日塔罗牌给您的生活指引',
      reasonEn: "Get today's tarot guidance for your life"
    },
    {
      action: '感情塔罗占卜',
      actionEn: 'Love Tarot',
      priority: 2,
      reason: '针对感情问题进行塔罗占卜',
      reasonEn: 'Tarot reading for love questions'
    }
  ],
  yijing: [
    {
      action: '六爻起卦',
      actionEn: 'Yi Jing Divination',
      priority: 1,
      reason: '通过易经六爻为您起卦占卜',
      reasonEn: 'Divination through Yi Jing hexagrams'
    },
    {
      action: '决策指引',
      actionEn: 'Decision Guidance',
      priority: 2,
      reason: '针对您的决策问题提供易经指引',
      reasonEn: 'Yi Jing guidance for your decision'
    }
  ],
  western: [
    {
      action: '星盘分析',
      actionEn: 'Horoscope Analysis',
      priority: 1,
      reason: '生成您的西方星盘和行星相位',
      reasonEn: 'Generate your western horoscope and planetary aspects'
    },
    {
      action: '性格解读',
      actionEn: 'Character Reading',
      priority: 2,
      reason: '深度分析您的星座性格特点',
      reasonEn: 'Deep analysis of your zodiac personality'
    }
  ],
  synastry: [
    {
      action: '合盘分析',
      actionEn: 'Synastry Chart',
      priority: 1,
      reason: '分析您与伴侣的星盘合盘',
      reasonEn: 'Analyze synastry chart with your partner'
    },
    {
      action: '配对指数',
      actionEn: 'Compatibility Score',
      priority: 2,
      reason: '计算您与伴侣的配对指数',
      reasonEn: 'Calculate compatibility score with partner'
    }
  ]
};

const GOAL_MAPPING: Record<string, { scenes: string[], element: string }> = {
  career: {
    scenes: ['career_guidance', 'fortune_telling'],
    element: '木'
  },
  love: {
    scenes: ['relationship_insight', 'fortune_telling'],
    element: '火'
  },
  wealth: {
    scenes: ['fortune_telling', 'daily_tip'],
    element: '金'
  },
  self: {
    scenes: ['fortune_telling', 'yearly_reading'],
    element: '水'
  },
  decision: {
    scenes: ['fortune_telling', 'daily_tip'],
    element: '土'
  }
};

// 模拟会话存储
const onboardingSessions = new Map<string, {
  data: OnboardingRequest;
  createdAt: Date;
  sessionId: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const body: OnboardingRequest = await request.json();
    const {
      fortuneType,
      birthday,
      birthTime,
      gender,
      name,
      goal,
      language = 'zh'
    } = body;

    // Validate required fields
    if (!fortuneType || !birthday || !gender || !goal) {
      return NextResponse.json(
        { error: 'Missing required fields: fortuneType, birthday, gender, goal' },
        { status: 400 }
      );
    }

    // Create session
    const sessionId = `onboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      data: body,
      createdAt: new Date(),
      sessionId
    };
    onboardingSessions.set(sessionId, session);

    // Get recommendations based on fortune type
    const recommendations = FORTUNE_TYPE_RECOMMENDATIONS[fortuneType] || [];

    // Generate welcome narrative based on goal
    const goalInfo = GOAL_MAPPING[goal] || GOAL_MAPPING.self;
    const { script: welcomeScript, meta } = generateNarrativeScript({
      bazi: {
        dayHeavenlyStem: '甲',
        dayMasterElement: goalInfo.element,
        gender,
        year: birthday.split('-')[0],
        month: birthday.split('-')[1],
        day: birthday.split('-')[2],
        hour: birthTime.split(':')[0]
      },
      scene: 'fortune_telling',
      style: 'warm',
      language: language as 'zh' | 'en'
    });

    return NextResponse.json({
      success: true,
      sessionId,
      welcomeMessage: welcomeScript,
      narrativeMeta: meta,
      recommendations,
      nextSteps: {
        primary: recommendations[0]?.action || '开始探索',
        primaryEn: recommendations[0]?.actionEn || 'Start Exploring',
        redirectUrl: `/api/redirect/${fortuneType}?session=${sessionId}`
      },
      displayName: name || (language === 'zh' ? '亲爱的探索者' : 'Dear Explorer')
    });

  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get onboarding session
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId is required' },
      { status: 400 }
    );
  }

  const session = onboardingSessions.get(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: 'Session not found or expired' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    session: {
      id: session.sessionId,
      data: session.data,
      createdAt: session.createdAt,
      age: Math.floor((Date.now() - session.createdAt.getTime()) / 1000)
    }
  });
}