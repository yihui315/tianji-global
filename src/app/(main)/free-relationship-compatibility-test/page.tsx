'use client';

import Link from 'next/link';
import {
  Brain,
  CalendarHeart,
  ChevronRight,
  Clock3,
  CreditCard,
  Heart,
  HeartHandshake,
  MessageCircleHeart,
  Sparkles,
  Users,
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
  dimensions: {
    eyebrow: string;
    title: string;
    items: Array<{ icon: typeof Heart; title: string; body: string }>;
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    steps: Array<{ number: string; title: string; body: string }>;
  };
  score: {
    eyebrow: string;
    title: string;
    body: string;
    ranges: Array<{ range: string; label: string; desc: string }>;
  };
  fullReport: {
    eyebrow: string;
    title: string;
    body: string;
    items: string[];
    cta: string;
    assurance: string;
  };
  limitations: {
    title: string;
    body: string;
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
      eyebrow: 'Free Tool',
      title: 'Know Where You Stand',
      body: 'Our AI compatibility test gives you an instant read on relationship strengths, communication patterns, and timing signals.',
      primary: 'Take the free compatibility test',
      secondary: 'See full relationship reading',
    },
    dimensions: {
      eyebrow: 'What the test evaluates',
      title: 'Five dimensions of connection',
      items: [
        {
          icon: Heart,
          title: 'Emotional Compatibility',
          body: 'How your emotional rhythms sync — and where they pull in different directions.',
        },
        {
          icon: MessageCircleHeart,
          title: 'Communication Style',
          body: 'The natural way each of you processes and expresses feelings, and where gaps may create friction.',
        },
        {
          icon: Clock3,
          title: 'Timing & Transits',
          body: 'Current planetary windows that may be amplifying tension or opening new possibility.',
        },
        {
          icon: Users,
          title: 'Conflict Patterns',
          body: 'Recurring dynamics that tend to escalate — and what sits underneath them.',
        },
        {
          icon: Sparkles,
          title: 'Long-term Potential',
          body: 'Structural compatibility signals that tend to emerge over months and years rather than weeks.',
        },
      ],
    },
    howItWorks: {
      eyebrow: 'How it works',
      title: 'Three steps to your first read',
      steps: [
        {
          number: '01',
          title: 'Enter two birth dates',
          body: 'No names, no times — just two birthdays so we can read the chart pattern underneath each person.',
        },
        {
          number: '02',
          title: 'AI analysis runs',
          body: 'The engine compares the two charts across five compatibility dimensions and generates a free compatibility score.',
        },
        {
          number: '03',
          title: 'Get your score — free, instantly',
          body: 'A 0–100 compatibility score with a plain-English breakdown. Unlock the full report to go deeper.',
        },
      ],
    },
    score: {
      eyebrow: 'What your score means',
      title: 'Reading the 0–100 compatibility score',
      body: 'The score is a structural read from two birth charts — it measures where the patterns support each other and where they create friction. It is not a personality judgment.',
      ranges: [
        { range: '70–100', label: 'Strong harmony', desc: 'Charts reinforce each other in meaningful ways. The relationship has structural legs.' },
        { range: '50–69', label: 'Stable chemistry', desc: 'Some natural alignment with areas that need conscious care. Most relationships land here.' },
        { range: '30–49', label: 'Needs attention', desc: 'Significant patterns of friction or asymmetry. Not a verdict — a signal to investigate.' },
        { range: '0–29', label: 'Significant friction', desc: 'Structural mismatch that creates persistent pressure. Understanding the pattern is the first step.' },
      ],
    },
    fullReport: {
      eyebrow: 'Full report includes',
      title: 'When free is just the beginning',
      body: 'The free score tells you where you stand. The full report tells you why — and what to do next.',
      items: [
        'Detailed breakdown of all five compatibility dimensions',
        'Planetary aspect analysis — what the sky is amplifying right now',
        'Personalized action recommendations based on your specific chart combination',
        'Timing forecast: when pressure points may ease and when opportunities open',
      ],
      cta: 'Unlock full compatibility report — $1.99',
      assurance: 'Secure Stripe checkout. One-time unlock. No subscription.',
    },
    limitations: {
      title: 'Limitations of this tool',
      body: 'This compatibility test is designed for reflection and relationship insight — it is not a guaranteed prediction of relationship outcomes. Astrological compatibility is one lens among many. Real relationships are shaped by communication, shared values, timing, and effort that no chart can fully capture. Treat the reading as a conversation starter, not a verdict.',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Common questions',
      questions: [
        {
          q: 'Do I need both birth dates?',
          a: 'Yes. The compatibility reading is based on comparing two birth charts, so two dates are required. Birth time makes the reading more precise but is optional.',
        },
        {
          q: 'Is my data saved?',
          a: 'No birth dates or relationship data are stored on public pages. The free test runs in-session only. See our privacy policy for full details.',
        },
        {
          q: 'What is the difference between the free score and the full report?',
          a: 'The free score gives you a 0–100 compatibility number with a one-paragraph overview. The full report breaks down all five dimensions, includes timing windows based on your chart state, and provides specific action recommendations.',
        },
        {
          q: 'Is this a Chinese zodiac compatibility test?',
          a: 'This is a BaZi (Four Pillars) based compatibility analysis — deeper than zodiac. It uses heavenly stems, earthly branches, and five-element balance rather than animal signs alone.',
        },
        {
          q: 'Can this predict if we will stay together?',
          a: 'No. This tool reads structural patterns in the charts — it cannot predict human choice, external circumstances, or the effort both people put into the relationship.',
        },
      ],
    },
    finalCta: {
      title: 'Curious about the full picture?',
      primary: 'Take the free compatibility test',
      secondary: 'Explore all relationship tools',
    },
    footer: 'Compatibility readings are for reflection and relationship communication, not medical, legal, financial, or crisis advice.',
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
      eyebrow: '免费工具',
      title: '看清你们的关系位置',
      body: '我们的 AI 关系测试能即时读出关系优势、沟通模式和时机信号。',
      primary: '开始免费关系测试',
      secondary: '查看完整关系解读',
    },
    dimensions: {
      eyebrow: '测试评估的维度',
      title: '五个关系维度',
      items: [
        {
          icon: Heart,
          title: '情感契合度',
          body: '你们情绪节奏的同步程度——以及在哪里会朝不同方向拉扯。',
        },
        {
          icon: MessageCircleHeart,
          title: '沟通风格',
          body: '每个人处理和表达感受的自然方式，以及差异可能在哪里产生摩擦。',
        },
        {
          icon: Clock3,
          title: '时机与运势',
          body: '当前行星行运可能正在放大紧张感或打开新的可能性窗口。',
        },
        {
          icon: Users,
          title: '冲突模式',
          body: '容易激化的重复互动模式——以及它们底层真正的原因。',
        },
        {
          icon: Sparkles,
          title: '长期发展潜力',
          body: '结构性的契合信号，这些信号在数月和数年后才会显现，而非数周。',
        },
      ],
    },
    howItWorks: {
      eyebrow: '使用步骤',
      title: '三步获得你的首次解读',
      steps: [
        {
          number: '01',
          title: '输入两个出生日期',
          body: '无需姓名和时间——只需两个生日，我们就能读取每个人命盘中的格局。',
        },
        {
          number: '02',
          title: 'AI 分析运行',
          body: '引擎在五个契合维度上比对两个命盘，生成免费的关系契合度评分。',
        },
        {
          number: '03',
          title: '获得评分——免费，即时',
          body: '0-100 的契合度评分配以简明英文解析。解锁完整报告以深入了解。',
        },
      ],
    },
    score: {
      eyebrow: '评分解读',
      title: '如何看懂 0-100 契合度评分',
      body: '评分是对两个出生命盘的结构性解读——它衡量格局在哪些地方相互支撑，在哪些地方产生摩擦。它不是性格审判。',
      ranges: [
        { range: '70–100', label: '相得益彰', desc: '命盘在有意义的地方相互增强。这段关系有结构性的支撑。' },
        { range: '50–69', label: '稳定可持', desc: '有一定自然的契合，也有些地方需要用心经营。大多数关系落在此区间。' },
        { range: '30–49', label: '需要关注', desc: '存在明显的摩擦或不对称模式。这不是判决——而是值得探究的信号。' },
        { range: '0–29', label: '挑战较大', desc: '结构性的不匹配造成持续的压力。理解这种模式是第一步。' },
      ],
    },
    fullReport: {
      eyebrow: '完整报告包含',
      title: '免费只是开始',
      body: '免费评分告诉你站在哪里。完整报告告诉你为什么——以及下一步该怎么做。',
      items: [
        '所有五个契合维度的详细拆解',
        '行星相位分析——当前天象正在放大什么',
        '基于你们特定命盘组合的个性化行动建议',
        '时机预测：压力何时可能缓解，机会何时出现',
      ],
      cta: '解锁完整契合报告 — $1.99',
      assurance: '通过 Stripe 安全结账。单次解锁。无需订阅。',
    },
    limitations: {
      title: '本工具的局限性',
      body: '此关系契合测试专为反思和关系洞察设计——不是关系结果的保证性预测。星象契合只是一个维度。真实的关系受沟通、共同价值观、时机和双方努力影响，这些是任何命盘都无法完全涵盖的。请将此解读作为对话起点，而非判决。',
    },
    faq: {
      eyebrow: '常见问题',
      title: '常见问题解答',
      questions: [
        {
          q: '需要提供两个出生日期吗？',
          a: '是的。关系契合解读基于两个出生命盘的对比，所以需要两个日期。出生时辰能让解读更精确，但不是必须的。',
        },
        {
          q: '我的数据会被保存吗？',
          a: '公开页面上不会存储出生日期或关系数据。免费测试仅在会话中运行。详情见隐私政策。',
        },
        {
          q: '免费评分和完整报告有什么区别？',
          a: '免费评分给你一个 0-100 的契合数字和一段概述。完整报告拆解所有五个维度，包含行星运势，并提供具体的行动建议。',
        },
        {
          q: '这是生肖配对测试吗？',
          a: '这是基于八字（四柱）的契合度分析——比生肖更深入。它使用天干、地支和五行平衡，而非仅用生肖属相。',
        },
        {
          q: '这个能预测我们会不会在一起吗？',
          a: '不能。此工具读取命盘中的结构性模式——无法预测人类的选择、外部环境，或双方为关系付出的努力。',
        },
      ],
    },
    finalCta: {
      title: '想看到更完整的图景？',
      primary: '开始免费关系测试',
      secondary: '探索所有关系工具',
    },
    footer: '关系契合解读仅用于反思和沟通，不能替代医疗、法律、金融或危机咨询建议。',
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

