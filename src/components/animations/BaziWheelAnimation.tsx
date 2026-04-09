'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface BaZiChart {
  year: { heavenlyStem: string; earthlyBranch: string; element: string };
  month: { heavenlyStem: string; earthlyBranch: string; element: string };
  day: { heavenlyStem: string; earthlyBranch: string; element: string };
  hour: { heavenlyStem: string; earthlyBranch: string; element: string };
  dayMasterElement: string;
}

interface BaziWheelAnimationProps {
  birthDate?: string;
  birthTime?: string;
  name?: string;
  width?: number;
  height?: number;
  playing?: boolean;
}

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENTS = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];

const ELEMENT_COLORS: Record<string, string> = {
  '木': '#22C55E',
  '火': '#EF4444',
  '土': '#D97706',
  '金': '#9CA3AF',
  '水': '#3B82F6',
};

const ELEMENT_EN: Record<string, string> = {
  '木': 'Wood',
  '火': 'Fire',
  '土': 'Earth',
  '金': 'Metal',
  '水': 'Water',
};

function yearStemIndex(year: number): number {
  return ((year - 4) % 10 + 10) % 10;
}

function yearBranchIndex(year: number): number {
  return ((year - 4) % 12 + 12) % 12;
}

function hourBranchIndex(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2);
}

function julianDayNumber(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr +
    Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
}

function buildPillar(stemIdx: number, branchIdx: number) {
  return {
    heavenlyStem: HEAVENLY_STEMS[stemIdx % 10],
    earthlyBranch: EARTHLY_BRANCHES[branchIdx % 12],
    element: ELEMENTS[stemIdx % 10],
  };
}

function calculateBaZi(year: number, month: number, day: number, hour: number): BaZiChart {
  const yearStem = yearStemIndex(year);
  const yearBranch = yearBranchIndex(year);
  const monthStem = ((yearStem % 5) * 2 + (month - 1)) % 10;
  const monthBranch = (month + 1) % 12;
  const jdn = julianDayNumber(year, month, day);
  const dayStem = ((jdn - 11) % 10 + 10) % 10;
  const dayBranch = ((jdn - 11) % 12 + 12) % 12;
  const hourBranch = hourBranchIndex(hour);
  const hourStem = ((dayStem % 5) * 2 + hourBranch) % 10;
  return {
    year: buildPillar(yearStem, yearBranch),
    month: buildPillar(monthStem, monthBranch),
    day: buildPillar(dayStem, dayBranch),
    hour: buildPillar(hourStem, hourBranch),
    dayMasterElement: ELEMENTS[dayStem % 10],
  };
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

const PILLAR_LABELS = ['年', '月', '日', '时'];

// Animated arc segment
function AnimatedArc({
  cx, cy, innerR, outerR, startAngle, endAngle,
  color, delay, playing,
}: {
  cx: number; cy: number; innerR: number; outerR: number;
  startAngle: number; endAngle: number; color: string; delay: number; playing: boolean;
}) {
  const midR = (innerR + outerR) / 2;
  const path = describeArc(cx, cy, midR, startAngle, endAngle);
  const circumference = Math.PI * (outerR - innerR);
  const dashLength = (Math.PI * midR * 90) / 180;

  return (
    <motion.path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth={outerR - innerR}
      opacity={0.2}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={playing ? { pathLength: 1, opacity: 0.2 } : {}}
      transition={{
        pathLength: { duration: 1.2, delay, ease: 'easeInOut' },
        opacity: { duration: 0.4, delay },
      }}
    />
  );
}

// Animated radial line
function AnimatedRadialLine({
  cx, cy, innerR, outerR, angle, color, delay, playing,
}: {
  cx: number; cy: number; innerR: number; outerR: number; angle: number; color: string; delay: number; playing: boolean;
}) {
  const outer = polarToCartesian(cx, cy, outerR, angle);
  const inner = polarToCartesian(cx, cy, innerR, angle);
  return (
    <motion.line
      x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
      stroke={color}
      strokeWidth="2"
      initial={{ opacity: 0 }}
      animate={playing ? { opacity: 0.5 } : {}}
      transition={{ duration: 0.5, delay }}
    />
  );
}

// Animated pillar label
function AnimatedPillarLabel({
  cx, cy, r, angle, label, delay, playing,
}: {
  cx: number; cy: number; r: number; angle: number; label: string; delay: number; playing: boolean;
}) {
  const pos = polarToCartesian(cx, cy, r, angle);
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={playing ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.6 + delay, duration: 0.5, type: 'spring', stiffness: 200 }}
    >
      <text
        x={pos.x} y={pos.y}
        textAnchor="middle" dominantBaseline="middle"
        fill="#F59E0B" fontSize="14" fontWeight="bold" fontFamily="sans-serif"
      >
        {label}
      </text>
    </motion.g>
  );
}

