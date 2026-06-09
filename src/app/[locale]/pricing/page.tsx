import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';

type PageParams = {
  params: Promise<{ locale: string }>;
};

type PricingCopy = {
  title: string;
  description: string;
  cta: string;
  headline: string;
  subheadline: string;
  plans: Array<{
    name: string;
    price: string;
    description: string;
    badge?: string;
  }>;
};

const copy = {
  en: {
    title: 'Simple one-time pricing for modern love readings',
    description:
      'Start free, then unlock deeper self-reflection and relationship guidance only when it feels useful.',
    cta: 'Begin free',
    headline: 'Start with one private question. No subscription required.',
    subheadline: 'Get clarity about your love situation instantly. Upgrade only when you need deeper guidance.',
    plans: [
      {
        name: 'Free Love Signal Check',
        price: 'Free',
        description: 'Enter your situation. Get 3 love signals free. No payment required.',
      },
      {
        name: 'One Private Love Question',
        price: '$1.99',
        description: 'Ask one private love question. Instant clarity on what they feel, what is blocking your connection, and what to do next.',
        badge: 'Launch',
      },
      {
        name: 'Deep Relationship Report',
        price: '$19.99',
        description: 'A full private love reading: emotional analysis, partner feelings, blockage, timing, 7-day action plan, red flags, PDF download.',
      },
      {
        name: 'Monthly Love Guidance',
        price: '$9.99/month',
        description: '10 readings/month, Daily Love Oracle, saved history, PDF export, priority interpretations.',
        badge: 'Popular',
      },
      {
        name: 'Annual Plan',
        price: '$99.99/year',
        description: 'Best value. 12 months of guidance, all monthly features, priority support.',
      },
    ],
  },
  'zh-CN': {
    title: '面向现代关系洞察的一次性价格',
    description: '先免费体验，在真正需要时再解锁更深层的自我反思与关系建议。',
    cta: '先免费开始',
    headline: '从一个私人问题开始。无需订阅。',
    subheadline: '立即了解你的感情状况。只在需要更深层指导时升级。',
    plans: [
      {
        name: '免费爱情信号检测',
        price: '免费',
        description: '输入你的情况。获得3个免费爱情信号。无需付款。',
      },
      {
        name: '一个私人爱情问题',
        price: '¥9.9',
        description: '提出一个私人爱情问题。立即了解对方的感受、阻碍你们连接的原因，以及下一步该怎么做。',
        badge: '首发优惠',
      },
      {
        name: '深度关系报告',
        price: '¥149',
        description: '完整的私人爱情解读：情感分析、伴侣感受、阻碍、时机、7天行动计划、红色警报、PDF下载。',
      },
      {
        name: '月度爱情指导',
        price: '¥69/月',
        description: '每月10次解读、每日爱情神谕、保存历史、PDF导出、优先解读。',
        badge: '热门',
      },
      {
        name: '年度计划',
        price: '¥699/年',
        description: '最佳价值。12个月指导，包含所有月度功能、优先支持。',
      },
    ],
  },
} satisfies Record<Locale, PricingCopy>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  return buildLocalizedMetadata({
    locale,
    path: '/pricing',
    title: locale === 'zh-CN' ? 'TianJi Love 价格' : 'TianJi Love Pricing',
    description: copy[locale].description,
  });
}

export default async function PricingPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = copy[locale];

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href={getLocalizedPath(locale, '/')} className="text-sm text-white/58 hover:text-white">
          TianJi Love
        </Link>
        <section className="py-14">
          <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">{t.headline}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">{t.subheadline}</p>
          <Link
            href={getLocalizedPath(locale, '/love-reading/result/demo')}
            className="mt-8 inline-flex rounded-full bg-[rgb(212,175,119)] px-6 py-3 text-sm font-semibold text-black"
          >
            {t.cta}
          </Link>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {t.plans.map(({ name, price, description, badge }) => (
            <article key={name} className="rounded-3xl border border-white/10 bg-white/[0.055] p-6">
              {badge && (
                <span className="inline-block rounded-full bg-[rgb(212,175,119)] px-2 py-0.5 text-xs font-semibold text-black">
                  {badge}
                </span>
              )}
              <h2 className="mt-3 text-xl font-semibold text-white">{name}</h2>
              <p className="mt-4 font-serif text-4xl text-[rgb(252,230,191)]">{price}</p>
              <p className="mt-5 text-sm leading-7 text-white/62">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
