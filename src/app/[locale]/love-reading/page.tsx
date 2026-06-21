import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';
import { MessageCircleHeart, Sparkles, Timer, ShieldCheck } from 'lucide-react';

type PageParams = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  const title = locale === 'zh-CN' ? '关系解读 — Tianji Love' : 'Love Reading — Tianji Love';
  const description =
    locale === 'zh-CN'
      ? '探索你的情感命运。输入你和对方的生日，获取深度的关系兼容性解读。免费预览完整报告。'
      : 'Explore your love destiny. Enter you and your partner\'s birth dates for deep compatibility insights. Free preview available.';

  return buildLocalizedMetadata({ locale, path: '/love-reading', title, description });
}

const features = {
  en: [
    {
      icon: MessageCircleHeart,
      title: 'Deep Compatibility Analysis',
      desc: 'Five dimensions: attraction, communication, conflict, rhythm, and long-term alignment.',
    },
    {
      icon: Sparkles,
      title: 'Relationship Archetype',
      desc: 'Discover your relationship pattern — from Romantic Dreamers to Steady Companions.',
    },
    {
      icon: Timer,
      title: '30-Day Timing Forecast',
      desc: 'Know the optimal windows for connection, communication, and key decisions.',
    },
    {
      icon: ShieldCheck,
      title: 'Privacy Protected',
      desc: 'Birth dates only. No names, locations, or personal questions stored.',
    },
  ],
  zh: [
    {
      icon: MessageCircleHeart,
      title: '深度兼容性分析',
      desc: '五个维度：吸引力、沟通、冲突、节奏和长期契合。',
    },
    {
      icon: Sparkles,
      title: '关系原型',
      desc: '发现你们的关系模式 — 从浪漫梦想家到稳定伙伴。',
    },
    {
      icon: Timer,
      title: '30天时机预测',
      desc: '了解连接、沟通和关键决策的最佳窗口期。',
    },
    {
      icon: ShieldCheck,
      title: '隐私保护',
      desc: '仅使用生日信息。不存储姓名、位置或个人问题。',
    },
  ],
};

const ctas = {
  en: {
    primary: 'Start Your Free Reading',
    secondary: 'See sample report',
    note: 'Free preview includes: overall score, archetype, top 2 dimensions, and shareable summary.',
  },
  zh: {
    primary: '开始免费解读',
    secondary: '查看示例报告',
    note: '免费预览包含：综合评分、原型、两个核心维度、以及可分享摘要。',
  },
};

export default async function LoveReadingPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const isZh = locale === 'zh-CN';
  const copyLocale = isZh ? 'zh' : 'en';
  const t = features[copyLocale];
  const c = ctas[copyLocale];

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
            <Sparkles className="h-4 w-4" />
            {isZh ? '关系解读' : 'Love Reading'}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#ffe3b4] sm:text-5xl">
            {isZh ? '探索你们的关系命运' : 'Explore Your Relationship Destiny'}
          </h1>
          <p className="text-lg text-[#f4d7a3]/70">
            {isZh
              ? '输入你们双方的生日，获取深度的关系兼容性和时机分析。'
              : 'Enter both birth dates for deep compatibility and timing insights.'}
          </p>
        </div>

        {/* CTA Card */}
        <div className="mb-10 rounded-2xl border border-[#d8b77b]/24 bg-gradient-to-b from-[#1a1209] to-[#0d0b07] p-8 text-center">
          <h2 className="mb-2 text-2xl font-semibold text-[#ffe3b4]">
            {isZh ? '开始你们的关系解读' : 'Start Your Love Reading'}
          </h2>
          <p className="mb-6 text-sm text-[#f4d7a3]/60">{c.note}</p>
          <Link
            href={getLocalizedPath(locale, '/relationship')}
            className="inline-block rounded-full bg-[#ff6c73] px-8 py-4 text-base font-semibold text-white transition hover:bg-[#ff6c73]/90"
          >
            {c.primary}
          </Link>
        </div>

        {/* Features */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2">
          {t.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-[#d8b77b]/16 bg-[#ffffff]/04 p-5"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6c73]/14 text-[#ff9c8b]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-[#ffe3b4]">{title}</h3>
              <p className="text-sm text-[#f4d7a3]/60">{desc}</p>
            </div>
          ))}
        </div>

        {/* Sample Report Link */}
        <div className="text-center">
          <p className="mb-4 text-sm text-[#f4d7a3]/50">
            {isZh ? '想先看看报告的样子？' : 'Want to see what a report looks like first?'}
          </p>
          <Link
            href={getLocalizedPath(locale, '/relationship')}
            className="text-sm text-[#d8b77b] underline hover:text-[#f4d7a3]"
          >
            {c.secondary} →
          </Link>
        </div>

        {/* Trust footer */}
        <div className="mt-12 rounded-xl border border-[#d8b77b]/12 bg-[#ffffff]/03 p-5">
          <p className="mb-2 text-center text-xs uppercase tracking-widest text-[#d8b77b]/60">
            {isZh ? '隐私声明' : 'Privacy'}
          </p>
          <p className="text-center text-xs text-[#f4d7a3]/40">
            {isZh
              ? '我们仅使用出生日期进行分析。不存储出生时辰、出生地点或具体问题。所有数据加密存储，可随时删除。'
              : 'We use only birth dates for analysis. No birth times, locations, or private questions stored. All data encrypted at rest, deletable on request.'}
          </p>
        </div>
      </div>
    </main>
  );
}
