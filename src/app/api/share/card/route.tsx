import { ImageResponse } from '@vercel/og';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeLoveTestSharePayload, type LoveTestShareFormat, type LoveTestSharePayload } from '@/lib/love-test';

export const runtime = 'edge';

const RELATIONSHIP_CARD_FORMATS = ['og', 'wechat_moments', 'xiaohongshu', 'douyin'] as const;
type RelationshipCardFormat = (typeof RELATIONSHIP_CARD_FORMATS)[number];
type LegacyCardFormat = 'wechat' | 'twitter' | 'instagram';
type CardFormat = LegacyCardFormat | RelationshipCardFormat | LoveTestShareFormat;

interface CardRequest {
  serviceType?: string;
  resultData?: Record<string, unknown>;
  cardFormat?: CardFormat;
}

interface RelationshipCardData {
  score: number;
  headline: string;
  oneLiner: string;
  keywords: string[];
  shareUrl: string;
  personA: string;
  personB: string;
}

const SERVICE_COLORS: Record<string, { primary: string; secondary: string; bg: string }> = {
  bazi: { primary: '#D4AF37', secondary: '#EF4444', bg: '#120B05' },
  tarot: { primary: '#D8B4FE', secondary: '#D4AF37', bg: '#090813' },
  yijing: { primary: '#A7F3D0', secondary: '#D4AF37', bg: '#06130D' },
  ziwei: { primary: '#A78BFA', secondary: '#D4AF37', bg: '#080816' },
  western: { primary: '#93C5FD', secondary: '#D4AF37', bg: '#06101F' },
  fortune: { primary: '#FDE68A', secondary: '#A78BFA', bg: '#090711' },
  relationship: { primary: '#F0ABFC', secondary: '#D4AF37', bg: '#130714' },
  love_test: { primary: '#FF9C8B', secondary: '#D8B77B', bg: '#080914' },
  tianji: { primary: '#A78BFA', secondary: '#D4AF37', bg: '#080816' },
};

const SERVICE_NAMES: Record<string, { zh: string; en: string }> = {
  bazi: { zh: '八字命理', en: 'BaZi Destiny' },
  tarot: { zh: '塔罗牌阵', en: 'Tarot Reading' },
  yijing: { zh: '易经占卜', en: 'Yi Jing Oracle' },
  ziwei: { zh: '紫微斗数', en: 'Zi Wei Destiny' },
  western: { zh: '西方占星', en: 'Western Astrology' },
  fortune: { zh: '人生曲线', en: 'Fortune Timeline' },
  relationship: { zh: '关系合盘', en: 'Relationship Pattern' },
  love_test: { zh: 'Love Test', en: 'Love Test' },
  tianji: { zh: '天机全球', en: 'TianJi Global' },
};

function pickString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function pickNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function pickStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 4);
}

const RELATIONSHIP_SENSITIVE_FIELD_PARTS = [
  ['birth', 'date'],
  ['birth', 'time'],
  ['birth', 'location'],
  ['time', 'zone'],
  ['raw', 'question'],
  ['pro', 'mpt'],
  ['full', 'report'],
  ['full', 'result'],
].map((parts) => parts.join(''));

function isSafeRelationshipCardKey(key: string) {
  const normalized = key.replace(/[\s_-]/g, '').toLowerCase();
  return !RELATIONSHIP_SENSITIVE_FIELD_PARTS.includes(normalized);
}

function sanitizeRelationshipCardData(resultData: Record<string, unknown>): RelationshipCardData {
  const safeData = Object.fromEntries(
    Object.entries(resultData).filter(([key]) => isSafeRelationshipCardKey(key))
  );
  const score = Math.max(0, Math.min(100, Math.round(pickNumber(safeData.score ?? safeData.overallScore, 72))));

  return {
    score,
    headline: pickString(safeData.headline) ?? 'Your relationship pattern is ready',
    oneLiner:
      pickString(safeData.oneLiner) ??
      pickString(safeData.summary) ??
      'A private compatibility signal you can share without exposing private inputs.',
    keywords: pickStringArray(safeData.keywords),
    shareUrl: pickString(safeData.shareUrl) ?? 'https://tianji.love/relationship/new',
    personA: pickString(safeData.personA) ?? 'Person A',
    personB: pickString(safeData.personB) ?? 'Person B',
  };
}

