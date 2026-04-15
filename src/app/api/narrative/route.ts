/**
 * Narrative Script API
 *
 * POST /api/narrative
 * Body: {
 *   element: string,         // 木/火/土/金/水
 *   scene: string,           // fortune_telling/yearly_reading/daily_tip/relationship_insight/career_guidance
 *   style?: string,          // poetic/warm/mysterious/philosophical/practical
 *   language?: 'zh' | 'en',
 *   context?: object         // additional context variables
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateNarrativeScript, type NarrativeScene, type NarrativeStyle } from '@/lib/narrative-engine';

const VALID_SCENES: NarrativeScene[] = [
  'fortune_telling', 'yearly_reading', 'daily_tip', 'relationship_insight', 'career_guidance'
];

const VALID_STYLES: NarrativeStyle[] = [
  'poetic', 'warm', 'mysterious', 'philosophical', 'practical'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      element = '木',
      scene = 'fortune_telling',
      style = 'warm',
      language = 'zh',
      context = {}
    } = body;

    // Validate scene
    if (!VALID_SCENES.includes(scene as NarrativeScene)) {
      return NextResponse.json(
        { error: `Invalid scene. Valid options: ${VALID_SCENES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate style
    if (!VALID_STYLES.includes(style as NarrativeStyle)) {
      return NextResponse.json(
        { error: `Invalid style. Valid options: ${VALID_STYLES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate element
    if (!['木', '火', '土', '金', '水'].includes(element)) {
      return NextResponse.json(
        { error: 'Invalid element. Valid options: 木, 火, 土, 金, 水' },
        { status: 400 }
      );
    }

    const result = generateNarrativeScript({
      bazi: {
        dayHeavenlyStem: '甲',
        dayMasterElement: element
      },
      scene: scene as NarrativeScene,
      style: style as NarrativeStyle,
      language: language as 'zh' | 'en',
      additionalContext: context
    });

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Narrative API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for quick narrative generation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const element = searchParams.get('element') || '木';
  const scene = (searchParams.get('scene') || 'fortune_telling') as NarrativeScene;
  const style = (searchParams.get('style') || 'warm') as NarrativeStyle;
  const language = (searchParams.get('language') || 'zh') as 'zh' | 'en';

  try {
    const result = generateNarrativeScript({
      bazi: { dayHeavenlyStem: '甲', dayMasterElement: element },
      scene,
      style,
      language
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}