'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { colors } from '@/design-system';

/**
 * DestinyPhilosophy — Hero下方第一个Section
 *
 * 哲学核心：所有占卜系统是同一个宇宙的不同语言翻译
 * East + West divination = different lenses on ONE cosmic reality
 */
export default function DestinyPhilosophy() {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  // 五大体系的核心比喻
  const systems = [
    {
      icon: '🌌',
      label: { zh: '紫微斗数', en: 'Zi Wei Dou Shu' },
      metaphor: { zh: '命运宫殿', en: 'Palace of Destiny' },
      desc: {
        zh: '十四颗主星落入十二宫位，如同宇宙在你生命中的投影',
        en: '14 major stars in 12 palaces — the cosmos projected onto your life',
      },
      accent: '#A78BFA', // purple
    },
    {
      icon: '🌓',
      label: { zh: '八字命理', en: 'Ba Zi' },
      metaphor: { zh: '时间结构', en: 'Temporal Architecture' },
      desc: {
        zh: '年月日时四柱，阴阳五行的宇宙方程式',
        en: 'Year·Month·Day·Hour pillars — the universe\'s equation of yin-yang',
      },
      accent: '#F59E0B', // gold
    },
    {
      icon: '⭐',
      label: { zh: '西方星盘', en: 'Western Chart' },
      metaphor: { zh: '行星运行', en: 'Planetary Motion' },
      desc: {
        zh: '十大行星黄道十二宫，宇宙能量的精确星历表',
        en: '10 planets × 12 signs — Swiss Ephemeris precision',
      },
      accent: '#06B6D4', // cyan
    },
    {
      icon: '🔮',
      label: { zh: '易经', en: 'Yi Jing' },
      metaphor: { zh: '变化哲学', en: 'Philosophy of Change' },
      desc: {
        zh: '六十四卦推演变化之道，先天智慧的无字天书',
        en: '64 hexagrams decode change — the original wisdom oracle',
      },
      accent: '#10B981', // green
    },
    {
      icon: '🃏',
      label: { zh: '塔罗', en: 'Tarot' },
      metaphor: { zh: '潜意识镜', en: 'Mirror of the Unconscious' },
      desc: {
        zh: '七十八张图，潜意识的象征语言与集体智慧',
        en: '78 symbolic cards — your unconscious speaking in archetypes',
      },
      accent: '#EC4899', // pink
    },
  ];

  return (
    <section
      ref={ref}
      className="relative z-10 py-24 sm:py-32 overflow-hidden"
      style={{ background: colors.bgPrimary }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.4), rgba(6,182,212,0.2))' }}
      />

      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-16 sm:mb-20"
        >
          {/* Eyebrow */}
          <p
            className="text-[10px] tracking-[0.3em] uppercase mb-4 animate-text-glow"
            style={{ color: colors.dataCyan }}
          >
            {lang === 'zh' ? '同一宇宙，五种语言' : 'One Universe, Five Languages'}
          </p>

          {/* Main title */}
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-serif leading-tight mb-6"
            style={{ color: colors.textPrimary }}
          >
            {lang === 'zh'
              ? <>东来命理，西式星象<br /><span style={{ color: colors.purpleLight }}>同一宇宙的五种观照</span></>
              : <>Eastern Wisdom. Western Science.<br /><span style={{ color: colors.purpleLight }}>Five Views of One Cosmic Reality</span></>
            }
          </h2>

          {/* Subtitle */}
          <p
            className="max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            {lang === 'zh'
              ? '紫微八字、易经塔罗、西方星盘——看似不同的占卜体系，实际上都在用各自的语言描述同一个宇宙能量场。天机全球把它们融为一体，让你从多个维度交叉验证，获得更完整的命运画像。'
              : 'Zi Wei, BaZi, Yi Jing, Western Astrology, Tarot — each a different language describing the same cosmic energy field. TianJi Global weaves them together, letting you cross-reference multiple dimensions for a complete picture of your destiny.'
            }
          </p>
        </motion.div>

        {/* Five systems — horizontal flow on desktop, stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-3">
          {systems.map((sys, i) => (
            <motion.div
              key={sys.label.en}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: 'easeOut' }}
              className="group relative"
            >
              <div
                className="rounded-xl p-4 sm:p-5 border transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: `${sys.accent}22`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${sys.accent}55`;
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${sys.accent}22`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${sys.accent}22`;
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                {/* Icon */}
                <div
                  className="text-3xl mb-3"
                  style={{ filter: `drop-shadow(0 0 8px ${sys.accent}66)` }}
                >
                  {sys.icon}
                </div>

                {/* Label */}
                <h3 className="text-sm font-serif mb-1" style={{ color: colors.textPrimary }}>
                  {sys.label[lang]}
                </h3>

                {/* Metaphor tag */}
                <p
                  className="text-[10px] tracking-wider uppercase mb-2"
                  style={{ color: sys.accent }}
                >
                  {sys.metaphor[lang]}
                </p>

                {/* Description */}
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: colors.textTertiary }}
                >
                  {sys.desc[lang]}
                </p>

                {/* Connecting line — not on last item */}
                {i < systems.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-1/2 -right-[10px] w-[20px] h-px"
                    style={{
                      background: `linear-gradient(to right, ${sys.accent}44, transparent)`,
                    }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom statement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-center mt-16 sm:mt-20"
        >
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: colors.textMuted }}
          >
            {lang === 'zh'
              ? '所有工具互相印证 · 单一入口 · 完整命运图谱'
              : 'Cross-validated insights · Single entry · Complete destiny map'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
