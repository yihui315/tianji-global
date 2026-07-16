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
  // Illustrative product-use examples, not customer testimonials.
  // 产品使用场景示例，并非真实用户评价。
} as const;

// ────────────────────────────────────────────
// 6. Pricing Plan Copy
// ────────────────────────────────────────────
export const pricingPlans = {
  free: {
    name: { zh: '探索', en: 'Explore' },
    identity: { zh: '免费体验', en: 'Free' },
    tagline: { zh: '先体验命盘结构，了解你的星辰基因', en: 'Discover your chart structure and cosmic blueprint' },
    price: '$0',
    period: { zh: '永久免费', en: 'Free forever' },
  },
  premium: {
    name: { zh: '星辰', en: 'Stellar' },
    identity: { zh: '最受欢迎', en: 'Most Popular' },
    tagline: { zh: '解锁完整命盘、运势模式与长周期洞察', en: 'Unlock your full chart, patterns, and long-term insights' },
    price: '$9.9',
    period: { zh: '/月', en: '/mo' },
  },
  deep: {
    name: { zh: '天机', en: 'TianJi Pro' },
    identity: { zh: '深度洞察', en: 'For Deep Insight' },
    tagline: { zh: '针对你当前人生阶段的个性化深度解读', en: 'Personalized interpretation for your specific life phase' },
    price: '$29.9',
    period: { zh: '/月', en: '/mo' },
  },
} as const;

// ────────────────────────────────────────────
// 7. Product Use Examples (replaces fake testimonials)
// Illustrative product-use examples, not customer testimonials.
// 产品使用场景示例，并非真实用户评价.
// ────────────────────────────────────────────
export const productUseExamples = {
  zh: [
    '整理沟通问题：了解自己在关系中的表达模式',
    '识别重复关系模式：发现自己反复遇到的关系类型',
    '记录情绪和关系变化：用图表追踪关系发展的节律',
    '决定沟通、暂停或寻求帮助：在关键节点做出理性选择',
  ],
  en: [
    'Organizing communication patterns: understand how you express yourself in relationships',
    'Identifying recurring relationship patterns: discover the types of connections you keep forming',
    'Tracking emotional and relationship changes: use charts to follow the rhythm of your bond',
    'Deciding to communicate, pause, or seek help: make informed choices at key moments',
  ],
} as const;

// ────────────────────────────────────────────
// 8. Trust Section Copy
// ────────────────────────────────────────────
export const trustPillars = [
  {
    icon: '🔬',
    title: { zh: '结构化计算', en: 'Structured Calculation' },
    desc: {
      zh: '基于瑞士星历表(Swiss Ephemeris)精确到角秒级别的天文计算，非随机生成。',
      en: 'Built on Swiss Ephemeris arc-second astronomical calculations, not random generation.',
    },
  },
  {
    icon: '🧠',
    title: { zh: 'AI解释，不编造', en: 'AI Explains, Not Invents' },
    desc: {
      zh: 'AI基于经典命理文献和心理学框架进行解读，忠于原始星盘数据。',
      en: 'AI interprets based on classical texts and psychological frameworks, faithful to raw chart data.',
    },
  },
  {
    icon: '🔒',
    title: { zh: '隐私优先', en: 'Privacy-First' },
    desc: {
      zh: '银行级加密传输，绝不分享出生数据给第三方，随时可删除。',
      en: 'Bank-grade encryption. Birth data is never shared with third parties. Delete anytime.',
    },
  },
  {
    icon: '⚖️',
    title: { zh: '负责任的解读', en: 'Responsible Interpretation' },
    desc: {
      zh: '提供有深度的自我探索工具，明确标注为参考而非绝对预测。',
      en: 'A tool for deep self-exploration, clearly framed as insight — not absolute prediction.',
    },
  },
] as const;
