'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import DynamicHero from '@/components/hero/DynamicHero';
import { SERVICES } from '@/data/services';
import { LanguageProvider, useLanguage } from '@/hooks/useLanguage';

/**
 * TianJi Global — Premium Commercial Landing Page (Refactored)
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
   Language Toggle Button
   ═══════════════════════════════════════════ */
function LangToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
      className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 border border-white/[0.08] hover:border-white/[0.15] rounded-full px-3 py-1.5 transition-all duration-200 hover:scale-105"
    >
      <span className={lang === 'zh' ? 'text-white/70' : 'text-white/30'}>中</span>
      <span className="text-white/[0.15]">|</span>
      <span className={lang === 'en' ? 'text-white/70' : 'text-white/30'}>EN</span>
    </button>
  );
}

/* ═══════════════════════════════════════════
   Section Heading Component (Simplified — no en subtitle)
   ═══════════════════════════════════════════ */
function SectionHeading({ titleKey }: { titleKey: string }) {
  const { t } = useLanguage();
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
      <h2 className="text-4xl sm:text-5xl font-serif text-white">{t(titleKey)}</h2>
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
   Unified CTA Button
   ═══════════════════════════════════════════ */
function PrimaryCTA({ href = '/western', className = '' }: { href?: string; className?: string }) {
  const { t } = useLanguage();
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center px-10 sm:px-12 py-4 sm:py-5 text-base sm:text-lg bg-white text-black font-medium rounded-full hover:scale-[1.03] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.3)] transition-all duration-200 ${className}`}
    >
      {t('hero.cta')} · {t('hero.cta.en')}
      <span className="ml-2 text-black/50 text-sm" />
    </a>
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
   Testimonials Carousel
   ═══════════════════════════════════════════ */
function TestimonialsSection() {
  const { t, lang } = useLanguage();
  const testimonials = [
    {
      quote: t('testimonial.1'),
      name: t('testimonial.author1.name'),
      loc: t('testimonial.author1.loc'),
      flag: '🇬🇧',
    },
    {
      quote: t('testimonial.2'),
      name: t('testimonial.author2.name'),
      loc: t('testimonial.author2.loc'),
      flag: '🇨🇦',
    },
    {
      quote: t('testimonial.3'),
      name: t('testimonial.author3.name'),
      loc: t('testimonial.author3.loc'),
      flag: '🇯🇵',
    },
  ];

  return (
    <div className="relative z-10 overflow-hidden py-28 sm:py-36">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative">
        <SectionHeading titleKey="testimonials.heading" />
        <p className="text-center text-white/30 text-xs tracking-widest uppercase mb-12">
          {t('testimonials.subheading')}
        </p>

        {/* Social proof stat chips */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12 sm:mb-16">
          {[
            { value: '120K+', zh: t('social.readings'), en: 'Structured Readings' },
            { value: '50K+', zh: t('social.reports'), en: 'Bilingual Reports' },
            { value: '30K+', zh: t('social.saved'), en: 'Saved Insights' },
          ].map((stat, i) => (
            <motion.div
              key={stat.en}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] rounded-full px-4 py-2"
            >
              <span className="text-amber-300/80 text-sm font-serif">{stat.value}</span>
              <span className="text-white/40 text-xs">{lang === 'zh' ? stat.zh : stat.en}</span>
            </motion.div>
          ))}
        </div>

        {/* Auto-scrolling carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: [0, '-33.333%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-gradient-to-br from-white/[0.02] to-white/[0.04] border border-white/[0.06] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col"
              >
                <span className="text-amber-400/15 text-4xl font-serif leading-none mb-3">&ldquo;</span>
                <p className="text-white/65 text-sm leading-relaxed flex-1">{t.quote}</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.06]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600/20 to-amber-500/10 flex items-center justify-center text-white/40 text-sm">
                    {t.flag}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{t.name}</p>
                    <p className="text-white/30 text-[11px]">{t.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Pricing Section
   ═══════════════════════════════════════════ */
function PricingSection() {
  const { t, lang } = useLanguage();

  const plans = [
    {
      key: 'free',
      intentLabel: lang === 'zh' ? '探索' : 'Explore',
      intentLabelEn: 'Explore',
      copy: lang === 'zh' ? '先尝一口命运' : 'Start with a taste',
      price: '¥0',
      priceAlt: '$0',
      period: '',
      features: [
        { key: 'feature.daily' },
        { key: 'feature.basic' },
        { key: 'feature.tarot' },
        { key: 'feature.community' },
      ],
      cta: lang === 'zh' ? '免费开始' : 'Start Free',
      href: '/western',
      highlighted: false,
      scale: '',
    },
    {
      key: 'premium',
      intentLabel: lang === 'zh' ? '最受欢迎' : 'Most Popular',
      intentLabelEn: 'Most Popular',
      copy: lang === 'zh' ? '解锁完整命盘，洞察当下星象' : 'See your full chart, patterns, and what the stars are saying right now',
      price: '¥29',
      priceAlt: '$4.99',
      period: '/月',
      periodAlt: '/mo',
      features: [
        { key: 'feature.all12' },
        { key: 'feature.ai' },
        { key: 'feature.three' },
        { key: 'feature.synastry' },
        { key: 'feature.pdf' },
        { key: 'feature.bilingual' },
      ],
      cta: lang === 'zh' ? '立即升级' : 'Upgrade Now',
      href: '/pricing',
      highlighted: true,
      scale: 'scale-105',
    },
    {
      key: 'deep',
      intentLabel: lang === 'zh' ? '深度解读' : 'For Serious Insight',
      intentLabelEn: 'For Serious Insight',
      copy: lang === 'zh' ? 'AI深度解读，为你专属定制' : 'Personalized guidance from AI-trained interpreters, tailored to your exact chart',
      price: '¥99',
      priceAlt: '$14.99',
      period: '/次',
      periodAlt: '/session',
      features: [
        { key: 'feature.premium' },
        { key: 'feature.celebrity' },
        { key: 'feature.annual' },
        { key: 'feature.priority' },
        { key: 'feature.personal' },
        { key: 'feature.revisions' },
      ],
      cta: lang === 'zh' ? '预约深度解读' : 'Book Deep Reading',
      href: '/pricing',
      highlighted: false,
      scale: '',
    },
  ];

  return (
    <section id="pricing" className="relative z-10 py-28 sm:py-36">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <SectionHeading titleKey="pricing.heading" />
        <p className="text-center text-white/40 text-sm mb-10 max-w-2xl mx-auto leading-relaxed">
          {lang === 'zh' ? '从免费探索到专家级深度解读，满足每一位命理探索者' : 'From free exploration to expert-level deep readings, for every seeker of wisdom'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan) => (
            <FadeInWhenVisible key={plan.key} className={plan.scale}>
              <div
                className={`relative bg-gradient-to-br rounded-2xl sm:rounded-3xl p-5 sm:p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'from-purple-900/40 to-amber-900/20 border-2 border-amber-400/40 shadow-lg shadow-amber-500/15'
                    : 'from-white/[0.015] to-white/[0.03] border border-white/[0.05]'
                }`}
              >
                {/* Intent label */}
                <div className="mb-4">
                  <span className={`text-[10px] tracking-wider uppercase ${
                    plan.highlighted ? 'text-amber-300/80' : 'text-white/30'
                  }`}>
                    {plan.intentLabel}
                  </span>
                </div>

                {/* Emotional copy */}
                <p className="text-white/50 text-xs mb-4 leading-relaxed max-w-full">
                  {plan.copy}
                </p>

                {/* Price */}
                <div className="mb-5">
                  <span className="text-3xl sm:text-4xl font-serif text-white">{plan.price}</span>
                  <span className="text-white/40 text-sm ml-1">{plan.period}</span>
                  <div className="text-white/20 text-xs mt-1">
                    {plan.priceAlt}{plan.periodAlt}
                  </div>
                </div>

                {/* Feature comparison — 3 rows */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.slice(0, 3).map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs">
                      <span className="text-amber-400/60 mt-0.5">✓</span>
                      <span>
                        <span className="text-white/50">{t(`${f.key}.zh`)}</span>
                        <span className="text-white/20 text-[10px] block">{t(`${f.key}`)}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={plan.href}
                  className={`block text-center py-3 sm:py-3.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.03] ${
                    plan.highlighted
                      ? 'bg-amber-400 text-black hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/25'
                      : 'bg-white/[0.05] text-white/70 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>

        {/* Urgency line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center text-white/30 text-xs mt-10"
        >
          {lang === 'zh'
            ? '大多数用户在首次解读后升级'
            : 'Most users upgrade after their first reading'}
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
   FAQ Section
   ═══════════════════════════════════════════ */
function FAQSection() {
  const { t, lang } = useLanguage();
  const faqItems = [
    { qKey: 'faq.q1', qZh: 'faq.q1.zh', aKey: 'faq.a1', aZh: 'faq.a1.zh' },
    { qKey: 'faq.q2', qZh: 'faq.q2.zh', aKey: 'faq.a2', aZh: 'faq.a2.zh' },
    { qKey: 'faq.q3', qZh: 'faq.q3.zh', aKey: 'faq.a3', aZh: 'faq.a3.zh' },
    { qKey: 'faq.q4', qZh: 'faq.q4.zh', aKey: 'faq.a4', aZh: 'faq.a4.zh' },
    { qKey: 'faq.q5', qZh: 'faq.q5.zh', aKey: 'faq.a5', aZh: 'faq.a5.zh' },
    { qKey: 'faq.q6', qZh: 'faq.q6.zh', aKey: 'faq.a6', aZh: 'faq.a6.zh' },
  ];

  return (
    <section id="faq" className="relative z-10 py-28 sm:py-36">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        <SectionHeading titleKey="faq.heading" />
        <div>
          {faqItems.map((item, i) => (
            <FAQItem
              key={i}
              q={t(item.qZh)}
              qEn={t(item.qKey)}
              a={t(item.aZh)}
              aEn={t(item.aKey)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, qEn, a, aEn, index }: { q: string; qEn: string; a: string; aEn: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <FadeInWhenVisible delay={index * 0.08}>
      <div className="border-b border-white/[0.05]">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-5 sm:py-6 text-left group"
        >
          <div className="flex-1 pr-4">
            <p className="text-base sm:text-lg font-serif text-white group-hover:text-amber-200/80 transition-colors duration-200">
              {q}
            </p>
            <p className="text-white/25 text-xs mt-1">{qEn}</p>
          </div>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/35 text-xl flex-shrink-0"
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
                <p className="text-white/55 text-sm leading-relaxed">{a}</p>
                <p className="text-white/25 text-xs mt-2 leading-relaxed">{aEn}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeInWhenVisible>
  );
}

/* ═══════════════════════════════════════════
   Tools Grid Section (Weakened)
   ═══════════════════════════════════════════ */
function ToolsSection() {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const displayServices = expanded ? SERVICES : SERVICES.slice(0, 6);

  return (
    <section id="services" className="relative z-10 py-28 sm:py-36">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <SectionHeading titleKey="section.tools" />
        <p className="text-center text-white/35 text-xs tracking-widest uppercase mb-12">
          {t('tools.subtitle')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayServices.map((s, i) => (
            <FadeInWhenVisible key={s.href} delay={i * 0.04}>
              <a
                href={s.href}
                className="group block bg-white/[0.015] border border-white/[0.05] hover:border-amber-300/30 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/[0.06]"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                  {s.icon}
                </div>
                <h3 className="text-base font-serif text-white mb-1">{s.title}</h3>
                <p className="text-white/40 text-xs">{s.desc}</p>
                <div className="mt-4 text-amber-300/50 group-hover:text-amber-200 flex items-center gap-1.5 text-xs transition-colors duration-200">
                  {t('tools.start')}
                  <span className="text-sm group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </a>
            </FadeInWhenVisible>
          ))}
        </div>
        {/* Expand button */}
        {!expanded && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setExpanded(true)}
              className="text-white/35 hover:text-white/60 text-sm transition-all duration-200 hover:scale-[1.02] border border-white/[0.06] hover:border-white/[0.1] rounded-full px-6 py-2.5"
            >
              {t('tools.cta')} →
            </button>
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
  const { t } = useLanguage();
  const [activeStory, setActiveStory] = useState('chart');

  const handleStoryActive = useCallback((id: string) => {
    setActiveStory((prev) => (prev !== id ? id : prev));
  }, []);

  return (
    <div className="mystic-page bg-[#030014] text-white min-h-screen">
      {/* Language toggle — top right */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <LangToggle />
      </div>

      {/* ═══════ 1. Immersive Mystic Hero ═══════ */}
      <DynamicHero />

      {/* ═══════ 2. Sticky Storytelling Section ═══════ */}
      <ParallaxSection offset={20} className="relative z-10 py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <SectionHeading titleKey="story.heading" />

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
              <p className="text-white/30 text-xs mt-3">{t('hero.helper')}</p>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* ═══════ 3. Tools Grid (Weakened) ═══════ */}
      <ParallaxSection offset={15}>
        <ToolsSection />
      </ParallaxSection>

      {/* ═══════ 4. How It Works ═══════ */}
      <ParallaxSection offset={20} className="relative z-10 py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center relative">
          <SectionHeading titleKey="how.heading" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
            {[
              {
                step: '01',
                titleKey: 'how.step1.title',
                descKey: 'how.step1.desc',
                icon: '🌙',
              },
              {
                step: '02',
                titleKey: 'how.step2.title',
                descKey: 'how.step2.desc',
                icon: '⚡',
              },
              {
                step: '03',
                titleKey: 'how.step3.title',
                descKey: 'how.step3.desc',
                icon: '📜',
              },
            ].map((item, i) => (
              <FadeInWhenVisible key={item.step} delay={i * 0.15}>
                <div className="text-center group">
                  <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/15 to-amber-500/8 group-hover:from-purple-600/25 group-hover:to-amber-500/15 transition-all duration-500" />
                    <span className="text-3xl relative z-10">{item.icon}</span>
                  </div>
                  <div className="text-5xl sm:text-6xl font-serif text-amber-300/8 mb-3">{item.step}</div>
                  <h3 className="text-lg sm:text-xl font-serif text-white mb-1">{t(item.titleKey)}</h3>
                  <p className="text-white/45 text-sm">{t(item.descKey)}</p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </ParallaxSection>

      {/* ═══════ 5. Premium Chart Analytics Preview ═══════ */}
      <ParallaxSection offset={15} className="relative z-10 py-28 sm:py-36">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-900/12 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative">
          <SectionHeading titleKey="charts.heading" />
          <p className="text-center text-white/35 text-sm mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('charts.subtitle')}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Circular Energy Chart */}
            <FadeInWhenVisible>
              <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/[0.06]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-serif text-white">{t('charts.radar')}</h3>
                  </div>
                  <span className="text-white/12 text-[10px] bg-white/[0.02] px-2.5 py-1 rounded-full">
                    {t('charts.sample')}
                  </span>
                </div>
                <div className="w-52 h-52 sm:w-56 sm:h-56 mx-auto">
                  <CircularEnergyChart />
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Life Timeline Line Chart */}
            <FadeInWhenVisible delay={0.12}>
              <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/[0.06]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-serif text-white">{t('charts.timeline')}</h3>
                  </div>
                  <span className="text-white/12 text-[10px] bg-white/[0.02] px-2.5 py-1 rounded-full">
                    {t('charts.sample')}
                  </span>
                </div>
                <div className="h-36 sm:h-40">
                  <LifeTimelineChart />
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Signal Layer Bars */}
            <FadeInWhenVisible delay={0.08}>
              <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/[0.06]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-serif text-white">{t('charts.layers')}</h3>
                  </div>
                  <span className="text-white/12 text-[10px] bg-white/[0.02] px-2.5 py-1 rounded-full">
                    {t('charts.sample')}
                  </span>
                </div>
                <SignalLayerBars />
              </div>
            </FadeInWhenVisible>

            {/* Insight Chips Card */}
            <FadeInWhenVisible delay={0.16}>
              <div className="bg-white/[0.015] border border-white/[0.05] rounded-2xl p-5 sm:p-6 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/[0.06]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-serif text-white">{t('charts.insights')}</h3>
                  </div>
                  <span className="text-white/12 text-[10px] bg-white/[0.02] px-2.5 py-1 rounded-full">
                    {t('charts.sample')}
                  </span>
                </div>
                <InsightChips />
                <div className="mt-5 bg-white/[0.01] rounded-xl p-3 border border-white/[0.03]">
                  <p className="text-white/35 text-xs leading-relaxed italic">
                    &quot;当前大运壬寅，印星透干生身，事业运势处于上升通道。建议把握2024-2026年窗口期...&quot;
                  </p>
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Full-width Sample Report Card */}
            <FadeInWhenVisible delay={0.1} className="lg:col-span-2">
              <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-base font-serif text-white">{t('charts.report.title')}</h3>
                  </div>
                  <a href="/western" className="text-amber-300/60 hover:text-amber-200 text-xs flex items-center gap-1 transition-colors duration-200">
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
                      className="bg-white/[0.015] rounded-xl p-3 border border-white/[0.04]"
                    >
                      <h4 className="text-xs font-serif text-amber-300/60 mb-1">{t(item.titleKey)}</h4>
                      <p className="text-white/45 text-[11px] leading-relaxed">{item.content}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
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

      {/* ═══════ 9. Final CTA ═══════ */}
      <section className="relative z-10 py-28 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-900/25 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <FadeInWhenVisible>
            <p className="text-amber-300/40 text-xs tracking-[0.3em] uppercase mb-6">Destiny Awaits</p>
            <h2 className="text-3xl sm:text-5xl font-serif text-white mb-6">{t('cta.title')}</h2>
            <p className="text-white/30 text-sm mb-10 max-w-md mx-auto leading-relaxed">
              {t('cta.subtitle')}
            </p>
            <div className="text-center">
              <PrimaryCTA />
              <p className="text-white/30 text-xs mt-4">{t('hero.helper')}</p>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ═══════ 10. Rich Footer ═══════ */}
      <footer className="relative z-10 border-t border-white/[0.05]">
        {/* Trust statement */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-12 sm:pt-16 pb-6">
          <p className="text-center text-white/20 text-xs leading-relaxed max-w-lg mx-auto">
            {t('footer.trust')}
          </p>
        </div>

        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-8">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-amber-300/50 text-xl">☯︎</span>
                <span className="text-white/70 font-serif text-lg">TianJi Global</span>
              </div>
              <p className="text-white/35 text-sm leading-relaxed mb-3 max-w-sm">
                {t('footer.brand.desc')}
              </p>
              <div className="flex gap-4 mt-5">
                {['Twitter', 'GitHub', 'Discord'].map((platform) => (
                  <span key={platform} className="text-white/15 hover:text-white/40 text-xs cursor-pointer transition-colors duration-200">
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white/50 text-sm font-medium mb-3">{t('footer.products')}</h4>
              <ul className="space-y-2">
                {[
                  { label: '紫微斗数', href: '/ziwei' },
                  { label: '八字命理', href: '/bazi' },
                  { label: '西方星盘', href: '/western' },
                  { label: '塔罗占卜', href: '/tarot' },
                  { label: '易经', href: '/yijing' },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-white/30 hover:text-white/55 text-sm transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Advanced */}
            <div>
              <h4 className="text-white/50 text-sm font-medium mb-3">{t('footer.advanced')}</h4>
              <ul className="space-y-2">
                {[
                  { label: '合盘分析', href: '/synastry' },
                  { label: 'Transit推运', href: '/transit' },
                  { label: '太阳返照', href: '/solar-return' },
                  { label: '风水布局', href: '/fengshui' },
                  { label: '择日择吉', href: '/electional' },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-white/30 hover:text-white/55 text-sm transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust & Legal */}
            <div>
              <h4 className="text-white/50 text-sm font-medium mb-3">{t('footer.trust.links')}</h4>
              <ul className="space-y-2">
                {[
                  { label: '关于天机', href: '/about' },
                  { label: '价格方案', href: '/pricing' },
                  { label: '隐私政策', href: '/legal/privacy' },
                  { label: '服务条款', href: '/legal/terms' },
                  { label: '联系我们', href: '/about#contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-white/30 hover:text-white/55 text-sm transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.03]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/15 text-xs">
              © {new Date().getFullYear()} TianJi Global · 天机全球. All rights reserved.
            </p>
            <p className="text-white/10 text-[10px] text-center sm:text-right max-w-xs">
              提供自我反思工具，不替代专业建议 · A tool for self-reflection, not a substitute for professional advice. 🌐 Region-neutral · 中英双语
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
