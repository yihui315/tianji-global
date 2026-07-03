'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * ModuleGrid — 6-Card Parallax Grid
 *
 * Taste Rule: 深空黑背景、大留白、克制金紫光效
 *
 * Cards: 八字、紫微斗数、易经、塔罗、西方占星、关系合盘
 * Each card: hover glow (gold/purple), subtle video-preview animation
 * Parallax: cards move at slightly different speeds on scroll
 */

interface ModuleCardProps {
  index: number;
  title: { zh: string; en: string };
  subtitle: { zh: string; en: string };
  icon: string;
  accentColor: string;
  href: string;
  description: { zh: string; en: string };
}

function ModuleCard({ index, title, subtitle, icon, accentColor, href, description }: ModuleCardProps) {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  // Staggered entrance
  const delay = index * 0.08;

  // Accent colors per card (gold/purple, Taste Rule)
  const glowMap: Record<string, string> = {
    gold: 'rgba(245,158,11,',
    purple: 'rgba(168,130,255,',
    cyan: 'rgba(0,212,255,',
    rose: 'rgba(244,114,182,',
    emerald: 'rgba(52,211,153,',
    orange: 'rgba(251,191,36,',
  };

  const glowColor = glowMap[accentColor] || glowMap.purple;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <a
        href={href}
        className="group relative block rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
        style={{
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 0 0 0 transparent',
        }}
      >
        {/* Hover glow layer — Taste Rule: restrained gold/purple */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: `0 0 40px ${glowColor}0.12), inset 0 0 40px ${glowColor}0.06)`,
            borderRadius: '1rem',
          }}
        />

        {/* Subtle animated border gradient on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${glowColor}0.08) 0%, transparent 50%, ${glowColor}0.04) 100%)`,
            borderRadius: '1rem',
          }}
        />

        {/* Content */}
        <div className="relative p-6 sm:p-7">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110"
              style={{
                background: `${glowColor}0.1)`,
                boxShadow: `0 0 0 0 ${glowColor}0)`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${glowColor}0.2)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${glowColor}0)`;
              }}
            >
              {icon}
            </div>

            {/* Tag */}
            <span
              className="text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{
                background: `${glowColor}0.08)`,
                color: `${glowColor}0.7)`,
                border: `1px solid ${glowColor}0.15)`,
              }}
            >
              {lang === 'zh' ? '验证镜头' : 'Lens'}
            </span>
          </div>

          {/* Text */}
          <h3
            className="text-lg font-serif mb-1.5 transition-colors duration-200"
            style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {lang === 'zh' ? title.zh : title.en}
          </h3>

          <p
            className="text-[11px] mb-4"
            style={{ color: `${glowColor}0.6)`, letterSpacing: '0.04em' }}
          >
            {lang === 'zh' ? subtitle.zh : subtitle.en}
          </p>

          {/* Divider */}
          <div
            className="h-px mb-4"
            style={{ background: `${glowColor}0.1)` }}
          />

          {/* Description */}
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {lang === 'zh' ? description.zh : description.en}
          </p>

          {/* Mini animated preview — abstract constellation dots */}
          <div className="mt-5 relative h-16 overflow-hidden">
            <ConstellationPreview accentColor={glowColor} cardIndex={index} />
          </div>
        </div>
      </a>
    </motion.div>
  );
}

/** Animated constellation mini-preview per card */
function ConstellationPreview({ accentColor, cardIndex }: { accentColor: string; cardIndex: number }) {
  const dots = [
    { x: 10, y: 30, r: 3 },
    { x: 30, y: 15, r: 2 },
    { x: 50, y: 35, r: 2.5 },
    { x: 70, y: 20, r: 3.5 },
    { x: 90, y: 40, r: 2 },
    { x: 110, y: 25, r: 2 },
    { x: 130, y: 45, r: 3 },
    { x: 150, y: 30, r: 2.5 },
  ];

  const connections: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
  ];

  return (
    <svg width="100%" height="100%" viewBox="0 0 160 60" className="absolute inset-0">
      {/* Connection lines */}
      {connections.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={dots[a].x} y1={dots[a].y}
          x2={dots[b].x} y2={dots[b].y}
          stroke={accentColor + '0.15)'}
          strokeWidth="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 3 + cardIndex * 0.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Dots */}
      {dots.map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill={accentColor + '0.5)'}
          animate={{ opacity: [0.3, 0.9, 0.3], r: [dot.r, dot.r * 1.3, dot.r] }}
          transition={{
            duration: 2.5 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Faint horizontal scan line */}
      <motion.line
        x1="0" y1="30" x2="160" y2="30"
        stroke={accentColor + '0.04)'}
        strokeWidth="0.5"
        animate={{ x1: [-20, 180], opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
    </svg>
  );
}

const MODULES = [
  {
    title: { zh: '八字四柱', en: 'BaZi Four Pillars' },
    subtitle: { zh: '长期结构与五行倾向', en: 'Long-range structure' },
    icon: '🌿',
    accentColor: 'gold',
    href: '/bazi',
    description: {
      zh: '判断你的底层能量、五行平衡、长期节奏和适合持续投入的方向。',
      en: 'Reads elemental balance, long-cycle structure, and the direction that can compound over time.',
    },
  },
  {
    title: { zh: '紫微斗数', en: 'Zi Wei Dou Shu' },
    subtitle: { zh: '宫位与人生剧本', en: 'Palaces and life roles' },
    icon: '☁️',
    accentColor: 'purple',
    href: '/ziwei',
    description: {
      zh: '用命宫、事业、财富和关系宫位验证你在不同人生领域里的角色与剧本。',
      en: 'Uses palaces and stars to verify life roles across career, wealth, relationships, and identity.',
    },
  },
  {
    title: { zh: '易经六爻', en: 'Yi Jing Hexagrams' },
    subtitle: { zh: '当前问题与变化趋势', en: 'Current change pattern' },
    icon: '⚙️',
    accentColor: 'cyan',
    href: '/yijing',
    description: {
      zh: '当你面对具体选择时，易经负责判断当下形势、变化方向和行动窗口。',
      en: 'For a specific question, Yi Jing checks the current situation, change direction, and timing window.',
    },
  },
  {
    title: { zh: '塔罗牌阵', en: 'Tarot Card Spread' },
    subtitle: { zh: '即时情绪与行动提示', en: 'Choice and action signal' },
    icon: '🌙',
    accentColor: 'rose',
    href: '/tarot',
    description: {
      zh: '补足当下情绪、犹豫点和下一步动作，让命运画像不只停留在结构。',
      en: 'Adds the immediate emotional state, choice tension, and practical next action to the profile.',
    },
  },
  {
    title: { zh: '西方占星', en: 'Western Astrology' },
    subtitle: { zh: '心理模式与行运窗口', en: 'Psychology and transits' },
    icon: '🪐',
    accentColor: 'emerald',
    href: '/western',
    description: {
      zh: '用出生星盘与行运验证你的心理需求、关系模式和当前生命阶段。',
      en: 'Uses natal psychology and transits to verify needs, relationship patterns, and current life phase.',
    },
  },
  {
    title: { zh: '关系合盘', en: 'Relationship Synastry' },
    subtitle: { zh: '匹配、冲突与关系时机', en: 'Match, conflict, timing' },
    icon: '∞',
    accentColor: 'orange',
    href: '/relationship/new',
    description: {
      zh: '作为分享裂变入口，验证两个人的吸引、冲突、成长空间和适合推进的时机。',
      en: 'The shareable relationship lens verifies attraction, conflict, growth space, and timing between two people.',
    },
  },
];

export default function ModuleGrid() {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section ref={sectionRef} className="relative z-10 py-28 sm:py-40">
      {/* Background: subtle deep gradient — Taste Rule */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.5) 50%, transparent 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 sm:mb-20"
        >
          <p
            className="text-[10px] tracking-[0.3em] uppercase mb-4"
            style={{ color: 'rgba(245,158,11,0.5)' }}
          >
            {lang === 'zh' ? '六大验证镜头' : 'Six Verification Lenses'}
          </p>
          <h2
            className="text-center leading-tight mb-4"
            style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {lang === 'zh' ? '一份命运画像，六套系统交叉验证' : 'Six lenses, one destiny profile'}
          </h2>
          <p
            className="text-sm max-w-lg mx-auto"
            style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}
          >
            {lang === 'zh'
              ? '八字、紫微、易经、西方占星、塔罗与关系合盘不再互相竞争，而是共同验证 Identity、Timing、Relationship、Career、Wealth、Action 与 Risk。'
              : 'BaZi, Zi Wei, Yi Jing, Western astrology, Tarot, and Synastry stop competing as tools and become evidence for one profile.'}
          </p>
        </motion.div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {MODULES.map((mod, i) => (
            <ModuleCard key={mod.href + mod.title.zh} {...mod} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-center mt-14"
        >
          <a
            href={`/destiny/scan?lang=${lang}`}
            className="flex items-center gap-2 text-sm transition-colors duration-200"
            style={{ color: 'rgba(245,158,11,0.5)' }}
          >
            <span>{lang === 'zh' ? '开始命运扫描' : 'Start Destiny Scan'}</span>
            <span className="text-base">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
