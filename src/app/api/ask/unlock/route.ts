import { NextRequest, NextResponse } from 'next/server';
import {
  createPayPerUseCheckout,
  verifyPayPerUseUnlock,
  type PayPerUseConfig,
} from '@/lib/pay-per-use-unlock';
import { ASK_QUESTION_UNLOCK_PRICE_USD_CENTS } from '@/lib/ask-question';

export const dynamic = 'force-dynamic';

const ASK_UNLOCK_CONFIG: PayPerUseConfig = {
  kind: 'ask',
  priceCents: ASK_QUESTION_UNLOCK_PRICE_USD_CENTS,
  productName: {
    en: 'TianJi Oracle - Complete decision reading',
    zh: '天机综合解读 - 单题完整解锁',
  },
  productDescription: {
    en: 'Unlock the full decision reading for this one request. One-time payment. No subscription.',
    zh: '解锁本次问题的完整解读。一次性付费，无需订阅。',
  },
  returnPath: '/ask',
};

export async function POST(request: NextRequest) {
  try {
    return await createPayPerUseCheckout(request, ASK_UNLOCK_CONFIG);
  } catch (error) {
    console.error('[api/ask/unlock] checkout error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await verifyPayPerUseUnlock(request, ASK_UNLOCK_CONFIG);
    if (result.response) {
      return result.response;
    }

    if (result.record.kind !== 'ask') {
      return NextResponse.json({ error: 'Invalid preview type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      unlocked: true,
      data: {
        question: result.record.question,
        language: result.record.language,
        fullAnswer: result.record.fullAnswer,
        model: result.record.usage.model,
        provider: result.record.usage.provider,
      },
    });
  } catch (error) {
    console.error('[api/ask/unlock] verify error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Unable to verify payment' }, { status: 500 });
  }
}