// Animated stem/branch content
function AnimatedStemBranch({
  cx, cy, midR, angle, pillar, delay, playing,
}: {
  cx: number; cy: number; midR: number; angle: number; pillar: BaZiChart[keyof BaZiChart]; delay: number; playing: boolean;
}) {
  const pos = polarToCartesian(cx, cy, midR, angle);
  const elemColor = ELEMENT_COLORS[pillar.element];

  return (
    <motion.g
      initial={{ opacity: 0, y: 20 }}
      animate={playing ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.8 + delay, duration: 0.6, type: 'spring', stiffness: 150, damping: 15 }}
    >
      <text x={pos.x} y={pos.y - 14} textAnchor="middle" fill="#FCD34D" fontSize="18" fontWeight="bold" fontFamily="serif">
        {pillar.heavenlyStem}
      </text>
      <text x={pos.x} y={pos.y + 6} textAnchor="middle" fill="#FDBA74" fontSize="18" fontWeight="bold" fontFamily="serif">
        {pillar.earthlyBranch}
      </text>
      <text x={pos.x} y={pos.y + 24} textAnchor="middle" fill={elemColor} fontSize="11" fontFamily="sans-serif">
        {ELEMENT_EN[pillar.element]}
      </text>
    </motion.g>
  );
}

// Animated outer ring
function AnimatedRing({
  cx, cy, r, color, delay, playing,
}: {
  cx: number; cy: number; r: number; color: string; delay: number; playing: boolean;
}) {
  return (
    <motion.circle
      cx={cx} cy={cy} r={r}
      fill="none"
      stroke={color}
      strokeWidth="2"
      initial={{ opacity: 0 }}
      animate={playing ? { opacity: 0.6 } : {}}
      transition={{ duration: 0.8, delay }}
    />
  );
}

export default function BaziWheelAnimation({
  birthDate = '2000-08-16',
  birthTime = '02:00',
  width = 420,
  height = 420,
  playing = true,
}: BaziWheelAnimationProps) {
  const chart = useMemo(() => {
    try {
      const [year, month, day] = birthDate.split('-').map(Number);
      const [hourStr] = birthTime.split(':');
      const hour = parseInt(hourStr, 10);
      return calculateBaZi(year, month, day, hour);
    } catch {
      return calculateBaZi(2000, 8, 16, 2);
    }
  }, [birthDate, birthTime]);

  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 20;
  const innerRadius = outerRadius * 0.35;
  const midRadius = outerRadius * 0.65;

  const pillars = [
    { pillar: chart.year, angle: 0 },
    { pillar: chart.month, angle: 90 },
    { pillar: chart.day, angle: 180 },
    { pillar: chart.hour, angle: 270 },
  ];

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ background: 'transparent' }}
      >
        <defs>
          <filter id="bazi-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer and inner rings */}
        <AnimatedRing cx={centerX} cy={centerY} r={outerRadius} color="#7C3AED" delay={0} playing={playing} />
        <AnimatedRing cx={centerX} cy={centerY} r={innerRadius} color="#F59E0B" delay={0.2} playing={playing} />

        {/* Arc segments */}
        {[0, 90, 180, 270].map((startAngle, i) => {
          const endAngle = startAngle + 90;
          const segColor = i % 2 === 0 ? '#7C3AED' : '#F59E0B';
          return (
            <AnimatedArc
              key={i}
              cx={centerX} cy={centerY}
              innerR={innerRadius} outerR={outerRadius}
              startAngle={startAngle} endAngle={endAngle}
              color={segColor}
              delay={0.1 * i}
              playing={playing}
            />
          );
        })}

        {/* Radial lines */}
        {[0, 90, 180, 270].map((angle, i) => (
          <AnimatedRadialLine
            key={i}
            cx={centerX} cy={centerY}
            innerR={innerRadius} outerR={outerRadius}
            angle={angle}
            color="#7C3AED"
            delay={0.3 + i * 0.1}
            playing={playing}
          />
        ))}

        {/* Pillar labels */}
        {pillars.map((p, i) => (
          <AnimatedPillarLabel
            key={i}
            cx={centerX} cy={centerY}
            r={outerRadius + 12}
            angle={p.angle + 45}
            label={PILLAR_LABELS[i]}
            delay={i * 0.1}
            playing={playing}
          />
        ))}

        {/* Pillar content (stem/branch) */}
        {pillars.map((p, i) => (
          <AnimatedStemBranch
            key={i}
            cx={centerX} cy={centerY}
            midR={midRadius}
            angle={p.angle + 45}
            pillar={p.pillar}
            delay={i * 0.1}
            playing={playing}
          />
        ))}

        {/* Center: Day Master */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={innerRadius * 0.8}
          fill="#1F2937"
          stroke="#F59E0B"
          strokeWidth="2"
          filter="url(#bazi-glow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={playing ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 1.0, duration: 0.5, type: 'spring', stiffness: 200 }}
        />
        <motion.text
          x={centerX}
          y={centerY - 8}
          textAnchor="middle"
          fill="#F59E0B"
          fontSize="24"
          fontWeight="bold"
          fontFamily="serif"
          initial={{ opacity: 0 }}
          animate={playing ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          {chart.day.heavenlyStem}
        </motion.text>
        <motion.text
          x={centerX}
          y={centerY + 14}
          textAnchor="middle"
          fill={ELEMENT_COLORS[chart.dayMasterElement]}
          fontSize="12"
          fontFamily="sans-serif"
          initial={{ opacity: 0 }}
          animate={playing ? { opacity: 1 } : {}}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          {ELEMENT_EN[chart.dayMasterElement]}
        </motion.text>

        {/* Title */}
        <motion.text
          x={centerX}
          y={height - 6}
          textAnchor="middle"
          fill="rgba(245,158,11,0.5)"
          fontSize="9"
          fontFamily="sans-serif"
          initial={{ opacity: 0 }}
          animate={playing ? { opacity: 1 } : {}}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          八字 · Ba Zi
        </motion.text>
      </svg>
    </div>
  );
}
