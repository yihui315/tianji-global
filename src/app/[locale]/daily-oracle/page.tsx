import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';
import { Sparkles } from 'lucide-react';

type PageParams = { params: Promise<{ locale: string }> };

const copy = {
  en: {
    title: 'Daily Love Oracle',
    subtitle: 'Draw your card of the day. A single insight to guide your heart today.',
    drawCta: 'Draw My Daily Card',
    dailyTitle: 'Your Daily Love Card',
    description: 'Each day brings a unique energy. Receive guidance tailored to today\'s love vibration.',
    cta: 'Get Your Daily Card',
    subscribe: 'Get daily guidance — Subscribe for $9.99/mo',
    howItWorks: 'How it works',
    steps: [
      'Draw one card from the deck',
      'Receive your daily love insight',
      'Get guidance for today\'s decisions',
    ],
    cardBack: 'Tap to reveal your card',
  },
  'zh-CN': {
    title: '每日爱情签',
    subtitle: '抽取今日卡牌，获得专属爱情指引。',
    drawCta: '抽取今日爱情签',
    dailyTitle: '今日爱情卡',
    description: '每一天都有独特的能量。接收专属于今天的爱情洞察。',
    cta: '获取今日卡牌',
    subscribe: '每日获得指引 — 订阅 $9.99/月',
    howItWorks: '如何使用',
    steps: ['从牌组中抽取一张卡', '接收今日爱情洞察', '获得今日决策指引'],
    cardBack: '点击揭示你的卡牌',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};
  return buildLocalizedMetadata({
    locale,
    path: '/daily-oracle',
    title: copy[locale as keyof typeof copy].title,
    description: copy[locale as keyof typeof copy].subtitle,
  });
}

export default async function DailyOraclePage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = copy[locale as keyof typeof copy];

  return (
    <main className="min-h-screen bg-[#050508] text-white">
      {/* Hero */}
      <section className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/08 px-4 py-2">
          <Sparkles className="h-4 w-4 text-[#d8b77b]" />
          <span className="text-xs font-medium tracking-widest text-[#d8b77b]">DAILY LOVE ORACLE</span>
        </div>
        <h1 className="font-serif text-5xl leading-tight text-[#ffe3b4] sm:text-6xl">{t.title}</h1>
        <p className="mt-6 text-lg text-white/62">{t.subtitle}</p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href={getLocalizedPath(locale, '/draw')}
            className="inline-flex items-center gap-2 rounded-full bg-[rgba(212,175,119)] px-8 py-4 text-sm font-semibold text-black transition hover:bg-[rgba(232,195,139)]"
          >
            {t.drawCta}
          </Link>
          <p className="text-xs text-white/38">{t.cardBack}</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <h2 className="mb-10 text-center font-serif text-2xl text-[#ffe3b4]">{t.howItWorks}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {t.steps.map((step, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
              <div className="mb-4 text-3xl font-semibold text-[rgba(212,175,119)]">{i + 1}</div>
              <p className="text-sm text-white/62">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
        <div className="rounded-3xl border border-[rgba(212,175,119,0.3)] bg-[rgba(212,175,119,0.06)] p-10">
          <h2 className="font-serif text-3xl text-[#ffe3b4]">{t.dailyTitle}</h2>
          <p className="mt-4 text-white/62">{t.description}</p>
          <Link
            href={getLocalizedPath(locale, '/pricing')}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,119,0.5)] px-8 py-4 text-sm font-semibold text-[#f5d8aa] transition hover:border-[#d8b77b]"
          >
            {t.subscribe}
          </Link>
        </div>
      </section>

      {/* Back home */}
      <section className="pb-20 text-center">
        <Link href={getLocalizedPath(locale, '/')} className="text-sm text-white/38 hover:text-white/62">
          ← Back to Tianji Love
        </Link>
      </section>
    </main>
  );
}