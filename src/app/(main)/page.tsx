'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
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
   Mock Chart Component
   ═══════════════════════════════════════════ */
function MockRadarChart() {
  // Simplified SVG radar chart for visual display
  const axes = 6;
  const size = 200;
  const center = size / 2;
  const radius = 70;
  // Mock data values (0-1 range) — replace with real data in production
  const values = [0.85, 0.72, 0.91, 0.68, 0.78, 0.88];
  const labels = ['财运', '事业', '健康', '感情', '学业', '人际'];

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / axes - Math.PI / 2;
    return {
      x: center + radius * value * Math.cos(angle),
      y: center + radius * value * Math.sin(angle),
    };
  };

  const dataPoints = values.map((v, i) => getPoint(i, v));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      {/* Grid rings */}
      {[0.33, 0.66, 1].map((scale) => (
        <polygon
          key={scale}
          points={Array.from({ length: axes }, (_, i) => {
            const p = getPoint(i, scale);
            return `${p.x},${p.y}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />
      ))}
      {/* Axis lines */}
      {Array.from({ length: axes }, (_, i) => {
        const p = getPoint(i, 1);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.5"
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="rgba(124,58,237,0.2)"
        stroke="rgba(168,130,255,0.6)"
        strokeWidth="1.5"
      />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#A78BFA" />
      ))}
      {/* Labels */}
      {labels.map((label, i) => {
        const p = getPoint(i, 1.25);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="8"
            fontFamily="serif"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Mock Bar Chart Component
   ═══════════════════════════════════════════ */
function MockBarChart() {
  // Mock monthly fortune data — replace with real data in production
  const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
  const values = [72, 85, 64, 91, 78, 88];
  const max = 100;

  return (
    <div className="flex items-end gap-3 h-40 px-4">
      {months.map((month, i) => (
        <div key={month} className="flex-1 flex flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${(values[i] / max) * 100}%` }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="w-full rounded-t-md bg-gradient-to-t from-purple-600/60 to-amber-400/40 relative"
          >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-white/50">
              {values[i]}
            </span>
          </motion.div>
          <span className="text-[10px] text-white/40">{month}</span>
        </div>
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
  /* Sticky section scroll transforms */
  const stickyRef = useRef(null);
  const { scrollYProgress: stickyProgress } = useScroll({
    target: stickyRef,
    offset: ['start start', 'end start'],
  });
  const stickyOpacity = useTransform(stickyProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const stickyScale = useTransform(stickyProgress, [0, 0.3, 0.7, 1], [0.92, 1, 1, 0.95]);
  const stickyY = useTransform(stickyProgress, [0, 0.3, 0.7, 1], [60, 0, 0, -40]);

  return (
    <div className="mystic-page bg-[#030014] text-white min-h-screen">
      {/* ═══════ 1. Immersive Mystic Hero ═══════ */}
      <DynamicHero />

      {/* ═══════ 2. Sticky Storytelling Section ═══════ */}
      <section
        ref={stickyRef}
        className="relative z-10 min-h-[200vh]"
      >
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <motion.div
            style={{ opacity: stickyOpacity, scale: stickyScale, y: stickyY }}
            className="max-w-4xl mx-auto px-6 sm:px-8 text-center"
          >
            <p className="text-amber-300/60 text-sm tracking-[0.3em] uppercase mb-6">
              Ancient Wisdom · Modern Technology
            </p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white leading-tight mb-8">
              穿越千年的智慧<br />
              <span className="text-amber-200/70">遇见前沿AI</span>
            </h2>
            <p className="text-white/40 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Swiss Ephemeris 精确星历计算 · 紫微斗数经典算法 · 现代心理学框架
              <br />
              <span className="text-white/25">
                Precision astronomical computation meets classical Chinese metaphysics and modern psychology
              </span>
            </p>

            {/* Animated stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16">
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
          </motion.div>
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

      {/* ═══════ 5. Advanced Chart Preview ═══════ */}
      <section className="relative z-10 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <SectionHeading
            zh="专业级命理图表"
            en="Professional-Grade Chart Analysis"
            subtitle="从紫微星盘到运势曲线，每一份分析都精确呈现"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Radar chart card */}
            <FadeInWhenVisible>
              <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-serif text-white">六维运势分析</h3>
                    <p className="text-white/30 text-xs mt-1">Six-Dimension Fortune Radar</p>
                  </div>
                  <span className="text-white/20 text-xs bg-white/[0.05] px-3 py-1 rounded-full">
                    示例 / Sample
                  </span>
                </div>
                <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto">
                  <MockRadarChart />
                </div>
              </div>
            </FadeInWhenVisible>

            {/* Bar chart card */}
            <FadeInWhenVisible delay={0.15}>
              <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.06] border border-white/[0.08] rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-serif text-white">月度运势趋势</h3>
                    <p className="text-white/30 text-xs mt-1">Monthly Fortune Trend</p>
                  </div>
                  <span className="text-white/20 text-xs bg-white/[0.05] px-3 py-1 rounded-full">
                    示例 / Sample
                  </span>
                </div>
                <MockBarChart />
              </div>
            </FadeInWhenVisible>

            {/* Sample report card */}
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
                {/* Mock report content */}
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
                    <div
                      key={i}
                      className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]"
                    >
                      <h4 className="text-sm font-serif text-amber-300/70 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-white/25 text-[10px] mb-2">{item.titleEn}</p>
                      <p className="text-white/50 text-xs leading-relaxed">{item.content}</p>
                    </div>
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
