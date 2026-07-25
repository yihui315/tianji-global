import { redirect } from 'next/navigation';
import { buildRedirectHref } from '@/lib/analytics/redirect-query';

type PageParams = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Localized alias for the canonical love-reading result page.
 *
 * Destination locale is fixed at /en/love-reading/result/[id]. Only the
 * strict UTM whitelist is forwarded; every other key — including `lang`
 * and the raw `id` query — is dropped. The dynamic [id] segment is the
 * ONLY source of truth for the result identity.
 */
export default async function LoveReadingResultAliasPage({ params, searchParams }: PageParams) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  redirect(buildRedirectHref(`/en/love-reading/result/${id}`, query));
}