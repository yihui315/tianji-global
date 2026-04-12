'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import DynamicHero from '@/components/hero/DynamicHero';
import { SERVICES } from '@/data/services';
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage';
import { colors } from '@/design-system';
import {
  SectionHeader,
  MysticButton,
  GlassCard,
  FAQAccordion,
  PricingCard,
  TestimonialCard,
  StatBadge,
  LanguageSwitch,
  FinalCTA,
  HowItWorksSteps,
  ResponsibleUseNotice,
  TrustChip,
} from '@/components/ui';
import {
  pricingPlans,
  testimonials as testimonialTokens,
  ctaLabels,
  trustPillars,
} from '@/design-system/content-tokens';

/**
 * TianJi Global — Premium Commercial Landing Page
 *
 * Sections:
 * 1. Immersive Hero (existing DynamicHero)
 * 2. Storytelling — Three Distinct Visual Systems (Structure / Relationship / Timeline)
 * 3. How It Works (HowItWorksSteps)
 * 4. Advanced Chart Mock Preview
 * 5. Testimonials / Social Proof (TestimonialCard + StatBadge)
 * 6. Trust Section (TrustPillars)
 * 7. Pricing Preview (PricingCard)
 * 7.5. Tools — Secondary Exploration (6 tools + "View All Tools")
 * 8. FAQ (FAQAccordion)
 * 9. Final CTA (FinalCTA)
 * 10. Rich Footer (ResponsibleUseNotice)
 *
 * Main flow: Hero → Story → Results → Trust → Pricing → CTA
 * Tools are secondary, placed after Pricing as optional exploration.
 *
 * All sections consume design-system tokens and UI atom components.
 */

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
   Parallax Section Wrapper
   ═══════════════════════════════════════════ */
