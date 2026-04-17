'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { colors } from '@/design-system';

/**
 * EntryPathways — 用户意图三条路径
 *
 * 哲学落地后，给用户清晰的下一步：
 * Path 1: 我想了解"我是谁" → 结构分析（BaZi + Western + ZiWei）
 * Path 2: 我想知道"我现在该怎么做" → 当下指引（Tarot + YiJing + Transit）
 * Path 3: 我想知道"两个人的关系" → 关系合盘（Synastry）
 *
 * 每条路径一个主CTA + 子入口
 */
export default function EntryPathways() {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const pathways = [
    {
      id: 'self',
      icon: '🧭',
      label: { zh: '自我认知', en: 'Know Yourself' },
      tagline: {
        zh: '我的性格、优势、命运结构是什么？',
        en: 'What is my nature, strength, and destiny structure?',
      },
      primaryHref: '/western',
      primaryLabel: { zh: '从星盘开始', en: 'Start with My Chart' },
      tools: [
        { label: { zh: '西方星盘', en: 'Western Chart' }, href: '/western', icon: '⭐' },
        { label: { zh: '紫微斗数', en: 'Zi Wei' }, href: '/ziwei', icon: '🌟' },
        { label: { zh: '八字命理', en: 'BaZi' }, href: '/bazi', icon: '🌓' },
        { label: { zh: '姓名命理', en: 'Numerology' }, href: '/numerology', icon: '🔢' },
      ],
      accentColor: '#06B6D4', // cyan
      glowBg: 'rgba(6,182,212,0.08)',
    },
    {
      id: 'guidance',
      icon: '🔭',
      label: { zh: '当下指引', en: 'Guidance Now' },
      tagline: {
        zh: '我现在面临选择，宇宙想告诉我什么？',
        en: 'I face a choice — what does the cosmos say?',
      },
      primaryHref: '/tarot',
      primaryLabel: { zh: '塔罗占卜', en: 'Tarot Reading' },
      tools: [
        { label: { zh: '塔罗', en: 'Tarot' }, href: '/tarot', icon: '🃏' },
        { label: { zh: '易经', en: 'Yi Jing' }, href: '/yijing', icon: '🔮' },
        { label: { zh: 'Transit推运', en: 'Transits' }, href: '/transit', icon: '🔭' },
        { label: { zh: '太阳返照', en: 'Solar Return' }, href: '/solar-return', icon: '☀️' },
      ],
      accentColor: '#A78BFA', // purple
      glowBg: 'rgba(124,58,237,0.08)',
    },
    {
      id: 'relationship',
      icon: '💫',
      label: { zh: '关系洞察', en: 'Relationship Insight' },
      tagline: {
        zh: '我和他/她之间，宇宙能量如何流动？',
        en: 'How does energy flow between us?',
      },
      primaryHref: '/synastry',
      primaryLabel: { zh: '关系合盘', en: 'Synastry Analysis' },
      tools: [
        { label: { zh: '合盘分析', en: 'Synastry' }, href: '/synastry', icon: '💫' },
        { label: { zh: '叠盘对比', en: 'Composite' }, href: '/synastry', icon: '🔗' },
        { label: { zh: '戴维森盘', en: 'Davison' }, href: '/synastry', icon: '⚡' },
      ],
      accentColor: '#F59E0B', // gold
      glowBg: 'rgba(245,158,11,0.08)',
    },
  ];

  return (
    <section
      ref={ref}
      className="relative z-10 py-20 sm:py-28 overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.3)' }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 sm:mb-16"
        >
          <p
            className="text-[10px] tracking-[0.3em] uppercase mb-3"
            style={{ color: colors.purpleLight }}
          >
            {lang === 'zh' ? '你想探索哪个维度？' : 'Choose Your Entry Point'}
          </p>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-serif"
            style={{ color: colors.textPrimary }}
          >
            {lang === 'zh' ? '三条命盘，三重观照' : 'Three Paths, One Destiny'}
          </h2>
        </motion.div>

        {/* Three pathways */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-5">
          {pathways.map((path, i) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease: 'easeOut' }}
              className="group relative rounded-2xl p-6 sm:p-7 border transition-all duration-300"
              style={{
                background: path.glowBg,
                borderColor: `${path.accentColor}33`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${path.accentColor}66`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${path.accentColor}18, inset 0 0 30px ${path.accentColor}08`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${path.accentColor}33`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              {/* Icon */}
              <div
                className="text-4xl mb-4"
                style={{ filter: `drop-shadow(0 0 12px ${path.accentColor}88)` }}
              >
                {path.icon}
              </div>

              {/* Label */}
              <h3
                className="text-lg sm:text-xl font-serif mb-2"
                style={{ color: colors.textPrimary }}
              >
                {path.label[lang]}
              </h3>

              {/* Tagline */}
              <p
                className="text-xs leading-relaxed mb-6"
                style={{ color: colors.textSecondary }}
              >
                {path.tagline[lang]}
              </p>

              {/* Primary CTA */}
              <a
                href={path.primaryHref}
                className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-4 py-2 mb-6 transition-all duration-200"
                style={{
                  background: `${path.accentColor}18`,
                  border: `1px solid ${path.accentColor}44`,
                  color: path.accentColor,
                }}
              >
                {path.primaryLabel[lang]} →
              </a>

              {/* Divider */}
              <div className="border-t mb-5" style={{ borderColor: `${path.accentColor}22` }} />

              {/* Tool list */}
              <div className="flex flex-wrap gap-2">
                {path.tools.map((tool) => (
                  <a
                    key={tool.href + tool.label.en}
                    href={tool.href}
                    className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: colors.textTertiary,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = `${path.accentColor}15`;
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = `${path.accentColor}33`;
                      (e.currentTarget as HTMLAnchorElement).style.color = colors.textSecondary;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.03)';
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLAnchorElement).style.color = colors.textTertiary;
                    }}
                  >
                    <span>{tool.icon}</span>
                    <span>{tool.label[lang]}</span>
                  </a>
                ))}
              </div>

              {/* Decorative corner glow */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none"
                style={{ background: path.accentColor }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
