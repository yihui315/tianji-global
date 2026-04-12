'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

import {
  heroSubtitles,
  ctaLabels,
  sectionHeadings,
  disclaimers,
  pricingPlans,
  testimonials as testimonialTokens,
} from '@/design-system/content-tokens';

type Lang = 'zh' | 'en';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Build translations map.
 *
 * Section headings, hero copy, CTAs, pricing, testimonials, and disclaimers
 * are sourced from content-tokens.ts (the design-system single source of truth).
 * Page-specific strings (FAQ, feature lists, etc.) remain here.
 */
function buildTranslations(): Record<string, Record<Lang, string>> {
  return {
    // ── Navigation & Hero ──────────────────────
    'hero.subtitle': {
      zh: heroSubtitles.zh[0],
      en: heroSubtitles.en[0],
    },
    'hero.cta': {
      zh: ctaLabels.primary.zh,
      en: ctaLabels.primary.en,
    },
    'hero.cta.secondary': {
      zh: ctaLabels.secondary.zh,
      en: ctaLabels.secondary.en,
    },
    'hero.helper': {
      zh: '不到3分钟',
      en: 'Takes less than 3 minutes',
    },

    // ── Storytelling section ───────────────────
    'story.heading': {
      zh: '穿越千年的智慧 · 遇见前沿AI',
      en: 'Ancient Wisdom Meets Modern AI',
    },
    'story.badge.chart': { zh: '命盘结构', en: 'Chart Structure' },
    'story.badge.relationship': { zh: '关系洞察', en: 'Relationship Insight' },
    'story.badge.rhythm': { zh: '生命节律', en: 'Life Rhythms' },
    'story.title.chart': { zh: '精密的命盘架构', en: 'Precision Chart Architecture' },
    'story.title.relationship': { zh: '深层关系解读', en: 'Deep Relationship Analysis' },
    'story.title.rhythm': { zh: '长周期运势节律', en: 'Long-Cycle Fortune Rhythms' },
    'story.body.chart': {
      zh: '从紫微十二宫到西方黄道十二宫，每一颗星曜的位置都经过瑞士星历表（Swiss Ephemeris）精确到角秒级别的计算。',
      en: 'From Zi Wei\'s twelve palaces to the Western zodiac, every stellar position is calculated to arc-second precision via Swiss Ephemeris.',
    },
    'story.body.relationship': {
      zh: '合盘分析、复合盘与戴维森盘，多维度揭示两人之间的能量互动与成长契机。',
      en: 'Synastry, composite, and Davison charts reveal the multi-dimensional energy exchange and growth opportunities between two people.',
    },
    'story.body.rhythm': {
      zh: '大运流年、Transit推运与太阳返照，精准追踪人生各阶段的能量高峰与转折点。',
      en: 'Decade pillars, transits, and solar returns track life-phase energy peaks and turning points with precision.',
    },

    // ── Stats ──────────────────────────────────
    'stats.users': { zh: '用户信赖', en: 'Trusted Users' },
    'stats.charts': { zh: '命盘已排', en: 'Charts Cast' },
    'stats.accuracy': { zh: '星历精度', en: 'Ephemeris Precision' },
    'stats.tools': { zh: '命理法门', en: 'Divination Tools' },

    // ── Services / Tools ───────────────────────
    'tools.heading': {
      zh: sectionHeadings.services.zh,
      en: sectionHeadings.services.en,
    },
    'tools.subtitle': {
      zh: '涵盖中国传统命理与西方占星术，东西方智慧全覆盖',
      en: 'Covering Chinese classical systems and Western astrology — East meets West',
    },
    'tools.cta': { zh: '查看全部12种工具', en: 'Explore All 12 Tools' },
    'tools.start': { zh: '开始排盘', en: 'Begin' },

    // ── Section headings (from content-tokens) ─
    'section.tools': {
      zh: sectionHeadings.services.zh,
      en: sectionHeadings.services.en,
    },

    // ── How it works ───────────────────────────
    'how.heading': {
      zh: sectionHeadings.howItWorks.zh,
      en: sectionHeadings.howItWorks.en,
    },
    'how.step1.title': { zh: '输入生辰', en: 'Enter Birth Details' },
    'how.step1.desc': {
      zh: '提供你的出生日期、时间和地点',
      en: 'Provide your date, time, and place of birth',
    },
    'how.step2.title': { zh: 'AI解析', en: 'AI Analysis' },
    'how.step2.desc': {
      zh: '瑞士星历表+古籍算法，精准计算星体位置',
      en: 'Swiss Ephemeris + classical algorithms calculate precise stellar positions',
    },
    'how.step3.title': { zh: '深度解读', en: 'Deep Interpretation' },
    'how.step3.desc': {
      zh: '融合现代心理学与古典命理，给你专属分析',
      en: 'Modern psychology meets classical methods for a personalized reading',
    },

    // ── Charts section ─────────────────────────
    'charts.heading': {
      zh: sectionHeadings.charts.zh,
      en: sectionHeadings.charts.en,
    },
    'charts.subtitle': {
      zh: '从紫微星盘到运势曲线，每一份分析都精确呈现',
      en: 'From Zi Wei star charts to fortune curves, every analysis is rendered with precision',
    },
    'charts.radar': { zh: '六维能量雷达', en: 'Six-Dimension Energy Radar' },
    'charts.timeline': { zh: '人生运势曲线', en: 'Life Fortune Timeline' },
    'charts.layers': { zh: '多维信号层叠', en: 'Multi-Signal Layers' },
    'charts.insights': { zh: 'AI洞察标签', en: 'AI Insight Tags' },
    'charts.sample': { zh: '示例', en: 'Sample' },
    'charts.report.title': { zh: 'AI深度分析报告示例', en: 'AI Deep Analysis Report Sample' },
    'charts.report.cta': { zh: '试试我的星盘', en: 'Try My Chart' },
    'charts.daymaster': { zh: '日主分析', en: 'Day Master Analysis' },
    'charts.ascendant': { zh: '上升星座', en: 'Ascendant' },
    'charts.primarystar': { zh: '紫微主星', en: 'Primary Star' },

    // ── Testimonials (from content-tokens) ─────
    'testimonials.heading': {
      zh: sectionHeadings.testimonials.zh,
      en: sectionHeadings.testimonials.en,
    },
    'testimonials.subheading': {
      zh: '真实用户，真实体验',
      en: 'Real insights. Real people.',
    },
    'testimonial.1': {
      zh: testimonialTokens[0].quote.zh,
      en: testimonialTokens[0].quote.en,
    },
    'testimonial.2': {
      zh: testimonialTokens[1].quote.zh,
      en: testimonialTokens[1].quote.en,
    },
    'testimonial.3': {
      zh: testimonialTokens[2].quote.zh,
      en: testimonialTokens[2].quote.en,
    },
    'testimonial.author1.name': { zh: testimonialTokens[0].author, en: testimonialTokens[0].author },
    'testimonial.author1.loc': { zh: testimonialTokens[0].location, en: testimonialTokens[0].location },
    'testimonial.author2.name': { zh: testimonialTokens[1].author, en: testimonialTokens[1].author },
    'testimonial.author2.loc': { zh: testimonialTokens[1].location, en: testimonialTokens[1].location },
    'testimonial.author3.name': { zh: testimonialTokens[2].author, en: testimonialTokens[2].author },
    'testimonial.author3.loc': { zh: testimonialTokens[2].location, en: testimonialTokens[2].location },

    // Social proof
    'social.readings': { zh: '结构化解读', en: 'Structured Readings' },
    'social.reports': { zh: '双语报告', en: 'Bilingual Reports' },
    'social.saved': { zh: '收藏洞察', en: 'Saved Insights' },

    // ── Pricing (from content-tokens) ──────────
    'pricing.heading': {
      zh: sectionHeadings.pricing.zh,
      en: sectionHeadings.pricing.en,
    },
    'pricing.subtitle': {
      zh: '从免费探索到专家级深度解读，满足每一位命理探索者',
      en: 'From free exploration to expert-level deep readings, for every seeker of wisdom',
    },
    'pricing.urgency': {
      zh: '大多数用户在首次解读后升级',
      en: 'Most users upgrade after their first reading',
    },

    // Plan names (from content-tokens)
    'plan.free': { zh: pricingPlans.free.name.zh, en: pricingPlans.free.name.en },
    'plan.premium': { zh: pricingPlans.premium.name.zh, en: pricingPlans.premium.name.en },
    'plan.deep': { zh: pricingPlans.deep.name.zh, en: pricingPlans.deep.name.en },

    // Plan emotional copy (from content-tokens)
    'plan.free.copy': { zh: pricingPlans.free.tagline.zh, en: pricingPlans.free.tagline.en },
    'plan.premium.copy': { zh: pricingPlans.premium.tagline.zh, en: pricingPlans.premium.tagline.en },
    'plan.deep.copy': { zh: pricingPlans.deep.tagline.zh, en: pricingPlans.deep.tagline.en },

    // Pricing features
    'feature.daily': { zh: '每日星座运势', en: 'Daily horoscope' },
    'feature.basic': { zh: '基础星盘查看', en: 'Basic chart viewing' },
    'feature.tarot': { zh: '单次塔罗占卜', en: 'Single tarot reading' },
    'feature.community': { zh: '社区讨论', en: 'Community access' },
    'feature.all12': { zh: '全部12种命理工具', en: 'All 12 divination tools' },
    'feature.ai': { zh: 'AI深度分析报告', en: 'AI deep analysis reports' },
    'feature.three': { zh: '紫微 + 八字 + 星盘', en: 'Zi Wei + BaZi + Chart' },
    'feature.synastry': { zh: '合盘 & 推运分析', en: 'Synastry & transit analysis' },
    'feature.pdf': { zh: 'PDF报告导出', en: 'PDF report export' },
    'feature.bilingual': { zh: '双语报告生成', en: 'Bilingual report generation' },
    'feature.premium': { zh: '高级版全部功能', en: 'All Premium features' },
    'feature.celebrity': { zh: '名人命盘对照分析', en: 'Celebrity chart comparison' },
    'feature.annual': { zh: '流年大运完整推演', en: 'Full annual transit analysis' },
    'feature.priority': { zh: '优先AI深度队列', en: 'Priority AI analysis queue' },
    'feature.personal': { zh: '个性化命理建议', en: 'Personalized guidance report' },
    'feature.revisions': { zh: '30天内无限次修正', en: '30-day unlimited revisions' },

    // ── FAQ ────────────────────────────────────
    'faq.heading': {
      zh: sectionHeadings.faq.zh,
      en: sectionHeadings.faq.en,
    },
    'faq.q1': { zh: '开始占卜需要什么？', en: 'What do I need to start?' },
    'faq.a1': {
      zh: '只需你的出生日期（公历或农历均可）。对于紫微斗数和八字分析，准确的出生时间（精确到时辰）会让结果更精准。西方星盘需要出生时间来计算上升星座。如果不确定出生时间，我们也提供不依赖时间的分析工具。',
      en: 'Just your date of birth (Gregorian or lunar). For Zi Wei and BaZi, an accurate birth time (to the hour) greatly improves precision. Western charts need it for your ascendant. If unsure, we offer time-independent tools as well.',
    },
    'faq.q2': { zh: '占卜是免费的吗？', en: 'Is the reading free?' },
    'faq.a2': {
      zh: '我们提供免费的基础功能，包括每日星座运势、基础星盘查看和单次塔罗占卜。更深度的AI分析报告、全部12种命理工具和PDF导出等高级功能包含在付费方案中。',
      en: 'We offer free basics — daily horoscope, basic chart viewing, and a single tarot reading. Deeper AI reports, all 12 divination tools, and PDF exports are part of our paid plans.',
    },
    'faq.q3': { zh: '分析结果有多准确？', en: 'How accurate is the result?' },
    'faq.a3': {
      zh: '我们的AI基于数千年的经典命理文献训练，结合现代心理学框架。星体位置使用瑞士星历表（Swiss Ephemeris）精确到角秒级别。分析结果旨在提供有价值的自我反思视角，而非绝对预测。',
      en: 'Our AI draws on thousands of years of classical texts, combined with modern psychology. Planetary positions are calculated to arc-second precision via Swiss Ephemeris. Results aim to offer valuable self-reflection, not absolute predictions.',
    },
    'faq.q4': { zh: '我的出生数据安全吗？', en: 'Is my birth data private?' },
    'faq.a4': {
      zh: '绝对安全。我们采用银行级加密传输，不会将你的出生数据分享给任何第三方。你随时可以在账户设置中删除所有个人数据。隐私是我们最核心的承诺之一。',
      en: 'Absolutely. We use bank-grade encryption and never share birth data with third parties. You can delete all personal data from account settings at any time. Privacy is one of our core commitments.',
    },
    'faq.q5': { zh: '高级版包含什么？', en: 'What is included in premium?' },
    'faq.a5': {
      zh: '高级版解锁全部12种命理工具（紫微斗数、八字、西方星盘、塔罗、易经等），AI深度分析报告、合盘与推运分析、PDF报告导出，以及双语报告生成功能。',
      en: 'Premium unlocks all 12 divination tools (Zi Wei, BaZi, Western chart, tarot, Yi Jing, etc.), AI deep analysis reports, synastry & transit analysis, PDF export, and bilingual report generation.',
    },
    'faq.q6': { zh: '这只是娱乐吗？', en: 'Is this for entertainment only?' },
    'faq.a6': {
      zh: disclaimers.responsible.zh,
      en: disclaimers.responsible.en,
    },

    // ── Final CTA (from content-tokens) ────────
    'cta.title': {
      zh: sectionHeadings.finalCta.zh,
      en: sectionHeadings.finalCta.en,
    },
    'cta.subtitle': {
      zh: '从紫微斗数到西方占星，从八字命理到塔罗牌，开启你的命运探索之旅',
      en: 'From Zi Wei to Western astrology, from BaZi to Tarot — begin your journey of self-discovery',
    },

    // ── Footer ─────────────────────────────────
    'footer.trust': {
      zh: disclaimers.responsible.zh,
      en: disclaimers.responsible.en,
    },
    'footer.brand.desc': {
      zh: '融合东方经典命理与西方占星智慧，以AI科技重新定义命运探索。',
      en: 'Bridging Eastern classical systems and Western astrology with AI-powered insight.',
    },
    'footer.products': { zh: '产品', en: 'Products' },
    'footer.advanced': { zh: '高级工具', en: 'Advanced' },
    'footer.trust.links': { zh: '信任与法律', en: 'Trust & Legal' },
  };
}

const allTranslations = buildTranslations();

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tianji-lang');
      if (stored === 'zh' || stored === 'en') return stored;
      return navigator.language.startsWith('zh') ? 'zh' : 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('tianji-lang', lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const t = useCallback(
    (key: string): string => {
      const entry = allTranslations[key];
      if (entry) return entry[lang];
      return key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
