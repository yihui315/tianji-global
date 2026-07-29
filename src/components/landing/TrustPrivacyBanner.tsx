import { colors, glass, radii } from '@/design-system';

export type TrustPrivacyLocale = 'en' | 'zh-CN';

export interface TrustPrivacyBannerProps {
  /**
   * Locale for the three trust statements. Strings are pulled from the landing
   * `copy` object so the banner stays in lockstep with the rest of the hero.
   */
  locale: TrustPrivacyLocale;
  /**
   * Optional pre-rendered statement overrides. When omitted, the banner
   * defaults to the three verifiable privacy / account / share-safety facts
   * defined per locale below.
   */
  noAccountLabel?: string;
  shareSafetyLabel?: string;
  noResaleLabel?: string;
  /** Pass-through className for layout tests / future positioning tweaks. */
  className?: string;
}

const COPY: Record<TrustPrivacyLocale, {
  noAccountLabel: string;
  shareSafetyLabel: string;
  noResaleLabel: string;
}> = {
  en: {
    noAccountLabel: 'No account needed to begin.',
    shareSafetyLabel: 'Birth details are never placed in share links.',
    noResaleLabel: 'We do not sell or trade your answers.',
  },
  'zh-CN': {
    noAccountLabel: '无需账号即可开始。',
    shareSafetyLabel: '出生资料不会出现在分享链接中。',
    noResaleLabel: '我们不会出售或交换你的回答。',
  },
};

/**
 * TrustPrivacyBanner — pure-server trust + privacy strip rendered above the
 * 3-step explainer on the Tianji Love landing.
 *
 * Each statement is a hard, verifiable product fact:
 *  1. No account is required to start (the gating login is for paid reports only).
 *  2. Birth details never appear in share URLs (matches the existing footnote
 *     in the page copy and is enforced server-side).
 *  3. We do not sell or trade user answers (covers resale-of-data assertions
 *     in the privacy policy).
 *
 * Design rules (do NOT widen scope):
 *  - No fabricated "social proof" or "X readers today" framings.
 *  - No refresh-stamp / cadence language; the facts above are static product
 *    properties, not editorial updates.
 *  - No fabricated numeric claims, percentages, or activity counts.
 *  - No analytics call sites; no fetch; no env reads.
 */
export function TrustPrivacyBanner({
  locale,
  noAccountLabel,
  shareSafetyLabel,
  noResaleLabel,
  className,
}: TrustPrivacyBannerProps) {
  const t = COPY[locale];

  return (
    <aside
      data-testid="trust-privacy-banner"
      data-locale={locale}
      aria-label={locale === 'zh-CN' ? '信任与隐私条' : 'Trust and privacy strip'}
      className={[
        'rounded-2xl border px-4 py-3',
        'border-[rgba(212,175,119,0.24)]',
        'bg-[rgba(6,11,22,0.6)] backdrop-blur-sm',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        borderRadius: radii.cardLg,
        boxShadow: glass.card.boxShadow,
      }}
    >
      <ul className="flex flex-col gap-1 text-sm leading-snug" style={{ color: colors.textPrimary }}>
        <li className="flex items-baseline gap-2">
          <span aria-hidden="true" className="text-[rgb(252,230,191)]">·</span>
          <span>{noAccountLabel ?? t.noAccountLabel}</span>
        </li>
        <li className="flex items-baseline gap-2">
          <span aria-hidden="true" className="text-[rgb(252,230,191)]">·</span>
          <span>{shareSafetyLabel ?? t.shareSafetyLabel}</span>
        </li>
        <li className="flex items-baseline gap-2">
          <span aria-hidden="true" className="text-[rgb(252,230,191)]">·</span>
          <span>{noResaleLabel ?? t.noResaleLabel}</span>
        </li>
      </ul>
    </aside>
  );
}

export default TrustPrivacyBanner;
