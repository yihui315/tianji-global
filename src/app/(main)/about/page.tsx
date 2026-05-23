'use client';

import { Brain, HeartHandshake, Lock, Mail, ShieldCheck, Sparkles, TimerReset } from 'lucide-react';

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
      draw: 'Draw',
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
  },
  zh: {
    nav: {
      loveReading: '关系解读',
      ask: '提问',
      draw: '抽牌',
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
