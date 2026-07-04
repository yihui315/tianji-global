'use client';

export async function generateMetadata() {
  return {
    title: 'Daily Love Oracle Guide — Free Planetary Timing for Relationships | Tianji Love',
    description: 'Learn how to use the free daily love oracle for planetary transits, element balance, and optimal timing windows to navigate your relationships each day.',
    alternates: {
      languages: {
        'en': '/daily-love-oracle-guide',
        'zh-CN': '/zh-CN/daily-love-oracle-guide',
        'x-default': '/daily-love-oracle-guide',
      },
    },
  };
}

import Link from 'next/link';
import {
  Brain,
  CalendarHeart,
  ChevronRight,
  Clock3,
  CreditCard,
  Globe2,
  Heart,
  HeartHandshake,
  Sparkles,
  Star,
} from 'lucide-react';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import {
  TianjiLoveButton,
  TianjiLoveFinalCta,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLoveHeroImage,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  TianjiLoveTrustCard,
} from '@/components/tianji-love';

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'zh';

type PageCopy = {
  nav: {
    home: string;
    loveReading: string;
    ask: string;
    draw: string;
    pricing: string;
    about: string;
    privacy: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
  whatItShows: {
    eyebrow: string;
    title: string;
    items: Array<{ icon: typeof Star; title: string; body: string }>;
  };
  howToUse: {
    eyebrow: string;
    title: string;
    items: Array<{ time: string; title: string; body: string }>;
  };
  dailyVsFull: {
    eyebrow: string;
    title: string;
    free: string[];
    full: string[];
  };
  sampleThemes: {
    eyebrow: string;
    title: string;
    themes: Array<{ label: string; body: string }>;
  };
  faq: {
    eyebrow: string;
    title: string;
    questions: Array<{ q: string; a: string }>;
  };
  finalCta: {
    title: string;
    primary: string;
    secondary: string;
  };
  footer: string;
};

// ─── Copy ─────────────────────────────────────────────────────────────────────

const PAGE_COPY: Record<Lang, PageCopy> = {
  en: {
    nav: {
      home: 'Home',
      loveReading: 'Love Reading',
      ask: 'Ask',
      draw: 'Draw Timing',
      pricing: 'Pricing',
      about: 'About',
      privacy: 'Privacy',
    },
    hero: {
      eyebrow: 'Free Daily Tool',
      title: 'A Fresh Start for Your Relationships',
      body: 'The daily love oracle gives you a timing-based reflection to carry through your day.',
      primary: 'Try the daily oracle — free',
      secondary: 'See all relationship tools',
    },
    whatItShows: {
      eyebrow: 'What the daily oracle shows',
      title: 'Three layers of daily timing',
      items: [
        {
          icon: Globe2,
          title: 'Planetary transits',
          body: 'Which planetary movements are active today and how they may be coloring your relationships — internally or with others.',
        },
        {
          icon: Sparkles,
          title: 'Element balance',
          body: 'The dominant elemental energy of the day and how it tends to show up in connection, communication, and decision-making.',
        },
        {
          icon: Clock3,
          title: 'Timing windows',
          body: 'Periods within the day when action or restraint tends to be more effective — useful for conversations, boundaries, or rest.',
        },
      ],
    },
    howToUse: {
      eyebrow: 'How to use it daily',
      title: 'Best practices for a daily reading',
      items: [
        {
          time: 'Morning',
          title: 'Check the oracle as your day starts',
          body: 'Read the theme and timing window before your day picks up speed. It works best as a compass, not a script.',
        },
        {
          time: 'Frame one question',
          title: 'Keep it to one focus area',
          body: 'Pick one relationship question or area of attention — love opportunity, communication, patience, or a specific conversation.',
        },
        {
          time: 'Evening',
          title: 'Note what resonated',
          body: 'A daily reading is a reflection aid, not a report card. Notice what felt accurate and what did not — over time this builds self-awareness.',
        },
      ],
    },
    dailyVsFull: {
      eyebrow: 'Daily vs full reading',
      title: 'What you get free vs what unlocks more',
      free: [
        'Daily planetary transit overview',
        'Element balance of the day',
        'One timing window or theme',
        'Free to refresh daily',
      ],
      full: [
        'Full birth chart analysis (BaZi + I Ching)',
        'Personalized compatibility readings',
        'Year-long timing forecast',
        'Unlimited oracle draws with question framing',
      ],
    },
    sampleThemes: {
      eyebrow: 'Sample daily oracle themes',
      title: 'What the oracle tends to surface',
      themes: [
        {
          label: 'Love opportunity',
          body: 'A window where connection feels more natural — good for reaching out, opening a conversation, or letting something move forward.',
        },
        {
          label: 'Communication focus',
          body: 'A day where how you say something matters more than what you say. Precision and tone are highlighted.',
        },
        {
          label: 'Patience window',
          body: 'A signal that this is a day for holding steady rather than pushing. Restraint is the action.',
        },
        {
          label: 'Decision point',
          body: 'A transit that sharpens clarity around a choice you have been sitting with. Good for weighing options, not necessarily acting yet.',
        },
      ],
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Common questions',
      questions: [
        {
          q: 'Is the daily oracle really free?',
          a: 'Yes. The daily love oracle is completely free — no signup required. You can refresh it once per day and get a fresh reading.',
        },
        {
          q: 'How is this different from the Draw Timing cards?',
          a: 'The daily oracle is a timing-based reflection tied to the current planetary day. Draw Timing asks about a specific moment or question you bring — the oracle reads the day itself.',
        },
        {
          q: 'Does the reading change at midnight?',
          a: 'The daily oracle updates with the planetary day, which roughly aligns with midnight in your local timezone. A new theme and timing window reset daily.',
        },
        {
          q: 'Can I ask about a specific person?',
          a: 'The daily oracle reads general timing energy rather than specific people. For questions about a specific relationship, the Ask or Love Reading tools are more targeted.',
        },
        {
          q: 'What should I do with the reading?',
          a: 'Use it as a gentle frame for your day — not a to-do list. If the theme is about patience, notice where impatience shows up. If it is about communication, pay attention to tone. The reading works best when you let it inform rather than dictate.',
        },
      ],
    },
    finalCta: {
      title: 'Start your day with more clarity',
      primary: 'Try the daily oracle — free',
      secondary: 'Explore all relationship tools',
    },
    footer: 'Daily oracle readings are for reflection and relationship communication, not medical, legal, financial, or crisis advice.',
  },
  zh: {
    nav: {
      home: '首页',
      loveReading: '关系解读',
      ask: '提问',
      draw: '时机抽牌',
      pricing: '会员权益',
      about: '关于',
      privacy: '隐私',
    },
    hero: {
      eyebrow: '每日免费工具',
      title: '为你的关系开启新一天',
      body: '每日爱情神谕给你一个基于时机的反思，陪伴你度过这一天。',
      primary: '试用每日神谕 — 免费',
      secondary: '查看所有关系工具',
    },
    whatItShows: {
      eyebrow: '每日神谕展示什么',
      title: '三层每日时机',
      items: [
        {
          icon: Globe2,
          title: '行星行运',
          body: '今天哪些行星运动处于活跃状态，以及它们可能如何影响你的人际关系——内在或与他人相处时。',
        },
        {
          icon: Sparkles,
          title: '五行平衡',
          body: '当天主导的元素能量，以及它如何在连接、沟通和决策中呈现。',
        },
        {
          icon: Clock3,
          title: '时机窗口',
          body: '一天中行动或克制的效果可能更好的时段——适用于对话、界限设定或休息。',
        },
      ],
    },
    howToUse: {
      eyebrow: '每日使用方法',
      title: '每日解读的最佳实践',
      items: [
        {
          time: '早晨',
          title: '在一天开始时查看神谕',
          body: '在日程加速之前了解主题和时机窗口。它最适合作为指南针，而非脚本。',
        },
        {
          time: '聚焦一个问题',
          title: '保持一个关注点',
          body: '选择一个关系问题或关注领域——爱情机会、沟通、耐心，或一次特定对话。',
        },
        {
          time: '晚间',
          title: '记录哪些引起了共鸣',
          body: '每日解读是一个反思工具，不是成绩单。注意哪些感觉准确，哪些不准确——长期来看这能建立自我觉察。',
        },
      ],
    },
    dailyVsFull: {
      eyebrow: '每日 vs 完整解读',
      title: '免费获得什么 vs 解锁更多内容',
      free: [
        '每日行星行运概览',
        '当天五行平衡',
        '一个时机窗口或主题',
        '每日可免费刷新',
      ],
      full: [
        '完整出生命盘分析（八字 + 易经）',
        '个性化契合度解读',
        '全年时机预测',
        '无限次神谕抽取，配提问框架',
      ],
    },
    sampleThemes: {
      eyebrow: '每日神谕主题示例',
      title: '神谕倾向于呈现的内容',
      themes: [
        {
          label: '爱情机会',
          body: '连接感更自然的窗口——适合主动联系、开启对话，或让事情向前推进。',
        },
        {
          label: '沟通焦点',
          body: '今天你说什么的方式比说什么更重要的一天。精准和语气是重点。',
        },
        {
          label: '耐心窗口',
          body: '表明这一天更适合保持稳定而非推动的信号。克制就是行动。',
        },
        {
          label: '决策点',
          body: '让你对一直犹豫的选择更加清晰的行运。适合权衡选项，不一定马上行动。',
        },
      ],
    },
    faq: {
      eyebrow: '常见问题',
      title: '常见问题解答',
      questions: [
        {
          q: '每日神谕真的免费吗？',
          a: '是的。每日爱情神谕完全免费——无需注册。每天可刷新一次，获得全新解读。',
        },
        {
          q: '这和时机抽牌有什么区别？',
          a: '每日神谕是与你当前行星日相关的时机反思。时机抽牌则是针对你带来的特定时刻或问题——神谕读的是这一天本身。',
        },
        {
          q: '解读在午夜变更吗？',
          a: '每日神谕随行星日更新，大致与你当地时区的午夜对齐。新的主题和时机窗口每天重置。',
        },
        {
          q: '我可以针对特定的人提问吗？',
          a: '每日神谕读取的是一般时机能量，而非特定的人。针对特定关系的问题，提问或关系解读工具更有针对性。',
        },
        {
          q: '拿到解读后该怎么做？',
          a: '用它作为一天的温和框架——不是待办事项清单。如果主题是关于耐心，注意不耐烦在哪里出现。如果关于沟通，关注语气。，当你让它影响而非决定你的行为时，解读效果最佳。',
        },
      ],
    },
    finalCta: {
      title: '每天以更清晰的认知开始',
      primary: '试用每日神谕 — 免费',
      secondary: '探索所有关系工具',
    },
    footer: '每日神谕解读仅用于反思和沟通，不能替代医疗、法律、金融或危机咨询建议。',
  },
};

// ─── FAQ JSON-LD ──────────────────────────────────────────────────────────────

function buildFaqSchema(copy: PageCopy['faq']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: copy.questions.map((q) => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.a,
      },
    })),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DailyLoveOracleGuidePage() {
  const [language] = useSyncedLanguage('en');
  const t = (en: string, zh: string) => (language === 'zh' ? zh : en);
  const copy = PAGE_COPY[language];
  const faqSchema = buildFaqSchema(copy.faq);

  const HERO_IMG = '/assets/images/hero/tianji-love-moon-pavilion-16x9.png';

  return (
    <>
      <TianjiLoveShell>
        <TianjiLoveHeader
          navItems={[
            { label: copy.nav.loveReading, href: '/love-reading' },
            { label: copy.nav.ask, href: '/ask' },
            { label: copy.nav.draw, href: '/draw' },
            { label: copy.nav.pricing, href: '/pricing' },
            { label: copy.nav.about, href: '/about' },
          ]}
          ctaLabel={copy.nav.privacy}
          ctaHref="/privacy"
        />

        {/* Hero */}
        <TianjiLoveHeroImage
          eyebrow={copy.hero.eyebrow}
          title={copy.hero.title}
          body={copy.hero.body}
          imageSrc={HERO_IMG}
          imageAlt="Love oracle"
          primaryCta={copy.hero.primary}
          primaryHref="/daily-oracle"
          secondaryCta={copy.hero.secondary}
          secondaryHref="/love-reading"
        />

        {/* What it shows */}
        <TianjiLovePanel>
          <TianjiLoveSectionTitle eyebrow={copy.whatItShows.eyebrow} title={copy.whatItShows.title} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {copy.whatItShows.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06]">
                    <Icon className="h-6 w-6 text-white/70" />
                  </div>
                  <h3 className="mb-2 text-sm font-medium text-white/90">{item.title}</h3>
                  <p className="text-sm text-white/50">{item.body}</p>
                </div>
              );
            })}
          </div>
        </TianjiLovePanel>

        {/* Ad placeholder */}
        <div id="daily-oracle-ads" className="my-16" />

        {/* How to use */}
        <TianjiLovePanel>
          <TianjiLoveSectionTitle eyebrow={copy.howToUse.eyebrow} title={copy.howToUse.title} />
          <div className="mt-10 space-y-8">
            {copy.howToUse.items.map((item) => (
              <div key={item.time} className="flex gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-xs uppercase tracking-widest text-white/50">
                  {item.time}
                </div>
                <div className="pt-2">
                  <h3 className="mb-1 text-base font-medium text-white/90">{item.title}</h3>
                  <p className="text-sm text-white/50">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <TianjiLoveButton href="/daily-oracle" variant="primary">
              {copy.hero.primary}
              <ChevronRight className="h-4 w-4" />
            </TianjiLoveButton>
          </div>
        </TianjiLovePanel>

        {/* Ad placeholder */}
        <div className="my-16" />

        {/* Daily vs full */}
        <TianjiLovePanel>
          <TianjiLoveSectionTitle eyebrow={copy.dailyVsFull.eyebrow} title={copy.dailyVsFull.title} />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
              <div className="mb-4 text-xs uppercase tracking-widest text-white/40">
                {t('Free daily access', '免费每日访问')}
              </div>
              <ul className="space-y-3">
                {copy.dailyVsFull.free.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-6">
              <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-widest text-purple-400/70">
                <Sparkles className="h-3.5 w-3.5" />
                {t('Full report unlocks', '完整报告解锁')}
              </div>
              <ul className="space-y-3">
                {copy.dailyVsFull.full.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400/50" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <TianjiLoveButton href="/relationship/new" variant="premium" size="sm">
                  <CreditCard className="h-3.5 w-3.5" />
                  {t('Unlock full reading', '解锁完整解读')}
                </TianjiLoveButton>
              </div>
            </div>
          </div>
        </TianjiLovePanel>

        {/* Ad placeholder */}
        <div className="my-16" />

        {/* Sample themes */}
        <TianjiLovePanel>
          <TianjiLoveSectionTitle eyebrow={copy.sampleThemes.eyebrow} title={copy.sampleThemes.title} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {copy.sampleThemes.themes.map((theme) => (
              <div
                key={theme.label}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
              >
                <div className="mb-2 text-xs uppercase tracking-widest text-white/40">
                  {theme.label}
                </div>
                <p className="text-sm text-white/55">{theme.body}</p>
              </div>
            ))}
          </div>
        </TianjiLovePanel>

        {/* Ad placeholder */}
        <div className="my-16" />

        {/* FAQ */}
        <TianjiLovePanel>
          <TianjiLoveSectionTitle eyebrow={copy.faq.eyebrow} title={copy.faq.title} />
          <div className="mt-8 space-y-6">
            {copy.faq.questions.map((q) => (
              <div key={q.q} className="border-b border-white/[0.06] pb-6 last:border-0">
                <h3 className="mb-2 text-sm font-medium text-white/80">{q.q}</h3>
                <p className="text-sm text-white/50">{q.a}</p>
              </div>
            ))}
          </div>
        </TianjiLovePanel>

        {/* Ad placeholder */}
        <div className="my-16" />

        {/* Final CTA */}
        <TianjiLoveFinalCta
          title={copy.finalCta.title}
          primaryCta={copy.finalCta.primary}
          primaryHref="/daily-oracle"
          secondaryCta={copy.finalCta.secondary}
          secondaryHref="/love-reading"
          imageSrc={HERO_IMG}
          imageAlt="Love oracle"
        />

        {/* Trust */}
        <TianjiLoveTrustCard
          items={[
            {
              icon: CalendarHeart,
              title: t('Refreshes daily', '每日更新'),
              body: t('A new reading each day tied to the planetary transit.', '每天根据行星行运生成新解读。'),
            },
            {
              icon: HeartHandshake,
              title: t('Private by default', '默认私密'),
              body: t('No data stored on public pages.', '公开页面上不存储任何数据。'),
            },
            {
              icon: Brain,
              title: t('Timing over prediction', '时机而非预言'),
              body: t('Reads the day, not the future.', '读的是这一天，而非未来。'),
            },
          ]}
        />

        <TianjiLoveFooter
          copy={copy.footer}
          href={(path: string) => path}
          links={[
            { label: copy.nav.about, href: '/about' },
            { label: copy.nav.privacy, href: '/privacy' },
          ]}
        />
      </TianjiLoveShell>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
