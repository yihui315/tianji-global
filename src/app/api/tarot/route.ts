import { NextRequest, NextResponse } from 'next/server';
import {
  shuffleDeck,
  drawCards,
  interpretCard,
  getRandomCard,
  spreadLayouts,
  type TarotCard,
  type SpreadLayout
} from '@/lib/tarot';

export interface TarotReadingRequest {
  spreadType: 'single' | 'three-card' | 'celtic-cross';
  question?: string;
  language?: 'en' | 'zh';
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: number;
  positionName: string;
  positionNameChinese: string;
  interpretation: string;
}

export interface TarotReadingResponse {
  spread: SpreadLayout;
  question?: string;
  drawnCards: DrawnCard[];
  totalCards: number;
  language: 'en' | 'zh';
}

// POST handler for tarot readings
export async function POST(req: NextRequest) {
  try {
    const body: TarotReadingRequest = await req.json();
    const { spreadType, question, language = 'en' } = body;

    // Validate spread type
    const validSpreads = ['single', 'three-card', 'celtic-cross'];
    if (!spreadType || !validSpreads.includes(spreadType)) {
      return NextResponse.json(
        { error: 'Invalid spread type. Must be: single, three-card, or celtic-cross' },
        { status: 400 }
      );
    }

    // Get spread layout
    const spreadMap: Record<string, number> = {
      'single': 0,
      'three-card': 1,
      'celtic-cross': 2,
    };
    const spread = spreadLayouts[spreadMap[spreadType]];

    // Shuffle deck and draw cards
    const shuffled = shuffleDeck();
    const { cards, isReversed } = drawCards(shuffled, spread.cardCount);

    // Format drawn cards with interpretations
    const drawnCards: DrawnCard[] = cards.map((card, index) => ({
      card,
      isReversed: isReversed[index],
      position: index + 1,
      positionName: spread.positions[index].name,
      positionNameChinese: spread.positions[index].nameChinese,
      interpretation: interpretCard(card, isReversed[index], language),
    }));

    const response: TarotReadingResponse = {
      spread,
      question,
      drawnCards,
      totalCards: 78,
      language,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET handler for random card of the day
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const language = (searchParams.get('language') as 'en' | 'zh') || 'en';

    const { card, isReversed } = getRandomCard();
    const interpretation = interpretCard(card, isReversed, language);

    return NextResponse.json({
      card,
      isReversed,
      interpretation,
      type: 'card-of-the-day',
      language,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
