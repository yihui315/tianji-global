import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';
import { LOVE_PREMIUM_REPORT_PRICE } from '@/lib/love-reading/revenue-contract';

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

const LOVE_PREMIUM_DISPLAY_PRICE = `${LOVE_PREMIUM_REPORT_PRICE.display} CNY`;

const copy = {
  en: {
    title: 'Simple pricing for private love readings',
    description:
      'Start free, then unlock deeper self-reflection only when the reading feels useful. Paid access adds depth, not certainty.',
    cta: 'Begin free',
    plans: [
      {
        name: 'Free preview',
        price: '$0',
        description: 'A private first signal before any checkout, payment, or subscription decision.',
      },
      {
        name: 'Ask one-question unlock',
        price: '$1.99 USD',
        description: 'A one-time deeper answer for one focused relationship question after a private preview.',
      },
      {
        name: 'Draw Timing unlock',
        price: '$2.99 USD',
        description: 'A one-time three-card timing reading for reflection, not guaranteed prediction.',
      },
      {
        name: 'Love Premium Relationship Report',
        price: LOVE_PREMIUM_DISPLAY_PRICE,
        description:
          'The canonical one-time premium report for saved Love Reading and Relationship results. Checkout remains gated until test-mode smoke passes.',
      },
    ],
  },
  'zh-CN': {
    title: '现代关系解读的清晰价格',
    description: '先免费预览；当一份解读真的值得深入时，再选择单次解锁。付费增加的是深度，不是确定结果。',
    cta: '先免费开始',
    plans: [
      {
        name: '免费预览',
        price: '$0',
        description: '先获得一段私密关系信号，再决定是否进入任何结账、付费或订阅路径。',
      },
      {
        name: 'Ask 单题解锁',
        price: '$1.99 USD',
        description: '在私密预览之后，单次解锁一个更深入的关系问题回答。',
      },
      {
        name: '时机抽牌解锁',
        price: '$2.99 USD',
        description: '单次解锁三张时机牌的完整解读，用于反思，不用于保证预测。',
      },
      {
        name: 'Love Premium 关系报告',
        price: LOVE_PREMIUM_DISPLAY_PRICE,
        description:
          '面向已保存 Love Reading 或 Relationship 结果的 canonical 单次付费报告。test-mode smoke 通过前，结账仍保持门禁。',
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
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
