'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Data Types ────────────────────────────────────────────────────────────────

interface PalaceStar {
  name: string;
  nameZh: string;
}

interface ZiweiChart {
  palaces: {
    name: string;
    nameZh: string;
    mainStar: string;
    stars: string[];
  }[];
  mingzhu: string;
}

interface ZiWeiPalaceAnimationProps {
  birthDate?: string;
  birthTime?: number;
  birthdayType?: 'solar' | 'lunar';
  gender?: 'male' | 'female';
  width?: number;
  height?: number;
  playing?: boolean;
}

// ─── Constants (mirrored from ZiWeiPalaceWidget) ───────────────────────────────

const PALACE_NAMES = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫'];
const PALACE_NAMES_EN = ['Ming', 'Siblings', 'Spouse', 'Children', 'Wealth', 'Health', 'Travel', 'Servants', 'Career', 'Property', 'Fortune', 'Parents'];
const MAIN_STARS = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];
const MINOR_STARS = ['文昌', '文曲', '左辅', '右弼', '天魁', '天钺', '火星', '铃星', '擎羊', '陀罗'];

function calculateZiwei(birthDate: string, birthTime: number, gender: 'male' | 'female'): ZiweiChart {
  const [y, m, d] = birthDate.split('-').map(Number);
  const seed = (y * 10000 + m * 100 + d + birthTime * 7) % 12;
  const palaces = PALACE_NAMES.map((name, i) => {
    const palaceIdx = (i + seed) % 12;
    return {
      name: PALACE_NAMES_EN[palaceIdx],
      nameZh: PALACE_NAMES[palaceIdx],
      mainStar: MAIN_STARS[(i * 3 + seed) % MAIN_STARS.length],
      stars: [
        MINOR_STARS[(i * 2 + seed) % MINOR_STARS.length],
        MINOR_STARS[(i * 2 + seed + 3) % MINOR_STARS.length],
      ],
    };
  });
  return { palaces, mingzhu: MAIN_STARS[seed % MAIN_STARS.length] };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function GlowText({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`relative inline-block ${className}`} style={style}>
      <motion.span
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ display: 'block', filter: 'blur(0px)' }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function MingzhuGlow({ mingzhu, cx, cy }: { mingzhu: string; cx: number; cy: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6, type: 'spring', stiffness: 200 }}
      style={{
        position: 'absolute',
        left: cx - 28,
        top: cy - 28,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, rgba(139,92,246,0.1) 70%, transparent 100%)',
        border: '2px solid #A78BFA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    >
      <motion.div
        animate={{ boxShadow: ['0 0 8px 2px rgba(167,139,250,0.4)', '0 0 20px 6px rgba(167,139,250,0.8)', '0 0 8px 2px rgba(167,139,250,0.4)'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: '#1F2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid #A78BFA',
        }}
      >
        <span style={{ color: '#C4B5FD', fontSize: 12, fontFamily: 'serif', fontWeight: 'bold' }}>{mingzhu}</span>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ZiWeiPalaceAnimation({
  birthDate = '2000-08-16',
  birthTime = 2,
  gender = 'male',
  width = 420,
  height = 420,
  playing = true,
}: ZiWeiPalaceAnimationProps) {
  const chart = useMemo(() => {
    try {
      return calculateZiwei(birthDate, birthTime, gender);
    } catch {
      return calculateZiwei('2000-08-16', 2, 'male');
    }
  }, [birthDate, birthTime, gender]);

  const cx = width / 2;
  const cy = height / 2;
  const outerSize = Math.min(width, height) * 0.88;
  const boxW = outerSize / 3.2;
  const boxH = outerSize / 4;

  const positions = [
    { x: cx + boxW * 0.6, y: cy - boxH * 1.3, palaceIdx: 2 },
    { x: cx, y: cy - boxH * 1.3, palaceIdx: 1 },
    { x: cx - boxW * 0.6, y: cy - boxH * 1.3, palaceIdx: 0 },
    { x: cx + boxW * 0.6, y: cy - boxH * 0.1, palaceIdx: 3 },
    { x: cx + boxW * 0.6, y: cy + boxH * 0.6, palaceIdx: 4 },
    { x: cx, y: cy + boxH * 1.1, palaceIdx: 11 },
    { x: cx - boxW * 0.6, y: cy + boxH * 0.6, palaceIdx: 5 },
    { x: cx - boxW * 0.6, y: cy - boxH * 0.1, palaceIdx: 10 },
    { x: cx + boxW * 0.6, y: cy + boxH * 1.1, palaceIdx: 6 },
    { x: cx, y: cy + boxH * 1.1, palaceIdx: 7 },
    { x: cx - boxW * 0.6, y: cy + boxH * 1.1, palaceIdx: 8 },
    { x: cx, y: cy + boxH * 2.3, palaceIdx: 9 },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const boxVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, type: 'spring', stiffness: 180, damping: 20 },
    },
  };

  return (
    <div style={{ position: 'relative', width, height, background: '#0F172A', borderRadius: 8, overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: '#0F172A' }} />

      {/* Connection lines (static SVG layer) */}
      <svg
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Grid lines */}
        <line x1={cx} y1={cy - boxH * 1.3} x2={cx + boxW * 0.6} y2={cy - boxH * 0.65} stroke="#374151" strokeWidth="1" />
        <line x1={cx} y1={cy - boxH * 1.3} x2={cx - boxW * 0.6} y2={cy - boxH * 0.65} stroke="#374151" strokeWidth="1" />
        <line x1={cx + boxW * 0.6} y1={cy - boxH * 0.65} x2={cx + boxW * 0.6} y2={cy + boxH * 0.25} stroke="#374151" strokeWidth="1" />
        <line x1={cx - boxW * 0.6} y1={cy - boxH * 0.65} x2={cx - boxW * 0.6} y2={cy + boxH * 0.25} stroke="#374151" strokeWidth="1" />
        <line x1={cx + boxW * 0.6} y1={cy + boxH * 0.25} x2={cx} y2={cy + boxH * 0.85} stroke="#374151" strokeWidth="1" />
        <line x1={cx - boxW * 0.6} y1={cy + boxH * 0.25} x2={cx} y2={cy + boxH * 0.85} stroke="#374151" strokeWidth="1" />
        <line x1={cx} y1={cy + boxH * 0.85} x2={cx + boxW * 0.6} y2={cy + boxH * 1.45} stroke="#374151" strokeWidth="1" />
        <line x1={cx} y1={cy + boxH * 0.85} x2={cx - boxW * 0.6} y2={cy + boxH * 1.45} stroke="#374151" strokeWidth="1" />
        <line x1={cx + boxW * 0.6} y1={cy + boxH * 1.45} x2={cx} y2={cy + boxH * 2.05} stroke="#374151" strokeWidth="1" />
        <line x1={cx - boxW * 0.6} y1={cy + boxH * 1.45} x2={cx} y2={cy + boxH * 2.05} stroke="#374151" strokeWidth="1" />
        {/* Center diamond */}
        <polygon
          points={`${cx},${cy - boxH * 0.65} ${cx + boxW * 0.6},${cy + boxH * 0.25} ${cx},${cy + boxH * 0.85} ${cx - boxW * 0.6},${cy + boxH * 0.25}`}
          fill="none"
          stroke="#7C3AED"
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>

      {/* Palace boxes */}
      {playing && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ position: 'absolute', inset: 0 }}
        >
          {chart.palaces.map((palace, i) => {
            const pos = positions[i];
            if (!pos) return null;
            const isMing = palace.nameZh === '命宫';
            const bx = pos.x - boxW / 2;
            const by = pos.y - boxH / 2;

            return (
              <motion.div
                key={`palace-${i}`}
                variants={boxVariants}
                style={{
                  position: 'absolute',
                  left: bx,
                  top: by,
                  width: boxW,
                  height: boxH,
                  background: isMing ? '#2D1B69' : '#1F2937',
                  border: `1px solid ${isMing ? '#A78BFA' : '#374151'}`,
                  borderRadius: 4,
                  padding: '4px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  boxSizing: 'border-box',
                }}
              >
                {/* Main star */}
                <motion.span
                  animate={{ opacity: [0.7, 1, 0.7], textShadow: ['0 0 4px rgba(196,181,253,0.3)', '0 0 10px rgba(196,181,253,0.8)', '0 0 4px rgba(196,181,253,0.3)'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                  style={{
                    color: isMing ? '#C4B5FD' : '#FCD34D',
                    fontSize: 11,
                    fontWeight: 'bold',
                    fontFamily: 'serif',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {palace.mainStar}
                </motion.span>
                {/* Minor stars */}
                <span style={{ color: '#94A3B8', fontSize: 8, textAlign: 'center', lineHeight: 1.2 }}>
                  {palace.stars.slice(0, 2).join(' · ')}
                </span>
                {/* Palace name */}
                <span style={{ color: '#7C3AED', fontSize: 8, fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                  {palace.nameZh}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Mingzhu center */}
      {playing && <MingzhuGlow mingzhu={chart.mingzhu} cx={cx} cy={cy + boxH * 0.1} />}

      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: playing ? 1 : 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: 10,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(124,58,237,0.7)',
          fontSize: 10,
          fontFamily: 'sans-serif',
          pointerEvents: 'none',
        }}
      >
        紫微斗数 · Zi Wei Dou Shu
      </motion.div>
    </div>
  );
}
