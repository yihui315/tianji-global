'use client';

import { useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { colors } from '@/design-system';

/**
 * ToolsByCategory — 重组工具网格
 *
 * 旧版：12个工具等比排列，用户选择困难
 * 新版：按用户意图分类（4类），每类2-4个工具，有引导文案
 * - 自我结构：ZiWei, BaZi, Western, Numerology
 * - 当下指引：Tarot, YiJing, Horary, Electional
 * - 关系合盘：Synastry, Composite
 * - 命运推演：Transit, SolarReturn, FengShui
 */
export default function ToolsByCategory() {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [activeCategory, setActiveCategory] = useState(0);

  const categories = [
    {
      id: 'structure',
      label: { zh: '自我结构', en: 'Self Structure' },
      icon: '🧬',
      desc: {
        zh: '理解你的核心本质——性格结构、命运格局、人生主轴',
        en: 'Understand your core nature — personality, destiny pattern, life axis',
      },
      accent: '#06B6D4',
      tools: [
        {
          href: '/western',
          icon: '⭐',
          name: { zh: '西方星盘', en: 'Western Chart' },
          tag: { zh: '最完整', en: 'Most Complete' },
          desc: {
            zh: '十大行星·十二宫·相位合相',
            en: '10 planets × 12 houses × aspects',
          },
        },
        {
          href: '/ziwei',
          icon: '🌟',
          name: { zh: '紫微斗数', en: 'Zi Wei Dou Shu' },
          tag: { zh: '帝王宫体系', en: 'Imperial Chart' },
          desc: {
            zh: '十四主星·十二宫位·四化飞星',
            en: '14 major stars · 12 palaces · 4 transformations',
          },
        },
        {
          href: '/bazi',
          icon: '🌓',
          name: { zh: '八字命理', en: 'BaZi Analysis' },
          tag: { zh: '时间结构', en: 'Temporal Structure' },
          desc: {
            zh: '日主·十神·大运流年',
            en: 'Day Master · Ten Gods · decade pillars',
          },
        },
        {
          href: '/numerology',
          icon: '🔢',
          name: { zh: '姓名命理', en: 'Numerology' },
          tag: { zh: '名字能量', en: 'Name Energy' },
          desc: {
            zh: '三才五格·数理磁场·名字解读',
            en: 'Name grids · numeric fields',
          },
        },
      ],
    },
    {
      id: 'guidance',
      label: { zh: '当下指引', en: 'Guidance Now' },
      icon: '🔮',
      desc: {
        zh: '面对选择或困境时，宇宙给你的即时回应',
        en: 'Cosmic answers when you face choices or dilemmas',
      },
      accent: '#A78BFA',
      tools: [
        {
          href: '/tarot',
          icon: '🃏',
          name: { zh: '塔罗占卜', en: 'Tarot Reading' },
          tag: { zh: '即时指引', en: 'Instant Insight' },
          desc: {
            zh: '78张牌·AI智能解读·三牌阵',
            en: '78 cards · AI interpretation · 3-card spread',
          },
        },
        {
          href: '/yijing',
          icon: '🔮',
          name: { zh: '易经占卜', en: 'Yi Jing Oracle' },
          tag: { zh: '变化之道', en: 'Path of Change' },
          desc: {
            zh: '64卦·爻辞·象数分析',
            en: '64 hexagrams · line texts',
          },
        },
        {
          href: '/horary',
          icon: '🌀',
          name: { zh: '卦占', en: 'Horary' },
          tag: { zh: '时间卦', en: 'Time Hexagram' },
          desc: {
            zh: '即时天机·提问即答',
            en: 'Instant insight · ask and receive',
          },
        },
        {
          href: '/electional',
          icon: '📅',
          name: { zh: '择日择吉', en: 'Electional' },
          tag: { zh: '最优时机', en: 'Best Timing' },
          desc: {
            zh: '黄道吉日·最佳行动时辰',
            en: 'Auspicious dates · optimal timing',
          },
        },
      ],
    },
    {
      id: 'relationship',
      label: { zh: '关系合盘', en: 'Relationship' },
      icon: '💫',
      desc: {
        zh: '关系的能量流动、匹配度、成长机会',
        en: 'Energy flow, compatibility, and growth opportunities',
      },
      accent: '#F59E0B',
      tools: [
        {
          href: '/synastry',
          icon: '💫',
          name: { zh: '合盘分析', en: 'Synastry' },
          tag: { zh: '叠盘对比', en: 'Overlay Chart' },
          desc: {
            zh: '行星相位·宫位共享·能量交换',
            en: 'Planetary aspects · shared houses',
          },
        },
        {
          href: '/synastry',
          icon: '🔗',
          name: { zh: '复合盘', en: 'Composite' },
          tag: { zh: '第三实体', en: 'Third Entity' },
          desc: {
            zh: '两人关系的独立实体·中点相位',
            en: 'The relationship as its own entity',
          },
        },
        {
          href: '/synastry',
          icon: '⚡',
          name: { zh: '戴维森盘', en: 'Davison Chart' },
          tag: { zh: '关系中点', en: 'Midpoint Chart' },
          desc: {
            zh: '关系中点星盘·深层动力分析',
            en: 'Relationship midpoint · deep dynamics',
          },
        },
      ],
    },
    {
      id: 'fate',
      label: { zh: '命运推演', en: 'Fate Projection' },
      icon: '📈',
      desc: {
        zh: '未来的能量走向、人生节点、转折时机',
        en: 'Future energy trends, turning points, and life phases',
      },
      accent: '#10B981',
      tools: [
        {
          href: '/transit',
          icon: '🔭',
          name: { zh: 'Transit推运', en: 'Transits' },
          tag: { zh: '行星推进', en: 'Planetary Progressions' },
          desc: {
            zh: '次限推进·外行星影响·顺逆行',
            en: 'Secondary progressions · outer planets',
          },
        },
        {
          href: '/solar-return',
          icon: '☀️',
          name: { zh: '太阳返照', en: 'Solar Return' },
          tag: { zh: '年度运势', en: 'Annual Forecast' },
          desc: {
            zh: '生日星盘·本年度能量主题',
            en: 'Birthday chart · yearly energy theme',
          },
        },
        {
          href: '/fengshui',
          icon: '🏠',
          name: { zh: '风水布局', en: 'Feng Shui' },
          tag: { zh: '空间能量', en: 'Space Energy' },
          desc: {
            zh: '八宅·玄空飞星·环境能量',
            en: 'Eight Mansions · Flying Stars',
          },
        },
      ],
    },
  ];

  const active = categories[activeCategory];

  return (
    <section
      ref={ref}
      id="tools"
      className="relative z-10 py-20 sm:py-28 overflow-hidden"
      style={{ background: colors.bgPrimary }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${active.accent}08, transparent)`,
          transition: 'background 0.5s ease',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p
            className="text-[10px] tracking-[0.3em] uppercase mb-3"
            style={{ color: colors.dataCyan }}
          >
            {lang === 'zh' ? '完整工具矩阵' : 'Complete Divination Matrix'}
          </p>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-4"
            style={{ color: colors.textPrimary }}
          >
            {lang === 'zh' ? '十二道观照，洞察命运全貌' : '12 Tools, One Complete Destiny Map'}
          </h2>
          <p
            className="max-w-xl mx-auto text-sm"
            style={{ color: colors.textSecondary }}
          >
            {lang === 'zh'
              ? '从自我认知到关系洞察，从当下指引到未来推演——每个工具都是命运图谱的一个观测维度'
              : 'From self-understanding to relationship insight, from present guidance to future projection — each tool illuminates a different dimension of your destiny map'
            }
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(i)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200"
              style={{
                background: activeCategory === i ? `${cat.accent}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeCategory === i ? `${cat.accent}55` : 'rgba(255,255,255,0.08)'}`,
                color: activeCategory === i ? cat.accent : colors.textTertiary,
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label[lang]}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: `${cat.accent}22`,
                  color: activeCategory === i ? cat.accent : colors.textMuted,
                }}
              >
                {cat.tools.length}
              </span>
            </button>
          ))}
        </div>

        {/* Tool cards — animate on category switch */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Category description */}
            <div className="text-center mb-8">
              <p
                className="text-sm mb-2"
                style={{ color: active.accent }}
              >
                {active.desc[lang]}
              </p>
            </div>

            {/* Tool grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {active.tools.map((tool, i) => (
                <motion.a
                  key={tool.href + tool.name.en}
                  href={tool.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.05 + i * 0.08 }}
                  className="group relative rounded-xl p-4 border transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: `${active.accent}22`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = `${active.accent}55`;
                    (e.currentTarget as HTMLAnchorElement).style.background = `${active.accent}08`;
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 30px ${active.accent}15`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = `${active.accent}22`;
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.02)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Tag */}
                  <span
                    className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${active.accent}15`,
                      color: active.accent,
                    }}
                  >
                    {tool.tag[lang]}
                  </span>

                  {/* Icon */}
                  <div
                    className="text-2xl mb-3"
                    style={{ filter: `drop-shadow(0 0 8px ${active.accent}55)` }}
                  >
                    {tool.icon}
                  </div>

                  {/* Name */}
                  <h3
                    className="text-sm font-serif mb-1"
                    style={{ color: colors.textPrimary }}
                  >
                    {tool.name[lang]}
                  </h3>

                  {/* Desc */}
                  <p
                    className="text-[10px] leading-relaxed"
                    style={{ color: colors.textTertiary }}
                  >
                    {tool.desc[lang]}
                  </p>

                  {/* Arrow */}
                  <div
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ color: active.accent }}
                  >
                    →
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-center mt-10"
        >
          <p className="text-xs" style={{ color: colors.textMuted }}>
            {lang === 'zh'
              ? '所有工具共享同一命盘数据 · 输入一次，十二种观照'
              : 'All tools share your birth data · Enter once, twelve dimensions revealed'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
