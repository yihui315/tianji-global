'use client';

import { BookOpen, Compass, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';
import { AdSenseSlot } from '@/components/ads/AdSenseSlot';
import {
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  getTianjiLovePrimaryNav,
  getTianjiLoveFooterNav,
} from '@/components/tianji-love';

const DISCLAIMER_EN =
  'tianji.love provides entertainment and self-reflection tools. Results are for reference only and do not constitute professional advice.';
const DISCLAIMER_ZH =
  'tianji.love 提供娱乐与自我探索工具，结果仅供参考，不构成专业建议。';

const FREE_FEATURES = [
  {
    icon: Compass,
    titleEn: 'Your birth pillars',
    titleZh: '你的出生四柱',
    descEn: 'See your year, month, day, and hour pillars — the foundational structure of your BaZi chart.',
    descZh: '查看你的年柱、月柱、日柱、时柱——八字命盘的基础结构。',
  },
  {
    icon: Users,
    titleEn: 'Element balance overview',
    titleZh: '五行平衡概览',
    descEn: 'Get a simple overview of your dominant elements and where imbalances may exist in your chart.',
    descZh: '获得你的主导五行和命盘可能出现失衡的简单概览。',
  },
  {
    icon: BookOpen,
    titleEn: 'Basic love style',
    titleZh: '基本爱情风格',
    descEn: 'Learn how your Day Master and element composition shape your approach to relationships.',
    descZh: '了解你的日主和五行组合如何塑造你的感情模式。',
  },
] as const;

const FAQS = [
  {
    qEn: 'What is BaZi?',
    qZh: '什么是八字？',
    aEn: 'BaZi (八字, "Eight Characters") is a Chinese birth chart analysis system based on the time of your birth. It maps your birth date and hour into four pillars — year, month, day, and hour — each containing a stem and a branch, which are read through the lens of the five elements and ten gods.',
    aZh: '八字是中国出生命盘分析系统，基于你的出生时间。它把你的出生日期和时辰映射为四柱——年柱、月柱、日柱、时柱——每柱包含天干和地支，通过五行和十神来解读。',
  },
  {
    qEn: 'How does BaZi relate to relationships?',
    qZh: '八字与感情有什么关系？',
    aEn: 'BaZi reveals your love style, ideal partner elements, and timing patterns through your Day Master, element balance, and specific relationship pillars. Elements that support each other suggest harmony; elements that clash suggest areas needing attention.',
    aZh: '八字通过你的日主、五行平衡和特定的关系柱来揭示你的爱情风格、理想伴侣五行和时机模式。相互支持的五行表示和谐；相冲的五行表示需要关注的领域。',
  },
  {
    qEn: 'What can a free BaZi analysis tell me about love?',
    qZh: '免费八字分析能告诉我哪些关于爱情的信息？',
    aEn: 'The free analysis gives you your four pillars, a basic element balance, and a high-level overview of your love style. It surfaces the major patterns — but does not go deep into compatibility, timing windows, or specific relationship scenarios.',
    aZh: '免费分析提供你的四柱、基本五行平衡和爱情风格的高级概览。它揭示主要模式——但不会深入到合盘、时机窗口或特定感情情境。',
  },
  {
    qEn: 'How is a professional BaZi reading different?',
    qZh: '专业八字解读与免费版有何不同？',
    aEn: 'A full human BaZi reading reads not just the four pillars but also the hidden stems, the standing tallies, the twelve growth branches, and the full interaction matrix. It reads the relational field between two people, their timing cycles, and the specific decision windows.',
    aZh: '完整的人工八字解读不仅读四柱，还解读隐藏的天干、旺度、十二长生和完整的互动矩阵。它解读两人之间的关系场、时机周期和特定决策窗口。',
  },
  {
    qEn: 'Do I need my exact birth time for BaZi?',
    qZh: '八字需要精确的出生时间吗？',
    aEn: 'Yes — the hour pillar (时柱) changes every two hours, so an accurate birth time is important for a reliable chart. If you are uncertain of your exact time, estimate the closest two-hour window and note that the hour pillar may carry less precision.',
    aZh: '是的——时柱每两个小时变化一次，所以准确的出生时间对可靠的命盘很重要。如果你不确定具体时间，估计最接近的两小时窗口，并注意时柱可能精度较低。',
  },
] as const;

const INTERNAL_LINKS = [
  { href: '/guide', labelEn: 'All Guides', labelZh: '全部指南' },
  { href: '/love-compatibility', labelEn: 'Love Compatibility', labelZh: '爱情合盘' },
  { href: '/services', labelEn: 'Services', labelZh: '服务' },
  { href: '/about', labelEn: 'About', labelZh: '关于' },
];

export default function BaziRelationshipAnalysisFreePage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const t = (en: string, zh: string) => (language === 'zh' ? zh : en);
  const navItems = getTianjiLovePrimaryNav(language);
  const footerLinks = getTianjiLoveFooterNav(language);
  const href = (path: string) => withLanguageParam(path, language);
  const toggleLanguage = () => setLanguage(language === 'zh' ? 'en' : 'zh');

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
    <TianjiLoveShell ariaLabel="Free BaZi Relationship Analysis">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={navItems}
        cta={{ label: t('Read My BaZi', '开始读八字'), href: href('/bazi') }}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />

      {/* Hero */}
      <section className="relative z-10 px-5 pt-20 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d8b77b]/64">
            {t('BaZi · Eight Characters · Free Analysis', '八字 · 四柱 · 免费分析')}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">
            {t('Free BaZi Relationship Analysis', '免费八字关系分析')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-[#f4d7a3]/72">
            {t(
              'Explore your BaZi (Eight Characters) for free relationship insights. Learn how your birth pillars affect your love style, compatibility, and timing patterns.',
              '免费探索你的八字（四柱）以获取感情洞察。了解你的出生柱如何影响你的爱情风格、合盘和时机模式。'
            )}
          </p>
        </div>
      </section>

      {/* What is BaZi */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <TianjiLoveSectionTitle
          eyebrow={t('Introduction', '入门介绍')}
          title={t('What is BaZi?', '什么是八字？')}
        />
        <TianjiLovePanel className="mx-auto mt-8 max-w-3xl p-7">
          <p className="text-base leading-8 text-[#f4d7a3]/72">
            {t(
              'BaZi (八字, "Eight Characters") is one of China\'s most enduring analytical systems. It maps your birth date and hour into four pillars of two characters each — eight characters total. Each pillar contains a Heavenly Stem (天干) and an Earthly Branch (地支), which are read through the five elements (五行) and the ten gods (十神).',
              '八字是中国最持久的分析系统之一。它把你的出生日期和时辰映射为四柱，每柱两个字符——共八个字。每一柱包含一个天干和一个地支，通过五行和十神来解读。'
            )}
          </p>
          <p className="mt-5 text-base leading-8 text-[#f4d7a3]/72">
            {t(
              'Unlike Western astrology which centers the Sun, BaZi centers the Day Master (日主) — the stem of your Day pillar, representing your core self and the element you most identify with.',
              '与以太阳为中心的西方占星不同，八字以日主（你日柱的天干）为中心——代表你的核心自我和你最认同的元素。'
            )}
          </p>
        </TianjiLovePanel>
      </section>

      {/* How BaZi Relates to Relationships */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle
          eyebrow={t('Relationship Astrology', '关系占星')}
          title={t('How BaZi Relates to Relationships', '八字与感情的关系')}
        />
        <TianjiLovePanel className="mx-auto mt-8 max-w-3xl p-7">
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                {t('Five Elements in Relationships', '五行与感情')}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/62">
                {t(
                  'Each element has a relational quality: Wood generates Fire, Fire creates Earth, Earth bears Metal, Metal collects Water, Water nourishes Wood. When two people\'s dominant elements support each other\'s needs, the relationship tends to feel easier and more generative.',
                  '每种五行都有其关系属性：木生火、火生土、土生金、金生水、水生木。当两个人的主导五行相互支持对方的需求时，感情往往感觉更顺畅、更有创造力。'
                )}
              </p>
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                {t('The Relationship Pillar', '感情柱')}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/62">
                {t(
                  'The month pillar (月柱) is sometimes called the "spouse palace" or "relationship pillar" in classical BaZi. Its stem and branch, combined with the ten gods they contain, describe the nature of your closest partnerships.',
                  '月柱在古典八式中有时被称为"配偶宫"或"感情柱"。它包含的天干地支以及其中的十神，描述你最亲密伴侣关系的本质。'
                )}
              </p>
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                {t('Timing Patterns', '时机模式')}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/62">
                {t(
                  'BaZi uses Da Yun (大运, ten-year cycles) and Liu Nian (流年, yearly cycles) to describe when relationship energy is more or less prominent. These cycles help identify windows when it is easier to form new connections or deepen existing ones.',
                  '八字用大运（十年周期）和流年（年度周期）来描述感情能量的起伏。这些周期帮助识别更容易建立新关系或深化现有关系的窗口期。'
                )}
              </p>
            </div>
          </div>
        </TianjiLovePanel>
      </section>

      {/* What Your BaZi Reveals */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle
          eyebrow={t('Love Insights', '感情洞察')}
          title={t('What Your BaZi Reveals About Love', '你的八字揭示了哪些感情信息')}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              titleEn: 'Love style',
              titleZh: '爱情风格',
              descEn: 'Whether you pursue romance actively or receive it passively; whether you lead or prefer to follow; how you express and receive affection.',
              descZh: '你是主动追求还是被动接受；你喜欢主导还是跟随；你如何表达和接受感情。',
            },
            {
              titleEn: 'Ideal partner elements',
              titleZh: '理想伴侣五行',
              descEn: 'Which elements complement your chart most naturally — and which may require more conscious effort to harmonize.',
              descZh: '哪些五行最自然地补充你的命盘——哪些可能需要更多有意识的努力来调和。',
            },
            {
              titleEn: 'Timing patterns',
              titleZh: '时机模式',
              descEn: 'Your peak and low relationship years based on your Da Yun and Liu Nian cycles — when to open the heart and when to consolidate.',
              descZh: '基于你的大运和流年周期的高峰和低谷感情年——何时敞开内心，何时稳固积累。',
            },
          ].map((item) => (
            <TianjiLovePanel key={item.titleEn} className="flex flex-col p-6">
              <h3 className="font-serif text-lg font-semibold text-[#ffe3b4]">
                {t(item.titleEn, item.titleZh)}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-[#f4d7a3]/62">
                {t(item.descEn, item.descZh)}
              </p>
            </TianjiLovePanel>
          ))}
        </div>
      </section>

      {/* Free vs Professional */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle
          eyebrow={t('Comparison', '比较')}
          title={t('Free vs Professional BaZi Analysis', '免费与专业八字分析')}
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <TianjiLovePanel className="flex flex-col p-6">
            <span className="mb-2 text-xs uppercase tracking-[0.22em] text-[#d8b77b]/62">
              {t('Free Tool', '免费工具')}
            </span>
            <h3 className="font-serif text-xl text-[#ffe3b4]">
              {t('Basic overview', '基础概览')}
            </h3>
            <ul className="mt-4 flex-1 space-y-3">
              {[
                t('Four pillars (year, month, day, hour)', '四柱（年柱、月柱、日柱、时柱）'),
                t('Basic element balance', '基本五行平衡'),
                t('High-level love style overview', '高级爱情风格概览'),
                t('Ideal partner element hints', '理想伴侣五行提示'),
                t('No hidden stems or branch interactions', '无隐藏天干或地支互动'),
                t('No Da Yun / Liu Nian timing', '无大运/流年时机'),
              ].map((text, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#f4d7a3]/62">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f4d7a3]/40" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </TianjiLovePanel>

          <TianjiLovePanel className="flex flex-col p-6">
            <span className="mb-2 text-xs uppercase tracking-[0.22em] text-[#d8b77b]/62">
              {t('Professional Reading', '专业解读')}
            </span>
            <h3 className="font-serif text-xl text-[#ffe3b4]">
              {t('Full human analysis', '完整人工分析')}
            </h3>
            <ul className="mt-4 flex-1 space-y-3">
              {[
                t('All four pillars with hidden stems', '含隐干的所有四柱'),
                t('Twelve growth branches and standing tallies', '十二长生和旺度'),
                t('Ten gods and their relational meaning', '十神及其关系含义'),
                t('Two-person compatibility matrix', '双人合盘矩阵'),
                t('Da Yun ten-year timing cycles', '大运十年时机周期'),
                t('Liu Nian yearly relationship windows', '流年年度感情窗口'),
                t('Specific decision timing guidance', '特定决策时机指引'),
              ].map((text, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#f4d7a3]/62">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d8b77b]/60" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </TianjiLovePanel>
        </div>
      </section>

      {/* AdSense placeholder */}
      <AdSenseSlot slot="BAZI_FREE_BOTTOM_SLOT" format="display" page="bazi-relationship-analysis-free" />

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        <TianjiLovePanel className="mx-auto max-w-3xl p-8 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-[#d8b77b]" aria-hidden />
          <h2 className="font-serif text-2xl font-semibold text-[#ffe3b4]">
            {t('Try BaZi for free', '免费使用八字工具')}
          </h2>
          <p className="mt-3 text-sm text-[#f4d7a3]/62">
            {t(
              'Enter your birth date, time, and location to generate your BaZi chart and get a free relationship overview.',
              '输入你的出生日期、时间和地点，生成你的八字命盘并获得免费感情概览。'
            )}
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <TianjiLoveButton href={href('/bazi')}>
              {t('Start Free BaZi Analysis →', '开始免费八字分析 →')}
            </TianjiLoveButton>
            <TianjiLoveButton href={href('/love-compatibility')} variant="secondary">
              {t('Explore Love Compatibility', '探索爱情合盘')}
            </TianjiLoveButton>
          </div>
        </TianjiLovePanel>
      </section>

      {/* How to Get Your BaZi */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle
          eyebrow={t('Getting Started', '入门')}
          title={t('How to Get Your BaZi', '如何获取你的八字')}
        />
        <TianjiLovePanel className="mx-auto mt-8 max-w-3xl p-7">
          <div className="space-y-5">
            {[
              {
                step: '01',
                titleEn: 'Enter your birth date',
                titleZh: '输入你的出生日期',
                descEn: 'Provide your year, month, and day of birth in the Gregorian calendar or lunar calendar.',
                descZh: '提供你的出生年月日（公历或农历均可）。',
              },
              {
                step: '02',
                titleEn: 'Provide your birth time',
                titleZh: '提供你的出生时间',
                descEn: 'Enter your hour of birth. The exact time is important — BaZi uses two-hour windows (each "shi chen" or "时辰").',
                descZh: '输入你的出生时辰。准确时间很重要——八字使用两小时一辰（每个时辰）。',
              },
              {
                step: '03',
                titleEn: 'Generate your chart',
                titleZh: '生成你的命盘',
                descEn: 'Our engine maps your birth data to the correct heavenly stems and earthly branches using solar time conversion.',
                descZh: '我们的引擎使用真太阳时转换把你的出生数据映射到正确的天干地支。',
              },
              {
                step: '04',
                titleEn: 'Read your love patterns',
                titleZh: '解读你的感情模式',
                descEn: 'Get your free BaZi overview with a basic relationship analysis — or unlock the full reading for deeper insights.',
                descZh: '获取你的免费八字概览和基本感情分析——或解锁完整解读以获得更深入的洞察。',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 border-t border-[#b57248]/22 pt-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#b57248]/48 bg-[#0a1020]/66 text-xs font-semibold text-[#d8b77b]">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                    {t(item.titleEn, item.titleZh)}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#f4d7a3]/62">
                    {t(item.descEn, item.descZh)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TianjiLovePanel>
      </section>

      {/* FAQ */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        <TianjiLoveSectionTitle eyebrow={t('FAQ', '问答')} title={t('Frequently Asked Questions', '常见问题')} />
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
      <nav className="relative z-10 flex flex-wrap justify-center gap-8 pb-8 text-sm text-[#f4d7a3]/56">
        {INTERNAL_LINKS.map((link) => (
          <Link key={link.href} href={href(link.href)} className="transition hover:text-[#ffe3b4]">
            {t(link.labelEn, link.labelZh)}
          </Link>
        ))}
      </nav>

      {/* AdSense placeholder */}
      <AdSenseSlot slot="BAZI_FREE_SLOT" format="in-article" page="bazi-relationship-analysis-free" />

      <TianjiLoveFooter
        disclaimer={t(DISCLAIMER_EN, DISCLAIMER_ZH)}
        links={footerLinks}
        homeHref={href('/')}
      />
    </TianjiLoveShell>
  );
}
