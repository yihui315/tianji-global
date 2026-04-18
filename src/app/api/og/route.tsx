import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Taste Rule OG Image Generator
 * Deep space black (#0a0a0a) + gold/purple nebula + Cinzel font
 * Returns 1200×630 OG image dynamic based on page props
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = searchParams.get('title') || 'TianJi Global';
  const subtitle = searchParams.get('subtitle') || '天机全球 · Premium AI Destiny';
  const moduleName = searchParams.get('module') || 'tianji';

  // Module color themes — gold primary, purple accent
  const themes: Record<string, { accent: string; secondary: string }> = {
    tianji:  { accent: '#D4AF37', secondary: '#A78BFA' },
    ziwei:   { accent: '#D4AF37', secondary: '#8B5CF6' },
    bazi:    { accent: '#D4AF37', secondary: '#F59E0B' },
    tarot:   { accent: '#D4AF37', secondary: '#EC4899' },
    yijing:  { accent: '#D4AF37', secondary: '#10B981' },
    western: { accent: '#D4AF37', secondary: '#3B82F6' },
    love:    { accent: '#D4AF37', secondary: '#F472B6' },
    synastry:{ accent: '#D4AF37', secondary: '#A78BFA' },
    fortune: { accent: '#D4AF37', secondary: '#7C3AED' },
  };

  const c = themes[moduleName] || themes.tianji;

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
          background: '#0a0a0a',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Nebula glow top-left */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(42,10,58,0.9) 0%, transparent 70%)',
          }}
        />
        {/* Nebula glow bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          }}
        />
        {/* Gold accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Decorative gold top line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)`,
          }}
        />

        {/* Module badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: 999,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: c.accent,
              boxShadow: `0 0 8px ${c.accent}`,
            }}
          />
          <span
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 16,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </span>
        </div>

        {/* Main title — Cinzel feel via bold serif */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: c.accent,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            textShadow: `0 0 60px rgba(212,175,55,0.3), 0 0 120px rgba(212,175,55,0.1)`,
            marginBottom: 16,
          }}
        >
          {title}
        </div>

        {/* Decorative divider */}
        <div
          style={{
            width: 80,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${c.secondary}, transparent)`,
            marginBottom: 32,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 24,
            letterSpacing: '0.05em',
          }}
        >
          Premium AI Destiny Platform
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'rgba(255,255,255,0.25)',
            fontSize: 16,
          }}
        >
          <span>tianji.global</span>
          <span style={{ color: c.accent }}>·</span>
          <span>Powered by AI</span>
        </div>

        {/* Decorative gold bottom line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
