/**
 * TianJi Design System — Content Tokens
 *
 * Canonical copy variants for hero, CTA, section headings, testimonials,
 * and disclaimers. Consumed by content-bearing components so that
 * wording stays consistent across all pages.
 *
 * All copy follows the Voice & Tone guidelines in docs/voice-and-tone.md.
 */

// ────────────────────────────────────────────
// 1. Hero Headlines
// ────────────────────────────────────────────
export const heroHeadlines = {
  zh: [
    '从命盘结构理解自己',
    '星辰指引，理性解读',
    '三分钟获得双引擎解读',
    '天机已显 · 结构已明',
    '穿越千年智慧 · 预见当下格局',
  ],
  en: [
    'Understand yourself through your chart',
    'Stellar guidance, grounded insight',
    'Dual-engine reading in 3 minutes',
    'Your chart, decoded',
    'Ancient wisdom meets modern clarity',
  ],
} as const;

// ────────────────────────────────────────────
// 2. Hero Subtitles
// ────────────────────────────────────────────
export const heroSubtitles = {
  zh: [
    '紫微 · 八字 · 星盘 · 塔罗 — 中西命理全覆盖',
    '从命盘结构、关系模式和时间节律理解自己',
    '精准星体计算 · 深度命理解读',
  ],
  en: [
    'Zi Wei · BaZi · Western Chart · Tarot — East meets West',
    'Understand yourself through chart structure, relationship patterns, and life rhythms',
    'Arc-second precision · deep interpretive analysis',
  ],
} as const;

// ────────────────────────────────────────────
// 3. CTA Labels
// ────────────────────────────────────────────
export const ctaLabels = {
  primary: {
    zh: '开始你的命运探索',
    en: 'Begin Your Journey',
  },
  secondary: {
    zh: '查看今日运势',
    en: 'Today\'s Insight',
  },
  pricing: {
    zh: '选择适合你的方案',
    en: 'Choose Your Plan',
  },
  report: {
    zh: '查看完整报告',
    en: 'View Full Report',
  },
} as const;

// ────────────────────────────────────────────
// 4. Section Headings
// ────────────────────────────────────────────
export const sectionHeadings = {
  services: {
    zh: '十二天机法门',
    en: 'All Divination Paths',
  },
  howItWorks: {
    zh: '天机如何运转',
    en: 'How It Works',
  },
  charts: {
    zh: '专业级命理图表',
    en: 'Professional-Grade Charts',
  },
  testimonials: {
    zh: '真实洞察，真实故事',
    en: 'Real Insights, Real Stories',
  },
  pricing: {
    zh: '选择你的方案',
    en: 'Choose Your Plan',
  },
  faq: {
    zh: '常见问题',
    en: 'FAQ',
  },
  finalCta: {
    zh: '天机已为你准备好答案',
    en: 'Your chart is ready',
  },
} as const;

// ────────────────────────────────────────────
// 5. Trust / Disclaimer Copy
// ────────────────────────────────────────────
export const disclaimers = {
  responsible: {
    zh: '天机的分析建立在严谨的天文计算和经典命理体系之上，旨在提供有深度的自我探索工具，而非替代专业建议。',
    en: 'TianJi\'s analysis is built on rigorous astronomical calculations and classical systems, designed as a tool for self-exploration — not a replacement for professional advice.',
  },
  privacy: {
    zh: '我们采用银行级加密传输，不会将你的出生数据分享给任何第三方。',
    en: 'We use bank-grade encryption and never share birth data with third parties.',
  },
  method: {
    zh: 'Swiss Ephemeris 精确星历计算 · 经典算法 · 现代心理学框架',
    en: 'Swiss Ephemeris precision · Classical algorithms · Modern psychological framework',
  },
} as const;

// ────────────────────────────────────────────
// 6. Pricing Plan Copy
// ────────────────────────────────────────────
export const pricingPlans = {
  free: {
    name: { zh: '探索', en: 'Explore' },
    tagline: { zh: '先体验命盘结构', en: 'Start with a taste' },
    price: '$0',
    period: { zh: '永久免费', en: 'Free forever' },
  },
  premium: {
    name: { zh: '星辰', en: 'Stellar' },
    tagline: { zh: '解锁完整命盘与AI深度分析', en: 'Full charts + AI deep analysis' },
    price: '$9.9',
    period: { zh: '/月', en: '/mo' },
  },
  deep: {
    name: { zh: '天机', en: 'TianJi Pro' },
    tagline: { zh: 'AI深度解读，为你专属定制', en: 'Personalized AI guidance, tailored to your chart' },
    price: '$29.9',
    period: { zh: '/月', en: '/mo' },
  },
} as const;

// ────────────────────────────────────────────
// 7. Testimonial Copy
// ────────────────────────────────────────────
export const testimonials = [
  {
    quote: {
      zh: '每个月做重大决策前我都会看推运报告，它帮我提前六个月预见了职业转型。',
      en: 'I check my Transit report every month before making big decisions. It helped me spot a career shift 6 months early.',
    },
    author: 'Sophia',
    location: 'London',
  },
  {
    quote: {
      zh: '我以前对八字持怀疑态度。天机的解读方式让我第一次同时理解了中西方命理。',
      en: 'I was skeptical about BaZi. TianJi explained it in a way that finally made Western astrology click for me too.',
    },
    author: 'Marcus',
    location: 'Toronto',
  },
  {
    quote: {
      zh: '合盘分析帮我省了好几个月的困惑。它把我感受到但说不清的关系模式清晰地呈现了出来。',
      en: 'The relationship compatibility report saved me months of confusion. It named patterns I\'d felt but couldn\'t articulate.',
    },
    author: 'Yuki',
    location: 'Tokyo',
  },
] as const;
