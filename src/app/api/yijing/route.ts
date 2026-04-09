import { NextRequest, NextResponse } from 'next/server';
import yijing, { enrichHexagram } from '@/lib/yijing';
import { interpretYiJing, type ReportResponse } from '@/lib/ai-interpreter';
import type { YiJingData } from '@/lib/ai-prompts';
import { filterSensitiveContent, addDisclaimer } from '@/lib/content-moderation';

interface LineInterpretation {
  position: number;
  value: number;
  meaning: string;
  meaningEn: string;
  isChanging: boolean;
  isYang: boolean;
}

interface HexagramResponse {
  number: number;
  name: string;
  pinyin: string;
  english: string;
  aboveName: string;
  belowName: string;
  aboveEn: string;
  belowEn: string;
  judgement: string;
  judgementEn: string;
  judgementZh: string;
  image: string;
  imageZh: string;
  imageEn: string;
  changingLines: Array<{
    line: number;
    value: number;
    isYang: boolean;
    isChanging: boolean;
    meaning: string;
    meaningEn: string;
  }>;
}

// GET /api/yijing - Get all hexagrams or a specific one
// GET /api/yijing?number=1 - Get specific hexagram by number
// GET /api/yijing?hexagram=鼎 - Get specific hexagram by name
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const numberStr = searchParams.get('number');
  const hexagramName = searchParams.get('hexagram');

  if (numberStr || hexagramName) {
    let hexagram;
    if (numberStr) {
      const number = parseInt(numberStr, 10);
      if (isNaN(number) || number < 1 || number > 64) {
        return NextResponse.json(
          { error: 'Hexagram number must be between 1 and 64.' },
          { status: 400 },
        );
      }
      hexagram = yijing.getHexagramByNumber(number);
    } else {
      // Search by name (Chinese, pinyin, or English)
      const all = yijing.HEXAGRAMS;
      hexagram = all.find(
        h =>
          h.name === hexagramName ||
          h.pinyin.toLowerCase() === hexagramName?.toLowerCase() ||
          h.english.toLowerCase() === hexagramName?.toLowerCase(),
      );
    }

    if (!hexagram) {
      return NextResponse.json(
        { error: 'Hexagram not found.' },
        { status: 404 },
      );
    }

    const enriched = enrichHexagram(hexagram, [7, 7, 7, 7, 7, 7]);

    return NextResponse.json({
      hexagram: enriched,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
      },
    });
  }

  // Return all hexagrams (abbreviated form)
  return NextResponse.json({
    hexagrams: yijing.HEXAGRAMS.map(h => ({
      number: h.number,
      name: h.name,
      pinyin: h.pinyin,
      english: h.english,
      above: h.above,
      below: h.below,
      aboveName: yijing.TRIGRAMS[h.above]?.name || '',
      belowName: yijing.TRIGRAMS[h.below]?.name || '',
    })),
    count: yijing.HEXAGRAMS.length,
    meta: {
      platform: 'TianJi Global | 天机全球',
      version: '1.0.0',
    },
  });
}

// POST /api/yijing - Cast a new hexagram using three-coins method
// Body: { language?: string, enhanceWithAI?: boolean, question?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      language = 'zh',
      enhanceWithAI = false,
      question,
      gender,
    } = body;

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

    const rawResult = yijing.castHexagram() as any;
    const enriched = rawResult.hexagram as HexagramResponse;
    const lines = rawResult.lines as number[];
    const hasChangingLines = rawResult.hasChangingLines as boolean;

    // Build hexagram response
    const hexagramResponse: HexagramResponse = {
      number: enriched.number,
      name: enriched.name,
      pinyin: enriched.pinyin,
      english: enriched.english,
      aboveName: enriched.aboveName,
      belowName: enriched.belowName,
      aboveEn: enriched.aboveEn,
      belowEn: enriched.belowEn,
      judgement: enriched.judgement,
      judgementEn: enriched.judgementEn,
      judgementZh: enriched.judgementZh,
      image: enriched.image,
      imageZh: enriched.judgementZh,
      imageEn: enriched.imageEn,
      changingLines: enriched.changingLines,
    };

    // Build line interpretations
    const lineInterpretations: LineInterpretation[] = lines.map((line: number, index: number) => {
      const cl = enriched.changingLines[index];
      const isYang = line === 7 || line === 9;
      return {
        position: index + 1,
        value: line,
        meaning: cl?.meaning || '',
        meaningEn: cl?.meaningEn || (isYang ? 'Yang' : 'Yin'),
        isChanging: line === 6 || line === 9,
        isYang,
      };
    });

    const response: Record<string, unknown> = {
      hexagram: hexagramResponse,
      lines: lineInterpretations,
      hasChangingLines,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
        method: 'three-coins',
      },
    };

    // AI interpretation
    if (enhanceWithAI) {
      try {
        const lang = language.startsWith('zh') ? 'zh' : 'en';

        const yiJingData: YiJingData = {
          hexagram: {
            number: enriched.number,
            name: enriched.name,
            nameEn: enriched.pinyin, // pinyin as nameEn
            above: enriched.aboveName,
            below: enriched.belowName,
            judgement: enriched.judgement || enriched.judgementZh,
            judgementEn: enriched.judgementEn,
            image: enriched.judgementZh,
            imageEn: enriched.imageEn,
            changingLines: enriched.changingLines.map(cl => ({
              line: cl.line,
              isYang: cl.isYang,
              meaning: cl.meaning,
              meaningEn: cl.meaningEn,
            })),
          },
          question,
          gender,
        };

        const { aiInterpretation, disclaimer, report } = await interpretYiJing(yiJingData, lang);
        response.aiInterpretation = addDisclaimer(aiInterpretation, 'yijing');
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
    return NextResponse.json(
      { error: `Divination failed: ${message}` },
      { status: 500 },
    );
  }
}
