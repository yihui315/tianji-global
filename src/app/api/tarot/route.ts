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
import { filterSensitiveContent, addDisclaimer } from '@/lib/content-moderation';
import { generateTianjiModelResponse } from '@/lib/tianji-model-gateway';

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

function buildTarotSystemPrompt(language: 'en' | 'zh'): string {
  const answerLanguage =
    language === 'zh'
      ? 'Answer in Simplified Chinese.'
      : 'Answer in English.';

  return [
    'You are TianJi Love, a careful tarot relationship reflection guide.',
    answerLanguage,
    'Interpret the spread as reflective relationship patterns, not guaranteed future prediction.',
    'Use grounded, practical language.',
    'Do not claim certainty, guarantee outcomes, or use fear-based payment urgency.',
  ].join(' ');
}

function buildTarotPrompt(params: {
  spread: SpreadLayout;
  drawnCards: DrawnCard[];
  question?: string;
  gender?: string;
  language: 'en' | 'zh';
}): string {
  const { spread, drawnCards, question, gender, language } = params;
  const lines = [
    `Spread: ${spread.name}`,
    question ? `Question: ${question}` : 'Question: no specific question was provided.',
    gender ? `Gender context: ${gender}` : undefined,
    '',
    'Cards:',
    ...drawnCards.map((drawn) => {
      const position = language === 'zh' ? drawn.positionNameChinese : drawn.positionName;
      const orientation = drawn.isReversed
        ? language === 'zh' ? '逆位' : 'Reversed'
        : language === 'zh' ? '正位' : 'Upright';
      return `${drawn.position}. ${position}: ${drawn.card.name} (${orientation}) - ${drawn.interpretation}`;
    }),
  ];

  return lines.filter((line): line is string => Boolean(line)).join('\n');
}

function toTarotAiMeta(response: Awaited<ReturnType<typeof generateTianjiModelResponse>>) {
  return {
    provider: response.audit.provider,
    model: response.audit.model,
    fallbackUsed: response.audit.fallback,
    safetyRewritten: response.audit.safetyRewriteApplied,
    latencyMs: response.audit.latencyMs,
    route: 'tarot_draw' as const,
  };
}

function buildDisclaimer(language: 'en' | 'zh') {
  return language === 'zh'
    ? 'AI塔罗解读仅供娱乐和自我反思，不构成专业心理、医疗、法律或财务建议。'
    : 'AI tarot readings are for entertainment and self-reflection only, not professional psychological, medical, legal, or financial advice.';
}

// POST handler for tarot readings
export async function POST(req: NextRequest) {
  try {
    const body: TarotReadingRequest = await req.json();
    const { spreadType, question, language = 'en', enhanceWithAI = false, gender } = body;

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

    const spreadMap: Record<string, number> = {
      single: 0,
      'three-card': 1,
      'celtic-cross': 2,
    };
    const spread = spreadLayouts[spreadMap[spreadType]];

    if (question) {
      const check = filterSensitiveContent(question);
      if (!check.safe) {
        return NextResponse.json(
          { error: 'Content flagged', code: 'CONTENT_FLAGGED' },
          { status: 400 },
        );
      }
    }

    const shuffled = shuffleDeck();
    const { cards, isReversed } = drawCards(shuffled, spread.cardCount);

    const drawnCards: DrawnCard[] = cards.map((card, index) => {
      const position = spread.positions[index];
      return {
        card,
        isReversed: isReversed[index],
        position: index + 1,
        positionName: position.name,
        positionNameChinese: position.nameChinese,
        interpretation: interpretCard(card, isReversed[index], language),
      };
    });

    const response: Record<string, unknown> = {
      spread,
      question,
      drawnCards,
      totalCards: 78,
      language,
      meta: {
        platform: 'TianJi Global',
        version: '1.0.0',
        method: 'shuffled-deck',
      },
    };

    if (enhanceWithAI) {
      try {
        const lang = language.startsWith('zh') ? 'zh' : 'en';
        const report = await generateTianjiModelResponse({
          intent: 'tarot_draw',
          prompt: buildTarotPrompt({ spread, drawnCards, question, gender, language: lang }),
          systemPrompt: buildTarotSystemPrompt(lang),
          responseFormat: 'text',
          maxTokens: 850,
          temperature: 0.65,
        });
        response.aiInterpretation = addDisclaimer(report.content.trim(), 'tarot');
        response.disclaimer = buildDisclaimer(lang);
        response.aiMeta = toTarotAiMeta(report);
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
        const lang = language.startsWith('zh') ? 'zh' : 'en';
        const spread = spreadLayouts[0];
        const drawnCards: DrawnCard[] = [{
          card,
          isReversed,
          position: 1,
          positionName: 'Card of the Day',
          positionNameChinese: '今日',
          interpretation,
        }];
        const report = await generateTianjiModelResponse({
          intent: 'tarot_draw',
          prompt: buildTarotPrompt({ spread, drawnCards, language: lang }),
          systemPrompt: buildTarotSystemPrompt(lang),
          responseFormat: 'text',
          maxTokens: 650,
          temperature: 0.65,
        });
        response.aiInterpretation = addDisclaimer(report.content.trim(), 'tarot');
        response.disclaimer = buildDisclaimer(lang);
        response.aiMeta = toTarotAiMeta(report);
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
