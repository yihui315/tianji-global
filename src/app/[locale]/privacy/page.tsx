import { notFound, permanentRedirect } from 'next/navigation';
import { buildRedirectHref } from '@/lib/analytics/redirect-query';
import { isSupportedLocale, locales } from '@/lib/i18n';

type PageParams = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocalizedPrivacyRedirect({ params, searchParams }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  // Destination locale is fixed at /legal/privacy?lang=<locale>. Only the
  // strict UTM whitelist is forwarded alongside the canonical lang hint;
  // every other key is dropped by `redirect-query`.
  const query = searchParams ? await searchParams : {};
  const lang = locale === 'zh-CN' ? 'zh' : 'en';
  permanentRedirect(buildRedirectHref(`/legal/privacy?lang=${lang}`, query));
}