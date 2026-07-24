import { redirect } from 'next/navigation';
import { buildRedirectHref } from '@/lib/analytics/redirect-query';

type PageParams = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Localized alias for the canonical love-reading entry funnel.
 *
 * Destination locale is fixed at /en/love-reading to keep the SEO
 * canonical surface singular. Only the strict UTM whitelist
 * (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`)
 * is forwarded; every other key — including `lang` — is dropped.
 */
export default async function LoveReadingAliasPage({ searchParams }: PageParams) {
  const query = searchParams ? await searchParams : {};
  redirect(buildRedirectHref('/en/love-reading', query));
}