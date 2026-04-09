'use client';

import { useMemo } from 'react';

interface ZiWeiPalaceWidgetProps {
  birthDate?: string;
  birthTime?: number;
  birthdayType?: 'solar' | 'lunar';
  gender?: 'male' | 'female';
  width?: number;
  height?: number;
}

// Simple ZiWei palace data structure
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

const PALACE_NAMES = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫'];
const PALACE_NAMES_EN = ['Ming', 'Siblings', 'Spouse', 'Children', 'Wealth', 'Health', 'Travel', 'Servants', 'Career', 'Property', 'Fortune', 'Parents'];

const MAIN_STARS = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];
const MINOR_STARS = ['文昌', '文曲', '左辅', '右弼', '天魁', '天钺', '火星', '铃星', '擎羊', '陀罗'];

// Simplified ZiWei calculation (placeholder)
function calculateZiwei(birthDate: string, birthTime: number, gender: 'male' | 'female'): ZiweiChart {
  // Use date components as seed for deterministic placeholder
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

  return {
    palaces,
    mingzhu: MAIN_STARS[seed % MAIN_STARS.length],
  };
}

export default function ZiWeiPalaceWidget({
  birthDate = '2000-08-16',
  birthTime = 2,
  gender = 'male',
  width = 400,
  height = 400,
}: ZiWeiPalaceWidgetProps) {
  const chart = useMemo(() => {
    try {
      return calculateZiwei(birthDate, birthTime, gender);
    } catch {
      return calculateZiwei('2000-08-16', 2, 'male');
    }
  }, [birthDate, birthTime, gender]);

  const cx = width / 2;
  const cy = height / 2;
  const outerSize = Math.min(width, height) * 0.9;
  const boxW = outerSize / 3.2;
  const boxH = outerSize / 4;

  // Grid positions: 3x4 grid, centers at cx, cy offset
  const positions = [
    // Row 0: 3-2-1 (top-right to top-left)
    { x: cx + boxW * 0.6, y: cy - boxH * 1.3, palaceIdx: 2 },
    { x: cx, y: cy - boxH * 1.3, palaceIdx: 1 },
    { x: cx - boxW * 0.6, y: cy - boxH * 1.3, palaceIdx: 0 },
    // Row 1: 4-12-11 (middle-right to middle-left)
    { x: cx + boxW * 0.6, y: cy - boxH * 0.1, palaceIdx: 3 },
    { x: cx + boxW * 0.6, y: cy + boxH * 0.6, palaceIdx: 4 },
    { x: cx, y: cy + boxH * 1.1, palaceIdx: 11 },
    { x: cx - boxW * 0.6, y: cy + boxH * 0.6, palaceIdx: 5 },
    { x: cx - boxW * 0.6, y: cy - boxH * 0.1, palaceIdx: 10 },
    // Row 2: 6-7-8 (bottom-right to bottom-left)
    { x: cx + boxW * 0.6, y: cy + boxH * 1.1, palaceIdx: 6 },
    { x: cx, y: cy + boxH * 1.1, palaceIdx: 7 },
    { x: cx - boxW * 0.6, y: cy + boxH * 1.1, palaceIdx: 8 },
    // Row 3: 9 (center bottom)
    { x: cx, y: cy + boxH * 2.3, palaceIdx: 9 },
  ];

  const drawBox = (
    x: number,
    y: number,
    palace: typeof chart.palaces[0],
    isMing: boolean
  ) => {
    const bx = x - boxW / 2;
    const by = y - boxH / 2;

    return (
      <g key={`palace-${palace.nameZh}`}>
        <rect
          x={bx}
          y={by}
          width={boxW}
          height={boxH}
          fill={isMing ? '#2D1B69' : '#1F2937'}
          stroke={isMing ? '#A78BFA' : '#374151'}
          strokeWidth={isMing ? 2 : 1}
          rx={4}
        />
        {isMing && (
          <rect
            x={bx}
            y={by}
            width={boxW}
            height={boxH}
            fill="none"
            stroke="#A78BFA"
            strokeWidth="1"
            rx={4}
            strokeDasharray="3,2"
            opacity="0.5"
          />
        )}
        {/* Main star */}
        <text
          x={x}
          y={by + boxH * 0.3}
          textAnchor="middle"
          fill={isMing ? '#C4B5FD' : '#FCD34D'}
          fontSize={isMing ? '11' : '10'}
          fontWeight="bold"
          fontFamily="serif"
        >
          {palace.mainStar}
        </text>
        {/* Minor stars */}
        <text
          x={x}
          y={by + boxH * 0.55}
          textAnchor="middle"
          fill="#94A3B8"
          fontSize="8"
          fontFamily="sans-serif"
        >
          {palace.stars.slice(0, 2).join(' · ')}
        </text>
        {/* Palace name */}
        <text
          x={x}
          y={by + boxH * 0.8}
          textAnchor="middle"
          fill="#7C3AED"
          fontSize="8"
          fontFamily="sans-serif"
          fontWeight="bold"
        >
          {palace.nameZh}
        </text>
      </g>
    );
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="zw-glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill="#0F172A" rx="8" />

      {/* Grid lines connecting boxes - diamond pattern */}
      {/* Top connections */}
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

      {/* Center diamond - body */}
      <polygon
        points={`${cx},${cy - boxH * 0.65} ${cx + boxW * 0.6},${cy + boxH * 0.25} ${cx},${cy + boxH * 0.85} ${cx - boxW * 0.6},${cy + boxH * 0.25}`}
        fill="none"
        stroke="#7C3AED"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Ming Zhu indicator in center */}
      <circle cx={cx} cy={cy + boxH * 0.1} r="14" fill="#1F2937" stroke="#A78BFA" strokeWidth="1.5" filter="url(#zw-glow)" />
      <text x={cx} y={cy + boxH * 0.1 + 4} textAnchor="middle" fill="#C4B5FD" fontSize="9" fontWeight="bold" fontFamily="serif">
        {chart.mingzhu}
      </text>

      {/* Palaces */}
      {chart.palaces.map((palace, i) => {
        const pos = positions[i];
        if (!pos) return null;
        const isMing = palace.nameZh === '命宫';
        return drawBox(pos.x, pos.y, palace, isMing);
      })}

      {/* Title */}
      <text
        x={cx}
        y={height - 10}
        textAnchor="middle"
        fill="#7C3AED"
        fontSize="10"
        fontFamily="sans-serif"
        opacity="0.7"
      >
        紫微斗数 · Zi Wei Dou Shu
      </text>
    </svg>
  );
}