function getSummary(resultData: Record<string, unknown>, serviceType: string): string {
  if (pickString(resultData.headline)) return pickString(resultData.headline) as string;
  if (pickString(resultData.summary)) return pickString(resultData.summary) as string;

  switch (serviceType) {
    case 'bazi': {
      const chart = resultData.chart as Record<string, Record<string, string>> | undefined;
      if (chart?.day) {
        const stem = chart.day.heavenlyStem || 'Day Master';
        const element = chart.dayMasterElement || 'Elemental pattern';
        return `日主 ${stem} • ${element}`;
      }
      return '八字结构已生成';
    }
    case 'tarot': {
      const cards = resultData.drawnCards as Array<{ card?: { name?: string; nameChinese?: string } }> | undefined;
      if (cards?.length) {
        return cards.map((item) => item.card?.nameChinese || item.card?.name).filter(Boolean).join(' • ');
      }
      return '塔罗牌阵已展开';
    }
    case 'yijing': {
      const hexagram = resultData.hexagram as { name?: string; pinyin?: string } | undefined;
      if (hexagram?.name) {
        return `${hexagram.name} 卦 • ${hexagram.pinyin || 'Yi Jing'}`;
      }
      return '易经卦象已生成';
    }
    default:
      return 'AI destiny reading generated';
  }
}

function sizeFor(format: CardFormat | undefined) {
  if (format === 'wechat_moments') return { width: 1080, height: 1080 };
  if (format === 'xiaohongshu') return { width: 1080, height: 1440 };
  if (format === 'douyin') return { width: 1080, height: 1920 };
  if (format === 'og') return { width: 1200, height: 630 };
  if (format === 'instagram') return { width: 1080, height: 1920 };
  if (format === 'twitter') return { width: 1200, height: 628 };
  return { width: 1200, height: 630 };
}

function isRelationshipCardFormat(format: CardFormat | undefined): format is RelationshipCardFormat {
  return (RELATIONSHIP_CARD_FORMATS as readonly string[]).includes(format ?? '');
}

