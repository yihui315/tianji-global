import { colors, glass, radii } from '@/design-system';

export type SocialProofLocale = 'en' | 'zh-CN';

export interface SocialProofBannerProps {
  /**
   * Locale for headline + supporting text. Strings are pulled from the landing
   * `copy` object so the banner stays in lockstep with the rest of the hero.
   */
  locale: SocialProofLocale;
  /**
   * Optional pre-rendered statement. When omitted, the banner defaults to the
   * static phrasing defined per locale below.
   */
  message?: string;
  /**
   * Optional pre-rendered supporting line.
   */
  footnote?: string;
  /**
   * Optional ISO date string (YYYY-MM-DD) shown as the last refreshed stamp.
   * When omitted, we render a stable static stamp so the banner stays
   * truthful without scraping any analytics pipeline.
   */
  refreshedAt?: string;
  /**
   * Pass-through className for layout tests / future positioning tweaks.
   */
  className?: string;
}

const COPY: Record<SocialProofLocale, { message: string; footnote: string; refreshedLabel: string }> = {
  en: {
    message: 'Private relationship readings are being shared with care every day.',
    footnote: 'Numbers below are static landmarks, refreshed monthly by the editorial team.',
    refreshedLabel: 'Last refreshed',
  },
  'zh-CN': {
    message: '每天都有新的私密关系解读被谨慎地分享出去。',
    footnote: '下方数字为编辑团队每月更新的静态标记，非实时统计。',
    refreshedLabel: '最近更新',
  },
};

const STATIC_REFRESHED_AT = '2026-07-29';

/**
 * SocialProofBanner — pure-server social-proof strip rendered above the
 * 3-step explainer on the Tianji Love landing.
 *
 * Design rules (do NOT widen scope):
 * - No browser-only APIs, no fetch, no env reads, no analytics calls.
 * - No birth details, no question content, no payment data ever appears here.
 * - Static copy only. Refresh cadence is editorial, not realtime.
 */
export function SocialProofBanner({
  locale,
  message,
  footnote,
  refreshedAt,
  className,
}: SocialProofBannerProps) {
  const t = COPY[locale];
  const stamp = (refreshedAt ?? STATIC_REFRESHED_AT).trim();

  return (
    <aside
      data-testid="social-proof-banner"
      data-locale={locale}
      aria-label={locale === 'zh-CN' ? '社会证据条' : 'Social proof strip'}
      className={[
        'rounded-2xl border px-4 py-3',
        'border-[rgba(212,175,119,0.24)]',
        'bg-[rgba(6,11,22,0.6)] backdrop-blur-sm',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        // Match the hero "soft" glass surface used elsewhere on the page,
        // but keep radius tighter than radii.badge so it reads as a strip.
        borderRadius: radii.cardLg,
        boxShadow: glass.card.boxShadow,
      }}
    >
      <p
        className="text-sm font-medium leading-snug"
        style={{ color: colors.textPrimary }}
      >
        {message ?? t.message}
      </p>
      <p
        className="mt-1 text-[11px] leading-relaxed"
        style={{ color: colors.textTertiary }}
      >
        <span>{footnote ?? t.footnote}</span>
        <span className="mx-2 opacity-60">·</span>
        <span>
          {t.refreshedLabel} {stamp}
        </span>
      </p>
    </aside>
  );
}

export default SocialProofBanner;
