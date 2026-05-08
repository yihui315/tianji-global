import { NextRequest, NextResponse } from 'next/server';
import {
  createPayPerUseCheckout,
  verifyPayPerUseUnlock,
  type PayPerUseConfig,
} from '@/lib/pay-per-use-unlock';
import { QUICK_DRAW_UNLOCK_PRICE_USD_CENTS } from '@/lib/quick-draw';

export const dynamic = 'force-dynamic';

const DRAW_UNLOCK_CONFIG: PayPerUseConfig = {
  kind: 'draw',
  priceCents: QUICK_DRAW_UNLOCK_PRICE_USD_CENTS,
  productName: {
    en: 'TianJi Three Cards - Full reading unlock',
    zh: '天机三张牌 - 完整解读解锁',
  },
  productDescription: {
    en: 'Unlock the full reading for the three cards drawn for this request. One-time payment. No subscription.',
    zh: '解锁本次三张牌的完整解读。一次性付费，无需订阅。',
  },
  returnPath: '/draw',
};

export async function POST(request: NextRequest) {
  try {
    return await createPayPerUseCheckout(request, DRAW_UNLOCK_CONFIG);
  } catch (error) {
    console.error('[api/draw/unlock] checkout error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await verifyPayPerUseUnlock(request, DRAW_UNLOCK_CONFIG);
    if (result.response) {
      return result.response;
    }

    if (result.record.kind !== 'draw') {
      return NextResponse.json({ error: 'Invalid preview type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      unlocked: true,
      data: {
        question: result.record.question,
        language: result.record.language,
        draw: result.record.draw,
        fullReading: result.record.fullReading,
        model: result.record.usage.model,
        provider: result.record.usage.provider,
      },
    });
  } catch (error) {
    console.error('[api/draw/unlock] verify error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Unable to verify payment' }, { status: 500 });
  }
}
