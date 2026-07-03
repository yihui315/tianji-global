'use client';

import {
  Heart,
  Sparkles,
  Star,
  Sun,
  Moon,
  MessageCircleHeart,
} from 'lucide-react';
import Link from 'next/link';

import {
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  getTianjiLoveFooterNav,
  getTianjiLovePrimaryNav,
} from '@/components/tianji-love';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';
import { AdSenseSlot } from '@/components/ads/AdSenseSlot';
import { AffiliateProductGrid } from '@/components/affiliate/AffiliateProductGrid';

const GUIDES = [
  {
    href: '/love-test',
    icon: Heart,
    titleEn: 'Free Relationship Test',
    titleZh: '免费关系测试',
    descEn: 'Enter two names and birth dates for instant compatibility analysis',
    descZh: '输入两个姓名和出生日期，获取即时合盘分析',
  },
  {
    href: '/daily-oracle',
    icon: Sun,
    titleEn: 'Daily Love Oracle',
    titleZh: '每日爱情运势',
    descEn: 'Get your daily love oracle with timing signals',
    descZh: '获取每日爱情运势与时机信号',
  },
  {
    href: '/love-compatibility',
    icon: Star,
    titleEn: 'Relationship Synastry',
    titleZh: '关系合盘分析',
    descEn: 'Deep compatibility analysis across 5 dimensions',
    descZh: '五个维度的深度合盘分析',
  },
  {
    href: '/tarot',
    icon: Moon,
    titleEn: 'Tarot Love Spread',
    titleZh: '塔罗爱情牌阵',
    descEn: 'Three-card relationship spread for specific questions',
    descZh: '三张牌阵解答具体感情问题',
  },
  {
    href: '/bazi',
    icon: Sparkles,
    titleEn: 'BaZi Life Reading',
    titleZh: '八字命理解读',
    descEn: 'Chinese BaZi analysis for relationship patterns',
    descZh: '八字命理揭示感情模式与缘分走向',
  },
] as const;

const FAQS = [
  {
    qEn: 'Are the guides free?',
    qZh: '这些指南免费吗？',
    aEn: 'Yes! All guides on tianji.love are completely free to use. We offer premium detailed reports for users who want deeper insights.',
    aZh: '是的！tianji.love 上的所有指南均可免费使用。如需更深入的解读，可选择高级详细报告。',
  },
  {
    qEn: 'How often are the guides updated?',
    qZh: '指南多久更新一次？',
    aEn: 'Daily oracles update every day at midnight (UTC+8). Compatibility calculations are based on stable astrological formulas and are continuously refined.',
    aZh: '每日运势每天 UTC+8 零点更新。合盘分析基于稳定的星盘计算公式，并持续优化。',
  },
  {
    qEn: 'Can I get personalized help?',
    qZh: '可以获得个性化帮助吗？',
    aEn: 'Yes! Visit our Ask page to submit a specific question, or start a Love Reading for a comprehensive personalized relationship analysis.',
    aZh: '可以！访问「提问」页面提交具体问题，或开始「关系解读」获取全面的个性化感情分析。',
  },
] as const;

const INTERNAL_LINKS = [
  { href: '/about', labelEn: 'About', labelZh: '关于' },
  { href: '/services', labelEn: 'Services', labelZh: '服务' },
  { href: '/privacy-center', labelEn: 'Privacy', labelZh: '隐私' },
];

const DISCLAIMER_EN =
  'tianji.love provides entertainment and self-reflection tools. Results are for reference only and do not constitute professional advice.';
const DISCLAIMER_ZH =
  'tianji.love 提供娱乐与自我探索工具，结果仅供参考，不构成专业建议。';

