'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * InteractiveLifeChart — Full-screen Enhanced Life K-Line
 *
 * Taste Rule: 深空黑、星云紫金渐变、克制光效
 *
 * Features:
 * - SVG animated life fortune K-line (2000–2050)
 * - Interactive hover: tooltips with fortune details
 * - Peak / Valley / Shift markers
 * - Animated line draw on scroll-into-view
 * - Gold-to-purple gradient line
 */

const PHASE_NAMES_ZH: Record<string, string> = {
  childhood: '童年',
  youth: '少年',
  youngAdult: '青年',
  establishing: '而立',
  clarifying: '不惑',
  wisdom: '知命',
  harmony: '耳顺',
  retirement: '花甲',
};

const PHASE_NAMES_EN: Record<string, string> = {
  childhood: 'Childhood',
  youth: 'Youth',
  youngAdult: 'Young Adult',
  establishing: 'Establishing',
  clarifying: 'Clarifying',
  wisdom: 'Wisdom',
  harmony: 'Harmony',
  retirement: 'Retirement',
};

interface FortunePoint {
  year: number;
  value: number; // 0–100
  phase: string;
}

const EVENTS: { year: number; label: { zh: string; en: string }; type: 'peak' | 'valley' | 'shift'; insight?: string }[] = [
  { year: 2005, label: { zh: '求学', en: 'School' }, type: 'shift', insight: 'growth' },
  { year: 2010, label: { zh: '事业起步', en: 'Career Start' }, type: 'peak', insight: 'peak' },
  { year: 2014, label: { zh: '低谷', en: 'Valley' }, type: 'valley', insight: 'valley' },
  { year: 2020, label: { zh: '大运转换', en: 'Decade Shift' }, type: 'shift', insight: 'growth' },
  { year: 2025, label: { zh: '高峰期', en: 'Peak Phase' }, type: 'peak', insight: 'peak' },
];

const FORTUNE_DATA: FortunePoint[] = [
  { year: 2000, value: 40, phase: 'childhood' },
  { year: 2001, value: 44, phase: 'childhood' },
  { year: 2002, value: 48, phase: 'childhood' },
  { year: 2003, value: 50, phase: 'childhood' },
  { year: 2004, value: 53, phase: 'childhood' },
  { year: 2005, value: 55, phase: 'youth' },
  { year: 2006, value: 58, phase: 'youth' },
  { year: 2007, value: 60, phase: 'youth' },
  { year: 2008, value: 58, phase: 'youth' },
  { year: 2009, value: 62, phase: 'youth' },
  { year: 2010, value: 72, phase: 'youngAdult' },
  { year: 2011, value: 78, phase: 'youngAdult' },
  { year: 2012, value: 82, phase: 'youngAdult' },
  { year: 2013, value: 80, phase: 'youngAdult' },
  { year: 2014, value: 65, phase: 'establishing' },
  { year: 2015, value: 68, phase: 'establishing' },
  { year: 2016, value: 72, phase: 'establishing' },
  { year: 2017, value: 70, phase: 'establishing' },
  { year: 2018, value: 75, phase: 'establishing' },
  { year: 2019, value: 78, phase: 'establishing' },
  { year: 2020, value: 80, phase: 'clarifying' },
  { year: 2021, value: 85, phase: 'clarifying' },
  { year: 2022, value: 88, phase: 'clarifying' },
  { year: 2023, value: 82, phase: 'clarifying' },
  { year: 2024, value: 78, phase: 'clarifying' },
  { year: 2025, value: 90, phase: 'wisdom' },
  { year: 2026, value: 95, phase: 'wisdom' },
  { year: 2027, value: 88, phase: 'wisdom' },
  { year: 2028, value: 82, phase: 'wisdom' },
  { year: 2029, value: 78, phase: 'wisdom' },
  { year: 2030, value: 85, phase: 'harmony' },
];

