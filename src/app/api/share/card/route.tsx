import { ImageResponse } from '@vercel/og';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface CardRequest {
  serviceType?: string;
  resultData?: Record<string, unknown>;
  cardFormat?: 'wechat' | 'twitter' | 'instagram';
}

const SERVICE_COLORS: Record<string, { primary: string; secondary: string; bg: string }> = {
  bazi: { primary: '#D4AF37', secondary: '#EF4444', bg: '#120B05' },
  tarot: { primary: '#D8B4FE', secondary: '#D4AF37', bg: '#090813' },
  yijing: { primary: '#A7F3D0', secondary: '#D4AF37', bg: '#06130D' },
  ziwei: { primary: '#A78BFA', secondary: '#D4AF37', bg: '#080816' },
  western: { primary: '#93C5FD', secondary: '#D4AF37', bg: '#06101F' },
  fortune: { primary: '#FDE68A', secondary: '#A78BFA', bg: '#090711' },
  relationship: { primary: '#F0ABFC', secondary: '#D4AF37', bg: '#130714' },
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
  tianji: { zh: '天机全球', en: 'TianJi Global' },
};

function pickString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
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

function sizeFor(format: CardRequest['cardFormat']) {
  if (format === 'instagram') return { width: 1080, height: 1920 };
  if (format === 'twitter') return { width: 1200, height: 628 };
  return { width: 1200, height: 630 };
}

function renderCard(
  c: { primary: string; secondary: string; bg: string },
  nameInfo: { zh: string; en: string },
  summary: string,
  format: CardRequest['cardFormat']
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