function RelationshipPatternCard({
  data,
  format,
}: {
  data: RelationshipCardData;
  format: RelationshipCardFormat;
}) {
  const isPortrait = format === 'xiaohongshu' || format === 'douyin';
  const isSquare = format === 'wechat_moments';
  const titleSize = isPortrait ? 72 : isSquare ? 58 : 52;
  const scoreSize = isPortrait ? 124 : isSquare ? 112 : 92;
  const bodySize = isPortrait ? 30 : 25;
  const cardWidth = isPortrait ? '82%' : isSquare ? '84%' : '78%';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 18% 12%, rgba(255,124,130,0.26), transparent 30%), radial-gradient(circle at 80% 84%, rgba(216,183,123,0.2), transparent 32%), linear-gradient(180deg, #050812 0%, #03040a 58%, #080914 100%)',
        color: '#FFE3B4',
        fontFamily: 'system-ui, sans-serif',
        padding: isPortrait ? 88 : 64,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 42,
          display: 'flex',
          border: '1px solid rgba(216,183,123,0.2)',
          borderRadius: isPortrait ? 54 : 42,
        }}
      />
      <div
        style={{
          width: cardWidth,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            padding: '10px 22px',
            border: '1px solid rgba(216,183,123,0.32)',
            borderRadius: 999,
            color: 'rgba(244,215,163,0.7)',
            fontSize: isPortrait ? 24 : 18,
          }}
        >
          Tianji Love · Relationship Pattern
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: isPortrait ? 58 : 38,
            color: '#F4D7A3',
            fontSize: isPortrait ? 30 : 24,
          }}
        >
          {data.personA} & {data.personB}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginTop: isPortrait ? 32 : 24,
          }}
        >
          <span style={{ color: '#FF9C8B', fontSize: scoreSize, fontWeight: 800, lineHeight: 1 }}>
            {data.score}
          </span>
          <span style={{ color: 'rgba(244,215,163,0.68)', fontSize: isPortrait ? 26 : 20 }}>
            compatibility signal
          </span>
        </div>
        <div
          style={{
            marginTop: isPortrait ? 34 : 24,
            color: '#FFE3B4',
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.08,
          }}
        >
          {data.headline}
        </div>
        <div
          style={{
            marginTop: isPortrait ? 34 : 24,
            color: 'rgba(244,215,163,0.78)',
            fontSize: bodySize,
            lineHeight: 1.42,
          }}
        >
          {data.oneLiner}
        </div>
        {data.keywords.length ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              marginTop: isPortrait ? 42 : 30,
            }}
          >
            {data.keywords.map((keyword) => (
              <span
                key={keyword}
                style={{
                  display: 'flex',
                  border: '1px solid rgba(216,183,123,0.28)',
                  borderRadius: 999,
                  padding: '8px 16px',
                  color: 'rgba(244,215,163,0.72)',
                  fontSize: isPortrait ? 22 : 16,
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: isPortrait ? 66 : 38,
          left: isPortrait ? 76 : 64,
          right: isPortrait ? 76 : 64,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 20,
          color: 'rgba(244,215,163,0.5)',
          fontSize: isPortrait ? 22 : 16,
        }}
      >
        <span>Birth data hidden by default</span>
        <span>{data.shareUrl.replace(/^https?:\/\//, '')}</span>
      </div>
    </div>
  );
}

function LoveTestShareCard({
  data,
  format,
}: {
  data: LoveTestSharePayload;
  format: LoveTestShareFormat;
}) {
  const isPortrait = format === 'xiaohongshu' || format === 'douyin';
  const isSquare = format === 'wechat_moments';
  const scoreSize = isPortrait ? 132 : isSquare ? 118 : 92;
  const titleSize = isPortrait ? 68 : isSquare ? 56 : 48;
  const bodySize = isPortrait ? 30 : 24;
  const contentWidth = isPortrait ? '82%' : isSquare ? '82%' : '76%';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 18% 12%, rgba(255,156,139,0.28), transparent 30%), radial-gradient(circle at 78% 84%, rgba(216,183,123,0.2), transparent 34%), linear-gradient(180deg, #050812 0%, #03040a 58%, #080914 100%)',
        color: '#FFE3B4',
        fontFamily: 'system-ui, sans-serif',
        padding: isPortrait ? 90 : 64,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: isPortrait ? 54 : 40,
          display: 'flex',
          border: '1px solid rgba(216,183,123,0.22)',
          borderRadius: isPortrait ? 58 : 40,
        }}
      />
      <div
        style={{
          width: contentWidth,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            border: '1px solid rgba(216,183,123,0.32)',
            borderRadius: 999,
            padding: '10px 22px',
            color: 'rgba(244,215,163,0.72)',
            fontSize: isPortrait ? 24 : 18,
          }}
        >
          Tianji Love Test
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginTop: isPortrait ? 58 : 36,
          }}
        >
          <span style={{ color: '#FF9C8B', fontSize: scoreSize, fontWeight: 800, lineHeight: 1 }}>
            {data.score}
          </span>
          <span style={{ color: 'rgba(244,215,163,0.68)', fontSize: isPortrait ? 27 : 20 }}>
            love signal
          </span>
        </div>
        <div
          style={{
            marginTop: isPortrait ? 28 : 20,
            color: '#F4D7A3',
            fontSize: isPortrait ? 32 : 24,
          }}
        >
          {data.archetype}
        </div>
        <div
          style={{
            marginTop: isPortrait ? 34 : 24,
            color: '#FFE3B4',
            fontSize: titleSize,
            fontWeight: 760,
            lineHeight: 1.08,
          }}
        >
          {data.headline}
        </div>
        <div
          style={{
            marginTop: isPortrait ? 32 : 22,
            color: 'rgba(244,215,163,0.78)',
            fontSize: bodySize,
            lineHeight: 1.42,
          }}
        >
          {data.oneLiner}
        </div>
        {data.keywords.length ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              marginTop: isPortrait ? 44 : 30,
            }}
          >
            {data.keywords.map((keyword) => (
              <span
                key={keyword}
                style={{
                  display: 'flex',
                  border: '1px solid rgba(216,183,123,0.28)',
                  borderRadius: 999,
                  padding: '8px 16px',
                  color: 'rgba(244,215,163,0.72)',
                  fontSize: isPortrait ? 22 : 16,
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: isPortrait ? 66 : 38,
          left: isPortrait ? 76 : 64,
          right: isPortrait ? 76 : 64,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 20,
          color: 'rgba(244,215,163,0.52)',
          fontSize: isPortrait ? 22 : 16,
        }}
      >
        <span>Birth data is not collected</span>
        <span>{data.shareUrl.replace(/^https?:\/\//, '')}</span>
      </div>
    </div>
  );
}

function renderCard(
  c: { primary: string; secondary: string; bg: string },
  nameInfo: { zh: string; en: string },
  summary: string,
  format: CardFormat | undefined
) {
  const isTall = format === 'instagram';
  const headlineSize = isTall ? 84 : 58;
  const summarySize = isTall ? 30 : 22;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: `radial-gradient(circle at 50% 12%, ${c.primary}33 0%, transparent 36%), linear-gradient(135deg, ${c.bg} 0%, #050508 100%)`,
        color: '#F8FAFC',
        fontFamily: 'system-ui, sans-serif',
        padding: isTall ? '96px 72px' : '64px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          background:
            'radial-gradient(circle at 18% 22%, rgba(255,255,255,0.16), transparent 18%), radial-gradient(circle at 82% 78%, rgba(212,175,55,0.14), transparent 24%)',
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: isTall ? 680 : 520,
          height: isTall ? 680 : 520,
          border: `2px solid ${c.primary}55`,
          borderRadius: '50%',
          boxShadow: `0 0 90px ${c.primary}26, inset 0 0 60px rgba(255,255,255,0.06)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: isTall ? 500 : 390,
          height: isTall ? 500 : 390,
          border: `1px solid ${c.secondary}55`,
          borderRadius: '50%',
          transform: 'rotate(-18deg)',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        <div
          style={{
            padding: '10px 22px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.72)',
            fontSize: isTall ? 22 : 14,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
          }}
        >
          TianJi Global
        </div>

        <div
          style={{
            marginTop: isTall ? 56 : 34,
            fontSize: headlineSize,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: c.primary,
            textShadow: `0 0 50px ${c.primary}55`,
            textAlign: 'center',
          }}
        >
          {nameInfo.zh}
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: isTall ? 32 : 24,
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          {nameInfo.en}
        </div>

        <div
          style={{
            marginTop: isTall ? 58 : 36,
            maxWidth: isTall ? 820 : 880,
            padding: isTall ? '26px 42px' : '18px 34px',
            borderRadius: 999,
            border: `1px solid ${c.primary}66`,
            background: 'rgba(5,5,8,0.58)',
            color: '#FFFFFF',
            fontSize: summarySize,
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 1.35,
          }}
        >
          {summary}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: isTall ? 82 : 36,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: 'rgba(255,255,255,0.48)',
          fontSize: isTall ? 22 : 16,
        }}
      >
        <span>tianji.global</span>
        <span style={{ color: c.secondary }}>•</span>
        <span>AI destiny reading</span>
      </div>
    </div>
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CardRequest;
    const serviceType = body.serviceType || 'tianji';
    const resultData = body.resultData || {};
    const cardFormat = body.cardFormat || 'wechat';

    if (serviceType === 'relationship') {
      const relationshipFormat = isRelationshipCardFormat(cardFormat) ? cardFormat : 'og';
      const relationshipCard = sanitizeRelationshipCardData(resultData);
      const { width, height } = sizeFor(relationshipFormat);

      return new ImageResponse(
        <RelationshipPatternCard data={relationshipCard} format={relationshipFormat} />,
        { width, height }
      );
    }

    if (serviceType === 'love_test') {
      const loveTestFormat = isRelationshipCardFormat(cardFormat) ? cardFormat : 'og';
      const loveTestCard = sanitizeLoveTestSharePayload(resultData);
      const { width, height } = sizeFor(loveTestFormat);

      return new ImageResponse(
        <LoveTestShareCard data={loveTestCard} format={loveTestFormat} />,
        { width, height }
      );
    }

    const colors = SERVICE_COLORS[serviceType] || SERVICE_COLORS.tianji;
    const nameInfo = SERVICE_NAMES[serviceType] || SERVICE_NAMES.tianji;
    const summary = getSummary(resultData, serviceType);
    const { width, height } = sizeFor(cardFormat);

    return new ImageResponse(renderCard(colors, nameInfo, summary, cardFormat), {
      width,
      height,
    });
  } catch (err) {
    console.error('Share card error:', err);
    return NextResponse.json({ error: 'Failed to generate share card' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const serviceType = searchParams.get('type') || 'tianji';
  const title = searchParams.get('title') || 'TianJi Global';
  const nameInfo = SERVICE_NAMES[serviceType] || SERVICE_NAMES.tianji;

  return NextResponse.json({
    success: true,
    og: {
      title: `${title} | TianJi Global`,
      description: `${nameInfo.en} share card generated by TianJi Global`,
      image: `/api/share/card?type=${encodeURIComponent(serviceType)}&title=${encodeURIComponent(title)}`,
      width: 1200,
      height: 630,
    },
  });
}
