/**
 * BaZi 多轮对话 API
 *
 * POST /api/bazi-chat
 * Body: {
 *   message: string,
 *   sessionId?: string,
 *   birthDate: string,
 *   birthTime: string,
 *   gender?: string,
 *   language?: 'zh' | 'en'
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, generateBaziInterpretation, type ChatSession } from '@/lib/bazi-ai';

// 模拟会话存储（生产环境应使用Redis或数据库）
const sessions = new Map<string, ChatSession>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, birthDate, birthTime, gender, language = 'zh' } = body;

    if (!message || !birthDate || !birthTime) {
      return NextResponse.json(
        { error: 'message, birthDate, birthTime are required' },
        { status: 400 }
      );
    }

    // 获取或创建会话
    let session: ChatSession;
    if (sessionId && sessions.has(sessionId)) {
      session = sessions.get(sessionId)!;
    } else {
      // 创建新会话
      const newSessionId = `bazi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      session = {
        id: newSessionId,
        messages: [],
        baziData: { birthDate, birthTime, gender, language },
        createdAt: new Date()
      };
      sessions.set(newSessionId, session);

      // 生成初始解读
      const initialInterpretation = generateBaziInterpretation(
        { dayHeavenlyStem: '木', dayMasterElement: '木', name: '用户' },
        language
      );
      session.messages.push({
        role: 'assistant',
        content: initialInterpretation
      });
    }

    // 添加用户消息
    session.messages.push({ role: 'user', content: message });

    // 生成AI回复
    const response = generateChatResponse(message, session);

    // 添加AI回复
    session.messages.push({ role: 'assistant', content: response });

    // 更新会话
    sessions.set(session.id, session);

    return NextResponse.json({
      sessionId: session.id,
      reply: response,
      history: session.messages.slice(-10), // 返回最近10条对话
      tips: [
        '💼 事业发展',
        '❤️ 感情运势',
        '💰 财富积累',
        '🏥 健康建议',
        '🔮 What-If情境'
      ]
    });

  } catch (error) {
    console.error('BaZi chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 获取会话历史
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({
    sessionId: session.id,
    history: session.messages,
    createdAt: session.createdAt
  });
}
