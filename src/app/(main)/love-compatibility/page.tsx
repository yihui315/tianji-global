import { redirect } from 'next/navigation';
import { buildRedirectHref } from '@/lib/analytics/redirect-query';

type PageParams = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Bare alias for the canonical relationship-compatibility flow.
 *
 * Destination is fixed at /relationship/new. Only the strict UTM
 * whitelist (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`,
 * `utm_term`) is forwarded; every other key — including `lang`, sensitive
 * user data, or arbitrary input — is dropped by `redirect-query`.
 */
export default async function LoveCompatibilityAliasPage({ searchParams }: PageParams) {
  const query = searchParams ? await searchParams : {};
  redirect(buildRedirectHref('/relationship/new', query));
}