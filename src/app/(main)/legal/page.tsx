'use client';

import { FileText, Lock, ShieldCheck } from 'lucide-react';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';
import {
  getTianjiLoveFooterNav,
  getTianjiLovePrimaryCta,
  getTianjiLovePrimaryNav,
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  TianjiLoveTrustCard,
} from '@/components/tianji-love';

const copy = {
  en: {
    nav: {
      compatibility: 'Compatibility',
      loveReading: 'Love Reading',
      timing: 'Timing',
      pricing: 'Pricing',
      privacy: 'Privacy',
    },
    eyebrow: 'Tianji Love / Legal',
    title: 'Clear rules for a reflective product.',
    body:
      'The legal pages stay readable and compliance-first. The product is for reflection and relationship communication, not professional or crisis advice.',
    privacyTitle: 'Privacy Policy',
    privacyBody: 'How we handle personal data, reading data, cookies, deletion requests, and public sharing safeguards.',
    termsTitle: 'Terms of Service',
    termsBody: 'The conditions for using Tianji Love, including service scope, user responsibilities, and liability limits.',
    open: 'Open page',
    trust: [
      { icon: Lock, title: 'Birth data protected', body: 'Public share surfaces hide birth date, time, location, and timezone by default.' },
      { icon: FileText, title: 'Plain-language legal', body: 'Legal pages are styled with the product shell while staying easy to read.' },
      { icon: ShieldCheck, title: 'Reflection only', body: 'Readings do not replace medical, legal, financial, or crisis support.' },
    ],
    footer:
      'Tianji Love legal pages keep compliance and privacy clarity ahead of marketing language.',
  },
  zh: {
    nav: {
      compatibility: '关系合盘',
      loveReading: '爱情解读',
      timing: '时机',
      pricing: '会员权益',
      privacy: '隐私',
    },
    eyebrow: 'Tianji Love / 法律',
    title: '给反思型产品准备的清晰规则。',
    body: '法律页面保持可读与合规优先。产品用于反思和关系沟通，不替代专业或危机建议。',
    privacyTitle: '隐私政策',
    privacyBody: '说明我们如何处理个人资料、解读数据、cookies、删除请求和公开分享保护。',
    termsTitle: '服务条款',
    termsBody: '说明使用 Tianji Love 的条件，包括服务范围、用户责任和责任限制。',
    open: '打开页面',
    trust: [
      { icon: Lock, title: '出生资料受保护', body: '公开分享默认隐藏出生日期、时间、地点和时区。' },
      { icon: FileText, title: '清晰法律文本', body: '法律页面套用产品视觉，但仍以清楚易读为优先。' },
      { icon: ShieldCheck, title: '仅用于反思', body: '解读不替代医疗、法律、财务或危机支持。' },
    ],
    footer: 'Tianji Love 法律页面把合规与隐私清晰度放在营销文案之前。',
  },
} as const;

export default function LegalPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const t = copy[language];
  const href = (path: string) => withLanguageParam(path, language);
  const toggleLanguage = () => setLanguage(language === 'zh' ? 'en' : 'zh');

  return (
    <TianjiLoveShell className="tianji-love-legal-index" ariaLabel="Tianji Love legal index">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={getTianjiLovePrimaryNav(language, href)}
        cta={getTianjiLovePrimaryCta(language, href)}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-5 py-16 text-center sm:px-8">
        <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{t.eyebrow}</p>
        <h1 className="mx-auto max-w-4xl font-serif text-[2.7rem] font-semibold leading-[1.08] text-[#ffe3b4] sm:text-[4.2rem]">
          {t.title}
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#f5d8aa]/78">{t.body}</p>
      </section>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 px-5 pb-12 sm:px-8 md:grid-cols-2">
        <TianjiLovePanel as="article" className="p-7">
          <Lock className="mb-5 h-9 w-9 text-[#d8b77b]" aria-hidden />
          <h2 className="font-serif text-3xl text-[#ffe3b4]">{t.privacyTitle}</h2>
          <p className="mt-4 text-base leading-8 text-[#f4d7a3]/70">{t.privacyBody}</p>
          <TianjiLoveButton href={href('/legal/privacy')} className="mt-7">{t.open}</TianjiLoveButton>
        </TianjiLovePanel>

        <TianjiLovePanel as="article" className="p-7">
          <FileText className="mb-5 h-9 w-9 text-[#d8b77b]" aria-hidden />
          <h2 className="font-serif text-3xl text-[#ffe3b4]">{t.termsTitle}</h2>
          <p className="mt-4 text-base leading-8 text-[#f4d7a3]/70">{t.termsBody}</p>
          <TianjiLoveButton href={href('/legal/terms')} variant="secondary" className="mt-7">{t.open}</TianjiLoveButton>
        </TianjiLovePanel>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle title={language === 'zh' ? '法律页面统一标准' : 'Shared legal standards'} className="mb-8" />
        <div className="grid gap-5 md:grid-cols-3">
          {t.trust.map((item) => (
            <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
          ))}
        </div>
      </section>

      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer={t.footer}
        links={getTianjiLoveFooterNav(language, href)}
      />
    </TianjiLoveShell>
  );
}
