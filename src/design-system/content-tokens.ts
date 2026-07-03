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
    '一份命运画像，六大系统验证',
    '用六个镜头看清同一个人生模式',
    '三分钟生成你的 TianJi Destiny OS',
    'Identity 与 Timing 先显现',
    '把占卜工具升级为统一画像',
  ],
  en: [
    'One Destiny Profile, Verified by Six Systems',
    'Six lenses, one practical life pattern',
    'Build your TianJi Destiny OS in 3 minutes',
    'Identity and Timing first, deeper layers next',
    'Not a toolbox. A unified destiny profile',
  ],
} as const;

// ────────────────────────────────────────────
// 2. Hero Subtitles
// ────────────────────────────────────────────
export const heroSubtitles = {
  zh: [
    '八字 · 紫微 · 易经 · 西方占星 · 塔罗 · 关系合盘共同验证一份命运画像',
    '先看 Identity 与 Timing，再解锁 Relationship、Career、Wealth、Action 与 Risk',
    '精准星体计算 · 经典算法 · AI解释，不编造',
  ],
  en: [
    'BaZi · Zi Wei · Yi Jing · Western astrology · Tarot · Synastry verify one profile',
    'Start with Identity and Timing, then unlock Relationship, Career, Wealth, Action, and Risk',
    'Precision calculations · classical algorithms · AI explains, not invents',
  ],
} as const;

// ────────────────────────────────────────────
// 3. CTA Labels
// ────────────────────────────────────────────
export const ctaLabels = {
  primary: {
    zh: '开始命运扫描',
    en: 'Start Destiny Scan',
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
    zh: '六大验证镜头',
    en: 'Six Verification Lenses',
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
    zh: '解锁完整命运画像',
    en: 'Unlock Your Full Destiny Profile',
  },
  faq: {
    zh: '常见问题',
    en: 'FAQ',
  },
  finalCta: {
    zh: '你的命运画像已经准备好',
    en: 'Your destiny profile is ready',
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
    identity: { zh: '免费体验', en: 'Free' },
    tagline: { zh: '免费查看 Identity 与 Timing 预览', en: 'Preview Identity and Timing for free' },
    price: '$0',
    period: { zh: '永久免费', en: 'Free forever' },
  },
  premium: {
    name: { zh: '星辰', en: 'Stellar' },
    identity: { zh: '最受欢迎', en: 'Most Popular' },
    tagline: { zh: '解锁完整统一画像与六系统验证洞察', en: 'Unlock the unified profile and deeper verified insight' },
    price: '$9.9',
    period: { zh: '/月', en: '/mo' },
  },
  deep: {
    name: { zh: '天机', en: 'TianJi Pro' },
    identity: { zh: '深度洞察', en: 'For Deep Insight' },
    tagline: { zh: '多档案、关系、长周期与顾问式工作流', en: 'Multi-profile, relationship, long-cycle, and advisor workflows' },
    price: '$29.9',
    period: { zh: '/月', en: '/mo' },
  },
} as const;

// ────────────────────────────────────────────
// 7. Testimonial Copy — Behavior-driven social proof
// ────────────────────────────────────────────
export const testimonials = [
  {
    quote: {
      zh: '每个月我都会回来看运势曲线的变化。它帮我提前六个月预见了职业转型的关键窗口。',
      en: 'I come back every month to check my timeline shifts. It helped me spot a career pivot 6 months before it happened.',
    },
    author: 'Sophia L.',
    location: { zh: '伦敦', en: 'London, UK' },
    avatar: '🇬🇧',
  },
  {
    quote: {
      zh: '合盘分析让我理解了为什么我的关系总在重复同样的模式。省了好几个月的困惑。',
      en: 'It helped me understand why my relationships repeat the same patterns. Saved me months of confusion.',
    },
    author: 'Marcus T.',
    location: { zh: '多伦多', en: 'Toronto, CA' },
    avatar: '🇨🇦',
  },
  {
    quote: {
      zh: '没想到AI解读能做到这种深度。紫微和西方星盘的双引擎分析，完全超出预期。',
      en: 'I didn\'t expect this level of depth from an AI reading. The dual-engine Zi Wei + Western chart blew me away.',
    },
    author: 'Yuki M.',
    location: { zh: '东京', en: 'Tokyo, JP' },
    avatar: '🇯🇵',
  },
  {
    quote: {
      zh: '作为一个创作者，我用它来理解自己的创造力周期。现在我知道什么时候该冲刺，什么时候该休息。',
      en: 'As a creator, I use it to understand my creative cycles. Now I know when to push and when to rest.',
    },
    author: 'Ava R.',
    location: { zh: '柏林', en: 'Berlin, DE' },
    avatar: '🇩🇪',
  },
  {
    quote: {
      zh: '八字报告里对我日主的分析精准得让我起鸡皮疙瘩。感觉它比我更了解我自己。',
      en: 'The Day Master analysis was so accurate it gave me chills. It felt like it knew me better than I know myself.',
    },
    author: 'James K.',
    location: { zh: '纽约', en: 'New York, US' },
    avatar: '🇺🇸',
  },
  {
    quote: {
      zh: '我给团队里的每个人都做了命盘分析。现在我们用它来理解团队动态和协作方式。',
      en: 'I ran charts for everyone on my team. We now use it to understand group dynamics and how we collaborate best.',
    },
    author: 'Lin W.',
    location: { zh: '新加坡', en: 'Singapore, SG' },
    avatar: '🇸🇬',
  },
] as const;

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
