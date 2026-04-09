import { NextRequest, NextResponse } from 'next/server';
import {
  shuffleDeck,
  drawCards,
  interpretCard,
  getRandomCard,
  spreadLayouts,
  type TarotCard,
  type SpreadLayout,
} from '@/lib/tarot';
import { interpretTarot } from '@/lib/ai-interpreter';
import type { TarotData } from '@/lib/ai-prompts';
import { filterSensitiveContent, addDisclaimer } from '@/lib/content-moderation';

export interface TarotReadingRequest {
  spreadType: 'single' | 'three-card' | 'celtic-cross';
  question?: string;
  language?: 'en' | 'zh';
  enhanceWithAI?: boolean;
  gender?: string;
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
    const { spreadType, question, language = 'en', enhanceWithAI = false, gender } = body;

    // Validate spread type
    const validSpreads = ['single', 'three-card', 'celtic-cross'];
    if (!spreadType || !validSpreads.includes(spreadType)) {
      return NextResponse.json(
        {
          error:
            'Invalid spread type. Must be: single, three-card, or celtic-cross',
        },
        { status: 400 },
      );
    }

    // Get spread layout
    const spreadMap: Record<string, number> = {
      single: 0,
      'three-card': 1,
      'celtic-cross': 2,
    };
    const spread = spreadLayouts[spreadMap[spreadType]];

    // Content safety check
    if (question) {
      const check = filterSensitiveContent(question);
      if (!check.safe) {
        return NextResponse.json(
          { error: 'Content flagged', code: 'CONTENT_FLAGGED' },
          { status: 400 },
        );
      }
    }

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

    const response: Record<string, unknown> = {
      spread,
      question,
      drawnCards,
      totalCards: 78,
      language,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
        method: 'shuffled-deck',
      },
    };

    // AI interpretation
    if (enhanceWithAI) {
      try {
        const tarotData: TarotData = {
          spread: {
            positions: spread.positions.map((p, i) => ({
              name: p.name,
              nameEn: p.nameChinese, // spread name is in Chinese
              description: p.description || p.nameChinese,
            })),
            cards: drawnCards.map(dc => ({
              name: dc.card.name,
              nameEn: dc.card.nameChinese || dc.card.name,
              suit: dc.card.suit,
              arcana: dc.card.arcana,
              uprightMeaning: dc.card.meaning,
              reversedMeaning: dc.card.reversedMeaning,
            })),
          },
          question,
          gender,
        };

        const lang = language.startsWith('zh') ? 'zh' : 'en';
        const { aiInterpretation, disclaimer, report } = await interpretTarot(tarotData, lang);
        response.aiInterpretation = addDisclaimer(aiInterpretation, 'tarot');
        response.disclaimer = disclaimer;
        response.aiMeta = {
          provider: report.provider,
          model: report.model,
          latencyMs: report.latencyMs,
          costUSD: report.costUSD,
        };
      } catch (aiErr) {
        response.aiError =
          aiErr instanceof Error ? aiErr.message : 'AI interpretation failed';
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Tarot reading failed: ${message}` }, { status: 500 });
  }
}

// GET handler for random card of the day
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const language = (searchParams.get('language') as 'en' | 'zh') || 'en';
    const enhanceWithAI = searchParams.get('enhanceWithAI') === 'true';

    const { card, isReversed } = getRandomCard();
    const interpretation = interpretCard(card, isReversed, language);

    const response: Record<string, unknown> = {
      card: {
        ...card,
        // Normalize field names for consistency
        nameEn: card.nameChinese || card.name,
        arcana: card.arcana,
        uprightMeaning: card.meaning,
        reversedMeaning: card.reversedMeaning,
      },
      isReversed,
      interpretation,
      type: 'card-of-the-day',
      language,
    };

    if (enhanceWithAI) {
      try {
        const tarotData: TarotData = {
          spread: {
            positions: [
              { name: '今日', nameEn: 'Card of the Day', description: 'Today\'s energy card' },
            ],
            cards: [
              {
                name: card.name,
                nameEn: card.nameChinese || card.name,
                suit: card.suit,
                arcana: card.arcana,
                uprightMeaning: card.meaning,
                reversedMeaning: card.reversedMeaning,
              },
            ],
          },
        };

        const lang = language.startsWith('zh') ? 'zh' : 'en';
        const { aiInterpretation, disclaimer, report } = await interpretTarot(tarotData, lang);
        response.aiInterpretation = addDisclaimer(aiInterpretation, 'tarot');
        response.disclaimer = disclaimer;
        response.aiMeta = {
          provider: report.provider,
          model: report.model,
          latencyMs: report.latencyMs,
          costUSD: report.costUSD,
        };
      } catch (aiErr) {
        response.aiError =
          aiErr instanceof Error ? aiErr.message : 'AI interpretation failed';
      }
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
