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
      zh: '六个系统，不是六个孤立工具',
      en: 'Six systems, one unified profile',
    },
    'story.badge.chart': { zh: 'Identity · 结构层', en: 'Identity · Structure' },
    'story.badge.relationship': { zh: '关系洞察', en: 'Relationship Insight' },
    'story.badge.rhythm': { zh: 'Timing · 时间窗口', en: 'Timing · Windows' },
    'story.title.chart': { zh: '先建立统一命运画像', en: 'Start with one destiny profile' },
    'story.title.relationship': { zh: '关系是分享裂变入口', en: 'Relationship is the shareable wedge' },
    'story.title.rhythm': { zh: '时间窗口决定行动顺序', en: 'Timing decides the action order' },
    'story.cta.relationship': { zh: '🔮 尝试关系合盘 →', en: '🔮 Try Relationship Analysis →' },
    'story.body.chart': {
      zh: '八字负责长期结构，紫微负责人生宫位，西方占星负责心理与行运。三者先共同建立 Identity 与 Timing。',
      en: 'BaZi reads long-range structure, Zi Wei reads life palaces, and Western astrology reads psychology and transits. Together they build Identity and Timing.',
    },
    'story.body.relationship': {
      zh: '关系合盘把两个人的吸引、冲突、成长空间和时机变成可分享的结果，是 TianJi 最适合传播的场景。',
      en: 'Synastry turns attraction, conflict, growth space, and timing between two people into the result users naturally share.',
    },
    'story.body.rhythm': {
      zh: '易经与塔罗补足当下问题、选择张力和 30 天行动建议，让完整画像从理解自己走向下一步行动。',
      en: 'Yi Jing and Tarot add the current question, choice tension, and 30-day action guidance so the profile becomes useful now.',
    },

    // ── Stats ──────────────────────────────────
    'stats.users': { zh: '用户信赖', en: 'Trusted Users' },
    'stats.charts': { zh: '命盘已排', en: 'Charts Cast' },
    'stats.accuracy': { zh: '星历精度', en: 'Ephemeris Precision' },
    'stats.tools': { zh: '验证镜头', en: 'Verification Lenses' },

    // ── Services / Tools ───────────────────────
    'tools.heading': {
      zh: sectionHeadings.services.zh,
      en: sectionHeadings.services.en,
    },
    'tools.subtitle': {
      zh: '这些入口是支持统一命运画像的验证镜头，不再是彼此竞争的工具列表',
      en: 'These entrances are verification lenses for one destiny profile, not competing tools',
    },
    'tools.cta': { zh: '查看全部验证镜头', en: 'Explore verification lenses' },
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
    'charts.report.cta': { zh: '开始命运扫描', en: 'Start Destiny Scan' },
    'charts.daymaster': { zh: '日主分析', en: 'Day Master Analysis' },
    'charts.ascendant': { zh: '上升星座', en: 'Ascendant' },
    'charts.primarystar': { zh: '紫微主星', en: 'Primary Star' },

    // ── Testimonials (from content-tokens) ─────
    'testimonials.heading': {
      zh: sectionHeadings.testimonials.zh,
      en: sectionHeadings.testimonials.en,
    },
    'testimonials.subheading': {
      zh: '来自全球思考者、创作者与探索者的真实使用体验',
      en: 'Trusted by thinkers, creators, and seekers worldwide',
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
      zh: '免费获得 Identity 与 Timing 预览，付费解锁 Relationship、Career、Wealth、Action 与 Risk。',
      en: 'Preview Identity and Timing for free, then unlock Relationship, Career, Wealth, Action, and Risk.',
    },
    'pricing.urgency': {
      zh: '主路径：Destiny Scan → Unified Preview → Premium Deep Profile',
      en: 'Main path: Destiny Scan -> Unified Preview -> Premium Deep Profile',
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
    'feature.identityPreview': { zh: 'Identity 画像预览', en: 'Identity profile preview' },
    'feature.timingPreview': { zh: 'Timing 时间窗口预览', en: 'Timing window preview' },
    'feature.sharePreview': { zh: '可分享的一句话结果', en: 'Shareable one-line result' },
    'feature.basicPrivacy': { zh: '分享默认隐藏出生隐私', en: 'Birth privacy hidden on shares by default' },
    'feature.unifiedProfile': { zh: '完整统一命运画像', en: 'Full unified destiny profile' },
    'feature.verifiedSix': { zh: '六系统交叉验证摘要', en: 'Six-system verification summary' },
    'feature.premiumLayers': { zh: 'Relationship、Career、Wealth、Action、Risk 解锁', en: 'Relationship, Career, Wealth, Action, and Risk unlocks' },
    'feature.synastry': { zh: '关系合盘与分享图卡', en: 'Relationship synastry and share cards' },
    'feature.pdf': { zh: 'PDF报告导出', en: 'PDF report export' },
    'feature.bilingual': { zh: '双语报告生成', en: 'Bilingual report generation' },
    'feature.premium': { zh: '高级版全部功能', en: 'All Premium features' },
    'feature.multiProfile': { zh: '多档案与关系画像管理', en: 'Multi-profile and relationship profile management' },
    'feature.annual': { zh: '长周期趋势观察', en: 'Long-cycle trend visibility' },
    'feature.priority': { zh: '优先AI深度队列', en: 'Priority AI analysis queue' },
    'feature.personal': { zh: '顾问式深度建议', en: 'Advisor-style deep guidance' },
    'feature.revisions': { zh: '导出与复盘工作流', en: 'Export and review workflow' },

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
      zh: '免费层展示 Identity 与 Timing 预览，让你先判断画像是否有用。Premium 解锁 Relationship、Career、Wealth、Action、Risk 和更深的六系统验证。',
      en: 'The free layer shows Identity and Timing so you can judge whether the profile is useful. Premium unlocks Relationship, Career, Wealth, Action, Risk, and deeper six-system verification.',
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
      zh: '高级版解锁完整统一命运画像、六系统交叉验证摘要、关系合盘、职业与财富节奏、30天行动建议、风险提示、PDF导出与双语报告。',
      en: 'Premium unlocks the full unified destiny profile, six-system verification summary, relationship synastry, career and wealth timing, 30-day action guidance, risk cues, PDF export, and bilingual reports.',
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
      zh: '先看 Identity 与 Timing，再决定是否解锁完整六系统验证画像。',
      en: 'Start with Identity and Timing, then decide whether to unlock the full six-system profile.',
    },

    // ── Footer ─────────────────────────────────
    'footer.trust': {
      zh: disclaimers.responsible.zh,
      en: disclaimers.responsible.en,
    },
    'footer.brand.desc': {
      zh: '把八字、紫微、易经、西方占星、塔罗与关系合盘整合成一份统一命运画像。',
      en: 'TianJi turns BaZi, Zi Wei, Yi Jing, Western astrology, Tarot, and Synastry into one unified destiny profile.',
    },
    'footer.products': { zh: '产品', en: 'Products' },
    'footer.advanced': { zh: '高级工具', en: 'Advanced' },
    'footer.trust.links': { zh: '信任与法律', en: 'Trust & Legal' },

    // ── Footer link labels ──────────────────────
    'footer.ziwei': { zh: '紫微斗数', en: 'Zi Wei Dou Shu' },
    'footer.bazi': { zh: '八字命理', en: 'BaZi Analysis' },
    'footer.western': { zh: '西方星盘', en: 'Western Chart' },
    'footer.tarot': { zh: '塔罗占卜', en: 'Tarot Reading' },
    'footer.yijing': { zh: '易经', en: 'Yi Jing Oracle' },
    'footer.synastry': { zh: '合盘分析', en: 'Synastry' },
    'footer.transit': { zh: 'Transit推运', en: 'Transits' },
    'footer.solreturn': { zh: '太阳返照', en: 'Solar Return' },
    'footer.fengshui': { zh: '风水布局', en: 'Feng Shui' },
    'footer.electional': { zh: '择日择吉', en: 'Electional' },
    'footer.relationship': { zh: '关系合盘', en: 'Relationship' },
    'footer.about': { zh: '关于天机', en: 'About TianJi' },
    'footer.pricing.link': { zh: '价格方案', en: 'Pricing' },
    'footer.privacy': { zh: '隐私政策', en: 'Privacy Policy' },
    'footer.terms': { zh: '服务条款', en: 'Terms of Service' },
    'footer.contact': { zh: '联系我们', en: 'Contact Us' },
    'footer.disclaimer': {
      zh: '提供自我反思工具，不替代专业建议',
      en: 'A tool for self-reflection, not a substitute for professional advice.',
    },

    // ── Trust Section ───────────────────────────
    'trust.heading': {
      zh: '为什么信赖天机',
      en: 'Why Trust TianJi',
    },
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
