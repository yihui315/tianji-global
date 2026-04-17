'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * ModuleGrid — 6-Card Parallax Grid
 *
 * Taste Rule: 深空黑背景、大留白、克制金紫光效
 *
 * Cards: 紫微斗数、八字、易经、塔罗、西方占星、人生K线
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
              {lang === 'zh' ? '立即体验' : 'Explore'}
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
    title: { zh: '紫微斗数', en: 'Zi Wei Dou Shu' },
    subtitle: { zh: '东方宫廷命运体系', en: 'Eastern Imperial Chart' },
    icon: '☁️',
    accentColor: 'purple',
    href: '/ziwei',
    description: {
      zh: '源自宋代的皇家星象学，通过14颗主星与12宫位，解读命宫、事业、感情、财富的完整格局。',
      en: 'Song-dynasty royal astrology. 14 main stars × 12 palaces decode your complete life architecture.',
    },
  },
  {
    title: { zh: '八字四柱', en: 'BaZi Four Pillars' },
    subtitle: { zh: '天干地支命运结构', en: 'Heavenly Stems & Earthly Branches' },
    icon: '🌿',
    accentColor: 'gold',
    href: '/bazi',
    description: {
      zh: '以出生年柱、月柱、日柱、时柱为核心，分析日元强弱、大运流转、十神关系，定位命运主轴。',
      en: 'Year/Month/Day/Hour pillars reveal your Day Master strength, decade cycles, and ten gods framework.',
    },
  },
  {
    title: { zh: '易经六爻', en: 'Yi Jing Hexagrams' },
    subtitle: { zh: '变化中的宇宙智慧', en: 'Wisdom Through Change' },
    icon: '⚙️',
    accentColor: 'cyan',
    href: '/yijing',
    description: {
      zh: '基于铜钱卜卦的六爻体系，通过世应关系、六亲配合、神煞介入，解读问题的当下时机与变化趋势。',
      en: 'Ancient coin-based hexagram system. Decode timing, relational dynamics, and emerging shifts.',
    },
  },
  {
    title: { zh: '塔罗牌阵', en: 'Tarot Card Spread' },
    subtitle: { zh: '78张牌的宇宙镜像', en: '78-Card Cosmic Mirror' },
    icon: '🌙',
    accentColor: 'rose',
    href: '/tarot',
    description: {
      zh: '从韦特体系到凯尔特十字，78张牌构成完整象征语言网络，针对具体问题提供精准卡位解读。',
      en: 'From Rider-Waite to Celtic Cross: 78 cards form a complete symbolic language for focused questions.',
    },
  },
  {
    title: { zh: '西方占星', en: 'Western Astrology' },
    subtitle: { zh: '行星运行与出生星盘', en: 'Planetary Birth Chart' },
    icon: '🪐',
    accentColor: 'emerald',
    href: '/western',
    description: {
      zh: '基于Swiss Ephemeris角秒级精度星历表，计算十大行星、十二星座、十大相位，呈现完整星盘能量图。',
      en: 'Swiss Ephemeris arc-second precision: 10 planets × 12 signs × 10 aspects = complete birth chart.',
    },
  },
  {
    title: { zh: '人生K线', en: 'Life K-Line' },
    subtitle: { zh: '命运曲线的周期预测', en: 'Fortune Cycle Projections' },
    icon: '📈',
    accentColor: 'orange',
    href: '/western',
    description: {
      zh: '将命运量化可视化——从童年到暮年的七大人生周期，标注高峰、低谷、转折点，预演未来十年走向。',
      en: 'Quantify destiny across 7 life cycles. Map peaks, valleys, and turning points. Project the next decade.',
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
            {lang === 'zh' ? '六大命运解读体系' : 'Six Cosmic Divination Systems'}
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
            {lang === 'zh' ? '一命二运三风水，四积阴德五读书' : 'One Destiny, Two Luck, Three Feng Shui'}
          </h2>
          <p
            className="text-sm max-w-lg mx-auto"
            style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}
          >
            {lang === 'zh'
              ? '东方千年智慧与西方星象学融合，六个维度完整覆盖你的人生格局'
              : 'Six dimensions of Eastern wisdom and Western astrology, fully covering your life architecture'}
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
            href="/western"
            className="flex items-center gap-2 text-sm transition-colors duration-200"
            style={{ color: 'rgba(245,158,11,0.5)' }}
          >
            <span>{lang === 'zh' ? '探索全部工具' : 'Explore all tools'}</span>
            <span className="text-base">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
