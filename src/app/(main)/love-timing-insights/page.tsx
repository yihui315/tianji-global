'use client';

import { Clock, Heart, MessageCircle, Sparkles, Timer } from 'lucide-react';
import Link from 'next/link';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';
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

const TIMING_DECISIONS = [
  {
    icon: Heart,
    titleEn: 'When to make a commitment',
    titleZh: '何时推进承诺',
    descEn: 'Planetary aspects that support declarations of intention — when the field is most receptive.',
    descZh: '适合表达意图、推进承诺的行星相位——能量场最易被接纳的时机。',
  },
  {
    icon: Clock,
    titleEn: 'When to wait',
    titleZh: '何时静待时机',
    descEn: 'Retrograde windows, void-of-course moons, and low-velocity transits signal restraint.',
    descZh: '逆行期、空相月亮与低速推运提醒我们暂时收敛、以退为进。',
  },
  {
    icon: MessageCircle,
    titleEn: 'When to communicate',
    titleZh: '何时展开沟通',
    descEn: 'Mercury-sun contacts and lunar void windows create different conversation quality.',
    descZh: '水星与太阳的相位节奏与月亮空相创造不同质量的对话时机。',
  },
  {
    icon: Timer,
    titleEn: 'When to take action',
    titleZh: '何时主动出击',
    descEn: 'Mars aspects, new moon windows, and elevated solar arcs mark forward motion.',
    descZh: '火星相位、新月窗口与上升点抬升标记着主动出击的时刻。',
  },
] as const;

const FAQS = [
  {
    qEn: 'Is this astrology or fortune-telling?',
    qZh: '这是占星还是算命？',
    aEn: 'Timing insights are derived from planetary transit analysis — a form of relationship astrology. We describe patterns and windows, not guaranteed outcomes.',
    aZh: '时机洞察源自行星推运分析——一种关系占星形式。我们描述的是模式与窗口，而非确定结果。',
  },
  {
    qEn: 'How is timing different from a horoscope?',
    qZh: '时机分析与运势有何不同？',
    aEn: 'A horoscope covers general daily energy. Love timing analysis looks at specific planetary transits across your chart — particularly the 5th, 7th, 8th, and 10th houses — to identify when romantic decisions gain momentum.',
    aZh: '运势覆盖一般性能量。爱情时机分析则针对你的星盘中的特定行星推运——特别是第5、7、8、10宫——来识别感情决策何时获得动力。',
  },
  {
    qEn: 'Can timing analysis predict when I will meet someone?',
    qZh: '时机分析能预测我何时遇见另一半吗？',
    aEn: 'Not precisely. It identifies favorable windows for new romantic energy to take hold — but meeting someone depends on many factors outside astrology.',
    aZh: '不能精确到那个程度。它识别的是新的浪漫能量容易扎根的窗口期——但遇见另一半取决于许多星盘之外的因素。',
  },
  {
    qEn: 'What if my current timing window is unfavorable?',
    qZh: '如果当前时机窗口不利怎么办？',
    aEn: 'A quiet window is still useful information. It is an ideal time for reflection, recalibration, and preparation — not frustration. Timing always cycles back.',
    aZh: '安静的窗口同样是有用的信息。这是反思、重新校准和准备的理想时机——而非沮丧。时机总会循环回来。',
  },
  {
    qEn: 'How often should I check my love timing?',
    qZh: '我应该多久查看一次爱情时机？',
    aEn: 'Monthly is a good rhythm for most people. Significant planetary shifts — like a Saturn return or Venus retrograde — warrant a dedicated check.',
    aZh: '大多数人每月一次是好节奏。重大行星变化——如土星回归或金星逆行——则值得专门做一次分析。',
  },
] as const;

const INTERNAL_LINKS = [
  { href: '/daily-oracle', labelEn: 'Daily Oracle', labelZh: '每日运势' },
  { href: '/guide', labelEn: 'All Guides', labelZh: '全部指南' },
  { href: '/about', labelEn: 'About', labelZh: '关于' },
  { href: '/services', labelEn: 'Services', labelZh: '服务' },
];

