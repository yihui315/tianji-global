'use client';

import { Award, Brain, BookOpen, HeartHandshake, Lock, Mail, ShieldCheck, Sparkles, TimerReset, Users } from 'lucide-react';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';
import {
  TianjiLoveButton,
  TianjiLoveFinalCta,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  TianjiLoveTrustCard,
} from '@/components/tianji-love';

const FINAL_PAVILION = '/assets/images/hero/tianji-love-moon-pavilion-16x9.png';

const copy = {
  en: {
    nav: {
      loveReading: 'Love Reading',
      ask: 'Ask',
      draw: 'Draw Timing',
      pricing: 'Pricing',
      about: 'About',
      login: 'Login',
      privacy: 'Privacy',
    },
    hero: {
      eyebrow: 'About Tianji Love',
      title: 'A calmer way to read relationship patterns.',
      body:
        'Tianji Love blends relationship astrology, timing signals, and AI-assisted reflection into reports you can return to without turning love into fear.',
      primary: 'Start Relationship Reading',
      secondary: 'Read Privacy',
    },
    principlesTitle: 'How Tianji Love works',
    principles: [
      { icon: HeartHandshake, title: 'Relationship-first', body: 'The product centers compatibility, communication, timing, and the patterns people repeat in love.' },
      { icon: TimerReset, title: 'Timing as a window', body: 'We describe romantic pressure points and openings without claiming guaranteed future events.' },
      { icon: Brain, title: 'AI for clarity', body: 'AI turns structured signals into readable guidance, prompts, and next-step reflections.' },
      { icon: Lock, title: 'Privacy by default', body: 'Birth date, birth time, location, and timezone stay hidden on public share surfaces by default.' },
    ],
    methodTitle: 'What we will not do',
    method: [
      ['No fear sales', 'We do not sell panic, curses, certainty, or guaranteed outcomes.'],
      ['No public birth data', 'Public reports stay privacy-safe unless a future explicit opt-in says otherwise.'],
      ['No medical, legal, financial, or crisis advice', 'Readings are for reflection and relationship communication only.'],
    ],
    contactTitle: 'Contact and data requests',
    contactBody:
      'Questions, billing help, and data deletion requests can start by email. We keep the legal pages readable and the product pages emotionally clear.',
    contacts: [
      ['Product', 'hello@tianji.love'],
      ['Billing', 'billing@tianji.love'],
      ['Privacy', 'privacy@tianji.love'],
    ],
    finalTitle: 'The next chapter deserves clarity without pressure.',
    footer:
      'Tianji Love readings are for reflection and relationship communication, not medical, legal, financial, or crisis advice.',
    // E-E-A-T Section
    eeatTitle: 'Why trust Tianji Love',
    eeatSubtitle: 'Credentials & methodology',
    eeat: [
      {
        icon: Award,
        title: 'Traditional foundation',
        body: 'Built on centuries of astrological relationship wisdom — synastry, composite charts, and timing signals refined by practitioners worldwide.',
      },
      {
        icon: Brain,
        title: 'AI-assisted clarity',
        body: 'Modern large-language models synthesize structured astrological data into readable, actionable reflection — not fortune-telling.',
      },
      {
        icon: BookOpen,
        title: 'Transparent methodology',
        body: 'Every reading explains its signals. We show the what and why, not just the what-next. Users can learn as they read.',
      },
      {
        icon: ShieldCheck,
        title: 'Privacy by design',
        body: 'Birth data never appears in share outputs. You control what you share, and with whom, at every step.',
      },
    ],
    // Team Story Section
    teamTitle: 'Our story',
    teamStory: `Tianji Love started because we kept seeing the same pattern: people turning to astrology out of fear, not curiosity — and products that fed that fear with vague predictions and hidden upsells.

We believed relationship guidance could be different. Calm, honest, and genuinely useful. So we built Tianji Love to give people a clearer mirror — one that respects their intelligence and doesn't trade in anxiety.

The name Tianji (天机) means "heaven\'s pattern" in Chinese — the idea that timing and connection have natural rhythms worth understanding, not manipulating.`,
    teamValues: [
      { title: 'Curiosity over fear', body: 'We design for questions, not threats.' },
      { title: 'Clarity without pressure', body: 'Guidance that informs, not coerces.' },
      { title: 'Privacy as default', body: 'Your data stays yours unless you choose otherwise.' },
    ],
    // Three-Pathway Monetization
    monetizationTitle: 'How Tianji Love sustains itself',
    monetizationSubtitle: 'Three ways to engage',
    pathways: [
      {
        icon: Sparkles,
        label: 'Free Preview',
        title: 'Start with a taste',
        body: 'Generate a free relationship preview with basic synastry signals and pattern overview at no cost. No account required.',
        cta: 'Try free preview',
      },
      {
        icon: HeartHandshake,
        label: 'Paid Report',
        title: 'Full relationship deep-dive',
        body: 'Unlock the complete premium report with all five dimensions, current timing windows, and personalized guidance. One-time purchase.',
        cta: 'Unlock full report',
      },
      {
        icon: Users,
        label: 'Subscription',
        title: 'Ongoing relationship insight',
        body: 'Monthly subscription for continuous access — new timing updates, multiple relationship readings, and priority processing.',
        cta: 'Explore subscription',
      },
    ],
  },
  zh: {
    nav: {
      loveReading: '关系解读',
      ask: '提问',
      draw: '时机抽牌',
      pricing: '会员权益',
      about: '关于',
      login: '登录',
      privacy: '隐私',
    },
    hero: {
      eyebrow: '关于 Tianji Love',
      title: '用更安静的方式，看清关系里的重复模式。',
      body:
        'Tianji Love 把关系合盘、时机信号和 AI 辅助反思整理成可以回看的报告，不把爱情变成焦虑销售。',
      primary: '开始关系解读',
      secondary: '阅读隐私政策',
    },
    principlesTitle: 'Tianji Love 如何工作',
    principles: [
      { icon: HeartHandshake, title: '以关系为中心', body: '产品围绕合盘、沟通、时机，以及人在亲密关系中反复遇到的模式。' },
      { icon: TimerReset, title: '把时机当作窗口', body: '我们描述关系里的压力点和开放窗口，但不宣称确定未来。' },
      { icon: Brain, title: 'AI 用于清晰表达', body: 'AI 把结构化信号整理成可读的指引、问题和下一步反思。' },
      { icon: Lock, title: '隐私默认优先', body: '公开分享默认隐藏出生日期、时间、地点和时区。' },
    ],
    methodTitle: '我们不会做什么',
    method: [
      ['不贩卖恐惧', '不销售恐慌、诅咒、确定性或保证结果。'],
      ['不公开出生资料', '公开报告默认保持隐私安全，除非未来存在明确的主动选择。'],
      ['不替代专业建议', '解读仅用于反思和关系沟通，不构成医疗、法律、财务或危机建议。'],
    ],
    contactTitle: '联系与数据请求',
    contactBody:
      '产品问题、账单帮助和数据删除请求都可以从邮件开始。法律页面保持清晰，产品页面保持情绪上的克制。',
    contacts: [
      ['产品', 'hello@tianji.love'],
      ['账单', 'billing@tianji.love'],
      ['隐私', 'privacy@tianji.love'],
    ],
    finalTitle: '下一章值得更清晰，也不需要被催促。',
    footer: 'Tianji Love 解读仅用于反思与关系沟通参考，不构成医疗、法律、财务或危机建议。',
    // E-E-A-T Section
    eeatTitle: '为什么信赖 Tianji Love',
    eeatSubtitle: '资质与方法论',
    eeat: [
      {
        icon: Award,
        title: '传统基础',
        body: '基于数百年的占星关系智慧构建——合盘、组合盘和时机信号经全球从业者不断完善。',
      },
      {
        icon: Brain,
        title: 'AI 辅助清晰化',
        body: '现代大语言模型将结构化占星数据合成为可读、可操作的反思内容——而非算命。',
      },
      {
        icon: BookOpen,
        title: '透明方法论',
        body: '每份解读都解释其信号来源。展示是什么和为什么，而非仅仅告诉你接下来会怎样。用户可以在阅读中学习。',
      },
      {
        icon: ShieldCheck,
        title: '隐私设计',
        body: '出生数据绝不会出现在分享内容中。每一步都由你控制分享内容和分享对象。',
      },
    ],
    // Team Story Section
    teamTitle: '我们的故事',
    teamStory: `Tianji Love 的诞生源于我们反复看到的同一个模式：人们出于恐惧而非好奇转向占星——而市面上的产品用模糊的预测和隐藏的追加销售来喂养这种恐惧。

我们相信，关系指引可以有所不同。更冷静、更诚实、更真正有用。于是我们构建了 Tianji Love，为人们提供一面更清晰的镜子——尊重用户的智商，不以焦虑为交易。

Tianji（天机）这个名字意为"天机"——时机与连接自有其节律，值得理解而非操控。`,
    teamValues: [
      { title: '好奇胜于恐惧', body: '我们为问题而设计，不为威胁而设计。' },
      { title: '清晰而不施压', body: '指引用于告知，不用于强迫。' },
      { title: '隐私默认开启', body: '你的数据归你所有，除非你选择分享。' },
    ],
    // Three-Pathway Monetization
    monetizationTitle: 'Tianji Love 如何维持自身发展',
    monetizationSubtitle: '三种参与方式',
    pathways: [
      {
        icon: Sparkles,
        label: '免费预览',
        title: '先尝一口',
        body: '免费生成关系预览，包含基础合盘信号和模式概览。无需注册账户。',
        cta: '尝试免费预览',
      },
      {
        icon: HeartHandshake,
        label: '付费报告',
        title: '完整关系深度解读',
        body: '解锁完整 premium 报告，包含五大维度、当前时机窗口和个性化指引。一次性购买。',
        cta: '解锁完整报告',
      },
      {
        icon: Users,
        label: '订阅',
        title: '持续的关系洞察',
        body: '月度订阅，持续访问——新的时机更新、多次关系解读和优先处理。',
        cta: '探索订阅方案',
      },
    ],
  },
} as const;