function ParallaxSection({
  children,
  offset = 30,
  className = '',
}: {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Unified CTA Button — uses MysticButton from design system
   ═══════════════════════════════════════════ */
function PrimaryCTA({ href = '/western', className = '' }: { href?: string; className?: string }) {
  const { lang } = useLanguage();
  return (
    <MysticButton variant="solid" size="lg" href={href} className={className}>
      {ctaLabels.primary[lang]}
    </MysticButton>
  );
}

/* ═══════════════════════════════════════════
   STORY BLOCK 1: BaZi / ZiWei Structured Grid
   Layout: Full-width centered · Static · No heavy animation
   Data: Chinese heavenly stems, earthly branches, palace names
   ═══════════════════════════════════════════ */
const ELEMENT_COLORS: Record<string, string> = {
  '水': 'text-blue-400/70',
  '火': 'text-red-400/70',
  '土': 'text-yellow-600/70',
  '木': 'text-emerald-400/70',
  '金': 'text-amber-300/70',
};

function StructureGrid() {
  const { lang } = useLanguage();

  const pillars = [
    { label: '年柱', stem: '壬', branch: '寅', element: '水', elementEn: 'Water', labelEn: 'Year', stemPy: 'Rén', branchPy: 'Yín' },
    { label: '月柱', stem: '戊', branch: '午', element: '土', elementEn: 'Earth', labelEn: 'Month', stemPy: 'Wù', branchPy: 'Wǔ' },
    { label: '日柱', stem: '甲', branch: '子', element: '木', elementEn: 'Wood', labelEn: 'Day', stemPy: 'Jiǎ', branchPy: 'Zǐ' },
    { label: '时柱', stem: '庚', branch: '申', element: '金', elementEn: 'Metal', labelEn: 'Hour', stemPy: 'Gēng', branchPy: 'Shēn' },
  ];

  const palaces = [
    { zh: '命宫', en: 'Destiny', star: '紫微', starEn: 'Zi Wei' },
    { zh: '兄弟', en: 'Siblings', star: '天机', starEn: 'Tian Ji' },
    { zh: '夫妻', en: 'Spouse', star: '太阳', starEn: 'Tai Yang' },
    { zh: '子女', en: 'Children', star: '武曲', starEn: 'Wu Qu' },
    { zh: '财帛', en: 'Wealth', star: '天同', starEn: 'Tian Tong' },
    { zh: '疾厄', en: 'Health', star: '廉贞', starEn: 'Lian Zhen' },
    { zh: '迁移', en: 'Travel', star: '天府', starEn: 'Tian Fu' },
    { zh: '交友', en: 'Friends', star: '太阴', starEn: 'Tai Yin' },
    { zh: '官禄', en: 'Career', star: '贪狼', starEn: 'Tan Lang' },
    { zh: '田宅', en: 'Property', star: '巨门', starEn: 'Ju Men' },
    { zh: '福德', en: 'Fortune', star: '天相', starEn: 'Tian Xiang' },
    { zh: '父母', en: 'Parents', star: '天梁', starEn: 'Tian Liang' },
  ];

  return (
    <div className="w-full">
      {/* BaZi Four Pillars — Structured Table */}
      <div className="border border-white/[0.06] rounded-2xl overflow-hidden mb-6">
        <div className="bg-white/[0.02] px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h4 className="text-sm font-serif text-white/70 tracking-wide">
            {lang === 'zh' ? '八字四柱 · 命盘' : 'BaZi Four Pillars · Chart'}
          </h4>
          <span className="text-[9px] tracking-widest uppercase text-white/20">
            {lang === 'zh' ? '结构层' : 'Structure Layer'}
          </span>
        </div>
        <div className="grid grid-cols-4 divide-x divide-white/[0.04]">
          {pillars.map((p, i) => (
            <div key={p.labelEn} className="flex flex-col items-center py-5 px-2 sm:px-4">
              <span className="text-[9px] tracking-widest uppercase text-white/25 mb-3">
                {lang === 'zh' ? p.label : p.labelEn}
              </span>
              <div className="flex flex-col items-center gap-1 mb-2">
                <span className="text-2xl sm:text-3xl font-serif text-white/75">{p.stem}</span>
                <span className="text-[8px] text-white/20">{p.stemPy}</span>
              </div>
              <div className="w-6 h-px bg-white/[0.06] my-1" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl sm:text-2xl text-white/50">{p.branch}</span>
                <span className="text-[8px] text-white/20">{p.branchPy}</span>
              </div>
              <span className={`text-[10px] mt-3 ${ELEMENT_COLORS[p.element] || 'text-white/40'}`}>
                {lang === 'zh' ? p.element : p.elementEn}
              </span>
            </div>
          ))}
        </div>
        <div className="bg-white/[0.015] px-5 py-2.5 border-t border-white/[0.04] flex items-center gap-4">
          <span className="text-[10px] text-amber-300/50">
            {lang === 'zh' ? '日主：甲木' : 'Day Master: Jiǎ Wood'}
          </span>
          <span className="text-white/10">·</span>
          <span className="text-[10px] text-white/25">
            {lang === 'zh' ? '身强 · 偏印格' : 'Strong · Indirect Seal'}
          </span>
        </div>
      </div>

      {/* ZiWei 12 Palace Grid — 4×3 static grid with highlighted Destiny palace */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {palaces.map((p) => {
          const isDestiny = p.en === 'Destiny';
          return (
            <div
              key={p.en}
              className={`rounded-lg px-2 py-2.5 sm:px-3 sm:py-3 text-center ${
                isDestiny
                  ? 'border border-amber-400/25 bg-amber-400/[0.04] shadow-[0_0_12px_rgba(245,158,11,0.06)]'
                  : 'border border-white/[0.05] bg-white/[0.015]'
              }`}
            >
              <span className={`block text-[10px] mb-1 ${isDestiny ? 'text-amber-300/50' : 'text-white/25'}`}>
                {lang === 'zh' ? p.zh : p.en}
              </span>
              <span className={`block text-xs font-serif ${isDestiny ? 'text-amber-200/70' : 'text-purple-300/60'}`}>
                {lang === 'zh' ? p.star : p.starEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STORY BLOCK 2: Radar / Spider Chart — Relationship Synastry
   Layout: Circular radar overlay · Two polygons for two entities
   Data: Dimensional comparison scores (0–1) across relationship axes
   ═══════════════════════════════════════════ */
function RelationshipRadarChart() {
  const { lang } = useLanguage();

  const axes = [
    { zh: '沟通', en: 'Comm.' },
    { zh: '信任', en: 'Trust' },
    { zh: '激情', en: 'Passion' },
    { zh: '成长', en: 'Growth' },
    { zh: '稳定', en: 'Stability' },
    { zh: '默契', en: 'Sync' },
  ];

  const personA = [0.82, 0.65, 0.93, 0.70, 0.55, 0.88];
  const personB = [0.60, 0.88, 0.52, 0.91, 0.80, 0.73];

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 110;
  const levels = 4;
  const n = axes.length;

  // Helper: polar → cartesian
  const polar = (angle: number, r: number) => ({
    x: cx + r * Math.cos(angle - Math.PI / 2),
    y: cy + r * Math.sin(angle - Math.PI / 2),
  });

  // Build polygon path for a data set
  const toPolygon = (values: number[]) => {
    return values
      .map((v, i) => {
        const angle = (2 * Math.PI * i) / n;
        const pt = polar(angle, v * maxR);
        return `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ') + ' Z';
  };

  const polyA = toPolygon(personA);
  const polyB = toPolygon(personB);

  // Grid rings
  const gridRings = Array.from({ length: levels }, (_, i) => {
    const r = (maxR / levels) * (i + 1);
    return axes
      .map((_, ai) => {
        const angle = (2 * Math.PI * ai) / n;
        const pt = polar(angle, r);
        return `${ai === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ') + ' Z';
  });

  // Determine overlap / tension per axis
  const insights = axes.map((_, i) => {
    const diff = Math.abs(personA[i] - personB[i]);
    if (diff < 0.1) return 'harmony' as const;
    if (diff > 0.3) return 'tension' as const;
    return null;
  });

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400/70" />
            <span className="text-[11px] text-white/40 font-serif">
              {lang === 'zh' ? '甲方 · 天府星系' : 'Person A · Tian Fu'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="text-[11px] text-white/40 font-serif">
              {lang === 'zh' ? '乙方 · 贪狼星系' : 'Person B · Tan Lang'}
            </span>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="border border-white/[0.06] rounded-2xl bg-white/[0.015] p-4 sm:p-6 flex justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px]" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(168,130,255,0.06)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Background glow */}
          <circle cx={cx} cy={cy} r={maxR + 10} fill="url(#radar-glow)" />

          {/* Grid rings (hexagonal) */}
          {gridRings.map((d, i) => (
            <path
              key={`ring-${i}`}
              d={d}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
            />
          ))}

          {/* Axis lines from center to outer */}
          {axes.map((_, i) => {
            const angle = (2 * Math.PI * i) / n;
            const outer = polar(angle, maxR);
            return (
              <line
                key={`axis-${i}`}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Person A polygon — filled */}
          <motion.path
            d={polyA}
            fill="rgba(168,130,255,0.12)"
            stroke="rgba(168,130,255,0.7)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            style={{ transformOrigin: `${cx}px ${cy}px`, filter: 'drop-shadow(0 0 6px rgba(168,130,255,0.2))' }}
          />

          {/* Person B polygon — filled */}
          <motion.path
            d={polyB}
            fill="rgba(245,158,11,0.10)"
            stroke="rgba(245,158,11,0.7)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            viewport={{ once: true }}
            style={{ transformOrigin: `${cx}px ${cy}px`, filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.2))' }}
          />

          {/* Data points A */}
          {personA.map((v, i) => {
            const angle = (2 * Math.PI * i) / n;
            const pt = polar(angle, v * maxR);
            return (
              <motion.circle
                key={`a-${i}`}
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill="#A78BFA"
                stroke="#030014"
                strokeWidth="1.5"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
                viewport={{ once: true }}
              />
            );
          })}

          {/* Data points B */}
          {personB.map((v, i) => {
            const angle = (2 * Math.PI * i) / n;
            const pt = polar(angle, v * maxR);
            return (
              <motion.circle
                key={`b-${i}`}
                cx={pt.x}
                cy={pt.y}
                r="3"
                fill="#F59E0B"
                stroke="#030014"
                strokeWidth="1.5"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.06 }}
                viewport={{ once: true }}
              />
            );
          })}

          {/* Axis labels */}
          {axes.map((axis, i) => {
            const angle = (2 * Math.PI * i) / n;
            const pt = polar(angle, maxR + 20);
            return (
              <text
                key={axis.en}
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.3)"
                fontSize="9"
              >
                {lang === 'zh' ? axis.zh : axis.en}
              </text>
            );
          })}

          {/* Harmony / Tension markers at axis tips */}
          {insights.map((type, i) => {
            if (!type) return null;
            const angle = (2 * Math.PI * i) / n;
            const midV = (personA[i] + personB[i]) / 2;
            const pt = polar(angle, midV * maxR);
            return (
              <motion.g
                key={`insight-${i}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                viewport={{ once: true }}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="8"
                  fill="none"
                  stroke={type === 'harmony' ? 'rgba(52,211,153,0.35)' : 'rgba(239,68,68,0.3)'}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              </motion.g>
            );
          })}

          {/* Center dot */}
          <circle cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.15)" />
        </svg>
      </div>

      {/* Insight badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-[10px] border border-emerald-500/20 text-emerald-400/60 rounded-full px-3 py-1">
          {lang === 'zh' ? '沟通 · 共鸣' : 'Comm. · Sync'}
        </span>
        <span className="text-[10px] border border-red-500/15 text-red-400/50 rounded-full px-3 py-1">
          {lang === 'zh' ? '激情 · 张力' : 'Passion · Tension'}
        </span>
        <span className="text-[10px] border border-white/[0.06] text-white/35 rounded-full px-3 py-1">
          {lang === 'zh' ? '合盘评分 · 样本' : 'Synastry · Sample'}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STORY BLOCK 3: Life Timeline — Wide Horizontal
   Layout: Full-width scrollable · Animated line · Event markers
   Data: Year-based (25-year span) with life events
   ═══════════════════════════════════════════ */
function LifeTimelineWide() {
  const { lang } = useLanguage();

  const startYear = 2000;
  const years = Array.from({ length: 26 }, (_, i) => startYear + i);
  const fortune = [
    40, 48, 55, 52, 60, 72, 68, 75, 82, 78,
    85, 92, 88, 80, 72, 65, 70, 78, 85, 90,
    95, 88, 82, 78, 85, 90,
  ];

  const events: { year: number; label: { zh: string; en: string }; type: 'peak' | 'valley' | 'shift' }[] = [
    { year: 2005, label: { zh: '求学', en: 'School' }, type: 'shift' },
    { year: 2010, label: { zh: '事业起步', en: 'Career Start' }, type: 'peak' },
    { year: 2014, label: { zh: '低谷', en: 'Valley' }, type: 'valley' },
    { year: 2020, label: { zh: '大运转换', en: 'Decade Shift' }, type: 'shift' },
    { year: 2025, label: { zh: '高峰期', en: 'Peak Phase' }, type: 'peak' },
  ];

  const w = 800;
  const h = 180;
  const padL = 30;
  const padR = 30;
  const padT = 40;
  const padB = 35;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const points = fortune.map((v, i) => ({
    x: padL + (i / (fortune.length - 1)) * chartW,
    y: padT + chartH - ((v - 30) / 70) * chartH,
  }));

  // Smooth curve using cubic bezier — control points at 40% of segment width
  // creates natural curves without overshooting between data points
  const smoothPath = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.4;
    const cpx2 = p.x - (p.x - prev.x) * 0.4;
    return `${acc} C${cpx1.toFixed(1)},${prev.y.toFixed(1)} ${cpx2.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }, '');

  const areaPath = `${smoothPath} L${points[points.length - 1].x},${padT + chartH} L${points[0].x},${padT + chartH} Z`;

  return (
    <div className="w-full">
      {/* Wide timeline — horizontally scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <div className="min-w-[640px]">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="life-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(168,130,255,0.2)" />
                <stop offset="50%" stopColor="rgba(124,58,237,0.08)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="life-line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(124,58,237,0.6)" />
                <stop offset="50%" stopColor="rgba(168,130,255,0.9)" />
                <stop offset="100%" stopColor="rgba(245,158,11,0.7)" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[0.25, 0.5, 0.75].map((pct) => (
              <line key={pct} x1={padL} y1={padT + chartH * (1 - pct)} x2={w - padR} y2={padT + chartH * (1 - pct)} stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
            ))}

            {/* Area fill */}
            <motion.path
              d={areaPath}
              fill="url(#life-grad)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              viewport={{ once: true }}
            />

            {/* Animated fortune line */}
            <motion.path
              d={smoothPath}
              fill="none"
              stroke="url(#life-line-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
              viewport={{ once: true }}
              style={{ filter: 'drop-shadow(0 0 8px rgba(168,130,255,0.4))' }}
            />

            {/* Event markers */}
            {events.map((evt, i) => {
              const idx = evt.year - startYear;
              if (idx < 0 || idx >= points.length) return null;
              const pt = points[idx];
              const markerColor =
                evt.type === 'peak' ? 'rgba(245,158,11,0.8)' :
                evt.type === 'valley' ? 'rgba(239,68,68,0.6)' :
                'rgba(168,130,255,0.7)';
              return (
                <motion.g
                  key={evt.year}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.2 + i * 0.2 }}
                  viewport={{ once: true }}
                >
                  {/* Vertical line from point to axis */}
                  <line x1={pt.x} y1={pt.y} x2={pt.x} y2={padT + chartH} stroke={markerColor} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                  {/* Marker dot */}
                  <circle cx={pt.x} cy={pt.y} r="5" fill={markerColor} stroke="#030014" strokeWidth="2" />
                  {/* Pulsing ring for peaks */}
                  {evt.type === 'peak' && (
                    <motion.circle
                      cx={pt.x}
                      cy={pt.y}
                      r="9"
                      fill="none"
                      stroke={markerColor}
                      strokeWidth="1"
                      animate={{ r: [9, 14, 9], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  {/* Event label */}
                  <text
                    x={pt.x}
                    y={pt.y - 14}
                    textAnchor="middle"
                    fill={markerColor}
                    fontSize="7.5"
                    fontFamily="serif"
                  >
                    {lang === 'zh' ? evt.label.zh : evt.label.en}
                  </text>
                </motion.g>
              );
            })}

            {/* Year labels — every 5 years */}
            {years.map((yr, i) => {
              if (yr % 5 !== 0) return null;
              return (
                <text key={yr} x={points[i].x} y={h - 8} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8">
                  {yr}
                </text>
              );
            })}

            {/* Decade boundary lines */}
            {years.map((yr, i) => {
              if (yr % 10 !== 0 || i === 0) return null;
              return (
                <line key={`dec-${yr}`} x1={points[i].x} y1={padT} x2={points[i].x} y2={padT + chartH} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="4 4" />
              );
            })}

            {/* Current year indicator */}
            {(() => {
              const currentIdx = 2025 - startYear;
              if (currentIdx < 0 || currentIdx >= points.length) return null;
              const pt = points[currentIdx];
              return (
                <motion.g
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 2 }}
                  viewport={{ once: true }}
                >
                  <line x1={pt.x} y1={padT - 5} x2={pt.x} y2={padT + chartH} stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
                  <text x={pt.x} y={padT - 10} textAnchor="middle" fill="rgba(245,158,11,0.6)" fontSize="7">
                    {lang === 'zh' ? '▼ 当前' : '▼ Now'}
                  </text>
                </motion.g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Legend row */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400/70" />
          <span className="text-[10px] text-white/30">{lang === 'zh' ? '高峰' : 'Peak'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <span className="text-[10px] text-white/30">{lang === 'zh' ? '低谷' : 'Valley'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-400/70" />
          <span className="text-[10px] text-white/30">{lang === 'zh' ? '运势转折' : 'Fortune Shift'}</span>
        </div>
        <span className="text-[9px] text-white/15 ml-auto">
          {lang === 'zh' ? '← 滑动查看完整时间线 →' : '← Scroll for full timeline →'}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Premium Circular Energy Chart (SVG) — Enhanced
   ═══════════════════════════════════════════ */
function CircularEnergyChart() {
  const { lang } = useLanguage();
  const size = 220;
  const center = size / 2;
  const outerR = 85;
  const arcs = [
    { label: lang === 'zh' ? '财运' : 'Wealth', value: 0.85, color: '#F59E0B' },
    { label: lang === 'zh' ? '事业' : 'Career', value: 0.72, color: '#A78BFA' },
    { label: lang === 'zh' ? '健康' : 'Health', value: 0.91, color: '#34D399' },
    { label: lang === 'zh' ? '感情' : 'Love', value: 0.68, color: '#F472B6' },
    { label: lang === 'zh' ? '学业' : 'Study', value: 0.78, color: '#60A5FA' },
    { label: lang === 'zh' ? '人际' : 'Social', value: 0.88, color: '#FBBF24' },
  ];
  const gap = 3;
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
    <div className="relative">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        <defs>
          <filter id="chart-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer glow ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={outerR + 8}
          fill="none"
          stroke="rgba(168,130,255,0.08)"
          strokeWidth="16"
          initial={{ opacity: 0, rotate: 0 }}
          whileInView={{ opacity: 1 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          viewport={{ once: true }}
          style={{ transformOrigin: `${center}px ${center}px` }}
          filter="url(#chart-glow)"
        />
        {/* Background ring */}
        <circle cx={center} cy={center} r={outerR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
        {/* Energy arcs */}
        {arcs.map((arc, i) => {
          const startDeg = i * (arcSpan + gap);
          const endDeg = startDeg + arcSpan * arc.value;
          const fullEnd = startDeg + arcSpan;
          return (
            <g key={arc.label}>
              <path
                d={describeArc(startDeg, fullEnd, outerR)}
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="14"
                strokeLinecap="round"
              />
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
              {(() => {
                const midDeg = startDeg + arcSpan / 2;
                const labelR = outerR + 18;
                const rad = ((midDeg - 90) * Math.PI) / 180;
                const lx = center + labelR * Math.cos(rad);
                const ly = center + labelR * Math.sin(rad);
                return (
                  <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily="serif">
                    {arc.label}
                  </text>
                );
              })()}
            </g>
          );
        })}
        {/* Pulsing center dot */}
        <motion.circle
          cx={center}
          cy={center}
          r="6"
          fill="rgba(168,130,255,0.6)"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          viewport={{ once: true }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(168,130,255,0.5))' }}
        />
        {/* Center score */}
        <text x={center} y={center - 6} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="22" fontFamily="serif">
          82
        </text>
        <text x={center} y={center + 12} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7">
          {lang === 'zh' ? '示例' : 'Sample'} · Overall
        </text>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Premium Line Chart — Life Timeline (SVG) — Enhanced
   ═══════════════════════════════════════════ */
function LifeTimelineChart() {
  const { lang } = useLanguage();
  const decades = ['10s', '20s', '30s', '40s', '50s', '60s', '70s'];
  const values = [55, 68, 82, 75, 91, 84, 72];
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
  const areaPath = `${linePath} L${points[points.length - 1].x},${h - padY} L${points[0].x},${h - padY} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="timeline-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(168,130,255,0.3)" />
          <stop offset="100%" stopColor="rgba(168,130,255,0)" />
        </linearGradient>
        <filter id="timeline-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <line key={pct} x1={padX} y1={padY + chartH * (1 - pct)} x2={w - padX} y2={padY + chartH * (1 - pct)} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      ))}
      {/* Filled area */}
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
      {/* Decade labels */}
      {decades.map((label, i) => (
        <text key={label} x={points[i].x} y={h - 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">
          {label}
        </text>
      ))}
      {/* Peak badge */}
      {(() => {
        const peak = values.indexOf(Math.max(...values));
        return (
          <text x={points[peak].x} y={points[peak].y - 10} textAnchor="middle" fill="rgba(245,158,11,0.8)" fontSize="7" fontFamily="serif">
            {lang === 'zh' ? '▲ 高峰' : '▲ Peak'}
          </text>
        );
      })()}
      {/* Transition badge */}
      {(() => {
        return (
          <text x={points[3].x} y={points[3].y - 10} textAnchor="middle" fill="rgba(168,130,255,0.6)" fontSize="6">
            {lang === 'zh' ? '○ 转折' : '○ Shift'}
          </text>
        );
      })()}
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Signal Layer Bars — Enhanced
   ═══════════════════════════════════════════ */
function SignalLayerBars() {
  const { t, lang } = useLanguage();
  const months = lang === 'zh'
    ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const layers = [
    { name: lang === 'zh' ? '事业' : 'Career', values: [60, 75, 55, 82, 70, 88, 78, 65], color: 'rgba(168,130,255,0.6)' },
    { name: lang === 'zh' ? '财运' : 'Wealth', values: [50, 65, 70, 60, 80, 72, 68, 75], color: 'rgba(245,158,11,0.5)' },
  ];
  const max = 100;

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        {layers.map((l) => (
          <div key={l.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-[10px] text-white/40">
              {l.name}
            </span>
          </div>
        ))}
      </div>
      {/* Bars grid */}
      <div className="flex items-end gap-2 h-36 relative">
        {/* Blur backdrop layer */}
        <div className="absolute inset-0 bg-white/[0.01] rounded-lg backdrop-blur-sm" />
        {months.map((month, mi) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-1.5 relative z-10">
            <div className="w-full flex gap-0.5 items-end h-28">
              {layers.map((layer, li) => (
                <motion.div
                  key={layer.name}
                  className="flex-1 rounded-t-sm relative group cursor-pointer"
                  style={{ background: layer.color }}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(layer.values[mi] / max) * 100}%` }}
                  transition={{ duration: 0.7, delay: mi * 0.06 + li * 0.15, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  whileHover={{ scaleY: 1.05 }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white/80 text-[9px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {layer.name}: {layer.values[mi]}
                  </div>
                </motion.div>
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
   Insight Chips
   ═══════════════════════════════════════════ */
function InsightChips() {
  const { lang } = useLanguage();
  const chips = [
    { zh: '事业上升期', en: 'Career Rising', status: 'positive' as const },
    { zh: '感情需关注', en: 'Love: Caution', status: 'warning' as const },
    { zh: '健康良好', en: 'Health: Good', status: 'positive' as const },
    { zh: '财运波动', en: 'Wealth: Volatile', status: 'neutral' as const },
    { zh: '贵人运强', en: 'Strong Benefactors', status: 'positive' as const },
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
          {lang === 'zh' ? chip.zh : chip.en}
        </motion.span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Testimonials — uses TestimonialCard + StatBadge from design system
   ═══════════════════════════════════════════ */
function TestimonialsSection() {
  const { t, lang } = useLanguage();

  const testimonialData = testimonialTokens.map((item) => ({
    quote: item.quote[lang],
    author: item.author,
    location: item.location[lang],
    flag: item.avatar,
  }));

  const stats = [
    { value: '120K+', label: t('social.readings') },
    { value: '50K+', label: t('social.reports') },
    { value: '30K+', label: t('social.saved') },
  ];

  return (
    <div className="relative z-10 overflow-hidden py-28 sm:py-36">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: colors.goldDim }} />
      </div>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative">
        <SectionHeader titleKey="testimonials" />
        <p className="text-center text-xs tracking-widest uppercase mb-12" style={{ color: colors.textTertiary }}>
          {t('testimonials.subheading')}
        </p>

        {/* Social proof stats — StatBadge */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12 sm:mb-16">
          {stats.map((stat) => (
            <StatBadge
              key={stat.label}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>

        {/* Auto-scrolling carousel — TestimonialCard */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: [0, `-${100 / 2}%`] }}
            transition={{ duration: testimonialData.length * 6, repeat: Infinity, ease: 'linear' }}
          >
            {[...testimonialData, ...testimonialData].map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <TestimonialCard
                  quote={item.quote}
                  author={item.author}
                  location={item.location}
                  avatar={item.flag}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Pricing Section — uses PricingCard from design system
   ═══════════════════════════════════════════ */
function PricingSection() {
  const { t, lang } = useLanguage();

  const plans = [
    {
      key: 'free' as const,
      features: ['feature.daily', 'feature.basic', 'feature.tarot', 'feature.community'],
      cta: lang === 'zh' ? '免费开始' : 'Start Free',
      href: '/western',
      highlighted: false,
    },
    {
      key: 'premium' as const,
      features: ['feature.all12', 'feature.ai', 'feature.three', 'feature.synastry', 'feature.pdf', 'feature.bilingual'],
      cta: lang === 'zh' ? '立即升级' : 'Upgrade Now',
      href: '/pricing',
      highlighted: true,
    },
    {
      key: 'deep' as const,
      features: ['feature.premium', 'feature.celebrity', 'feature.annual', 'feature.priority', 'feature.personal', 'feature.revisions'],
      cta: lang === 'zh' ? '预约深度解读' : 'Book Deep Reading',
      href: '/pricing',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="relative z-10 py-28 sm:py-36">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <SectionHeader titleKey="pricing" subtitle={t('pricing.subtitle')} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
          {plans.map((plan) => {
            const planToken = pricingPlans[plan.key];
            return (
              <PricingCard
                key={plan.key}
                name={planToken.name[lang]}
                tagline={planToken.tagline[lang]}
                price={planToken.price}
                period={planToken.period[lang]}
                identityBadge={planToken.identity[lang]}
                features={plan.features.map((fKey) => ({
                  label: t(fKey),
                  included: true,
                }))}
                ctaLabel={plan.cta}
                ctaHref={plan.href}
                highlighted={plan.highlighted}
                className={plan.highlighted ? 'md:scale-105 md:-my-4 relative z-10' : ''}
              />
            );
          })}
        </div>

        {/* Urgency line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center text-xs mt-10"
          style={{ color: colors.textTertiary }}
        >
          {t('pricing.urgency')}
        </motion.p>

        {/* CTA after pricing */}
        <div className="flex justify-center mt-8">
          <PrimaryCTA />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FAQ Section — uses FAQAccordion from design system
   ═══════════════════════════════════════════ */
function FAQSection() {
  const { t } = useLanguage();
  const faqKeys = [
    { qKey: 'faq.q1', aKey: 'faq.a1' },
    { qKey: 'faq.q2', aKey: 'faq.a2' },
    { qKey: 'faq.q3', aKey: 'faq.a3' },
    { qKey: 'faq.q4', aKey: 'faq.a4' },
    { qKey: 'faq.q5', aKey: 'faq.a5' },
    { qKey: 'faq.q6', aKey: 'faq.a6' },
  ];

  const faqItems = faqKeys.map((item) => ({
    question: t(item.qKey),
    answer: t(item.aKey),
  }));

  return (
    <section id="faq" className="relative z-10 py-28 sm:py-36">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        <SectionHeader titleKey="faq" />
        <FAQAccordion items={faqItems} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   Tools Grid Section — Secondary exploration, reduced visual weight
   ═══════════════════════════════════════════ */
function ToolsSection() {
  const { t, lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const displayServices = expanded ? SERVICES : SERVICES.slice(0, 6);

  return (
    <section id="services" className="relative z-10 py-14 sm:py-20">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Section label — secondary exploration */}
        <p className="text-center text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: colors.textMuted }}>
          {lang === 'zh' ? '探索更多工具' : 'Explore More Tools'}
        </p>
        <p className="text-center text-xs mb-8" style={{ color: colors.textTertiary }}>
          {t('tools.subtitle')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 opacity-75">
          {displayServices.map((s, i) => (
            <FadeInWhenVisible key={s.href} delay={i * 0.03}>
              <a
                href={s.href}
                className="group block rounded-lg overflow-hidden border border-white/[0.04] hover:border-white/[0.12] transition-all duration-200"
              >
                <div className="p-2.5 sm:p-3 bg-white/[0.01]">
                  <div className="text-lg mb-1">{s.icon}</div>
                  <h3 className="text-xs font-serif text-white/70 mb-0.5 group-hover:text-white/90 transition-colors">
                    {s.title[lang]}
                  </h3>
                  <p className="text-white/20 text-[10px] leading-relaxed line-clamp-1">{s.desc[lang]}</p>
                </div>
              </a>
            </FadeInWhenVisible>
          ))}
        </div>
        {/* View All / Collapse */}
        <div className="flex justify-center mt-6">
          <MysticButton variant="outline" size="md" onClick={() => setExpanded(!expanded)}>
            {expanded
              ? (lang === 'zh' ? '收起' : 'Show Less')
              : (lang === 'zh' ? '查看全部工具' : 'View All Tools')
            } {expanded ? '↑' : '→'}
          </MysticButton>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   How It Works — step definitions (static, no re-create per render)
   ═══════════════════════════════════════════ */
const HOW_IT_WORKS_KEYS = [
  { step: '01', titleKey: 'how.step1.title', descKey: 'how.step1.desc', icon: '🌙' },
  { step: '02', titleKey: 'how.step2.title', descKey: 'how.step2.desc', icon: '⚡' },
  { step: '03', titleKey: 'how.step3.title', descKey: 'how.step3.desc', icon: '📜' },
] as const;

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */
function Home() {
  const { t, lang } = useLanguage();

  return (
    <div className="mystic-page text-white min-h-screen" style={{ background: colors.bgPrimary }}>
      {/* Language toggle — top right — LanguageSwitch from design system */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <LanguageSwitch />
      </div>

      {/* ═══════ 1. Immersive Mystic Hero ═══════ */}
      <DynamicHero />

      {/* ═══════ 2. Storytelling — Three Distinct Visual Systems ═══════ */}
      <ParallaxSection offset={20} className="relative z-10 py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <SectionHeader title={t('story.heading')} />

          {/* ── BLOCK 1: Structure — Centered full-width grid ── */}
          <FadeInWhenVisible className="mb-28 sm:mb-36">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <span className="inline-block text-[10px] tracking-widest uppercase mb-3 text-purple-400/60">
                {t('story.badge.chart')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-white mb-4">
                {t('story.title.chart')}
              </h3>
              <p className="text-white/55 text-sm sm:text-base leading-relaxed">
                {t('story.body.chart')}
              </p>
            </div>
            <StructureGrid />
          </FadeInWhenVisible>

          {/* ── BLOCK 2: Relationship — Text left, graph right ── */}
          <FadeInWhenVisible delay={0.1} className="mb-28 sm:mb-36">
            <div className="lg:grid lg:grid-cols-5 lg:gap-12 items-start">
              <div className="lg:col-span-2 mb-8 lg:mb-0 lg:sticky lg:top-[25vh]">
                <span className="inline-block text-[10px] tracking-widest uppercase mb-3 text-amber-400/60">
                  {t('story.badge.relationship')}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-white mb-4">
                  {t('story.title.relationship')}
                </h3>
                <p className="text-white/55 text-sm sm:text-base leading-relaxed">
                  {t('story.body.relationship')}
                </p>
              </div>
              <div className="lg:col-span-3">
                <RelationshipRadarChart />
              </div>
            </div>
          </FadeInWhenVisible>

          {/* ── BLOCK 3: Life Timeline — Full-width horizontal ── */}
          <FadeInWhenVisible delay={0.15} className="mb-16 sm:mb-24">
            <div className="mb-8 sm:mb-10">
              <span className="inline-block text-[10px] tracking-widest uppercase mb-3 text-purple-400/60">
                {t('story.badge.rhythm')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-white mb-4">
                {t('story.title.rhythm')}
              </h3>
              <p className="text-white/55 text-sm sm:text-base leading-relaxed max-w-2xl">
                {t('story.body.rhythm')}
              </p>
            </div>
            <LifeTimelineWide />
          </FadeInWhenVisible>

          {/* CTA after storytelling */}
          <div className="flex justify-center mt-16 sm:mt-24">
            <div className="text-center">
              <PrimaryCTA />
              <p className="text-xs mt-3" style={{ color: colors.textTertiary }}>{t('hero.helper')}</p>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* ═══════ 4. How It Works — HowItWorksSteps from design system ═══════ */}
      <ParallaxSection offset={20} className="relative z-10 py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: colors.purpleDim }} />
        </div>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 relative">
          <HowItWorksSteps
            steps={HOW_IT_WORKS_KEYS.map((item) => ({
              step: item.step,
              icon: item.icon,
              title: t(item.titleKey),
              description: t(item.descKey),
            }))}
          />
        </div>
      </ParallaxSection>

      {/* ═══════ 5. Premium Chart Analytics Preview ═══════ */}
      <ParallaxSection offset={15} className="relative z-10 py-28 sm:py-36">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: colors.purpleDim }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative">
          <SectionHeader titleKey="charts" subtitle={t('charts.subtitle')} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Circular Energy Chart */}
            <FadeInWhenVisible>
              <GlassCard level="card" hoverLift className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-serif" style={{ color: colors.textPrimary }}>{t('charts.radar')}</h3>
                  <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ color: colors.textMuted, background: colors.bgSurface }}>
                    {t('charts.sample')}
                  </span>
                </div>
                <div className="w-52 h-52 sm:w-56 sm:h-56 mx-auto">
                  <CircularEnergyChart />
                </div>
              </GlassCard>
            </FadeInWhenVisible>

            {/* Life Timeline Line Chart */}
            <FadeInWhenVisible delay={0.12}>
              <GlassCard level="card" hoverLift className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-serif" style={{ color: colors.textPrimary }}>{t('charts.timeline')}</h3>
                  <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ color: colors.textMuted, background: colors.bgSurface }}>
                    {t('charts.sample')}
                  </span>
                </div>
                <div className="h-36 sm:h-40">
                  <LifeTimelineChart />
                </div>
              </GlassCard>
            </FadeInWhenVisible>

            {/* Signal Layer Bars */}
            <FadeInWhenVisible delay={0.08}>
              <GlassCard level="card" hoverLift className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-serif" style={{ color: colors.textPrimary }}>{t('charts.layers')}</h3>
                  <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ color: colors.textMuted, background: colors.bgSurface }}>
                    {t('charts.sample')}
                  </span>
                </div>
                <SignalLayerBars />
              </GlassCard>
            </FadeInWhenVisible>

            {/* Insight Chips Card */}
            <FadeInWhenVisible delay={0.16}>
              <GlassCard level="card" hoverLift className="p-5 sm:p-6 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-serif" style={{ color: colors.textPrimary }}>{t('charts.insights')}</h3>
                  <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ color: colors.textMuted, background: colors.bgSurface }}>
                    {t('charts.sample')}
                  </span>
                </div>
                <InsightChips />
                <div className="mt-5 rounded-xl p-3" style={{ background: colors.bgSurface, border: `1px solid ${colors.borderSubtle}` }}>
                  <p className="text-xs leading-relaxed italic" style={{ color: colors.textMuted }}>
                    {lang === 'zh'
                      ? '"当前大运壬寅，印星透干生身，事业运势处于上升通道。建议把握2024-2026年窗口期..."'
                      : '"Current decade pillar Ren-Yin: Indirect Resource star supports the Day Master. Career momentum is rising. Seize the 2024–2026 window..."'}
                  </p>
                </div>
              </GlassCard>
            </FadeInWhenVisible>

            {/* Full-width Sample Report Card */}
            <FadeInWhenVisible delay={0.1} className="lg:col-span-2">
              <GlassCard level="card" className="p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                  <h3 className="text-base font-serif" style={{ color: colors.textPrimary }}>{t('charts.report.title')}</h3>
                  <a href="/western" className="text-xs flex items-center gap-1 transition-colors duration-200" style={{ color: colors.goldDim }}>
                    {t('charts.report.cta')} <span className="inline-block">→</span>
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(lang === 'zh'
                    ? [
                        { titleKey: 'charts.daymaster', content: '甲木日主，生于春月，得令旺相。天干透壬水为印星，有生发之力。' },
                        { titleKey: 'charts.ascendant', content: '天蝎座上升，冥王星合轴，赋予强大的洞察力和转化能力。' },
                        { titleKey: 'charts.primarystar', content: '紫微天府同宫，命宫坐辰，天生领导气质，一生贵人助力。' },
                      ]
                    : [
                        { titleKey: 'charts.daymaster', content: 'Jia Wood Day Master, born in spring. Heavenly Stem reveals Ren Water as Indirect Resource, fueling growth.' },
                        { titleKey: 'charts.ascendant', content: 'Scorpio Rising with Pluto conjunct axis grants deep perception and transformative ability.' },
                        { titleKey: 'charts.primarystar', content: 'Zi Wei + Tian Fu share the Life Palace in Chen, conferring natural leadership and lifelong benefactors.' },
                      ]
                  ).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="rounded-xl p-3"
                      style={{ background: colors.bgSurface, border: `1px solid ${colors.borderSubtle}` }}
                    >
                      <h4 className="text-xs font-serif mb-1" style={{ color: colors.goldDim }}>{t(item.titleKey)}</h4>
                      <p className="text-[11px] leading-relaxed" style={{ color: colors.textTertiary }}>{item.content}</p>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </FadeInWhenVisible>
          </div>
        </div>
      </ParallaxSection>

      {/* ═══════ 6. Testimonials / Social Proof ═══════ */}
      <TestimonialsSection />

      {/* ═══════ 6.5. Trust Section ═══════ */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <SectionHeader title={t('trust.heading')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trustPillars.map((pillar, i) => (
              <FadeInWhenVisible key={pillar.icon} delay={i * 0.08}>
                <GlassCard level="card" className="p-5 sm:p-6 text-center h-full">
                  <span className="text-2xl mb-3 block">{pillar.icon}</span>
                  <h3 className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                    {pillar.title[lang]}
                  </h3>
                  <p className="text-[11px] leading-relaxed" style={{ color: colors.textTertiary }}>
                    {pillar.desc[lang]}
                  </p>
                </GlassCard>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 7. Pricing Preview ═══════ */}
      <PricingSection />

      {/* ═══════ 7.5. Tools — Secondary Exploration ═══════ */}
      <ToolsSection />

      {/* ═══════ 8. FAQ ═══════ */}
      <FAQSection />

      {/* ═══════ 9. Final CTA — FinalCTA from design system ═══════ */}
      <FinalCTA />

      {/* ═══════ 10. Rich Footer ═══════ */}
      <footer className="relative z-10" style={{ borderTop: `1px solid ${colors.borderSubtle}` }}>
        {/* Trust statement — ResponsibleUseNotice from design system */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-12 sm:pt-16 pb-6">
          <ResponsibleUseNotice />
        </div>

        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-8">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl" style={{ color: colors.goldDim }}>☯︎</span>
                <span className="font-serif text-lg" style={{ color: colors.textSecondary }}>TianJi Global</span>
              </div>
              <p className="text-sm leading-relaxed mb-3 max-w-sm" style={{ color: colors.textMuted }}>
                {t('footer.brand.desc')}
              </p>
              <div className="flex gap-4 mt-5">
                {['Twitter', 'GitHub', 'Discord'].map((platform) => (
                  <span key={platform} className="text-xs cursor-pointer transition-colors duration-200" style={{ color: colors.textMuted }}>
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-sm font-medium mb-3" style={{ color: colors.textTertiary }}>{t('footer.products')}</h4>
              <ul className="space-y-2">
                {[
                  { key: 'footer.ziwei', href: '/ziwei' },
                  { key: 'footer.bazi', href: '/bazi' },
                  { key: 'footer.western', href: '/western' },
                  { key: 'footer.tarot', href: '/tarot' },
                  { key: 'footer.yijing', href: '/yijing' },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm transition-colors duration-200" style={{ color: colors.textMuted }}>
                      {t(link.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Advanced */}
            <div>
              <h4 className="text-sm font-medium mb-3" style={{ color: colors.textTertiary }}>{t('footer.advanced')}</h4>
              <ul className="space-y-2">
                {[
                  { key: 'footer.synastry', href: '/synastry' },
                  { key: 'footer.transit', href: '/transit' },
                  { key: 'footer.solreturn', href: '/solar-return' },
                  { key: 'footer.fengshui', href: '/fengshui' },
                  { key: 'footer.electional', href: '/electional' },
                  { key: 'footer.relationship', href: '/relationship/new' },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm transition-colors duration-200" style={{ color: colors.textMuted }}>
                      {t(link.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust & Legal */}
            <div>
              <h4 className="text-sm font-medium mb-3" style={{ color: colors.textTertiary }}>{t('footer.trust.links')}</h4>
              <ul className="space-y-2">
                {[
                  { key: 'footer.about', href: '/about' },
                  { key: 'footer.pricing.link', href: '/pricing' },
                  { key: 'footer.privacy', href: '/legal/privacy' },
                  { key: 'footer.terms', href: '/legal/terms' },
                  { key: 'footer.contact', href: '/about#contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm transition-colors duration-200" style={{ color: colors.textMuted }}>
                      {t(link.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${colors.borderSubtle}` }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs" style={{ color: colors.textMuted }}>
              © {new Date().getFullYear()} TianJi Global. All rights reserved.
            </p>
            <p className="text-[10px] text-center sm:text-right max-w-xs" style={{ color: colors.textMuted }}>
              {t('footer.disclaimer')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Wrap Home with LanguageProvider for SSR-safe rendering
   ═══════════════════════════════════════════ */
export default function HomeWithProviders() {
  return (
    <LanguageProvider>
      <Home />
    </LanguageProvider>
  );
}
