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
  plans: Array<{
    name: string;
    price: string;
    description: string;
  }>;
};

const copy = {
  en: {
    title: 'Simple one-time pricing for modern love readings',
    description:
      'Start free, then unlock deeper self-reflection and relationship guidance only when it feels useful.',
    cta: 'Begin free',
    plans: [
      {
        name: 'Free preview',
        price: '$0',
        description: 'Start with a private relationship signal before any payment.',
      },
      {
        name: 'Love Premium report',
        price: '¥19.9',
        description: 'Unlock the complete Love Reading report as a one-time private upgrade.',
      },
      {
        name: 'Ask one-question unlock',
        price: '$1.99',
        description: 'Unlock one deeper relationship answer with practical next steps.',
      },
      {
        name: 'Draw Timing unlock',
        price: '$2.99',
        description: 'Unlock the full three-card timing reading as reflection, not certainty.',
      },
    ],
  },
  'zh-CN': {
    title: '面向现代关系洞察的一次性价格',
    description: '先免费体验，在真正需要时再解锁更深层的自我反思与关系建议。',
    cta: '先免费开始',
    plans: [
      {
        name: '免费预览',
        price: '$0',
        description: '先获得一段私密关系信号，再决定是否继续。',
      },
      {
        name: 'Love Premium 完整报告',
        price: '¥19.9',
        description: '单次解锁完整爱情报告，保留更深入的关系模式、时机和下一步建议。',
      },
      {
        name: 'Ask 单题解锁',
        price: '$1.99',
        description: '解锁一个更深入的爱情问题回答，包含可执行的下一步。',
      },
      {
        name: '时机抽牌解锁',
        price: '$2.99',
        description: '解锁完整三张时机牌解读，用作关系反思，而不是确定预言。',
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
          <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">{t.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">{t.description}</p>
          <Link
            href={getLocalizedPath(locale, '/love-reading/result/demo')}
            className="mt-8 inline-flex rounded-full bg-[rgb(212,175,119)] px-6 py-3 text-sm font-semibold text-black"
          >
            {t.cta}
          </Link>
        </section>
        <section className="grid gap-4 md:grid-cols-4">
          {t.plans.map(({ name, price, description }) => (
            <article key={name} className="rounded-3xl border border-white/10 bg-white/[0.055] p-6">
              <h2 className="text-xl font-semibold text-white">{name}</h2>
              <p className="mt-4 font-serif text-4xl text-[rgb(252,230,191)]">{price}</p>
              <p className="mt-5 text-sm leading-7 text-white/62">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