export default function FreeRelationshipCompatibilityTestPage() {
  const [language] = useSyncedLanguage('en');
  const t = (en: string, zh: string) => (language === 'zh' ? zh : en);
  const copy = PAGE_COPY[language];
  const faqSchema = buildFaqSchema(copy.faq);

  const HERO_IMG = '/assets/images/hero/tianji-love-couple-red-thread-16x9.png';
  const FINAL_IMG = '/assets/images/hero/tianji-love-moon-pavilion-16x9.png';

  return (
    <>
      <TianjiLoveShell>
        <TianjiLoveHeader
          homeHref="/"
          navItems={[
            { label: copy.nav.loveReading, href: '/love-reading' },
            { label: copy.nav.ask, href: '/ask' },
            { label: copy.nav.draw, href: '/draw' },
            { label: copy.nav.pricing, href: '/pricing' },
            { label: copy.nav.about, href: '/about' },
          ]}
        />

        {/* Hero */}
        <section className="relative z-10 px-5 pt-20 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d8b77b]/64">{copy.hero.eyebrow}</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">{copy.hero.title}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-[#f4d7a3]/72">{copy.hero.body}</p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <TianjiLoveButton href="/love-test" variant="primary">{copy.hero.primary}</TianjiLoveButton>
              <TianjiLoveButton href="/love-reading" variant="secondary">{copy.hero.secondary}</TianjiLoveButton>
            </div>
          </div>
        </section>

        {/* Dimensions */}
        <TianjiLovePanel>
          <TianjiLoveSectionTitle eyebrow={copy.dimensions.eyebrow} title={copy.dimensions.title} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {copy.dimensions.items.map((item) => {
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
        <div id="compatibility-test-ads" className="my-16" />

        {/* How it works */}
        <TianjiLovePanel>
          <TianjiLoveSectionTitle eyebrow={copy.howItWorks.eyebrow} title={copy.howItWorks.title} />
          <div className="mt-10 space-y-8">
            {copy.howItWorks.steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-sm font-medium text-white/60">
                  {step.number}
                </div>
                <div className="pt-2">
                  <h3 className="mb-1 text-base font-medium text-white/90">{step.title}</h3>
                  <p className="text-sm text-white/50">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <TianjiLoveButton href="/love-test" variant="primary">
              {copy.hero.primary}
              <ChevronRight className="h-4 w-4" />
            </TianjiLoveButton>
          </div>
        </TianjiLovePanel>

        {/* Ad placeholder */}
        <div className="my-16" />

        {/* Score explanation */}
        <TianjiLovePanel>
          <TianjiLoveSectionTitle eyebrow={copy.score.eyebrow} title={copy.score.title} />
          <p className="mt-4 text-sm text-white/60">{copy.score.body}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {copy.score.ranges.map((r) => (
              <div
                key={r.range}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5"
              >
                <div className="mb-2 text-xs uppercase tracking-widest text-white/40">{r.range}</div>
                <div className="mb-1 text-sm font-medium text-white/80">{r.label}</div>
                <div className="text-xs text-white/45">{r.desc}</div>
              </div>
            ))}
          </div>
        </TianjiLovePanel>

        {/* Ad placeholder */}
        <div className="my-16" />

        {/* Full report */}
        <TianjiLovePanel>
          <TianjiLoveSectionTitle eyebrow={copy.fullReport.eyebrow} title={copy.fullReport.title} />
          <p className="mt-4 text-sm text-white/60">{copy.fullReport.body}</p>
          <ul className="mt-6 space-y-3">
            {copy.fullReport.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <TianjiLoveButton href="/relationship/new" variant="primary">
              <CreditCard className="h-4 w-4" />
              {copy.fullReport.cta}
            </TianjiLoveButton>
            <p className="mt-3 text-xs text-white/35">{copy.fullReport.assurance}</p>
          </div>
        </TianjiLovePanel>

        {/* Ad placeholder */}
        <div className="my-16" />

        {/* Limitations */}
        <TianjiLovePanel>
          <h2 className="text-sm font-medium uppercase tracking-widest text-white/40">
            {copy.limitations.title}
          </h2>
          <p className="mt-3 text-sm text-white/50">{copy.limitations.body}</p>
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
          imageSrc={FINAL_IMG}
          title={copy.finalCta.title}
          buttonLabel={copy.finalCta.primary}
          href="/love-test"
        />

        {/* Trust */}
        <div className="grid gap-4 sm:grid-cols-3">
          <TianjiLoveTrustCard icon={HeartHandshake} title={t('Private by default', '默认私密')} body={t('No birth dates or relationship data exposed on public pages.', '公开页面上不暴露出生日期或关系数据。')} />
          <TianjiLoveTrustCard icon={Brain} title={t('AI-powered analysis', 'AI 驱动分析')} body={t('Five-dimensional BaZi compatibility model.', '五行八字五维契合模型。')} />
          <TianjiLoveTrustCard icon={CalendarHeart} title={t('Instant free score', '即时免费评分')} body={t('Get your 0–100 score in seconds, no signup required.', '几秒内获得 0-100 评分，无需注册。')} />
        </div>

        <TianjiLoveFooter
          disclaimer={copy.footer}
          links={[
            { label: copy.nav.about, href: '/about' },
            { label: copy.nav.privacy, href: '/privacy' },
          ]}
          homeHref="/"
        />
      </TianjiLoveShell>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
