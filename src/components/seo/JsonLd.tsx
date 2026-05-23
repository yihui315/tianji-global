/**
 * JsonLd — Server component helper for Schema.org JSON-LD payloads.
 *
 * Render inside any layout or page (server or client) to inject a
 * <script type="application/ld+json"> tag. Multiple JsonLd components
 * may coexist in the same tree; Google reads each independently.
 *
 * NOTE: Always serialize trusted, statically-known data only. The `<`
 * escape below guards against accidental script-tag escapes inside
 * string values (e.g. user-supplied descriptions in the future).
 */
export interface JsonLdProps {
  /** A Schema.org payload. Must be JSON-serializable. */
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/**
 * Stable site-wide identifiers. Centralised here so updates to the
 * canonical URL or brand name only need to change in one place.
 */
export const SITE = {
  url: 'https://tianji.love',
  name: 'Tianji Love',
  altName: '天机爱',
  logo: 'https://tianji.love/assets/images/brand/tianji-love-compass-mark.png',
  contactEmail: 'hello@tianji.love',
  privacyEmail: 'privacy@tianji.love',
  description:
    'AI relationship reading for compatibility, love timing, one-question clarity, and three-card relationship insight. Bilingual (zh / en).',
  sameAs: [] as string[], // social profiles can be added later
};

/**
 * Build a Schema.org BreadcrumbList payload for a single-level page
 * (Home → Module). Pass the module name in both languages, the slug,
 * and we'll wire the URLs back to SITE.url for you.
 *
 * Output is intentionally bilingual via `name` joined with " | " so a
 * single payload covers both audiences without duplicate scripts.
 */
export function buildBreadcrumb(
  segments: Array<{ name: string; path: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((segment, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: segment.name,
      item: `${SITE.url}${segment.path}`,
    })),
  };
}
