import { notFound, permanentRedirect } from 'next/navigation';
import { isSupportedLocale, locales } from '@/lib/i18n';

type PageParams = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocalizedTermsRedirect({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  permanentRedirect(`/legal/terms?lang=${locale === 'zh-CN' ? 'zh' : 'en'}`);
}
