import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';
import { MessageSquare, Sparkles, Zap, ShieldCheck } from 'lucide-react';

type PageParams = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  const title = locale === 'zh-CN' ? '提问 — Tianji Love' : 'Ask — Tianji Love';
  const description =
    locale === 'zh-CN'
      ? '向 AI 占卜师提问任何关于爱情、关系和时机的问题。$1.99/次，3分钟内获得深度解答。'
      : 'Ask the AI divination master anything about love, relationships, and timing. $1.99 per question, deep answers in 3 minutes.';

  return buildLocalizedMetadata({ locale, path: '/ask', title, description });
}

const features = {
  en: [
    {
      icon: MessageSquare,
      title: 'Any Love Question',
      desc: 'Ex relationships, current partner, timing, soulmate, twin flame, karmic patterns.',
    },
    {
      icon: Sparkles,
      title: 'AI Divination Master',
      desc: 'Combines tarot cards, bazi, and relationship archetypes for nuanced guidance.',
    },
    {
      icon: Zap,
      title: '3-Minute Answers',
      desc: 'Receive a detailed, thoughtful response within minutes of asking.',
    },
    {
      icon: ShieldCheck,
      title: 'Private & Secure',
      desc: 'No account required for free preview. Payment encrypted via Stripe.',
    },
  ],
  zh: [
    {
      icon: MessageSquare,
      title: '任何爱情问题',
      desc: '前任关系、现任伴侣、时机、灵魂伴侣、双生火焰、业力模式。',
    },
    {
      icon: Sparkles,
      title: 'AI 占卜师',
      desc: '结合塔罗牌、八字和关系原型，提供细致的指导。',
    },
    {
      icon: Zap,
      title: '3分钟解答',
      desc: '提问后几分钟内收到详细、有深度的回复。',
    },
    {
      icon: ShieldCheck,
      title: '隐私安全',
      desc: '免费预览无需账户。付款通过 Stripe 加密。',
    },
  ],
};

const pricing = {
  en: { price: '$1.99', unit: 'per question', note: 'Free preview of first answer' },
  zh: { price: '¥15', unit: '每次', note: '首次回答免费预览' },
};

export default async function AskPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const isZh = locale === 'zh-CN';
  const copyLocale = isZh ? 'zh' : 'en';
  const t = features[copyLocale];
  const p = pricing[copyLocale];

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link
          href={getLocalizedPath(locale, '/')}
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/58 hover:text-white"
        >
          ← {isZh ? '返回首页' : 'Back to home'}
        </Link>

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/8 px-4 py-2 text-sm text-[#f4d7a3]">
            <MessageSquare className="h-4 w-4" />
            {isZh ? '提问' : 'Ask'}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#ffe3b4] sm:text-5xl">
            {isZh ? '向 AI 占卜师提问' : 'Ask the AI Divination Master'}
          </h1>
          <p className="text-lg text-[#f4d7a3]/70">
            {isZh
              ? '任何关于爱情和关系的问题，3分钟内获得深度解答。'
              : 'Any question about love and relationships — deep answers in 3 minutes.'}
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-10 rounded-2xl border border-[#d8b77b]/24 bg-gradient-to-b from-[#1a1209] to-[#0d0b07] p-8 text-center">
          <div className="mb-2 text-5xl font-bold text-[#ffe3b4]">{p.price}</div>
          <div className="mb-1 text-sm text-[#f4d7a3]/60">{p.unit}</div>
          <div className="mb-6 text-xs text-[#f4d7a3]/40">{p.note}</div>
          <Link
            href={getLocalizedPath(locale, '/ask')}
            className="inline-block rounded-full bg-[#ff6c73] px-8 py-4 text-base font-semibold text-white transition hover:bg-[#ff6c73]/90"
          >
            {isZh ? '开始提问' : 'Ask Your Question'}
          </Link>
        </div>

        {/* Sample Questions */}
        <div className="mb-10">
          <h2 className="mb-4 text-center text-sm uppercase tracking-widest text-[#d8b77b]/60">
            {isZh ? '可以问什么问题？' : 'Example questions'}
          </h2>
          <div className="grid gap-3">
            {[
              isZh ? '我和他的关系最终会走向哪里？' : 'Where is my relationship with him going?',
              isZh ? '今年我会遇到我的灵魂伴侣吗？' : 'Will I meet my soulmate this year?',
              isZh ? '为什么我总是吸引不适合的人？' : 'Why do I always attract the wrong people?',
              isZh ? '我应该给前任发消息吗？' : 'Should I text my ex?',
              isZh ? '我和她之间有业力连接吗？' : 'Is there a karmic connection between us?',
            ].map((q) => (
              <div
                key={q}
                className="rounded-lg border border-[#d8b77b]/12 bg-[#ffffff]/04 px-4 py-3 text-sm text-[#f4d7a3]/80"
              >
                {q}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2">
          {t.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-[#d8b77b]/16 bg-[#ffffff]/04 p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6c73]/14 text-[#ff9c8b]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-[#ffe3b4]">{title}</h3>
              <p className="text-sm text-[#f4d7a3]/60">{desc}</p>
            </div>
          ))}
        </div>

        {/* Trust */}
        <div className="mt-8 rounded-xl border border-[#d8b77b]/12 bg-[#ffffff]/03 p-5">
          <p className="mb-2 text-center text-xs uppercase tracking-widest text-[#d8b77b]/60">
            {isZh ? '安全支付' : 'Secure Payment'}
          </p>
          <p className="text-center text-xs text-[#f4d7a3]/40">
            {isZh
              ? '所有支付通过 Stripe 处理。我们不存储信用卡信息。'
              : 'All payments processed by Stripe. We never store your credit card details.'}
          </p>
        </div>
      </div>
    </main>
  );
}
