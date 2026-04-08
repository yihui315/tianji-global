import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const type = searchParams.get('type') || 'tianji'; // tianji | ziwei | bazi | tarot | yijing | western
  const name = searchParams.get('name') || 'TianJi Global';
  const subtitle = searchParams.get('subtitle') || 'AI Fortune Platform';

  // Theme colors
  const colors = {
    tianji: { primary: '#7C3AED', secondary: '#F59E0B', bg: '#0F0F23' },
    ziwei: { primary: '#8B5CF6', secondary: '#F59E0B', bg: '#0F0F23' },
    bazi: { primary: '#F59E0B', secondary: '#EF4444', bg: '#1C1917' },
    tarot: { primary: '#EC4899', secondary: '#F59E0B', bg: '#0F172A' },
    yijing: { primary: '#10B981', secondary: '#F59E0B', bg: '#064E3B' },
    western: { primary: '#3B82F6', secondary: '#F59E0B', bg: '#0C1A2E' },
  };

  const c = colors[type as keyof typeof colors] || colors.tianji;

  return new ImageResponse(
    (
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
            opacity: 0.3,
          }}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#fff',
                margin: `${Math.random() * 100}%`,
                position: 'absolute',
                left: `${(i * 37) % 100}%`,
                top: `${(i * 23) % 100}%`,
              }}
            />
          ))}
        </div>

        {/* Logo/Brand */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: c.primary,
            letterSpacing: '-0.05em',
            marginBottom: 16,
            textShadow: `0 0 60px ${c.primary}40`,
          }}
        >
          {name}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: '#94A3B8',
            fontWeight: 400,
            marginBottom: 48,
          }}
        >
          {subtitle}
        </div>

        {/* Decorative line */}
        <div
          style={{
            width: 120,
            height: 4,
            background: `linear-gradient(90deg, ${c.primary}, ${c.secondary})`,
            borderRadius: 2,
            marginBottom: 48,
          }}
        />

        {/* Type badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 24px',
            background: `${c.primary}20`,
            border: `1px solid ${c.primary}40`,
            borderRadius: 999,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: c.primary,
            }}
          />
          <span style={{ color: '#E2E8F0', fontSize: 20, fontWeight: 500 }}>
            AI Fortune Reading
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#64748B',
            fontSize: 18,
          }}
        >
          <span>tianji.global</span>
          <span style={{ color: c.primary }}>·</span>
          <span>Powered by AI</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
