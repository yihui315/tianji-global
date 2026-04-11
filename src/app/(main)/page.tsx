'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import DynamicHero from '@/components/hero/DynamicHero';
import { SERVICES } from '@/data/services';

/**
 * TianJi Global — Premium Commercial Landing Page
 *
 * Sections:
 * 1. Immersive Hero (existing DynamicHero)
 * 2. Sticky Storytelling / Visual Transition
 * 3. Services Grid (enhanced)
 * 4. How It Works (enhanced with animations)
 * 5. Advanced Chart Mock Preview
 * 6. Testimonials / Social Proof
 * 7. Pricing Preview
 * 8. FAQ
 * 9. Final CTA
 * 10. Rich Footer
 */

/* ═══════════════════════════════════════════
   Section Heading Component
   ═══════════════════════════════════════════ */
function SectionHeading({
  zh,
  en,
  subtitle,
}: {
  zh: string;
  en: string;
  subtitle?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="text-center mb-12 sm:mb-16"
    >
      <h2 className="text-4xl sm:text-5xl font-serif text-white mb-3">{zh}</h2>
      <p className="text-white/35 text-sm tracking-widest uppercase">{en}</p>
      {subtitle && (
        <p className="text-white/50 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Fade-In Wrapper
   ═══════════════════════════════════════════ */
function FadeInWhenVisible({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Sticky Storytelling — Data & Visual Card
   ═══════════════════════════════════════════ */

/** Text blocks for the left-scrolling column. Replace copy in production. */
const STORY_BLOCKS = [
  {
    id: 'chart',
    badge: '命盘结构',
    badgeEn: 'Chart Structure',
    title: '精密的命盘架构',
    titleEn: 'Precision Chart Architecture',
    body: '从紫微十二宫到西方黄道十二宫，每一颗星曜的位置都经过瑞士星历表（Swiss Ephemeris）精确到角秒级别的计算。',
    bodyEn:
      'From Zi Wei\'s 12 palaces to the Western zodiac, every celestial body is computed to arc-second precision via Swiss Ephemeris.',
    accent: 'purple' as const,
  },
  {
    id: 'relationship',
    badge: '关系洞察',
    badgeEn: 'Relationship Insights',
    title: '深层关系解读',
    titleEn: 'Deep Relationship Analysis',
    body: '合盘分析、复合盘与戴维森盘，多维度揭示两人之间的能量互动与成长契机。',
    bodyEn:
      'Synastry, composite, and Davison charts reveal multi-dimensional energy dynamics and growth opportunities between two people.',
    accent: 'amber' as const,
  },
  {
    id: 'rhythm',
    badge: '生命节律',
    badgeEn: 'Life Rhythm',
    title: '长周期运势节律',
    titleEn: 'Long-Term Life Rhythm',
    body: '大运流年、Transit推运与太阳返照，精准追踪人生各阶段的能量高峰与转折点。',
    bodyEn:
      'Decade luck pillars, transits, and solar returns precisely track energy peaks and turning points across life stages.',
    accent: 'purple' as const,
  },
];

/** Individual story block — extracted to satisfy React hooks rules */
function StoryBlock({
  block,
  onActive,
}: {
  block: typeof STORY_BLOCKS[number];
  onActive: (id: string) => void;
}) {
  const blockRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(blockRef, { margin: '-40% 0px -40% 0px' });

  // Update active story when this block enters center viewport
  if (isInView) {
    onActive(block.id);
  }

  return (
    <motion.div
      ref={blockRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      viewport={{ once: true, margin: '-60px' }}
      className="lg:min-h-[50vh] flex flex-col justify-center"
    >
      <span
        className={`inline-block text-[10px] tracking-widest uppercase mb-3 ${
          block.accent === 'amber' ? 'text-amber-400/60' : 'text-purple-400/60'
        }`}
      >
        {block.badge} · {block.badgeEn}
      </span>
      <h3 className="text-2xl sm:text-3xl font-serif text-white mb-2">
        {block.title}
      </h3>
      <p className="text-white/30 text-xs mb-4">{block.titleEn}</p>
      <p className="text-white/55 text-sm sm:text-base leading-relaxed">
        {block.body}
      </p>
      <p className="text-white/25 text-xs mt-2 leading-relaxed">
        {block.bodyEn}
      </p>

      {/* Mobile: inline visual card (hidden on lg) */}
      <div className="mt-8 lg:hidden">
        <StoryVisualCard activeId={block.id} />
      </div>
    </motion.div>
  );
}
function StoryVisualCard({ activeId }: { activeId: string }) {
  /* Data layers — replace with real chart data in production */
  const layers = [
    { label: '命宫', labelEn: 'Life', value: 0.88, color: 'rgba(168,130,255,0.7)' },
    { label: '财帛', labelEn: 'Wealth', value: 0.72, color: 'rgba(245,158,11,0.6)' },
    { label: '官禄', labelEn: 'Career', value: 0.81, color: 'rgba(168,130,255,0.5)' },
    { label: '夫妻', labelEn: 'Partner', value: 0.65, color: 'rgba(245,158,11,0.45)' },
    { label: '迁移', labelEn: 'Travel', value: 0.77, color: 'rgba(168,130,255,0.4)' },
  ];

  const emphasisMap: Record<string, number[]> = {
    chart: [0, 2],
    relationship: [3, 4],
    rhythm: [0, 1, 2],
  };
  const emphasisIndices = emphasisMap[activeId] ?? [0];

  return (
    <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-serif text-white/80">命盘能量分布</h4>
          <p className="text-white/25 text-[10px] mt-0.5">Palace Energy Distribution</p>
        </div>
        <span className="text-white/15 text-[10px] bg-white/[0.04] px-2.5 py-1 rounded-full">
          LIVE · 实时
        </span>
      </div>

      {/* Animated horizontal bars */}
      <div className="space-y-4">
        {layers.map((layer, i) => {
          const isActive = emphasisIndices.includes(i);
          return (
            <div key={layer.labelEn}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-white/50">
                  {layer.label}{' '}
                  <span className="text-white/20">{layer.labelEn}</span>
                </span>
                <span className="text-[10px] text-white/30 tabular-nums">
                  {Math.round(layer.value * 100)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: layer.color }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${layer.value * 100}%`,
                    opacity: isActive ? 1 : 0.35,
                  }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 mt-6">
        {[
          { label: '甲木日主', en: 'Day Master: Jia', active: activeId === 'chart' },
          { label: '天蝎上升', en: 'ASC Scorpio', active: activeId === 'relationship' },
          { label: '大运·壬寅', en: 'Decade: Ren-Yin', active: activeId === 'rhythm' },
        ].map((badge) => (
          <motion.span
            key={badge.en}
            animate={{ opacity: badge.active ? 1 : 0.3, scale: badge.active ? 1 : 0.97 }}
            transition={{ duration: 0.4 }}
            className="text-[10px] bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1 text-white/50"
          >
            {badge.label} <span className="text-white/20">{badge.en}</span>
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Premium Circular Energy Chart (SVG)
   — replaces old MockRadarChart
   ═══════════════════════════════════════════ */
function CircularEnergyChart() {
  const size = 220;
  const center = size / 2;
  const outerR = 85;
  /* Mock energy arcs — replace values (0-1) with real palace/planet energy data */
  const arcs = [
    { label: '财运', labelEn: 'Wealth', value: 0.85, color: '#F59E0B' },
    { label: '事业', labelEn: 'Career', value: 0.72, color: '#A78BFA' },
    { label: '健康', labelEn: 'Health', value: 0.91, color: '#34D399' },
    { label: '感情', labelEn: 'Love', value: 0.68, color: '#F472B6' },
    { label: '学业', labelEn: 'Study', value: 0.78, color: '#60A5FA' },
    { label: '人际', labelEn: 'Social', value: 0.88, color: '#FBBF24' },
  ];
  const gap = 3; // degrees gap between arcs
  const arcSpan = (360 - arcs.length * gap) / arcs.length;

  const describeArc = (startAngle: number, endAngle: number, r: number) => {
    const s = ((startAngle - 90) * Math.PI) / 180;
    const e = ((endAngle - 90) * Math.PI) / 180;
    const x1 = center + r * Math.cos(s);
    const y1 = center + r * Math.sin(s);
    const x2 = center + r * Math.cos(e);
    const y2 = center + r * Math.sin(e);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      {/* Background ring */}
      <circle cx={center} cy={center} r={outerR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
      {/* Energy arcs with animated draw */}
      {arcs.map((arc, i) => {
        const startDeg = i * (arcSpan + gap);
        const endDeg = startDeg + arcSpan * arc.value;
        const fullEnd = startDeg + arcSpan;
        return (
          <g key={arc.labelEn}>
            {/* Track */}
            <path
              d={describeArc(startDeg, fullEnd, outerR)}
              fill="none"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Animated value arc */}
            <motion.path
              d={describeArc(startDeg, endDeg, outerR)}
              fill="none"
              stroke={arc.color}
              strokeWidth="14"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.85 }}
              transition={{ duration: 1.2, delay: i * 0.12, ease: 'easeOut' }}
              viewport={{ once: true }}
              style={{ filter: `drop-shadow(0 0 6px ${arc.color}40)` }}
            />
            {/* Label */}
            {(() => {
              const midDeg = startDeg + arcSpan / 2;
              const labelR = outerR + 18;
              const rad = ((midDeg - 90) * Math.PI) / 180;
              const lx = center + labelR * Math.cos(rad);
              const ly = center + labelR * Math.sin(rad);
              return (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.45)"
                  fontSize="7"
                  fontFamily="serif"
                >
                  {arc.label}
                </text>
              );
            })()}
          </g>
        );
      })}
      {/* Center score — replace with real composite score */}
      <text x={center} y={center - 6} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="22" fontFamily="serif">
        82
      </text>
      <text x={center} y={center + 12} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7">
        综合能量 · Overall
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Premium Line Chart — Life Timeline (SVG)
   ═══════════════════════════════════════════ */
function LifeTimelineChart() {
  /* Mock decade data — replace with real BaZi decade-luck or transit data */
  const decades = ['10s', '20s', '30s', '40s', '50s', '60s', '70s'];
  const values = [55, 68, 82, 75, 91, 84, 72]; // 0-100 scale
  const w = 340;
  const h = 140;
  const padX = 30;
  const padY = 20;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  const points = values.map((v, i) => ({
    x: padX + (i / (values.length - 1)) * chartW,
    y: padY + chartH - (v / 100) * chartH,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  // Gradient area path
  const areaPath = `${linePath} L${points[points.length - 1].x},${h - padY} L${points[0].x},${h - padY} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="timeline-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(168,130,255,0.25)" />
          <stop offset="100%" stopColor="rgba(168,130,255,0)" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <line
          key={pct}
          x1={padX}
          y1={padY + chartH * (1 - pct)}
          x2={w - padX}
          y2={padY + chartH * (1 - pct)}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="0.5"
        />
      ))}
      {/* Filled area under curve */}
      <motion.path
        d={areaPath}
        fill="url(#timeline-grad)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        viewport={{ once: true }}
      />
      {/* Animated line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke="rgba(168,130,255,0.7)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        viewport={{ once: true }}
        style={{ filter: 'drop-shadow(0 0 4px rgba(168,130,255,0.3))' }}
      />
      {/* Data points */}
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="#A78BFA"
          stroke="#030014"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
          viewport={{ once: true }}
        />
      ))}
      {/* X-axis labels */}
      {decades.map((label, i) => (
        <text
          key={label}
          x={points[i].x}
          y={h - 4}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize="8"
        >
          {label}
        </text>
      ))}
      {/* Peak marker */}
      {(() => {
        const peak = values.indexOf(Math.max(...values));
        return (
          <text
            x={points[peak].x}
            y={points[peak].y - 10}
            textAnchor="middle"
            fill="rgba(245,158,11,0.7)"
            fontSize="8"
            fontFamily="serif"
          >
            ▲ 高峰
          </text>
        );
      })()}
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Premium Layered Bar Chart (Signal Layers)
   ═══════════════════════════════════════════ */
function SignalLayerBars() {
  /* Mock monthly signal data — replace with real transit/fortune data */
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'];
  const layers = [
    { name: '事业', nameEn: 'Career', values: [60, 75, 55, 82, 70, 88, 78, 65], color: 'rgba(168,130,255,0.6)' },
    { name: '财运', nameEn: 'Wealth', values: [50, 65, 70, 60, 80, 72, 68, 75], color: 'rgba(245,158,11,0.5)' },
  ];
  const max = 100;

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        {layers.map((l) => (
          <div key={l.nameEn} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-[10px] text-white/40">
              {l.name} <span className="text-white/20">{l.nameEn}</span>
            </span>
          </div>
        ))}
      </div>
      {/* Bars grid */}
      <div className="flex items-end gap-2 h-36">
        {months.map((month, mi) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full flex gap-0.5 items-end h-28">
              {layers.map((layer, li) => (
                <motion.div
                  key={layer.nameEn}
                  className="flex-1 rounded-t-sm"
                  style={{ background: layer.color }}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(layer.values[mi] / max) * 100}%` }}
                  transition={{ duration: 0.7, delay: mi * 0.06 + li * 0.15, ease: 'easeOut' }}
                  viewport={{ once: true }}
                />
              ))}
            </div>
            <span className="text-[9px] text-white/25">{month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Insight Chips — status badges for chart section
   ═══════════════════════════════════════════ */
function InsightChips() {
  /* Mock insights — replace with real AI-generated insight tags in production */
  const chips = [
    { label: '事业上升期', en: 'Career Rising', status: 'positive' as const },
    { label: '感情需关注', en: 'Love: Caution', status: 'warning' as const },
    { label: '健康良好', en: 'Health: Good', status: 'positive' as const },
    { label: '财运波动', en: 'Wealth: Volatile', status: 'neutral' as const },
    { label: '贵人运强', en: 'Strong Benefactors', status: 'positive' as const },
  ];

  const statusStyles = {
    positive: 'border-emerald-500/20 text-emerald-400/70',
    warning: 'border-amber-500/20 text-amber-400/70',
    neutral: 'border-white/10 text-white/40',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, i) => (
        <motion.span
          key={chip.en}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          viewport={{ once: true }}
          className={`text-[10px] border rounded-full px-3 py-1 ${statusStyles[chip.status]}`}
        >
          {chip.label}{' '}
          <span className="opacity-50">{chip.en}</span>
        </motion.span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Testimonial Data — Replace with real testimonials in production
   ═══════════════════════════════════════════ */
const TESTIMONIALS = [
  {
    name: '张小姐',
    nameEn: 'Ms. Zhang',
    role: '创业者',
    roleEn: 'Entrepreneur',
    quote: '天机的紫微斗数分析精准到令人吃惊，帮助我在创业路上做出了关键决策。',
    quoteEn:
      'TianJi\'s Zi Wei analysis was astonishingly accurate and helped me make critical decisions on my entrepreneurial journey.',
    avatar: '🌟',
    rating: 5,
  },
  {
    name: 'David L.',
    nameEn: 'David L.',
    role: '软件工程师',
    roleEn: 'Software Engineer',
    quote: '西方星盘和八字的结合分析，让我对自己的职业方向有了全新的理解。',
    quoteEn:
      'The combination of Western astrology and BaZi analysis gave me a completely new understanding of my career path.',
    avatar: '⭐',
    rating: 5,
  },
  {
    name: '李女士',
    nameEn: 'Ms. Li',
    role: '心理咨询师',
    roleEn: 'Psychologist',
    quote: '作为心理学从业者，我对天机将古典智慧与现代心理学融合的方式印象深刻。',
    quoteEn:
      'As a psychology practitioner, I\'m impressed by how TianJi integrates classical wisdom with modern psychology.',
    avatar: '💫',
    rating: 5,
  },
  {
    name: 'Sarah K.',
    nameEn: 'Sarah K.',
    role: '瑜伽导师',
    roleEn: 'Yoga Instructor',
    quote: '每日运势和塔罗指引已经成为我早晨冥想的一部分，非常精准和有启发性。',
    quoteEn:
      'Daily horoscope and tarot guidance have become part of my morning meditation — very precise and inspiring.',
    avatar: '🔮',
    rating: 5,
  },
];

/* ═══════════════════════════════════════════
   Pricing Data — Replace with real pricing in production
   ═══════════════════════════════════════════ */
const PRICING_PLANS = [
  {
    name: '探索',
    nameEn: 'Explorer',
    price: '免费',
    priceEn: 'Free',
    period: '',
    periodEn: '',
    features: [
      { zh: '每日星座运势', en: 'Daily horoscope' },
      { zh: '基础星盘查看', en: 'Basic chart viewing' },
      { zh: '单次塔罗占卜', en: 'Single tarot reading' },
    ],
    cta: '免费开始',
    ctaEn: 'Start Free',
    href: '/western',
    highlighted: false,
  },
  {
    name: '专业版',
    nameEn: 'Professional',
    price: '¥29',
    priceEn: '$4.99',
    period: '/月',
    periodEn: '/mo',
    features: [
      { zh: '全部12种命理工具', en: 'All 12 divination tools' },
      { zh: 'AI深度分析报告', en: 'AI deep analysis reports' },
      { zh: '紫微 + 八字 + 星盘', en: 'Zi Wei + BaZi + Chart' },
      { zh: '合盘 & 推运分析', en: 'Synastry & transit analysis' },
      { zh: 'PDF报告导出', en: 'PDF report export' },
    ],
    cta: '立即升级',
    ctaEn: 'Upgrade Now',
    href: '/pricing',
    highlighted: true,
  },
  {
    name: '年度至尊',
    nameEn: 'Annual Premium',
    price: '¥249',
    priceEn: '$39.99',
    period: '/年',
    periodEn: '/yr',
    features: [
      { zh: '专业版全部功能', en: 'All Professional features' },
      { zh: '名人命盘对照', en: 'Celebrity chart comparison' },
      { zh: '流年大运完整分析', en: 'Full annual transit analysis' },
      { zh: '优先AI分析队列', en: 'Priority AI analysis queue' },
      { zh: '省17%', en: 'Save 17%' },
    ],
    cta: '最佳选择',
    ctaEn: 'Best Value',
    href: '/pricing',
    highlighted: false,
  },
];

/* ═══════════════════════════════════════════
   FAQ Data — Replace or extend in production
   ═══════════════════════════════════════════ */
const FAQ_ITEMS = [
  {
    q: '天机全球和其他占卜平台有什么不同？',
    qEn: 'What makes TianJi different from other fortune-telling platforms?',
    a: '天机融合了中国传统命理（紫微斗数、八字、易经）与西方占星术，并运用瑞士星历表（Swiss Ephemeris）进行精准天文计算，再结合AI进行深度心理学解读。这是目前市面上唯一一个东西方命理全覆盖的专业平台。',
    aEn: 'TianJi combines Chinese metaphysics (Zi Wei, BaZi, Yi Jing) with Western astrology, using Swiss Ephemeris for precision astronomical calculations and AI for deep psychological insights. It\'s the only platform offering comprehensive East-West divination.',
  },
  {
    q: 'AI分析的准确性如何保证？',
    qEn: 'How accurate is the AI analysis?',
    a: '我们的AI系统基于数千年的经典命理文献训练，结合现代心理学框架。星体位置使用瑞士星历表精确到角秒级别。分析结果仅供参考和自我探索，不替代专业建议。',
    aEn: 'Our AI is trained on thousands of years of classical texts, combined with modern psychology frameworks. Planetary positions are calculated to arc-second precision using Swiss Ephemeris. Results are for reference and self-exploration, not professional advice.',
  },
  {
    q: '需要准确的出生时间吗？',
    qEn: 'Do I need my exact birth time?',
    a: '对于紫微斗数和八字分析，准确的出生时间（精确到时辰）非常重要。西方星盘的上升星座也需要出生时间。如果不确定出生时间，我们也提供不依赖时间的分析方式。',
    aEn: 'For Zi Wei and BaZi analysis, an accurate birth time (to the hour) is very important. Western chart ascendant also requires birth time. If uncertain, we offer time-independent analysis methods.',
  },
  {
    q: '我的个人数据安全吗？',
    qEn: 'Is my personal data secure?',
    a: '绝对安全。我们采用银行级加密传输，不会将你的出生数据分享给任何第三方。你随时可以在账户设置中删除所有个人数据。',
    aEn: 'Absolutely. We use bank-grade encryption, and we never share your birth data with third parties. You can delete all personal data from your account settings at any time.',
  },
  {
    q: '支持哪些语言？',
    qEn: 'What languages are supported?',
    a: '目前支持中文和英文双语，分析报告可以选择任一语言生成。我们正在扩展更多语言支持。',
    aEn: 'Currently Chinese and English are fully supported. Analysis reports can be generated in either language. We are expanding to more languages.',
  },
];

/* ═══════════════════════════════════════════
   FAQ Accordion Item
   ═══════════════════════════════════════════ */
function FAQItem({
  q,
  qEn,
  a,
  aEn,
  index,
}: {
  q: string;
  qEn: string;
  a: string;
  aEn: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <FadeInWhenVisible delay={index * 0.08}>
      <div className="border-b border-white/[0.06]">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-5 sm:py-6 text-left group"
        >
          <div className="flex-1 pr-4">
            <p className="text-base sm:text-lg font-serif text-white group-hover:text-amber-200/80 transition-colors">
              {q}
            </p>
            <p className="text-white/30 text-xs mt-1">{qEn}</p>
          </div>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/40 text-xl flex-shrink-0"
          >
            +
          </motion.span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pb-5 sm:pb-6">
                <p className="text-white/60 text-sm leading-relaxed">{a}</p>
                <p className="text-white/30 text-xs mt-2 leading-relaxed">{aEn}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeInWhenVisible>
  );
}

/* ═══════════════════════════════════════════
   Stats Data — Replace with real numbers in production
   ═══════════════════════════════════════════ */
const STATS = [
  { value: '500K+', label: '用户信赖', labelEn: 'Users Trust Us' },
  { value: '2M+', label: '命盘已排', labelEn: 'Charts Generated' },
  { value: '99.7%', label: '星历精度', labelEn: 'Ephemeris Accuracy' },
  { value: '12', label: '命理法门', labelEn: 'Divination Paths' },
];

/* ═══════════════════════════════════════════
   FOOTER LINKS — Replace hrefs with real routes in production
   ═══════════════════════════════════════════ */
const FOOTER_SECTIONS = [
  {
    title: '命理工具',
    titleEn: 'Divination',
    links: [
      { label: '紫微斗数', href: '/ziwei' },
      { label: '八字命理', href: '/bazi' },
      { label: '西方星盘', href: '/western' },
      { label: '塔罗占卜', href: '/tarot' },
      { label: '易经', href: '/yijing' },
    ],
  },
  {
    title: '进阶分析',
    titleEn: 'Advanced',
    links: [
      { label: '合盘分析', href: '/synastry' },
      { label: 'Transit推运', href: '/transit' },
      { label: '太阳返照', href: '/solar-return' },
      { label: '风水布局', href: '/fengshui' },
      { label: '择日择吉', href: '/electional' },
    ],
  },
  {
    title: '关于',
    titleEn: 'About',
    links: [
      { label: '关于天机', href: '/about' },
      { label: '价格方案', href: '/pricing' },
      { label: '名人命盘', href: '/celebrities' },
      { label: '隐私政策', href: '/legal/privacy' },
      { label: '服务条款', href: '/legal/terms' },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  /* Active story block for sticky visual — tracked by scroll position */
  const [activeStory, setActiveStory] = useState('chart');

  return (
    <div className="mystic-page bg-[#030014] text-white min-h-screen">
      {/* ═══════ 1. Immersive Mystic Hero ═══════ */}
      <DynamicHero />

      {/* ═══════ 2. Sticky Storytelling Section ═══════
          Desktop: left-scrolling text blocks + right-sticky visual card
          Mobile: stacked layout with inline visuals */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <SectionHeading
            zh="穿越千年的智慧 · 遇见前沿AI"
            en="Ancient Wisdom Meets Modern Technology"
            subtitle="Swiss Ephemeris 精确星历计算 · 紫微斗数经典算法 · 现代心理学框架"
          />

          {/* Animated stats row (from old sticky section, preserved) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-24">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.labelEn}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-serif text-amber-300/80 mb-1">
                  {stat.value}
                </div>
                <div className="text-white/50 text-xs">{stat.label}</div>
                <div className="text-white/25 text-[10px]">{stat.labelEn}</div>
              </motion.div>
            ))}
          </div>

          {/* Desktop: two-column sticky layout · Mobile: stacked */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16">
            {/* Left column: scrolling text blocks */}
            <div className="space-y-16 sm:space-y-24 lg:space-y-32">
              {STORY_BLOCKS.map((block) => (
                <StoryBlock
                  key={block.id}
                  block={block}
                  onActive={(id) => {
                    if (activeStory !== id) setActiveStory(id);
                  }}
                />
              ))}
            </div>

            {/* Right column: sticky visual card (desktop only) */}
            <div className="hidden lg:block">
              <div className="sticky top-[20vh]">
                <StoryVisualCard activeId={activeStory} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 3. Services Grid (Enhanced) ═══════ */}
      <section id="services" className="relative z-10 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <SectionHeading
            zh="十二天机法门"
            en="Twelve Paths of Celestial Wisdom"
            subtitle="涵盖中国传统命理与西方占星术，东西方智慧全覆盖"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.map((s, i) => (
              <FadeInWhenVisible key={s.href} delay={i * 0.05}>
                <a
                  href={s.href}
                  className="group block bg-gradient-to-br from-white/[0.03] to-white/[0.07] border border-white/[0.08] hover:border-amber-300/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-300/[0.07]"
                >
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    {s.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif text-white mb-2">{s.title}</h3>
                  <p className="text-white/50 text-sm sm:text-base">{s.desc}</p>
                  <div className="mt-6 sm:mt-8 text-amber-300/70 group-hover:text-amber-200 flex items-center gap-2 text-sm transition-colors">
                    开始排盘{' '}
                    <span className="text-base group-hover:translate-x-1 transition-transform inline-block">
                      →
                    </span>
                  </div>
                </a>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 4. How It Works (Enhanced) ═══════ */}
      <section id="how" className="relative z-10 py-20 sm:py-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center relative">
          <SectionHeading zh="天机如何运转" en="How TianJi Works" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
            {[
              {
                step: '01',
                title: '输入生辰',
                titleEn: 'Birth Data',
                desc: '提供你的出生日期、时间和地点',
                descEn: 'Provide your date, time, and place of birth',
                icon: '🌙',
              },
              {
                step: '02',
                title: 'AI解析',
                titleEn: 'AI Analysis',
                desc: '瑞士星历表+古籍算法，精准计算星体位置',
                descEn: 'Swiss Ephemeris + classical algorithms for precise positions',
                icon: '⚡',
              },
              {
                step: '03',
                title: '深度解读',
                titleEn: 'Deep Reading',
                desc: '融合现代心理学与古典命理，给你专属分析',
                descEn: 'Blending modern psychology with classical wisdom',
                icon: '📜',
              },
            ].map((item, i) => (
              <FadeInWhenVisible key={item.step} delay={i * 0.15}>
                <div className="text-center group">
                  {/* Step icon with glow */}
                  <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/20 to-amber-500/10 group-hover:from-purple-600/30 group-hover:to-amber-500/20 transition-all duration-500" />
                    <span className="text-3xl relative z-10">{item.icon}</span>
                  </div>
                  <div className="text-5xl sm:text-6xl font-serif text-amber-300/10 mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif text-white mb-1">{item.title}</h3>
                  <p className="text-white/30 text-xs mb-2">{item.titleEn}</p>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                  <p className="text-white/25 text-xs mt-1">{item.descEn}</p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 5. Premium Chart Analytics Preview ═══════ */}
      <section className="relative z-10 py-20 sm:py-28">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative">
          <SectionHeading
            zh="专业级命理图表"
            en="Professional-Grade Chart Analysis"
            subtitle="从紫微星盘到运势曲线，每一份分析都精确呈现"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {/* Circular Energy Chart */}
            <FadeInWhenVisible>
              <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-serif text-white">六维能量雷达</h3>
                    <p className="text-white/30 text-xs mt-1">Six-Dimension Energy Radar</p>
                  </div>
                  <span className="text-white/15 text-[10px] bg-white/[0.04] px-3 py-1 rounded-full">
                    示例 · Sample
                  </span>
                </div>
                <div className="w-52 h-52 sm:w-60 sm:h-60 mx-auto">
                  <CircularEnergyChart />
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Life Timeline Line Chart */}
            <FadeInWhenVisible delay={0.12}>
              <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-serif text-white">人生运势曲线</h3>
                    <p className="text-white/30 text-xs mt-1">Life Fortune Timeline</p>
                  </div>
                  <span className="text-white/15 text-[10px] bg-white/[0.04] px-3 py-1 rounded-full">
                    示例 · Sample
                  </span>
                </div>
                <div className="h-40 sm:h-44">
                  <LifeTimelineChart />
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Signal Layer Bars */}
            <FadeInWhenVisible delay={0.08}>
              <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-serif text-white">多维信号层叠</h3>
                    <p className="text-white/30 text-xs mt-1">Multi-Signal Layers</p>
                  </div>
                  <span className="text-white/15 text-[10px] bg-white/[0.04] px-3 py-1 rounded-full">
                    示例 · Sample
                  </span>
                </div>
                <SignalLayerBars />
              </div>
            </FadeInWhenVisible>

            {/* Insight Chips Card */}
            <FadeInWhenVisible delay={0.16}>
              <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-serif text-white">AI洞察标签</h3>
                    <p className="text-white/30 text-xs mt-1">AI Insight Signals</p>
                  </div>
                  <span className="text-white/15 text-[10px] bg-white/[0.04] px-3 py-1 rounded-full">
                    示例 · Sample
                  </span>
                </div>
                <InsightChips />
                {/* Mini report snippet */}
                <div className="mt-6 bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                  <p className="text-white/40 text-xs leading-relaxed italic">
                    "当前大运壬寅，印星透干生身，事业运势处于上升通道。建议把握2024-2026年窗口期..."
                  </p>
                  <p className="text-white/20 text-[10px] mt-1.5 italic">
                    "Current decade luck Ren-Yin brings resource star support — career is in an ascending channel..."
                  </p>
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Full-width Sample Report Card */}
            <FadeInWhenVisible delay={0.1} className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white/[0.02] to-white/[0.05] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-lg font-serif text-white">AI深度分析报告示例</h3>
                    <p className="text-white/30 text-xs mt-1">
                      Sample AI Deep Analysis Report
                    </p>
                  </div>
                  <a
                    href="/western"
                    className="text-amber-300/70 hover:text-amber-200 text-sm flex items-center gap-1 transition-colors"
                  >
                    试试我的星盘 <span className="inline-block">→</span>
                  </a>
                </div>
                {/* Mock report content — replace with real report data */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    {
                      title: '日主分析',
                      titleEn: 'Day Master',
                      content: '甲木日主，生于春月，得令旺相。天干透壬水为印星，有生发之力。',
                    },
                    {
                      title: '上升星座',
                      titleEn: 'Ascendant',
                      content: '天蝎座上升，冥王星合轴，赋予强大的洞察力和转化能力。',
                    },
                    {
                      title: '紫微主星',
                      titleEn: 'Primary Star',
                      content: '紫微天府同宫，命宫坐辰，天生领导气质，一生贵人助力。',
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.12 }}
                      viewport={{ once: true }}
                      className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]"
                    >
                      <h4 className="text-sm font-serif text-amber-300/70 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-white/25 text-[10px] mb-2">{item.titleEn}</p>
                      <p className="text-white/50 text-xs leading-relaxed">{item.content}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* ═══════ 6. Testimonials / Social Proof ═══════ */}
      <section className="relative z-10 py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative">
          <SectionHeading
            zh="用户真实评价"
            en="What Our Users Say"
            subtitle="来自全球命理爱好者的真实反馈"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {TESTIMONIALS.map((t, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.1}>
                <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <span key={j} className="text-amber-400 text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-white/70 text-sm leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="text-white/30 text-xs mt-2 leading-relaxed">
                    &ldquo;{t.quoteEn}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/30 to-amber-500/20 flex items-center justify-center text-lg">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">{t.name}</p>
                      <p className="text-white/30 text-xs">{t.role} · {t.roleEn}</p>
                    </div>
                  </div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 7. Pricing Preview ═══════ */}
      <section id="pricing" className="relative z-10 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <SectionHeading
            zh="选择你的方案"
            en="Choose Your Plan"
            subtitle="从免费探索到专业深度分析，满足不同需求"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {PRICING_PLANS.map((plan, i) => (
              <FadeInWhenVisible key={plan.nameEn} delay={i * 0.1}>
                <div
                  className={`relative bg-gradient-to-br rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                    plan.highlighted
                      ? 'from-purple-900/40 to-amber-900/20 border-2 border-amber-400/30 shadow-lg shadow-amber-500/10'
                      : 'from-white/[0.03] to-white/[0.06] border border-white/[0.08]'
                  }`}
                >
                  {/* Popular badge */}
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[10px] font-bold px-4 py-1 rounded-full tracking-wider uppercase">
                      Most Popular · 最受欢迎
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-serif text-white">{plan.name}</h3>
                    <p className="text-white/30 text-xs">{plan.nameEn}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl font-serif text-white">{plan.price}</span>
                    <span className="text-white/40 text-sm ml-1">{plan.period}</span>
                    <div className="text-white/25 text-xs mt-1">
                      {plan.priceEn}
                      {plan.periodEn}
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-400/70 mt-0.5">✓</span>
                        <span>
                          <span className="text-white/60">{f.zh}</span>
                          <span className="text-white/25 text-xs block">{f.en}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={plan.href}
                    className={`block text-center py-3 sm:py-4 rounded-full text-sm font-medium transition-all duration-300 ${
                      plan.highlighted
                        ? 'bg-amber-400 text-black hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/20'
                        : 'bg-white/[0.06] text-white/80 border border-white/[0.1] hover:bg-white/[0.1] hover:text-white'
                    }`}
                  >
                    {plan.cta}
                    <span className="text-xs opacity-60 ml-2">{plan.ctaEn}</span>
                  </a>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 8. FAQ ═══════ */}
      <section id="faq" className="relative z-10 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <SectionHeading zh="常见问题" en="Frequently Asked Questions" />
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem
                key={i}
                q={item.q}
                qEn={item.qEn}
                a={item.a}
                aEn={item.aEn}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 9. Final CTA (Enhanced) ═══════ */}
      <section className="relative z-10 py-20 sm:py-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-900/30 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <FadeInWhenVisible>
            <p className="text-amber-300/50 text-sm tracking-[0.3em] uppercase mb-6">
              Destiny Awaits
            </p>
            <h2 className="text-3xl sm:text-5xl font-serif text-white mb-4">
              天机已为你准备好答案
            </h2>
            <p className="text-white/30 text-sm mb-10 max-w-md mx-auto leading-relaxed">
              从紫微斗数到西方占星，从八字命理到塔罗牌，开启你的命运探索之旅
              <br />
              <span className="text-white/20 text-xs">
                From Zi Wei to Western Astrology, from BaZi to Tarot — begin your journey of
                destiny
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/western"
                className="inline-flex items-center justify-center px-10 sm:px-12 py-4 sm:py-5 text-base sm:text-lg bg-white text-black font-medium rounded-full hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5"
              >
                立即开始占卜
                <span className="ml-2 text-black/50 text-sm">Get Started</span>
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg bg-white/[0.06] border border-white/[0.12] text-white/80 rounded-full hover:bg-white/[0.1] hover:text-white transition-all duration-300 hover:-translate-y-0.5"
              >
                查看方案
                <span className="ml-2 text-white/40 text-sm">View Plans</span>
              </a>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ═══════ 10. Rich Footer ═══════ */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-8">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-amber-300/60 text-xl">☯︎</span>
                <span className="text-white/80 font-serif text-lg">TianJi Global</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-4 max-w-sm">
                融合东方经典命理与西方占星智慧，以AI科技重新定义命运探索。
              </p>
              <p className="text-white/25 text-xs leading-relaxed max-w-sm">
                Bridging Eastern metaphysics and Western astrology with AI technology to redefine
                destiny exploration.
              </p>
              {/* Social links — replace with real URLs in production */}
              <div className="flex gap-4 mt-6">
                {['Twitter', 'GitHub', 'Discord'].map((platform) => (
                  <span
                    key={platform}
                    className="text-white/20 hover:text-white/50 text-xs cursor-pointer transition-colors"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.titleEn}>
                <h4 className="text-white/60 text-sm font-medium mb-4">{section.title}</h4>
                <p className="text-white/20 text-[10px] mb-3">{section.titleEn}</p>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-white/35 hover:text-white/60 text-sm transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/20 text-xs">
              © {new Date().getFullYear()} TianJi Global · 天机全球. All rights reserved.
            </p>
            <p className="text-white/15 text-[10px]">
              仅供娱乐参考 · For entertainment purposes only. 不替代专业建议。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