export default function LoveTimingInsightsPage() {
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
    <TianjiLoveShell ariaLabel="Love Timing Insights">
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
            {t('Relationship Astrology · Timing Analysis', '关系占星 · 时机分析')}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">
            {t('Love Timing Insights', '爱情时机洞察')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-[#f4d7a3]/72">
            {t(
              'Understand the best timing for relationship decisions. Our AI analyzes planetary transits and cycles to tell you when love is likely to move forward.',
              '了解感情决策的最佳时机。我们的 AI 分析行星推运与周期，告诉你爱情何时可能向前推进。'
            )}
          </p>
        </div>
      </section>

      {/* What is Relationship Timing */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <TianjiLoveSectionTitle
          eyebrow={t('Understanding Timing', '理解时机')}
          title={t('What is Relationship Timing?', '什么是关系时机？')}
        />
        <TianjiLovePanel className="mx-auto mt-8 max-w-3xl p-7">
          <p className="text-base leading-8 text-[#f4d7a3]/72">
            {t(
              'Planetary cycles do not cause events — but they describe the quality of energy available during a given window. A transit of Mars through your 5th house does not force you to fall in love. It marks a period when romantic initiative tends to carry more momentum, visibility, and urgency.',
              '行星周期不创造事件——但它们描述特定窗口期的能量质量。火星推运经过你的第5宫不会强迫你坠入爱河。它标记的是浪漫行动容易获得更多动力、可见度和紧迫感的时期。'
            )}
          </p>
          <p className="mt-5 text-base leading-8 text-[#f4d7a3]/72">
            {t(
              'Relationship timing analysis reads these transit signals across the houses most relevant to love — the 5th (romance and creativity), 7th (partnership and commitment), 8th (transformation and depth), and 10th (public recognition and ambition).',
              '关系时机分析解读这些推运信号中与爱情最相关的宫位——第5宫（浪漫与创造力）、第7宫（伴侣关系与承诺）、第8宫（转化与深度）和第10宫（公众认知与野心）。'
            )}
          </p>
        </TianjiLovePanel>
      </section>

      {/* How it Works */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle
          eyebrow={t('Methodology', '方法论')}
          title={t('How Timing Analysis Works', '时机分析如何运作')}
        />
        <TianjiLovePanel className="mx-auto mt-8 max-w-3xl p-7">
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#b57248]/48 bg-[#0a1020]/66 text-sm font-semibold text-[#d8b77b]">
                1
              </span>
              <div>
                <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                  {t('Identify the relevant houses', '识别相关宫位')}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#f4d7a3]/62">
                  {t(
                    'We map transits to your 5th, 7th, 8th, and 10th houses — the sectors most active in romantic and partnership themes.',
                    '我们将推运映射到你的第5、7、8、10宫——在浪漫和伴侣主题中最活跃的宫位。'
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#b57248]/48 bg-[#0a1020]/66 text-sm font-semibold text-[#d8b77b]">
                2
              </span>
              <div>
                <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                  {t('Read planetary aspect quality', '解读行星相位质量')}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#f4d7a3]/62">
                  {t(
                    'Conjunctions and trines suggest ease; squares and oppositions suggest friction and catalyst. We read both as informative.',
                    '合相和三合表示顺遂；刑冲表示摩擦和催化剂。两者我们都视为有价值的信息。'
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#b57248]/48 bg-[#0a1020]/66 text-sm font-semibold text-[#d8b77b]">
                3
              </span>
              <div>
                <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                  {t('Translate into decision windows', '转化为决策窗口')}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#f4d7a3]/62">
                  {t(
                    'We translate the planetary picture into practical guidance — when to move, when to wait, when to communicate, and when to reflect.',
                    '我们将行星图景转化为实用指引——何时推进、何时等待、何时沟通、何时反思。'
                  )}
                </p>
              </div>
            </div>
          </div>
        </TianjiLovePanel>
      </section>

      {/* Best Timing for Different Decisions */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle
          eyebrow={t('Practical Guidance', '实用指引')}
          title={t('Best Timing for Different Decisions', '不同决策的最佳时机')}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {TIMING_DECISIONS.map((item) => {
            const Icon = item.icon;
            return (
              <TianjiLovePanel key={item.titleEn} className="flex flex-col p-6">
                <Icon className="mb-4 h-7 w-7 text-[#d8b77b]" aria-hidden />
                <h3 className="font-serif text-lg font-semibold text-[#ffe3b4]">
                  {t(item.titleEn, item.titleZh)}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[#f4d7a3]/62">
                  {t(item.descEn, item.descZh)}
                </p>
              </TianjiLovePanel>
            );
          })}
        </div>
      </section>

      {/* AdSense placeholder */}
      <div id="timing-ads" className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8" />

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        <TianjiLovePanel className="mx-auto max-w-3xl p-8 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-[#d8b77b]" aria-hidden />
          <h2 className="font-serif text-2xl font-semibold text-[#ffe3b4]">
            {t('Try the free timing tool', '使用免费时机工具')}
          </h2>
          <p className="mt-3 text-sm text-[#f4d7a3]/62">
            {t(
              'Enter your birth details and get a personalized love timing analysis — completely free.',
              '输入你的出生信息，获取个性化的爱情时机分析——完全免费。'
            )}
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <TianjiLoveButton href={href('/draw')}>
              {t('Draw Timing Cards →', '抽时机牌 →')}
            </TianjiLoveButton>
            <TianjiLoveButton href={href('/relationship/new')} variant="secondary">
              {t('Unlock Full Report', '解锁完整报告')}
            </TianjiLoveButton>
          </div>
        </TianjiLovePanel>
      </section>

      {/* Limitations */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle
          eyebrow={t('Important Note', '重要说明')}
          title={t('Limitations', '局限性')}
        />
        <TianjiLovePanel className="mx-auto mt-8 max-w-3xl p-7">
          <ul className="space-y-4">
            {[
              t(
                'Timing analysis describes energy windows, not certain outcomes. Free will always interact with cosmic patterns.',
                '时机分析描述的是能量窗口，而非确定结果。自由意志始终与宇宙模式相互作用。'
              ),
              t(
                'Results are most useful for reflection and preparation — not as a replacement for honest conversation with your partner.',
                '结果最适用于反思和准备——而非取代与伴侣的坦诚沟通。'
              ),
              t(
                'We do not make predictions about specific people, specific dates, or specific relationship events.',
                '我们不对特定的人、特定的日期或特定的感情事件做预测。'
              ),
              t(
                'A poor timing window does not mean a relationship is doomed — it means the energy is better spent on inner work.',
                '不佳的时机窗口并不意味着感情没有希望——它意味着能量更适合投入内在成长。'
              ),
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-sm leading-6 text-[#f4d7a3]/62">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d8b77b]/60" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
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

      {/* AdSense placeholder after CTA */}
      <div id="timing-ads-2" className="relative z-10 mx-auto max-w-7xl px-5 pb-12 sm:px-8" />

      <TianjiLoveFooter
        disclaimer={t(DISCLAIMER_EN, DISCLAIMER_ZH)}
        links={footerLinks}
        homeHref={href('/')}
      />
    </TianjiLoveShell>
  );
}
