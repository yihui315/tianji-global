import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { isSupportedLocale, locales } from '@/lib/i18n';

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  return buildLocalizedMetadata({
    locale,
    path: '/',
    title: locale === 'zh-CN' ? 'TianJi Love | 私密关系洞察' : 'TianJi Love | Private Cosmic Love Reading',
    description:
      locale === 'zh-CN'
        ? '通过私密的天机关系洞察，理解你的情感模式、关系节奏与相遇时机。'
        : 'Discover romantic patterns, emotional timing, and relationship compatibility through a private cosmic reading.',
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  return (
    <section lang={locale} data-locale={locale} className="min-h-screen bg-[#050508] text-white">
      {children}
    </section>
  );
}
