import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';

type PageParams = {
  params: Promise<{ locale: string }>;
};

type TermsCopy = {
  title: string;
  description: string;
  points: string[];
};

const copy = {
  en: {
    title: 'Terms for reflective relationship guidance',
    description:
      'TianJi Love offers self-reflection and relationship guidance. It does not provide guaranteed predictions or medical, legal, or financial advice.',
    points: [
      'Readings are interpretive tools for reflection and conversation.',
      'Premium access begins only after successful payment confirmation.',
      'Do not use TianJi Love as a substitute for professional advice or emergency support.',
    ],
  },
  'zh-CN': {
    title: '关系自我反思服务条款',
    description: 'TianJi Love 提供自我反思与关系建议，不提供确定性预测，也不提供医疗、法律或财务建议。',
    points: [
      '解读是用于反思与沟通的解释性工具。',
      '付费权益仅在支付确认成功后生效。',
      '请不要把 TianJi Love 当作专业建议或紧急支持的替代品。',
    ],
  },
} satisfies Record<Locale, TermsCopy>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  return buildLocalizedMetadata({
    locale,
    path: '/terms',
    title: locale === 'zh-CN' ? 'TianJi Love 服务条款' : 'TianJi Love Terms',
    description: copy[locale].description,
  });
}

export default async function TermsPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = copy[locale];

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-10 text-white sm:px-8">
      <article className="mx-auto max-w-3xl">
        <Link href={getLocalizedPath(locale, '/')} className="text-sm text-white/58 hover:text-white">
          TianJi Love
        </Link>
        <h1 className="mt-12 font-serif text-4xl leading-tight sm:text-5xl">{t.title}</h1>
        <p className="mt-5 text-lg leading-8 text-white/68">{t.description}</p>
        <ul className="mt-10 space-y-4">
          {t.points.map((point) => (
            <li key={point} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-sm leading-7 text-white/68">
              {point}
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}
