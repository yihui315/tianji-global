'use client';

import { useState } from 'react';
import { AlertTriangle, FileText, ShieldCheck } from 'lucide-react';

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
    eyebrow: 'Terms of Service',
    title: 'Use Tianji Love as reflection, not certainty.',
    updated: 'Last updated: May 2026',
    intro:
      'These terms govern your use of Tianji Love. They are written to keep the product useful, privacy-safe, and clear about its limits.',
    contact: 'Email us with questions',
    sections: [
      ['Service scope', 'Tianji Love provides love readings, compatibility reports, timing readings, private history, and related reflective report surfaces. Features may change as the product evolves.'],
      ['Reflection-only disclaimer', 'Readings are for reflection and relationship communication. They are not medical, mental health, legal, financial, or crisis advice, and they do not guarantee outcomes.'],
      ['User responsibilities', 'You agree to provide accurate information where needed, protect your account, use the service lawfully, and avoid misuse, scraping, resale, or interference with the service.'],
      ['Payments and access', 'Paid access is handled through the existing checkout and billing flows. Pricing pages describe currently available paid features and do not create rights beyond the implemented product.'],
      ['Privacy and sharing', 'Public share surfaces must not expose birth date, birth time, birth location, or timezone by default. See the Privacy Policy for data handling details.'],
      ['Intellectual property', 'Tianji Love design, copy, code, and product assets belong to Tianji or its licensors. Your submitted content remains yours, with permission for us to process it to provide the service.'],
      ['Limitations of liability', 'To the extent allowed by law, Tianji Love is not responsible for decisions made from readings, service interruptions, indirect damages, or outcomes outside the product.'],
      ['Account termination', 'We may suspend or terminate accounts that violate these terms, abuse the service, or create legal or security risk. You may stop using the service at any time.'],
    ],
    trust: [
      { icon: AlertTriangle, title: 'No guaranteed predictions', body: 'The service names patterns and windows, not certain outcomes.' },
      { icon: ShieldCheck, title: 'Privacy defaults preserved', body: 'Public share surfaces keep sensitive birth data hidden by default.' },
      { icon: FileText, title: 'Implemented abilities only', body: 'Pricing and terms should reflect what the product actually supports.' },
    ],
    footer:
      'Tianji Love terms keep the service reflective, privacy-safe, and honest about its limits.',
  },
  zh: {
    nav: {
      compatibility: '关系合盘',
      loveReading: '爱情解读',
      timing: '时机',
      pricing: '会员权益',
      privacy: '隐私',
    },
    eyebrow: '服务条款',
    title: '请把 Tianji Love 用作反思，而不是确定性。',
    updated: '最后更新：2026 年 5 月',
    intro: '这些条款管理你对 Tianji Love 的使用，并确保产品保持有用、隐私安全，也清楚说明边界。',
    contact: '有问题写信给我们',
    sections: [
      ['服务范围', 'Tianji Love 提供爱情解读、关系合盘、时机解读、私人历史和相关报告页面。功能可能随着产品演进而变化。'],
      ['仅用于反思的声明', '解读用于反思和关系沟通，不构成医疗、心理健康、法律、财务或危机建议，也不保证结果。'],
      ['用户责任', '你同意在需要时提供准确信息，保护账号，合法使用服务，并避免滥用、抓取、转售或干扰服务。'],
      ['支付与访问', '付费访问通过现有结账和账单流程处理。价格页说明当前可用的付费功能，不产生超出已实现产品的权利。'],
      ['隐私与分享', '公开分享页面默认不得展示出生日期、出生时间、出生地点或时区。数据处理细节请查看隐私政策。'],
      ['知识产权', 'Tianji Love 的设计、文案、代码和产品资产属于 Tianji 或其许可方。你提交的内容属于你，我们仅为提供服务而处理。'],
      ['责任限制', '在法律允许范围内，Tianji Love 不对基于解读做出的决定、服务中断、间接损失或产品之外的结果负责。'],
      ['账号终止', '如果账号违反条款、滥用服务或带来法律/安全风险，我们可以暂停或终止账号。你也可以随时停止使用服务。'],
    ],
    trust: [
      { icon: AlertTriangle, title: '不保证预测', body: '服务描述模式和窗口，不承诺确定结果。' },
      { icon: ShieldCheck, title: '保留隐私默认值', body: '公开分享默认隐藏敏感出生资料。' },
      { icon: FileText, title: '只承诺已实现能力', body: '价格和条款应反映产品实际支持的功能。' },
    ],
    footer: 'Tianji Love 条款让服务保持反思性、隐私安全，并诚实说明边界。',
  },
} as const;

export default function TermsPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const [activeSection, setActiveSection] = useState(0);
  const t = copy[language];
  const href = (path: string) => withLanguageParam(path, language);
  const toggleLanguage = () => setLanguage(language === 'zh' ? 'en' : 'zh');

  return (
    <TianjiLoveShell className="tianji-love-terms-page" ariaLabel="Tianji Love terms of service">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={getTianjiLovePrimaryNav(language, href)}
        cta={getTianjiLovePrimaryCta(language, href)}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-5 py-16 text-center sm:px-8">
        <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{t.eyebrow}</p>
        <h1 className="mx-auto max-w-4xl font-serif text-[2.5rem] font-semibold leading-[1.1] text-[#ffe3b4] sm:text-[4rem]">
          {t.title}
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-[#f4d7a3]/46">{t.updated}</p>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#f5d8aa]/78">{t.intro}</p>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {t.trust.map((item) => (
            <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-14 sm:px-8">
        <TianjiLoveSectionTitle title={language === 'zh' ? '条款详情' : 'Terms Details'} className="mb-8" />
        <div className="space-y-3">
          {t.sections.map(([title, body], index) => {
            const isOpen = activeSection === index;
            return (
              <TianjiLovePanel key={title} as="article" className="p-0">
                <button
                  type="button"
                  onClick={() => setActiveSection(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-xl text-[#ffe3b4]">{title}</span>
                  <span className="text-[#d8b77b]" aria-hidden>{isOpen ? '-' : '+'}</span>
                </button>
                {isOpen ? <p className="border-t border-[#b57248]/22 px-5 py-4 text-sm leading-7 text-[#f4d7a3]/70">{body}</p> : null}
              </TianjiLovePanel>
            );
          })}
        </div>
        <div className="mt-9 flex justify-center">
          <TianjiLoveButton href="mailto:hello@tianji.love">{t.contact}</TianjiLoveButton>
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
