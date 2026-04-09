'use client';

import { useMemo } from 'react';

interface BaZiChart {
  year: { heavenlyStem: string; earthlyBranch: string; element: string };
  month: { heavenlyStem: string; earthlyBranch: string; element: string };
  day: { heavenlyStem: string; earthlyBranch: string; element: string };
  hour: { heavenlyStem: string; earthlyBranch: string; element: string };
  dayMasterElement: string;
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

interface BaziWheelWidgetProps {
  birthDate?: string;
  birthTime?: string;
  name?: string;
  width?: number;
  height?: number;
}

export default function BaziWheelWidget({
  birthDate = '2000-08-16',
  birthTime = '02:00',
  width = 400,
  height = 400,
}: BaziWheelWidgetProps) {
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
    { label: '年', pillar: chart.year, angle: 0 },
    { label: '月', pillar: chart.month, angle: 90 },
    { label: '日', pillar: chart.day, angle: 180 },
    { label: '时', pillar: chart.hour, angle: 270 },
  ];

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  }

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: 'transparent' }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer ring */}
      <circle
        cx={centerX}
        cy={centerY}
        r={outerRadius}
        fill="none"
        stroke="#7C3AED"
        strokeWidth="2"
        opacity="0.6"
      />
      <circle
        cx={centerX}
        cy={centerY}
        r={innerRadius}
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2"
        opacity="0.6"
      />

      {/* Four segment arcs */}
      {[0, 90, 180, 270].map((startAngle, i) => {
        const endAngle = startAngle + 90;
        const midAngle = startAngle + 45;
        const segColor = i % 2 === 0 ? '#7C3AED' : '#F59E0B';
        return (
          <path
            key={i}
            d={describeArc(centerX, centerY, (outerRadius + innerRadius) / 2, startAngle, endAngle)}
            fill="none"
            stroke={segColor}
            strokeWidth={outerRadius - innerRadius}
            opacity="0.15"
          />
        );
      })}

      {/* Element distribution bars */}
      {pillars.map((p, i) => {
        const angle = p.angle;
        const outer = polarToCartesian(centerX, centerY, outerRadius - 5, angle);
        const inner = polarToCartesian(centerX, centerY, innerRadius + 5, angle);
        return (
          <line
            key={i}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={ELEMENT_COLORS[p.pillar.element]}
            strokeWidth="2"
            opacity="0.5"
          />
        );
      })}

      {/* Center: Day Master */}
      <circle
        cx={centerX}
        cy={centerY}
        r={innerRadius * 0.8}
        fill="#1F2937"
        stroke="#F59E0B"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <text
        x={centerX}
        y={centerY - 8}
        textAnchor="middle"
        fill="#F59E0B"
        fontSize="24"
        fontWeight="bold"
        fontFamily="serif"
      >
        {chart.day.heavenlyStem}
      </text>
      <text
        x={centerX}
        y={centerY + 14}
        textAnchor="middle"
        fill={ELEMENT_COLORS[chart.dayMasterElement]}
        fontSize="12"
        fontFamily="sans-serif"
      >
        {ELEMENT_EN[chart.dayMasterElement]}
      </text>

      {/* Pillar labels on outer ring */}
      {pillars.map((p, i) => {
        const labelAngle = p.angle + 45;
        const pos = polarToCartesian(centerX, centerY, outerRadius + 12, labelAngle);
        return (
          <g key={i}>
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#F59E0B"
              fontSize="14"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {p.label}
            </text>
          </g>
        );
      })}

      {/* Pillar content at each direction */}
      {pillars.map((p, i) => {
        const labelAngle = p.angle + 45;
        const midPos = polarToCartesian(centerX, centerY, midRadius, labelAngle);
        const elemColor = ELEMENT_COLORS[p.pillar.element];

        return (
          <g key={i}>
            {/* Stem */}
            <text
              x={midPos.x}
              y={midPos.y - 14}
              textAnchor="middle"
              fill="#FCD34D"
              fontSize="18"
              fontWeight="bold"
              fontFamily="serif"
            >
              {p.pillar.heavenlyStem}
            </text>
            {/* Branch */}
            <text
              x={midPos.x}
              y={midPos.y + 6}
              textAnchor="middle"
              fill="#FDBA74"
              fontSize="18"
              fontWeight="bold"
              fontFamily="serif"
            >
              {p.pillar.earthlyBranch}
            </text>
            {/* Element */}
            <text
              x={midPos.x}
              y={midPos.y + 24}
              textAnchor="middle"
              fill={elemColor}
              fontSize="11"
              fontFamily="sans-serif"
            >
              {ELEMENT_EN[p.pillar.element]}
            </text>
          </g>
        );
      })}

      {/* Radial lines dividing the wheel */}
      {[0, 90, 180, 270].map((angle, i) => {
        const outer = polarToCartesian(centerX, centerY, outerRadius, angle);
        return (
          <line
            key={i}
            x1={outer.x}
            y1={outer.y}
            x2={centerX + innerRadius * Math.cos(((angle - 90) * Math.PI) / 180)}
            y2={centerY + innerRadius * Math.sin(((angle - 90) * Math.PI) / 180)}
            stroke="#7C3AED"
            strokeWidth="1"
            opacity="0.4"
          />
        );
      })}
    </svg>
  );
}
