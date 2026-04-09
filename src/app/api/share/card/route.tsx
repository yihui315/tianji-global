import { ImageResponse } from '@vercel/og';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface CardRequest {
  serviceType: string;
  resultData: Record<string, unknown>;
  cardFormat: 'wechat' | 'twitter' | 'instagram';
}

const SERVICE_COLORS: Record<string, { primary: string; secondary: string; bg: string }> = {
  bazi: { primary: '#F59E0B', secondary: '#EF4444', bg: '#1C1917' },
  tarot: { primary: '#EC4899', secondary: '#F59E0B', bg: '#0F172A' },
  yijing: { primary: '#10B981', secondary: '#F59E0B', bg: '#064E3B' },
  ziwei: { primary: '#8B5CF6', secondary: '#F59E0B', bg: '#0F0F23' },
  western: { primary: '#3B82F6', secondary: '#F59E0B', bg: '#0C1A2E' },
  tianji: { primary: '#7C3AED', secondary: '#F59E0B', bg: '#0F0F23' },
};

const SERVICE_NAMES: Record<string, { zh: string; en: string }> = {
  bazi: { zh: '八字命理', en: 'Ba Zi Fortune' },
  tarot: { zh: '塔罗牌占卜', en: 'Tarot Reading' },
  yijing: { zh: '易经占卜', en: 'Yi Jing Oracle' },
  ziwei: { zh: '紫微斗数', en: 'Zi Wei Destiny' },
  western: { zh: '西方占星', en: 'Western Astrology' },
  tianji: { zh: '天机全球', en: 'TianJi Global' },
};

function getSummary(resultData: Record<string, unknown>, serviceType: string): string {
  switch (serviceType) {
    case 'bazi': {
      const chart = resultData.chart as Record<string, Record<string, string>> | undefined;
      if (chart?.day) {
        return `日主 ${chart.day.heavenlyStem || ''} · ${chart.dayMasterElement || ''}行`;
      }
      return '八字命理分析';
    }
    case 'tarot': {
      const cards = resultData.drawnCards as Array<{ card: { name?: string; nameChinese?: string } }> | undefined;
      if (cards && cards.length > 0) {
        return cards.map(c => c.card.nameChinese || c.card.name || '').join(' · ');
      }
      return '塔罗牌解读';
    }
    case 'yijing': {
      const hex = resultData.hexagram as { name?: string; pinyin?: string } | undefined;
      if (hex) {
        return `${hex.name}卦 · ${hex.pinyin || ''}`;
      }
      return '易经卦象解读';
    }
    default:
      return 'AI Fortune Reading';
  }
}

function renderWeChatCard(serviceType: string, resultData: Record<string, unknown>, c: { primary: string; secondary: string; bg: string }, nameInfo: { zh: string; en: string }, summary: string) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${c.bg} 0%, #1a1a2e 100%)`,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Stars decoration */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexWrap: 'wrap',
          opacity: 0.2,
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Service name */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 900,
          color: c.primary,
          letterSpacing: '-0.03em',
          marginBottom: 12,
          textShadow: `0 0 40px ${c.primary}40`,
        }}
      >
        {nameInfo.zh}
      </div>

      {/* English name */}
      <div
        style={{
          fontSize: 24,
          color: '#94A3B8',
          fontWeight: 400,
          marginBottom: 32,
        }}
      >
        {nameInfo.en}
      </div>

      {/* Summary badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 28px',
          background: `${c.primary}20`,
          border: `1px solid ${c.primary}50`,
          borderRadius: 999,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: c.primary,
          }}
        />
        <span style={{ color: '#E2E8F0', fontSize: 20, fontWeight: 500 }}>
          {summary}
        </span>
      </div>

      {/* Decorative line */}
      <div
        style={{
          width: 100,
          height: 3,
          background: `linear-gradient(90deg, ${c.primary}, ${c.secondary})`,
          borderRadius: 2,
          marginBottom: 32,
        }}
      />

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#64748B',
          fontSize: 16,
        }}
      >
        <span>tianji.global</span>
        <span style={{ color: c.primary }}>·</span>
        <span>Powered by AI</span>
      </div>
    </div>
  );
}

