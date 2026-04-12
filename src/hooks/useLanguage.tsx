'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

type Lang = 'zh' | 'en';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const translations: Record<string, string> = {
  // Navigation & Hero
  'hero.subtitle': 'Swiss Ephemeris 精确星历计算 · 紫微斗数经典算法 · 现代心理学框架',
  'hero.cta': '开始你的命运探索',
  'hero.cta.en': 'Begin Your Journey',
  'hero.helper': 'Takes less than 3 minutes · 不到3分钟',

  // Storytelling section
  'story.heading': '穿越千年的智慧 · 遇见前沿AI',
  'story.badge.chart': '命盘结构',
  'story.badge.relationship': '关系洞察',
  'story.badge.rhythm': '生命节律',
  'story.title.chart': '精密的命盘架构',
  'story.title.relationship': '深层关系解读',
  'story.title.rhythm': '长周期运势节律',
  'story.body.chart': '从紫微十二宫到西方黄道十二宫，每一颗星曜的位置都经过瑞士星历表（Swiss Ephemeris）精确到角秒级别的计算。',
  'story.body.relationship': '合盘分析、复合盘与戴维森盘，多维度揭示两人之间的能量互动与成长契机。',
  'story.body.rhythm': '大运流年、Transit推运与太阳返照，精准追踪人生各阶段的能量高峰与转折点。',

  // Stats
  'stats.users': '用户信赖',
  'stats.charts': '命盘已排',
  'stats.accuracy': '星历精度',
  'stats.tools': '命理法门',

  // Services / Tools
  'tools.heading': 'All Divination Paths',
  'tools.subtitle': '涵盖中国传统命理与西方占星术，东西方智慧全覆盖',
  'tools.cta': 'Explore All 12 Tools',
  'tools.start': '开始排盘',

  // How it works
  'how.heading': '天机如何运转',
  'how.step1.title': '输入生辰',
  'how.step1.desc': '提供你的出生日期、时间和地点',
  'how.step2.title': 'AI解析',
  'how.step2.desc': '瑞士星历表+古籍算法，精准计算星体位置',
  'how.step3.title': '深度解读',
  'how.step3.desc': '融合现代心理学与古典命理，给你专属分析',

  // Charts section
  'charts.heading': '专业级命理图表',
  'charts.subtitle': '从紫微星盘到运势曲线，每一份分析都精确呈现',
  'charts.radar': '六维能量雷达',
  'charts.timeline': '人生运势曲线',
  'charts.layers': '多维信号层叠',
  'charts.insights': 'AI洞察标签',
  'charts.sample': '示例 · Sample',
  'charts.report.title': 'AI深度分析报告示例',
  'charts.report.cta': '试试我的星盘',
  'charts.daymaster': '日主分析',
  'charts.ascendant': '上升星座',
  'charts.primarystar': '紫微主星',

  // Testimonials
  'testimonials.heading': '真实洞察，真实故事',
  'testimonials.subheading': 'Real insights. Real people.',
  'testimonial.1': 'I check my Transit report every month before making big decisions. It helped me spot a career shift 6 months early.',
  'testimonial.2': 'I was skeptical about BaZi. TianJi explained it in a way that finally made Western astrology click for me too.',
  'testimonial.3': 'The relationship compatibility report saved me months of confusion. It named patterns I\'d felt but couldn\'t articulate.',
  'testimonial.author1.name': 'Sophia',
  'testimonial.author1.loc': 'London',
  'testimonial.author2.name': 'Marcus',
  'testimonial.author2.loc': 'Toronto',
  'testimonial.author3.name': 'Yuki',
  'testimonial.author3.loc': 'Tokyo',

  // Social proof
  'social.readings': '结构化解读',
  'social.reports': '双语报告',
  'social.saved': '收藏洞察',

  // Pricing
  'pricing.heading': '选择你的方案',
  'pricing.subtitle': '从免费探索到专家级深度解读，满足每一位命理探索者',
  'pricing.urgency': 'Most users upgrade after their first reading · 大多数用户在首次解读后升级',

  // Plan names
  'plan.free': 'Explore',
  'plan.premium': 'Most Popular',
  'plan.deep': 'For Serious Insight',

  // Plan names zh
  'plan.free.zh': '探索',
  'plan.premium.zh': '最受欢迎',
  'plan.deep.zh': '深度解读',

  // Plan emotional copy
  'plan.free.copy': 'Start with a taste',
  'plan.free.copy.zh': '先尝一口命运',
  'plan.premium.copy': 'See your full chart, patterns, and what the stars are saying right now',
  'plan.premium.copy.zh': '解锁完整命盘，洞察当下星象',
  'plan.deep.copy': 'Personalized guidance from AI-trained interpreters, tailored to your exact chart',
  'plan.deep.copy.zh': 'AI深度解读，为你专属定制',

  // Pricing features
  'feature.daily': 'Daily horoscope',
  'feature.daily.zh': '每日星座运势',
  'feature.basic': 'Basic chart viewing',
  'feature.basic.zh': '基础星盘查看',
  'feature.tarot': 'Single tarot reading',
  'feature.tarot.zh': '单次塔罗占卜',
  'feature.community': 'Community access',
  'feature.community.zh': '社区讨论',
  'feature.all12': 'All 12 divination tools',
  'feature.all12.zh': '全部12种命理工具',
  'feature.ai': 'AI deep analysis reports',
  'feature.ai.zh': 'AI深度分析报告',
  'feature.three': 'Zi Wei + BaZi + Chart',
  'feature.three.zh': '紫微 + 八字 + 星盘',
  'feature.synastry': 'Synastry & transit analysis',
  'feature.synastry.zh': '合盘 & 推运分析',
  'feature.pdf': 'PDF report export',
  'feature.pdf.zh': 'PDF报告导出',
  'feature.bilingual': 'Bilingual report generation',
  'feature.bilingual.zh': '双语报告生成',
  'feature.premium': 'All Premium features',
  'feature.premium.zh': '高级版全部功能',
  'feature.celebrity': 'Celebrity chart comparison',
  'feature.celebrity.zh': '名人命盘对照分析',
  'feature.annual': 'Full annual transit analysis',
  'feature.annual.zh': '流年大运完整推演',
  'feature.priority': 'Priority AI analysis queue',
  'feature.priority.zh': '优先AI深度队列',
  'feature.personal': 'Personalized guidance report',
  'feature.personal.zh': '个性化命理建议',
  'feature.revisions': '30-day unlimited revisions',
  'feature.revisions.zh': '30天内无限次修正',

  // FAQ
  'faq.heading': '常见问题',
  'faq.q1': 'What do I need to start?',
  'faq.q1.zh': '开始占卜需要什么？',
  'faq.a1': 'Just your date of birth (Gregorian or lunar). For Zi Wei and BaZi, an accurate birth time (to the hour) greatly improves precision. Western charts need it for your ascendant. If unsure, we offer time-independent tools as well.',
  'faq.a1.zh': '只需你的出生日期（公历或农历均可）。对于紫微斗数和八字分析，准确的出生时间（精确到时辰）会让结果更精准。西方星盘需要出生时间来计算上升星座。如果不确定出生时间，我们也提供不依赖时间的分析工具。',
  'faq.q2': 'Is the reading free?',
  'faq.q2.zh': '占卜是免费的吗？',
  'faq.a2': 'We offer free basics — daily horoscope, basic chart viewing, and a single tarot reading. Deeper AI reports, all 12 divination tools, and PDF exports are part of our paid plans.',
  'faq.a2.zh': '我们提供免费的基础功能，包括每日星座运势、基础星盘查看和单次塔罗占卜。更深度的AI分析报告、全部12种命理工具和PDF导出等高级功能包含在付费方案中。',
  'faq.q3': 'How accurate is the result?',
  'faq.q3.zh': '分析结果有多准确？',
  'faq.a3': 'Our AI draws on thousands of years of classical texts, combined with modern psychology. Planetary positions are calculated to arc-second precision via Swiss Ephemeris. Results aim to offer valuable self-reflection, not absolute predictions.',
  'faq.a3.zh': '我们的AI基于数千年的经典命理文献训练，结合现代心理学框架。星体位置使用瑞士星历表（Swiss Ephemeris）精确到角秒级别。分析结果旨在提供有价值的自我反思视角，而非绝对预测。',
  'faq.q4': 'Is my birth data private?',
  'faq.q4.zh': '我的出生数据安全吗？',
  'faq.a4': 'Absolutely. We use bank-grade encryption and never share birth data with third parties. You can delete all personal data from account settings at any time. Privacy is one of our core commitments.',
  'faq.a4.zh': '绝对安全。我们采用银行级加密传输，不会将你的出生数据分享给任何第三方。你随时可以在账户设置中删除所有个人数据。隐私是我们最核心的承诺之一。',
  'faq.q5': 'What is included in premium?',
  'faq.q5.zh': '高级版包含什么？',
  'faq.a5': 'Premium unlocks all 12 divination tools (Zi Wei, BaZi, Western chart, tarot, Yi Jing, etc.), AI deep analysis reports, synastry & transit analysis, PDF export, and bilingual report generation.',
  'faq.a5.zh': '高级版解锁全部12种命理工具（紫微斗数、八字、西方星盘、塔罗、易经等），AI深度分析报告、合盘与推运分析、PDF报告导出，以及双语报告生成功能。',
  'faq.q6': 'Is this for entertainment only?',
  'faq.q6.zh': '这只是娱乐吗？',
  'faq.a6': 'TianJi\'s analysis is built on rigorous astronomical calculations and classical systems, designed as a meaningful tool for self-exploration. We encourage users to approach readings with an open and responsible mindset — as reflective guidance, not a replacement for professional advice.',
  'faq.a6.zh': '天机的分析建立在严谨的天文计算和经典命理体系之上，旨在为用户提供有深度的自我探索工具。我们鼓励用户以开放且负责任的态度对待解读结果，将其作为自我反思的参考，而非替代专业建议。',

  // Final CTA
  'cta.title': '天机已为你准备好答案',
  'cta.subtitle': '从紫微斗数到西方占星，从八字命理到塔罗牌，开启你的命运探索之旅',

  // Footer
  'footer.trust': '天机致力于为用户提供负责任的命理解读。我们珍视你的隐私，鼓励以反思和开放的心态看待每一份报告。',
  'footer.brand.desc': '融合东方经典命理与西方占星智慧，以AI科技重新定义命运探索。',
  'footer.products': 'Products',
  'footer.advanced': 'Advanced',
  'footer.trust.links': 'Trust & Legal',

  // Section headings (simplified — no en subtitle)
  'section.tools': '十二天机法门',
};

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
      const langKey = `${key}.${lang}`;
      return translations[langKey] ?? translations[key] ?? key;
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