export default function GuidePage() {
  const [language, setLanguage] = useSyncedLanguage('en');

  const t = (en: string, zh: string) => (language === 'zh' ? zh : en);
  const navItems = getTianjiLovePrimaryNav(language);
  const footerLinks = getTianjiLoveFooterNav(language);
  const href = (path: string) => withLanguageParam(path, language);

  const toggleLanguage = () => {
    const next = language === 'zh' ? 'en' : 'zh';
    setLanguage(next);
  };

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: t(faq.qEn, faq.qZh),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(faq.aEn, faq.aZh),
      },
    })),
  };

  return (
    <TianjiLoveShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={navItems}
        cta={{ label: t('Start Love Reading', '开始关系解读'), href: href('/relationship/new') }}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />

      {/* Hero */}
      <section className="relative z-10 px-5 pt-20 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d8b77b]/64">
            {t('Explore · Discover · Understand', '探索 · 发现 · 理解')}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">
            {t(
              'Relationship & Astrology Guides',
              '情感与命理指南'
            )}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-[#f4d7a3]/72">
            {t(
              'Explore our collection of free relationship and astrology guides. Learn about love compatibility, timing, tarot, BaZi, and more.',
              '探索我们免费的关系与星象指南集合，了解爱情合盘、时机、塔罗、八字等。'
            )}
          </p>
        </div>
      </section>

      {/* Guide Cards Grid */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <TianjiLovePanel key={guide.href} className="flex flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#b57248]/38 bg-[#0a1020]/66">
                  <Icon className="h-6 w-6 text-[#d8b77b]" aria-hidden />
                </div>
                <h2 className="font-serif text-xl font-semibold text-[#ffe3b4]">
                  {t(guide.titleEn, guide.titleZh)}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#f4d7a3]/62">
                  {t(guide.descEn, guide.descZh)}
                </p>
                <TianjiLoveButton href={href(guide.href)} className="mt-6 w-full" variant="secondary">
                  {t('Explore →', '开始探索 →')}
                </TianjiLoveButton>
              </TianjiLovePanel>
            );
          })}
        </div>
      </section>

      {/* AdSense placeholder */}
      <AdSenseSlot slot="GUIDE_BOTTOM_SLOT" format="display" page="guide" />

      {/* CTA Banner */}
      <section className="relative z-10 px-5 pb-16 sm:px-8">
        <TianjiLovePanel className="mx-auto max-w-3xl p-8 text-center">
          <MessageCircleHeart className="mx-auto mb-4 h-10 w-10 text-[#d8b77b]" aria-hidden />
          <h2 className="font-serif text-2xl font-semibold text-[#ffe3b4]">
            {t('Want a personalized reading?', '想要个性化解读？')}
          </h2>
          <p className="mt-3 text-sm text-[#f4d7a3]/62">
            {t(
              'Get a comprehensive love compatibility report based on your birth charts.',
              '基于您的出生图获取全面的爱情合盘报告。'
            )}
          </p>
          <TianjiLoveButton href={href('/relationship/new')} className="mt-6">
            {t('Start Relationship Reading', '开始关系解读')}
            <Sparkles className="ml-2 h-4 w-4" aria-hidden />
          </TianjiLoveButton>
        </TianjiLovePanel>
      </section>

      {/* FAQ */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('Frequently Asked Questions', '常见问题')}
          eyebrow={t('FAQ', '问答')}
        />
        <div className="mt-8 space-y-4">
          {FAQS.map((faq, i) => (
            <TianjiLovePanel key={i} className="p-6">
              <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                {t(faq.qEn, faq.qZh)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#f4d7a3]/62">
                {t(faq.aEn, faq.aZh)}
              </p>
            </TianjiLovePanel>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <nav className="relative z-10 flex justify-center gap-8 pb-8 text-sm text-[#f4d7a3]/56">
        {INTERNAL_LINKS.map((link) => (
          <Link key={link.href} href={href(link.href)} className="transition hover:text-[#ffe3b4]">
            {t(link.labelEn, link.labelZh)}
          </Link>
        ))}
      </nav>

      {/* AdSense placeholder */}
      <AdSenseSlot slot="GUIDE_MAIN_SLOT" format="in-article" page="guide" />

            {/* Affiliate Products */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <AffiliateProductGrid />
      </section>

      <TianjiLoveFooter
        disclaimer={t(DISCLAIMER_EN, DISCLAIMER_ZH)}
        links={footerLinks}
        homeHref={href('/')}
      />
    </TianjiLoveShell>
  );
}
