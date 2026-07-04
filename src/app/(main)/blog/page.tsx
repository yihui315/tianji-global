'use client';

import {
  BookOpen,
  Heart,
  Star,
  Sun,
  Moon,
  Compass,
  Sparkles,
  ArrowRight,
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
import { AdSenseSlot } from '@/components/ads/AdSenseSlot';
import { AffiliateProductGrid } from '@/components/affiliate/AffiliateProductGrid';

export async function generateMetadata() {
  return {
    title: 'Love & Astrology Guides: Free Relationship, Tarot & Compatibility Articles | Tianji Love',
    description: 'Explore expert astrology guides, tarot readings, and relationship compatibility articles. Free love tests, BaZi analysis, and dating insights for every zodiac sign.',
    alternates: {
      languages: {
        'en': '/blog',
        'zh-CN': '/zh-CN/blog',
        'x-default': '/blog',
      },
    },
  };
}

const BLOG_CATEGORIES = [
  {
    titleEn: 'Love Compatibility Guides',
    titleZh: '情感兼容性指南',
    icon: Heart,
    color: 'text-[#e8a87c]',
    articles: [
      {
        href: '/compatibility-zodiac-signs',
        titleEn: 'Zodiac Compatibility Guide: All 12 Signs',
        titleZh: '十二星座完整兼容性指南',
        descEn: 'Complete love compatibility breakdown for every zodiac sign pairing — strengths, challenges, and relationship dynamics.',
        descZh: '十二星座完整爱情兼容性分析——优势、挑战与关系动态。',
        readTimeEn: '12 min read',
        readTimeZh: '12 分钟阅读',
      },
      {
        href: '/love-compatibility-zodiac-2024',
        titleEn: 'Love Compatibility by Zodiac 2024',
        titleZh: '2024十二星座爱情兼容性',
        descEn: 'Year-specific compatibility insights for all sign combinations, with timing guidance for relationships.',
        descZh: '年度星座兼容性分析，含时机指导。',
        readTimeEn: '8 min read',
        readTimeZh: '8 分钟阅读',
      },
      {
        href: '/free-relationship-compatibility-test',
        titleEn: 'Free Relationship Compatibility Test',
        titleZh: '免费关系兼容性测试',
        descEn: 'Enter two names and birth dates for instant AI-powered compatibility analysis across five dimensions.',
        descZh: '输入两个姓名和出生日期，获取即时AI五维合盘分析。',
        readTimeEn: '3 min test',
        readTimeZh: '3 分钟测试',
      },
      {
        href: '/he-loves-you-signs',
        titleEn: 'Signs He Loves You — Quiz & Guide',
        titleZh: '他爱你的表现——测试与指南',
        descEn: '22 clear signs to know if he truly loves you, with relationship guidance based on behavioral patterns.',
        descZh: '22个清晰指标判断他是否真的爱你，基于行为模式的关系指导。',
        readTimeEn: '7 min read',
        readTimeZh: '7 分钟阅读',
      },
    ],
  },
  {
    titleEn: 'Tarot & Divination',
    titleZh: '塔罗与占卜',
    icon: Moon,
    color: 'text-[#a78bfa]',
    articles: [
      {
        href: '/tarot-love-reading-online',
        titleEn: 'Free AI Tarot Love Reading Online',
        titleZh: '免费AI塔罗爱情占卜',
        descEn: 'Ask a specific love question and receive a three-card tarot spread with AI-powered interpretation.',
        descZh: '提出具体爱情问题，获得三张牌阵AI解读。',
        readTimeEn: '5 min reading',
        readTimeZh: '5 分钟占卜',
      },
      {
        href: '/tarot-spread-meanings',
        titleEn: 'Tarot Spread Meanings: Complete Guide',
        titleZh: '塔罗牌阵含义完整指南',
        descEn: 'Learn what each position in a tarot spread means — past, present, challenge, foundation, and guidance.',
        descZh: '了解塔罗牌阵每个位置的含义——过去、现在、挑战、基础、指引。',
        readTimeEn: '10 min read',
        readTimeZh: '10 分钟阅读',
      },
      {
        href: '/how-to-read-tarot-cards-for-beginners',
        titleEn: 'How to Read Tarot Cards for Beginners',
        titleZh: '塔罗牌入门完全指南',
        descEn: 'Step-by-step guide to learning tarot card meanings, spreads, and interpretation for love questions.',
        descZh: '逐步指南：学习塔罗牌含义、牌阵与爱情问题解读。',
        readTimeEn: '15 min read',
        readTimeZh: '15 分钟阅读',
      },
    ],
  },
  {
    titleEn: 'Bazi & Chinese Astrology',
    titleZh: '八字与中国命理',
    icon: Compass,
    color: 'text-[#6ee7b7]',
    articles: [
      {
        href: '/bazi-relationship-analysis-free',
        titleEn: 'Free Bazi Relationship Analysis',
        titleZh: '免费八字合盘分析',
        descEn: 'Analyze two birth charts using Chinese lunar calendar data for compatibility in career, finances, and emotions.',
        descZh: '用中国农历八字分析两人事业、财运、情感兼容性。',
        readTimeEn: '6 min read',
        readTimeZh: '6 分钟阅读',
      },
    ],
  },
  {
    titleEn: 'Love Timing & Insights',
    titleZh: '爱情时机与洞察',
    icon: Sparkles,
    color: 'text-[#fbbf24]',
    articles: [
      {
        href: '/love-timing-insights',
        titleEn: 'Love Timing Insights',
        titleZh: '爱情时机洞察',
        descEn: 'Discover the best timing for relationship decisions — when to act, wait, or let things unfold naturally.',
        descZh: '发现关系决策的最佳时机——何时行动、何时等待、何时顺其自然。',
        readTimeEn: '5 min read',
        readTimeZh: '5 分钟阅读',
      },
      {
        href: '/daily-love-oracle-guide',
        titleEn: 'Daily Love Oracle Guide',
        titleZh: '每日爱情神谕指南',
        descEn: 'How to use the daily love oracle effectively — timing, intention-setting, and interpreting your cards.',
        descZh: '如何有效使用每日爱情神谕——时机、意念设定与牌卡解读。',
        readTimeEn: '4 min read',
        readTimeZh: '4 分钟阅读',
      },
      {
        href: '/how-to-get-clarity-in-relationship',
        titleEn: 'How to Get Clarity in Your Relationship',
        titleZh: '如何在感情中获得清晰认知',
        descEn: 'Practical methods to gain emotional clarity — reflection techniques, communication strategies, and decision frameworks.',
        descZh: '获得情感清晰认知的实用方法——反思技巧、沟通策略与决策框架。',
        readTimeEn: '8 min read',
        readTimeZh: '8 分钟阅读',
      },
    ],
  },
  {
    titleEn: 'Relationship Patterns',
    titleZh: '关系模式',
    icon: Star,
    color: 'text-[#f472b6]',
    articles: [
      {
        href: '/relationship-patterns-guide',
        titleEn: 'Relationship Patterns Guide',
        titleZh: '关系模式完整指南',
        descEn: 'Identify recurring patterns in your love life — attachment styles, communication traps, and how to break negative cycles.',
        descZh: '识别感情中的重复模式——依恋风格、沟通陷阱与如何打破负面循环。',
        readTimeEn: '11 min read',
        readTimeZh: '11 分钟阅读',
      },
      {
        href: '/free-ai-love-reading',
        titleEn: 'Free AI Love Reading',
        titleZh: '免费AI爱情解读',
        descEn: 'Get a personalized AI love reading based on your name and birth date — pattern analysis and forward-looking insights.',
        descZh: '基于姓名和出生日期获取个性化AI爱情解读——模式分析与前瞻洞察。',
        readTimeEn: '4 min read',
        readTimeZh: '4 分钟阅读',
      },
    ],
  },
];

export default function BlogPage() {
  return (
    <TianjiLoveShell>
      <TianjiLoveHeader
        homeHref="/"
        navItems={getTianjiLovePrimaryNav('en', (p) => p)}
        cta={{ label: 'Free Love Test', href: '/love-test' }}
      />

      <main className="min-h-screen bg-[#0a0a14]">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1038]/60 to-[#0a0a14]" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#d8b77b]/12 px-4 py-1.5 text-sm text-[#d8b77b]">
              <BookOpen size={14} />
              Free Guides & Insights
            </div>
            <h1 className="mb-4 text-4xl font-bold text-[#f4d7a3]">
              Love & Destiny Guides
            </h1>
            <p className="text-lg text-[#f4d7a3]/70">
              Expert astrology, tarot, and relationship guides to help you understand love,
              timing, and your connection with others.
            </p>
          </div>
        </section>

        {/* Top AdSense */}
        <div className="mx-auto max-w-5xl px-6 py-6">
          <AdSenseSlot slot="top" className="min-h-[90px]" />
        </div>

        {/* Category Sections */}
        <div className="mx-auto max-w-5xl px-6 pb-16">
          {BLOG_CATEGORIES.map((category) => (
            <section key={category.titleEn} className="mb-12">
              <TianjiLoveSectionTitle
                eyebrow={category.titleEn}
                title={category.titleZh}
                className="mb-6"
              />
              <div className="grid gap-4 md:grid-cols-2">
                {category.articles.map((article) => (
                  <Link
                    key={article.href}
                    href={article.href}
                    className="group block rounded-2xl border border-[#d8b77b]/16 bg-[#0f0f1e] p-5 transition hover:border-[#d8b77b]/32 hover:bg-[#14142a]"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-base font-semibold text-[#f4d7a3] group-hover:text-[#ffe3b4]">
                        {article.titleEn}
                      </h3>
                      <ArrowRight
                        size={16}
                        className="mt-0.5 shrink-0 text-[#d8b77b]/40 transition group-hover:translate-x-1 group-hover:text-[#d8b77b]"
                      />
                    </div>
                    <p className="mb-2 text-xs text-[#f4d7a3]/50">{article.readTimeEn}</p>
                    <p className="text-sm text-[#f4d7a3]/60">{article.descEn}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Inline AdSense */}
        <div className="mx-auto max-w-5xl px-6 py-6">
          <AdSenseSlot slot="inline" className="min-h-[90px]" />
        </div>

        {/* CTA Section */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <TianjiLovePanel className="text-center">
            <h2 className="mb-3 text-2xl font-bold text-[#f4d7a3]">
              Ready for Your Personalized Reading?
            </h2>
            <p className="mb-6 text-[#f4d7a3]/60">
              Get your free AI-powered love reading based on your unique birth chart.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <TianjiLoveButton href="/love-test">
                Free Love Test →
              </TianjiLoveButton>
              <TianjiLoveButton href="/ask" variant="secondary">
                Ask the AI
              </TianjiLoveButton>
            </div>
          </TianjiLovePanel>
        </section>

        {/* Affiliate Grid */}
        <div className="mx-auto max-w-5xl px-6 pb-16">
          <TianjiLoveSectionTitle
            eyebrow="Recommended Tools & Resources"
            title="推荐工具与资源"
            className="mb-6"
          />
          <AffiliateProductGrid />
        </div>
      </main>

      <TianjiLoveFooter
        homeHref="/"
        disclaimer="Guides and readings are for self-reflection and entertainment only, not medical, legal, financial or crisis advice."
        links={getTianjiLoveFooterNav('en', (p) => p)}
      />
    </TianjiLoveShell>
  );
}
