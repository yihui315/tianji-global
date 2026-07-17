'use client';

import { useState } from 'react';
import { Database, Lock, Mail, ShieldCheck } from 'lucide-react';

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
      terms: 'Terms',
    },
    eyebrow: 'Privacy Policy',
    title: 'Your relationship data stays handled with care.',
    updated: 'Last updated: May 2026',
    intro:
      'This page explains how Tianji Love collects, uses, stores, and protects personal data, reading data, and account information.',
    deletion: 'Request data deletion',
    sections: [
      ['Information we collect', 'We may collect account details, language preference, birth details you enter, relationship questions, reading outputs, checkout status, and technical logs needed to keep the service secure. We do not knowingly collect data from children under 13.'],
      ['How we use data', 'We use data to provide readings, save history, manage accounts, process checkout through Stripe, protect the service from abuse, and respond to support or privacy requests.'],
      ['Third-party AI services', 'We use AI services for relationship reading generation and astrology calculations. These services process your input data (birth details, relationship questions) solely to generate personalized guidance. AI services are used only for reading generation and are not used for profiling, automated decision-making, or advertising targeting beyond contextual personalization.'],
      ['Payments', 'Payments are handled by Stripe. Tianji Love does not store complete card numbers. Billing events are used to unlock the paid surfaces already implemented in the product. AdSense revenue helps support the availability of free tools.'],
      ['Public sharing', 'Public relationship share pages hide birth date, birth time, birth location, and timezone by default. This is a product rule as well as a privacy rule.'],
      ['Retention and deletion', 'Account and reading data are retained for up to 2 years after your last activity, or until deletion is requested. You may request deletion at any time by emailing privacy@tianji.love. Data may be retained longer if required by law. Upon deletion request, data is typically purged within 30 days.'],
      ['International data transfer', 'Your data may be processed on servers located outside of your country of residence, including in the United States. We ensure appropriate safeguards are in place for international transfers.'],
      ['Your rights', 'Depending on where you live, you may request access, correction, deletion, export, restriction, objection, or withdrawal of consent. We respond through the privacy contact below.'],
      ['Cookies, consent, and security', 'Necessary storage supports authentication, language, security, and consent records. Optional analytics is disabled by default and can be changed or withdrawn through the Privacy settings control available on every page. Advertising remains denied in that first-party control and, if enabled, is managed only through a Google-certified consent provider.'],
      ['Advertising and third-party cookies', 'If advertising is enabled, Google AdSense may use cookies and device identifiers according to the choices collected by a Google-certified consent provider where required. Advertising and non-essential analytics must not load before the applicable consent signals allow them. Tianji Love does not control third-party ad content.'],
      ['Children\'s privacy', 'Tianji Love is not directed to children under 13, and we do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 13, we will delete that information promptly.'],
      ['Contact', 'For privacy questions, email privacy@tianji.love. For billing questions, email billing@tianji.love.'],
    ],
    trust: [
      { icon: Lock, title: 'Public birth data hidden', body: 'Share pages hide birth date, birth time, location, and timezone by default.' },
      { icon: Database, title: 'Purpose-limited use', body: 'Data is used to provide readings, history, account, payment, support, and security functions.' },
      { icon: Mail, title: 'Deletion channel', body: 'Privacy requests can start at privacy@tianji.love.' },
    ],
    footer:
      'Privacy is part of the Tianji Love product contract, not an afterthought.',
  },
  zh: {
    nav: {
      compatibility: '关系合盘',
      loveReading: '爱情解读',
      timing: '时机',
      pricing: '会员权益',
      terms: '条款',
    },
    eyebrow: '隐私政策',
    title: '你的关系数据，需要被认真处理。',
    updated: '最后更新：2026 年 5 月',
    intro: '本页说明 Tianji Love 如何收集、使用、存储和保护个人资料、解读数据与账号信息。',
    deletion: '请求删除数据',
    sections: [
      ['我们收集的信息', '我们可能收集账号资料、语言偏好、你输入的出生资料、关系问题、解读输出、结账状态，以及维护服务安全所需的技术日志。我们不会故意收集13岁以下儿童的数据。'],
      ['数据如何使用', '数据用于提供解读、保存历史、管理账号、通过 Stripe 处理结账、防止滥用，以及回应支持或隐私请求。'],
      ['第三方AI服务', '我们使用AI服务来生成关系解读和占星计算。这些服务仅处理你的输入数据（出生资料、关系问题）以生成个性化指导。AI服务仅用于解读生成，不用于用户画像、自动化决策或除情境个性化外的广告定向。'],
      ['支付信息', '支付由 Stripe 处理。Tianji Love 不保存完整银行卡号。账单事件用于解锁产品中已经实现的付费页面和权益。AdSense 收入有助于支持免费工具的可用性。'],
      ['公开分享', '公开关系分享页默认隐藏出生日期、出生时间、出生地点和时区。这既是产品规则，也是隐私规则。'],
      ['保留与删除', '账号和解读数据自你最后一次活动起保留最多2年，或直至你请求删除。你可随时通过 privacy@tianji.love 请求删除。如果法律要求，数据可能会保留更长时间。收到删除请求后，数据通常在30天内清除。'],
      ['国际数据传输', '你的数据可能在您所在国家/地区以外的服务器上处理，包括美国服务器。我们确保为国际传输提供适当的保护措施。'],
      ['你的权利', '根据你的所在地，你可以请求访问、更正、删除、导出、限制处理、反对处理或撤回同意。我们会通过隐私邮箱回应。'],
      ['Cookies、同意与安全', '必要存储用于登录、语言、安全与同意记录。可选的分析和广告存储默认关闭，你可以通过每个页面上的“Privacy settings”入口随时修改或撤回。'],
      ['广告与第三方Cookies', '广告启用后，Google AdSense 可能依据适用地区由 Google 认证同意管理平台收集的选择使用 cookies 和设备标识符。在适用同意信号允许前，不得加载广告和非必要分析。Tianji Love 不控制第三方广告内容。'],
      ['儿童隐私', 'Tianji Love 不面向13岁以下的儿童，我们不会故意收集儿童的个人信息。如果我们发现收集了13岁以下儿童的数据，将立即删除该信息。'],
      ['联系我们', '隐私问题请发邮件至 privacy@tianji.love。账单问题请发邮件至 billing@tianji.love。'],
    ],
    trust: [
      { icon: Lock, title: '公开出生资料默认隐藏', body: '分享页默认隐藏出生日期、时间、地点和时区。' },
      { icon: Database, title: '限定用途', body: '数据用于解读、历史、账号、支付、支持与安全功能。' },
      { icon: Mail, title: '删除请求入口', body: '隐私请求可以从 privacy@tianji.love 开始。' },
    ],
    footer: '隐私是 Tianji Love 产品契约的一部分，而不是事后的补丁。',
  },
} as const;

export default function PrivacyPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const [activeSection, setActiveSection] = useState(0);
  const t = copy[language];
  const href = (path: string) => withLanguageParam(path, language);
  const toggleLanguage = () => setLanguage(language === 'zh' ? 'en' : 'zh');

  const deletionHref = `mailto:privacy@tianji.love?subject=${encodeURIComponent(
    language === 'zh' ? '请求删除我的 Tianji Love 账号与数据' : 'Please delete my Tianji Love account and data',
  )}`;

  return (
    <TianjiLoveShell className="tianji-love-privacy-page" ariaLabel="Tianji Love privacy policy">
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
        <TianjiLoveSectionTitle title={language === 'zh' ? '政策详情' : 'Policy Details'} className="mb-8" />
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
          <TianjiLoveButton href={deletionHref}>{t.deletion}</TianjiLoveButton>
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
