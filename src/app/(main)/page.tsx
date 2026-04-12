'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
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
} from '@/design-system/content-tokens';

/**
 * TianJi Global — Premium Commercial Landing Page
 *
 * Sections:
 * 1. Immersive Hero (existing DynamicHero)
 * 2. Sticky Storytelling / Visual Transition
 * 3. Services Grid
 * 4. How It Works (HowItWorksSteps)
 * 5. Advanced Chart Mock Preview
 * 6. Testimonials / Social Proof (TestimonialCard + StatBadge)
 * 7. Pricing Preview (PricingCard)
 * 8. FAQ (FAQAccordion)
 * 9. Final CTA (FinalCTA)
 * 10. Rich Footer (ResponsibleUseNotice)
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
   STORY BLOCK 1: BaZi Pillar Grid Visual
   ═══════════════════════════════════════════ */
function BaZiPillarGrid({ active }: { active: boolean }) {
  const pillars = [
    { label: '年柱', stem: '壬', branch: '寅', labelEn: 'Year' },
    { label: '月柱', stem: '戊', branch: '午', labelEn: 'Month' },
    { label: '日柱', stem: '甲', branch: '子', labelEn: 'Day' },
    { label: '时柱', stem: '庚', branch: '申', labelEn: 'Time' },
  ];
  const activeIdx = active ? 2 : 0;

  return (
    <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-serif text-white/80">八字四柱</h4>
          <p className="text-white/25 text-[10px] mt-0.5">BaZi Pillar Structure</p>
        </div>
        <span className="text-white/15 text-[10px] bg-white/[0.04] px-2.5 py-1 rounded-full">
          LIVE · 实时
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {pillars.map((p, i) => (
          <motion.div
            key={p.labelEn}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            viewport={{ once: true }}
            className={`flex flex-col items-center rounded-xl border p-3 transition-all duration-300 ${
              i === activeIdx
                ? 'border-amber-400/40 bg-amber-400/5 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : 'border-white/[0.06] bg-white/[0.02]'
            }`}
          >
            <span className="text-[10px] text-white/30 mb-1">{p.labelEn}</span>
            <span className={`text-xl font-serif ${i === activeIdx ? 'text-amber-300' : 'text-white/60'}`}>
              {p.stem}
            </span>
            <span className={`text-lg ${i === activeIdx ? 'text-amber-200/80' : 'text-white/40'}`}>
              {p.branch}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-5">
        {[
          { label: '甲木日主', active: activeIdx === 2 },
          { label: '天蝎上升', active: false },
          { label: '大运·壬寅', active: false },
        ].map((badge) => (
          <motion.span
            key={badge.label}
            animate={{ opacity: badge.active ? 1 : 0.3, scale: badge.active ? 1 : 0.97 }}
            transition={{ duration: 0.4 }}
            className={`text-[10px] border rounded-full px-3 py-1 ${
              badge.active
                ? 'border-amber-400/30 text-amber-300/70'
                : 'border-white/[0.06] text-white/50'
            }`}
          >
            {badge.label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STORY BLOCK 2: Two-Circle Venn Diagram
   ═══════════════════════════════════════════ */
function TwoCircleDiagram({ active }: { active: boolean }) {
  return (
    <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-serif text-white/80">合盘关系</h4>
          <p className="text-white/25 text-[10px] mt-0.5">Relationship Synastry</p>
        </div>
        <span className="text-white/15 text-[10px] bg-white/[0.04] px-2.5 py-1 rounded-full">
          LIVE · 实时
        </span>
      </div>
      <div className="relative w-48 h-36 mx-auto">
        {/* Left circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-purple-400/40 bg-purple-400/5 flex flex-col items-center justify-center"
          style={{ boxShadow: '0 0 30px rgba(168,130,255,0.1)' }}
        >
          <span className="text-purple-300/80 text-xs font-serif">天府</span>
          <span className="text-purple-200/60 text-[10px]">紫微</span>
        </motion.div>
        {/* Right circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-amber-400/40 bg-amber-400/5 flex flex-col items-center justify-center"
          style={{ boxShadow: '0 0 30px rgba(245,158,11,0.1)' }}
        >
          <span className="text-amber-300/80 text-xs font-serif">贪狼</span>
          <span className="text-amber-200/60 text-[10px]">武曲</span>
        </motion.div>
        {/* Overlap area highlight */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: active ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
        >
          <span className="text-[8px] text-white/60">缘</span>
        </motion.div>
        {/* Animated energy lines */}
        {[0, 1, 2].map((i) => (
          <motion.line
            key={i}
            x1="56"
            y1="18"
            x2="108"
            y2="18"
            stroke="rgba(168,130,255,0.4)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
            viewport={{ once: true }}
            style={{
              transformOrigin: '56px 18px',
              transform: `rotate(${i * 30}deg)`,
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-5">
        {[
          { label: '天府', color: 'purple' },
          { label: '贪狼', color: 'amber' },
          { label: '紫微', color: 'purple' },
          { label: '武曲', color: 'amber' },
        ].map((badge) => (
          <span
            key={badge.label}
            className={`text-[10px] border rounded-full px-3 py-1 ${
              badge.color === 'purple'
                ? 'border-purple-400/20 text-purple-300/60'
                : 'border-amber-400/20 text-amber-300/60'
            }`}
          >
            {badge.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STORY BLOCK 3: Life Timeline SVG
   ═══════════════════════════════════════════ */
function LifeTimelineVisual({ active }: { active: boolean }) {
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
    <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-serif text-white/80">人生运势曲线</h4>
          <p className="text-white/25 text-[10px] mt-0.5">Life Fortune Timeline</p>
        </div>
        <span className="text-white/15 text-[10px] bg-white/[0.04] px-2.5 py-1 rounded-full">
          LIVE · 实时
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="timeline-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(168,130,255,0.25)" />
            <stop offset="100%" stopColor="rgba(168,130,255,0)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Filled area */}
        <motion.path
          d={areaPath}
          fill="url(#timeline-fill)"
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
            <g>
              <text
                x={points[peak].x}
                y={points[peak].y - 10}
                textAnchor="middle"
                fill="rgba(245,158,11,0.8)"
                fontSize="7"
                fontFamily="serif"
              >
                ▲ Peak · 高峰
              </text>
            </g>
          );
        })()}
        {/* Transition badge */}
        {(() => {
          return (
            <g>
              <text
                x={points[3].x}
                y={points[3].y - 10}
                textAnchor="middle"
                fill="rgba(168,130,255,0.6)"
                fontSize="6"
              >
                ○ Transition · 转折
              </text>
            </g>
          );
        })()}
      </svg>
      <div className="flex flex-wrap gap-2 mt-4">
        {[
          { label: '高峰', sub: 'Peak', color: 'amber' },
          { label: '平稳', sub: 'Steady', color: 'purple' },
          { label: '转折', sub: 'Transition', color: 'purple' },
        ].map((badge) => (
          <span
            key={badge.label}
            className={`text-[10px] border rounded-full px-3 py-1 ${
              badge.color === 'amber'
                ? 'border-amber-400/20 text-amber-300/60'
                : 'border-purple-400/20 text-purple-300/60'
            }`}
          >
            {badge.label} · {badge.sub}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Sticky Storytelling — Data & Visual Card
   ═══════════════════════════════════════════ */
const STORY_BLOCKS = [
  {
    id: 'chart',
    badgeKey: 'story.badge.chart',
    titleKey: 'story.title.chart',
    bodyKey: 'story.body.chart',
    accent: 'purple' as const,
  },
  {
    id: 'relationship',
    badgeKey: 'story.badge.relationship',
    titleKey: 'story.title.relationship',
    bodyKey: 'story.body.relationship',
    accent: 'amber' as const,
  },
  {
    id: 'rhythm',
    badgeKey: 'story.badge.rhythm',
    titleKey: 'story.title.rhythm',
    bodyKey: 'story.body.rhythm',
    accent: 'purple' as const,
  },
];

/** Individual story block */
function StoryBlock({
  block,
  onActive,
}: {
  block: (typeof STORY_BLOCKS)[number];
  onActive: (id: string) => void;
}) {
  const { t } = useLanguage();
  const blockRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(blockRef, { margin: '-40% 0px -40% 0px' });

  useEffect(() => {
    if (isInView) {
      onActive(block.id);
    }
  }, [isInView, block.id, onActive]);

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
        {t(block.badgeKey)}
      </span>
      <h3 className="text-2xl sm:text-3xl font-serif text-white mb-4 max-w-2xl">
        {t(block.titleKey)}
      </h3>
      <p className="text-white/55 text-sm sm:text-base leading-relaxed max-w-2xl">
        {t(block.bodyKey)}
      </p>

      {/* Mobile: inline visual (hidden on lg) */}
      <div className="mt-8 lg:hidden">
        <StoryVisualCard activeId={block.id} />
      </div>
    </motion.div>
  );
}

function StoryVisualCard({ activeId }: { activeId: string }) {
  if (activeId === 'chart') return <BaZiPillarGrid active={activeId === 'chart'} />;
  if (activeId === 'relationship') return <TwoCircleDiagram active={activeId === 'relationship'} />;
  return <LifeTimelineVisual active={activeId === 'rhythm'} />;
}

/* ═══════════════════════════════════════════
   Premium Circular Energy Chart (SVG) — Enhanced
   ═══════════════════════════════════════════ */
function CircularEnergyChart() {
  const { t } = useLanguage();
  const size = 220;
  const center = size / 2;
  const outerR = 85;
  const arcs = [
    { label: '财运', labelEn: 'Wealth', value: 0.85, color: '#F59E0B' },
    { label: '事业', labelEn: 'Career', value: 0.72, color: '#A78BFA' },
    { label: '健康', labelEn: 'Health', value: 0.91, color: '#34D399' },
    { label: '感情', labelEn: 'Love', value: 0.68, color: '#F472B6' },
    { label: '学业', labelEn: 'Study', value: 0.78, color: '#60A5FA' },
    { label: '人际', labelEn: 'Social', value: 0.88, color: '#FBBF24' },
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
            <g key={arc.labelEn}>
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
          {t('charts.sample').split('·')[0].trim()} · Overall
        </text>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Premium Line Chart — Life Timeline (SVG) — Enhanced
   ═══════════════════════════════════════════ */
function LifeTimelineChart() {
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
            ▲ Peak · 高峰
          </text>
        );
      })()}
      {/* Transition badge */}
      {(() => {
        return (
          <text x={points[3].x} y={points[3].y - 10} textAnchor="middle" fill="rgba(168,130,255,0.6)" fontSize="6">
            ○ Transition · 转折
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
  const { t } = useLanguage();
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
      <div className="flex items-end gap-2 h-36 relative">
        {/* Blur backdrop layer */}
        <div className="absolute inset-0 bg-white/[0.01] rounded-lg backdrop-blur-sm" />
        {months.map((month, mi) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-1.5 relative z-10">
            <div className="w-full flex gap-0.5 items-end h-28">
              {layers.map((layer, li) => (
                <motion.div
                  key={layer.nameEn}
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
  const { t, lang } = useLanguage();
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
          {lang === 'zh' ? chip.label : chip.en}
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

  const testimonialData = testimonialTokens.map((item, i) => ({
    quote: item.quote[lang],
    author: item.author,
    location: item.location,
    flag: ['🇬🇧', '🇨🇦', '🇯🇵'][i],
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
            animate={{ x: [0, '-33.333%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan) => {
            const planToken = pricingPlans[plan.key];
            return (
              <PricingCard
                key={plan.key}
                name={planToken.name[lang]}
                tagline={planToken.tagline[lang]}
                price={planToken.price}
                period={planToken.period[lang]}
                features={plan.features.map((fKey) => ({
                  label: t(fKey),
                  included: true,
                }))}
                ctaLabel={plan.cta}
                ctaHref={plan.href}
                highlighted={plan.highlighted}
                className={plan.highlighted ? 'scale-105' : ''}
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
   Tools Grid Section — uses SectionHeader + GlassCard from design system
   ═══════════════════════════════════════════ */
function ToolsSection() {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const displayServices = expanded ? SERVICES : SERVICES.slice(0, 6);

  return (
    <section id="services" className="relative z-10 py-28 sm:py-36">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeader titleKey="services" />
        <p className="text-center text-xs tracking-widest uppercase mb-12" style={{ color: colors.textMuted }}>
          {t('tools.subtitle')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayServices.map((s, i) => (
            <FadeInWhenVisible key={s.href} delay={i * 0.04}>
              <GlassCard level="card" hoverLift>
                <a
                  href={s.href}
                  className="block p-4"
                >
                  <div className="text-3xl mb-3">
                    {s.icon}
                  </div>
                  <h3 className="text-base font-serif mb-1" style={{ color: colors.textPrimary }}>{s.title}</h3>
                  <p className="text-xs" style={{ color: colors.textTertiary }}>{s.desc}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: colors.goldDim }}>
                    {t('tools.start')}
                    <span className="text-sm inline-block">→</span>
                  </div>
                </a>
              </GlassCard>
            </FadeInWhenVisible>
          ))}
        </div>
        {/* Expand button */}
        {!expanded && (
          <div className="flex justify-center mt-8">
            <MysticButton variant="outline" size="md" onClick={() => setExpanded(true)}>
              {t('tools.cta')} →
            </MysticButton>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */
function Home() {
  const { t, lang } = useLanguage();
  const [activeStory, setActiveStory] = useState('chart');

  const handleStoryActive = useCallback((id: string) => {
    setActiveStory((prev) => (prev !== id ? id : prev));
  }, []);

  const howItWorksSteps = [
    { step: '01', titleKey: 'how.step1.title', descKey: 'how.step1.desc', icon: '🌙' },
    { step: '02', titleKey: 'how.step2.title', descKey: 'how.step2.desc', icon: '⚡' },
    { step: '03', titleKey: 'how.step3.title', descKey: 'how.step3.desc', icon: '📜' },
  ];

  return (
    <div className="mystic-page text-white min-h-screen" style={{ background: colors.bgPrimary }}>
      {/* Language toggle — top right — LanguageSwitch from design system */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <LanguageSwitch />
      </div>

      {/* ═══════ 1. Immersive Mystic Hero ═══════ */}
      <DynamicHero />

      {/* ═══════ 2. Sticky Storytelling Section ═══════ */}
      <ParallaxSection offset={20} className="relative z-10 py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <SectionHeader title={t('story.heading')} />

          {/* Desktop: two-column sticky layout · Mobile: stacked */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16">
            {/* Left column: scrolling text blocks */}
            <div className="space-y-16 sm:space-y-24 lg:space-y-32">
              {STORY_BLOCKS.map((block) => (
                <StoryBlock key={block.id} block={block} onActive={handleStoryActive} />
              ))}
            </div>

            {/* Right column: sticky visual card (desktop only) */}
            <div className="hidden lg:block">
              <div className="sticky top-[20vh]">
                <StoryVisualCard activeId={activeStory} />
              </div>
            </div>
          </div>

          {/* CTA after storytelling */}
          <div className="flex justify-center mt-16 sm:mt-24">
            <div className="text-center">
              <PrimaryCTA />
              <p className="text-xs mt-3" style={{ color: colors.textTertiary }}>{t('hero.helper')}</p>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* ═══════ 3. Tools Grid ═══════ */}
      <ParallaxSection offset={15}>
        <ToolsSection />
      </ParallaxSection>

      {/* ═══════ 4. How It Works — HowItWorksSteps from design system ═══════ */}
      <ParallaxSection offset={20} className="relative z-10 py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: colors.purpleDim }} />
        </div>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 relative">
          <HowItWorksSteps
            steps={howItWorksSteps.map((item) => ({
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
                    &quot;当前大运壬寅，印星透干生身，事业运势处于上升通道。建议把握2024-2026年窗口期...&quot;
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
                  {[
                    { titleKey: 'charts.daymaster', content: '甲木日主，生于春月，得令旺相。天干透壬水为印星，有生发之力。' },
                    { titleKey: 'charts.ascendant', content: '天蝎座上升，冥王星合轴，赋予强大的洞察力和转化能力。' },
                    { titleKey: 'charts.primarystar', content: '紫微天府同宫，命宫坐辰，天生领导气质，一生贵人助力。' },
                  ].map((item, i) => (
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

      {/* ═══════ 7. Pricing Preview ═══════ */}
      <PricingSection />

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
                  { label: '紫微斗数', href: '/ziwei' },
                  { label: '八字命理', href: '/bazi' },
                  { label: '西方星盘', href: '/western' },
                  { label: '塔罗占卜', href: '/tarot' },
                  { label: '易经', href: '/yijing' },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm transition-colors duration-200" style={{ color: colors.textMuted }}>
                      {link.label}
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
                  { label: '合盘分析', href: '/synastry' },
                  { label: 'Transit推运', href: '/transit' },
                  { label: '太阳返照', href: '/solar-return' },
                  { label: '风水布局', href: '/fengshui' },
                  { label: '择日择吉', href: '/electional' },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm transition-colors duration-200" style={{ color: colors.textMuted }}>
                      {link.label}
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
                  { label: '关于天机', href: '/about' },
                  { label: '价格方案', href: '/pricing' },
                  { label: '隐私政策', href: '/legal/privacy' },
                  { label: '服务条款', href: '/legal/terms' },
                  { label: '联系我们', href: '/about#contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm transition-colors duration-200" style={{ color: colors.textMuted }}>
                      {link.label}
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
              © {new Date().getFullYear()} TianJi Global · 天机全球. All rights reserved.
            </p>
            <p className="text-[10px] text-center sm:text-right max-w-xs" style={{ color: colors.textMuted }}>
              {lang === 'zh'
                ? '提供自我反思工具，不替代专业建议 · 🌐 中英双语'
                : 'A tool for self-reflection, not a substitute for professional advice. 🌐 Bilingual'}
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