function renderTwitterCard(serviceType: string, resultData: Record<string, unknown>, c: { primary: string; secondary: string; bg: string }, nameInfo: { zh: string; en: string }, summary: string) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${c.bg} 0%, #1a1a2e 100%)`,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Stars */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexWrap: 'wrap',
          opacity: 0.2,
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Service name */}
      <div
        style={{
          fontSize: 60,
          fontWeight: 900,
          color: c.primary,
          letterSpacing: '-0.03em',
          marginBottom: 12,
          textShadow: `0 0 40px ${c.primary}40`,
        }}
      >
        {nameInfo.zh}
      </div>

      <div
        style={{
          fontSize: 26,
          color: '#94A3B8',
          fontWeight: 400,
          marginBottom: 36,
        }}
      >
        {nameInfo.en}
      </div>

      {/* Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 28px',
          background: `${c.primary}20`,
          border: `1px solid ${c.primary}50`,
          borderRadius: 999,
          marginBottom: 44,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: c.primary,
          }}
        />
        <span style={{ color: '#E2E8F0', fontSize: 22, fontWeight: 500 }}>
          {summary}
        </span>
      </div>

      {/* Decorative line */}
      <div
        style={{
          width: 100,
          height: 3,
          background: `linear-gradient(90deg, ${c.primary}, ${c.secondary})`,
          borderRadius: 2,
          marginBottom: 36,
        }}
      />

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#64748B',
          fontSize: 16,
        }}
      >
        <span>tianji.global</span>
        <span style={{ color: c.primary }}>·</span>
        <span>Powered by AI</span>
      </div>
    </div>
  );
}

function renderInstagramCard(serviceType: string, resultData: Record<string, unknown>, c: { primary: string; secondary: string; bg: string }, nameInfo: { zh: string; en: string }, summary: string) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(180deg, ${c.bg} 0%, #1a1a2e 60%, #0a0a15 100%)`,
        fontFamily: 'system-ui, sans-serif',
        padding: '80px 60px',
      }}
    >
      {/* Stars */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexWrap: 'wrap',
          opacity: 0.2,
        }}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Service name */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: c.primary,
          letterSpacing: '-0.03em',
          marginBottom: 16,
          textShadow: `0 0 60px ${c.primary}50`,
          textAlign: 'center',
        }}
      >
        {nameInfo.zh}
      </div>

      <div
        style={{
          fontSize: 32,
          color: '#94A3B8',
          fontWeight: 400,
          marginBottom: 60,
        }}
      >
        {nameInfo.en}
      </div>

      {/* Summary badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '20px 40px',
          background: `${c.primary}20`,
          border: `1px solid ${c.primary}50`,
          borderRadius: 999,
          marginBottom: 60,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: c.primary,
          }}
        />
        <span style={{ color: '#E2E8F0', fontSize: 28, fontWeight: 500 }}>
          {summary}
        </span>
      </div>

      {/* Decorative line */}
      <div
        style={{
          width: 120,
          height: 4,
          background: `linear-gradient(90deg, ${c.primary}, ${c.secondary})`,
          borderRadius: 2,
          marginBottom: 60,
        }}
      />

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#64748B',
          fontSize: 22,
        }}
      >
        <span>tianji.global</span>
        <span style={{ color: c.primary }}>·</span>
        <span>Powered by AI</span>
      </div>
    </div>
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: CardRequest = await req.json();
    const { serviceType, resultData, cardFormat } = body;

    const c = SERVICE_COLORS[serviceType] || SERVICE_COLORS.tianji;
    const nameInfo = SERVICE_NAMES[serviceType] || SERVICE_NAMES.tianji;
    const summary = getSummary(resultData, serviceType);

    let width = 1200;
    let height = 630;

    if (cardFormat === 'instagram') {
      width = 1080;
      height = 1920;
    } else if (cardFormat === 'twitter') {
      width = 1200;
      height = 628;
    }

    const element = cardFormat === 'instagram'
      ? renderInstagramCard(serviceType, resultData, c, nameInfo, summary)
      : cardFormat === 'twitter'
        ? renderTwitterCard(serviceType, resultData, c, nameInfo, summary)
        : renderWeChatCard(serviceType, resultData, c, nameInfo, summary);

    const imageResponse = new ImageResponse(element, {
      width,
      height,
    });

    // Return the image as PNG
    const buffer = await imageResponse.blob();
    const base64 = await buffer.arrayBuffer().then(buf => Buffer.from(buf).toString('base64'));

    return new NextResponse(`data:image/png;base64,${base64}`, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (err) {
    console.error('Share card error:', err);
    return NextResponse.json({ error: 'Failed to generate share card' }, { status: 500 });
  }
}