export default function AboutPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const t = copy[language];
  const href = (path: string) => withLanguageParam(path, language);
  const toggleLanguage = () => setLanguage(language === 'zh' ? 'en' : 'zh');

  return (
    <TianjiLoveShell className="tianji-love-about-page" ariaLabel="About Tianji Love">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={[
          { label: t.nav.loveReading, href: href('/relationship/new') },
          { label: t.nav.ask, href: href('/ask') },
          { label: t.nav.draw, href: href('/draw') },
          { label: t.nav.pricing, href: href('/pricing'), mobile: true },
          { label: t.nav.about, href: href('/about') },
          { label: t.nav.login, href: href('/login'), mobile: true },
        ]}
        cta={{ label: t.hero.primary, href: href('/relationship/new') }}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-14 pt-16 sm:px-8 lg:min-h-[560px] lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
        <div>
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{t.hero.eyebrow}</p>
          <h1 className="max-w-3xl font-serif text-[2.7rem] font-semibold leading-[1.08] text-[#ffe3b4] sm:text-[4.4rem]">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f5d8aa]/78">{t.hero.body}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <TianjiLoveButton href={href('/ask')}>{t.hero.primary}</TianjiLoveButton>
            <TianjiLoveButton href={href('/legal/privacy')} variant="secondary">{t.hero.secondary}</TianjiLoveButton>
          </div>
        </div>

        <TianjiLovePanel className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
          {t.principles.map((item) => (
            <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
          ))}
        </TianjiLovePanel>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle title={t.principlesTitle} className="mb-10" />
        <div className="grid gap-5 md:grid-cols-4">
          {t.principles.map((item) => (
            <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
          ))}
        </div>
      </section>

      {/* E-E-A-T Section */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-4 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{t.eeatSubtitle}</p>
          <h2 className="mt-3 font-serif text-3xl text-[#ffe3b4] sm:text-4xl">{t.eeatTitle}</h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {t.eeat.map((item) => (
            <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
          ))}
        </div>
      </section>

      {/* Team Story Section */}
      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-start">
        <TianjiLovePanel className="p-7">
          <Users className="mb-4 h-8 w-8 text-[#d8b77b]" aria-hidden />
          <h2 className="font-serif text-3xl text-[#ffe3b4]">{t.teamTitle}</h2>
          <div className="mt-5 space-y-4 text-base leading-8 text-[#f4d7a3]/70">
            {t.teamStory.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </TianjiLovePanel>

        <div className="space-y-5">
          <h3 className="font-serif text-2xl text-[#ffe3b4]">Our values</h3>
          {t.teamValues.map((value) => (
            <TianjiLoveTrustCard key={value.title} icon={Sparkles} title={value.title} body={value.body} />
          ))}
        </div>
      </section>

      {/* Three-Pathway Monetization Section */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-4 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{t.monetizationSubtitle}</p>
          <h2 className="mt-3 font-serif text-3xl text-[#ffe3b4] sm:text-4xl">{t.monetizationTitle}</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {t.pathways.map((pathway) => (
            <TianjiLovePanel key={pathway.label} className="flex flex-col p-6">
              <pathway.icon className="mb-4 h-8 w-8 text-[#d8b77b]" aria-hidden />
              <span className="mb-2 text-xs uppercase tracking-[0.22em] text-[#d8b77b]/62">{pathway.label}</span>
              <h3 className="font-serif text-xl text-[#ffe3b4]">{pathway.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-[#f4d7a3]/66">{pathway.body}</p>
              <TianjiLoveButton href={href('/relationship/new')} variant="secondary" className="mt-5">
                {pathway.cta}
              </TianjiLoveButton>
            </TianjiLovePanel>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <TianjiLovePanel className="p-7">
          <ShieldCheck className="mb-4 h-8 w-8 text-[#d8b77b]" aria-hidden />
          <h2 className="font-serif text-3xl text-[#ffe3b4]">{t.methodTitle}</h2>
          <div className="mt-6 space-y-5">
            {t.method.map(([title, body]) => (
              <div key={title} className="border-t border-[#b57248]/22 pt-5">
                <h3 className="text-base font-semibold text-[#ffe3b4]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#f4d7a3]/66">{body}</p>
              </div>
            ))}
          </div>
        </TianjiLovePanel>

        <TianjiLovePanel className="p-7">
          <Mail className="mb-4 h-8 w-8 text-[#d8b77b]" aria-hidden />
          <h2 className="font-serif text-3xl text-[#ffe3b4]">{t.contactTitle}</h2>
          <p className="mt-4 text-base leading-8 text-[#f4d7a3]/70">{t.contactBody}</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {t.contacts.map(([label, value]) => (
              <a
                key={value}
                href={`mailto:${value}`}
                className="rounded-lg border border-[#b57248]/30 bg-[#070b16]/64 p-4 text-sm transition hover:border-[#ffe3b4]/50"
              >
                <span className="block text-xs uppercase tracking-[0.22em] text-[#d8b77b]/62">{label}</span>
                <span className="mt-2 block break-words text-[#ffe3b4]">{value}</span>
              </a>
            ))}
          </div>
        </TianjiLovePanel>
      </section>

      <TianjiLoveFinalCta imageSrc={FINAL_PAVILION} title={t.finalTitle} buttonLabel={t.hero.primary} href={href('/relationship/new')} />

      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer={t.footer}
        links={[
          { label: t.nav.loveReading, href: href('/relationship/new') },
          { label: t.nav.ask, href: href('/ask') },
          { label: t.nav.draw, href: href('/draw') },
          { label: t.nav.pricing, href: href('/pricing') },
          { label: t.nav.about, href: href('/about') },
          { label: t.nav.login, href: href('/login') },
          { label: t.nav.privacy, href: href('/legal/privacy') },
        ]}
      />
    </TianjiLoveShell>
  );
}
