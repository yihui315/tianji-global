/**
 * Knowledge Base API — TianJi Global
 *
 * GET /api/kb?service=bazi|ziwei|yijing
 * Returns KB entry count and metadata for the requested service type.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  STEM_MEANINGS,
  BRANCH_MEANINGS,
  JIAZI_COMBINATIONS,
  ELEMENT_CYCLE,
  buildBaZiCorpus,
} from '@/data/bazi-knowledge-base';
import {
  PALACE_MEANINGS,
  STAR_MEANINGS,
  MINGZHU_COMBINATIONS,
  buildZiweiCorpus,
} from '@/data/ziwei-knowledge-base';

type ServiceType = 'bazi' | 'ziwei' | 'yijing';

function getKBMetadata(serviceType: ServiceType) {
  switch (serviceType) {
    case 'bazi': {
      const corpus = buildBaZiCorpus();
      return {
        serviceType: 'bazi' as const,
        entryCount: {
          stems: STEM_MEANINGS.length,
          branches: BRANCH_MEANINGS.length,
          jiazi: JIAZI_COMBINATIONS.length,
          elements: ELEMENT_CYCLE.length,
          total: STEM_MEANINGS.length + BRANCH_MEANINGS.length + JIAZI_COMBINATIONS.length + ELEMENT_CYCLE.length,
        },
        corpusLines: corpus.length,
        lastUpdated: '2024-01-01',
        description: 'BaZi (八字) Four Pillars of Destiny knowledge base — stems, branches, 60 JiaZi combinations, and Wu Xing element cycle.',
      };
    }
    case 'ziwei': {
      const corpus = buildZiweiCorpus();
      return {
        serviceType: 'ziwei' as const,
        entryCount: {
          palaces: PALACE_MEANINGS.length,
          stars: STAR_MEANINGS.length,
          mingzhuCombinations: MINGZHU_COMBINATIONS.length,
          total: PALACE_MEANINGS.length + STAR_MEANINGS.length + MINGZHU_COMBINATIONS.length,
        },
        corpusLines: corpus.length,
        lastUpdated: '2024-01-01',
        description: 'Zi Wei Dou Shu (紫微斗数) Purple Star Astrology knowledge base — 12 palaces, stellar meanings, and Mingzhu star combinations.',
      };
    }
    case 'yijing': {
      return {
        serviceType: 'yijing' as const,
        entryCount: {
          hexagrams: 64,
          total: 64,
        },
        corpusLines: 10,
        lastUpdated: '2024-01-01',
        description: 'Yi Jing (易经) Book of Changes — 64 hexagrams with structural references (trigrams, judgment text, image text).',
      };
    }
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get('service') as ServiceType | null;

  if (!service || !['bazi', 'ziwei', 'yijing'].includes(service)) {
    return NextResponse.json(
      {
        error: 'Invalid or missing "service" query param',
        hint: 'Use ?service=bazi, ?service=ziwei, or ?service=yijing',
        availableServices: ['bazi', 'ziwei', 'yijing'],
      },
      { status: 400 }
    );
  }

  const metadata = getKBMetadata(service);
  if (!metadata) {
    return NextResponse.json({ error: 'Unknown service type' }, { status: 400 });
  }

  return NextResponse.json(
    {
      success: true,
      data: metadata,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