export default function InteractiveLifeChart() {
  const { lang } = useLanguage();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger animation on scroll-into-view
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setIsVisible(true);
    });
  }, []);

  // Observe container
  const observerRef = useRef<IntersectionObserver | null>(null);
  const initObserver = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    observerRef.current = new IntersectionObserver(handleIntersection, { threshold: 0.2 });
    observerRef.current.observe(el);
  }, [handleIntersection]);

  const W = 800;
  const H = 260;
  const PAD_L = 50;
  const PAD_R = 30;
  const PAD_T = 40;
  const PAD_B = 45;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const minYear = FORTUNE_DATA[0].year;
  const maxYear = FORTUNE_DATA[FORTUNE_DATA.length - 1].year;

  const points = FORTUNE_DATA.map((d) => ({
    ...d,
    x: PAD_L + ((d.year - minYear) / (maxYear - minYear)) * chartW,
    y: PAD_T + chartH - ((d.value - 30) / 70) * chartH,
  }));

  // Smooth bezier path
  const smoothPath = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.4;
    const cpx2 = p.x - (p.x - prev.x) * 0.4;
    return `${acc} C${cpx1.toFixed(1)},${prev.y.toFixed(1)} ${cpx2.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }, '');

  const areaPath = `${smoothPath} L${points[points.length - 1].x},${PAD_T + chartH} L${points[0].x},${PAD_T + chartH} Z`;

  const markerColor = (type: string) =>
    type === 'peak' ? '#F59E0B' : type === 'valley' ? 'rgba(239,68,68,0.7)' : 'rgba(168,130,255,0.8)';

  return (
    <div ref={(el) => { initObserver(el as HTMLDivElement); }} className="w-full">
      <div className="border border-white/[0.06] rounded-2xl bg-white/[0.01] p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[640px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            preserveAspectRatio="xMidYMid meet"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              {/* Gradient: purple → gold (Taste Rule: 星云紫金渐变) */}
              <linearGradient id="kline-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(124,58,237,0.7)" />
                <stop offset="50%" stopColor="rgba(168,130,255,0.9)" />
                <stop offset="100%" stopColor="rgba(245,158,11,0.8)" />
              </linearGradient>
              <linearGradient id="kline-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(168,130,255,0.2)" />
                <stop offset="60%" stopColor="rgba(124,58,237,0.05)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <filter id="line-glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal grid lines */}
            {[0.25, 0.5, 0.75].map((pct) => (
              <line
                key={pct}
                x1={PAD_L}
                y1={PAD_T + chartH * (1 - pct)}
                x2={W - PAD_R}
                y2={PAD_T + chartH * (1 - pct)}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="0.5"
              />
            ))}

            {/* Area fill */}
            <motion.path
              d={areaPath}
              fill="url(#kline-area)"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />

            {/* Fortune K-line — animated draw */}
            <motion.path
              d={smoothPath}
              fill="none"
              stroke="url(#kline-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#line-glow)"
              initial={{ pathLength: 0 }}
              animate={isVisible ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
            />

            {/* Event markers */}
            {EVENTS.map((evt, i) => {
              const idx = FORTUNE_DATA.findIndex((d) => d.year === evt.year);
              if (idx < 0) return null;
              const pt = points[idx];
              const mc = markerColor(evt.type);

              return (
                <motion.g
                  key={evt.year}
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 1.5 + i * 0.2 }}
                >
                  {/* Vertical marker line */}
                  <line
                    x1={pt.x} y1={pt.y}
                    x2={pt.x} y2={PAD_T + chartH}
                    stroke={mc}
                    strokeWidth="0.5"
                    strokeDasharray="3 3"
                    opacity="0.4"
                  />

                  {/* Marker dot */}
                  <circle cx={pt.x} cy={pt.y} r="5" fill={mc} stroke="#0a0a0a" strokeWidth="2" />

                  {/* Pulsing ring for peaks */}
                  {evt.type === 'peak' && (
                    <motion.circle
                      cx={pt.x} cy={pt.y} r="9"
                      fill="none"
                      stroke={mc}
                      strokeWidth="1"
                      animate={{ r: [9, 15, 9], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  {/* Year label */}
                  <text
                    x={pt.x} y={pt.y - 16}
                    textAnchor="middle"
                    fill={mc}
                    fontSize="8"
                    fontFamily="serif"
                  >
                    {evt.year}
                  </text>

                  {/* Event label */}
                  <text
                    x={pt.x} y={pt.y - 26}
                    textAnchor="middle"
                    fill={mc}
                    fontSize="7"
                    opacity="0.8"
                  >
                    {lang === 'zh' ? evt.label.zh : evt.label.en}
                  </text>
                </motion.g>
              );
            })}

            {/* Interactive hover overlay — invisible hit areas */}
            {FORTUNE_DATA.map((d, i) => (
              <motion.rect
                key={d.year}
                x={points[i].x - 12}
                y={PAD_T}
                width={24}
                height={chartH}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
                style={{ cursor: 'crosshair' }}
              />
            ))}

            {/* Hover tooltip */}
            {hoveredIdx !== null && (() => {
              const pt = points[hoveredIdx];
              const d = FORTUNE_DATA[hoveredIdx];
              const phaseName = lang === 'zh'
                ? PHASE_NAMES_ZH[d.phase] || d.phase
                : PHASE_NAMES_EN[d.phase] || d.phase;

              const tooltipX = Math.min(Math.max(pt.x, 80), W - 80);

              return (
                <motion.g
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Tooltip box */}
                  <rect
                    x={tooltipX - 52}
                    y={pt.y - 70}
                    width={104}
                    height={60}
                    rx="6"
                    fill="rgba(10,10,10,0.9)"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                  {/* Year */}
                  <text x={tooltipX} y={pt.y - 52} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9">
                    {d.year}
                  </text>
                  {/* Fortune value */}
                  <text x={tooltipX} y={pt.y - 36} textAnchor="middle" fill="#F59E0B" fontSize="14" fontFamily="serif">
                    {d.value}
                  </text>
                  {/* Phase */}
                  <text x={tooltipX} y={pt.y - 20} textAnchor="middle" fill="rgba(168,130,255,0.7)" fontSize="8">
                    {phaseName}
                  </text>
                  {/* Connector line */}
                  <line
                    x1={tooltipX} y1={pt.y - 10}
                    x2={pt.x} y2={pt.y}
                    stroke="rgba(245,158,11,0.4)"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                  />
                </motion.g>
              );
            })()}

            {/* Year axis labels — every 5 years */}
            {FORTUNE_DATA.filter((_, i) => (FORTUNE_DATA[i].year % 5 === 0)).map((d, i, arr) => {
              const idx = FORTUNE_DATA.indexOf(d);
              const pt = points[idx];
              return (
                <text
                  key={d.year}
                  x={pt.x}
                  y={H - 8}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.2)"
                  fontSize="8"
                >
                  {d.year}
                </text>
              );
            })}

            {/* Current year indicator (2025) */}
            {(() => {
              const curIdx = FORTUNE_DATA.findIndex((d) => d.year === 2025);
              if (curIdx < 0) return null;
              const pt = points[curIdx];
              return (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 2 }}
                >
                  <line x1={pt.x} y1={PAD_T - 5} x2={pt.x} y2={PAD_T + chartH} stroke="rgba(245,158,11,0.35)" strokeWidth="1" />
                  <text x={pt.x} y={PAD_T - 10} textAnchor="middle" fill="rgba(245,158,11,0.6)" fontSize="7">
                    {lang === 'zh' ? '▼ 当前' : '▼ Now'}
                  </text>
                </motion.g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mt-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B' }} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {lang === 'zh' ? '高峰' : 'Peak'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(239,68,68,0.7)' }} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {lang === 'zh' ? '低谷' : 'Valley'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(168,130,255,0.8)' }} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {lang === 'zh' ? '运势转折' : 'Fortune Shift'}
          </span>
        </div>
        <span className="text-[9px] ml-auto" style={{ color: 'rgba(255,255,255,0.15)' }}>
          {lang === 'zh' ? '← 悬停查看年度详情 →' : '← Hover for year details →'}
        </span>
      </div>
    </div>
  );
}
