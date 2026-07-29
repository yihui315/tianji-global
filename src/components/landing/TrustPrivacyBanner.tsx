import { colors, glass, radii } from '@/design-system';

export type TrustPrivacyLocale = 'en' | 'zh-CN';

export interface TrustPrivacyBannerProps {
  /** Locale for the three trust statements. */
  locale: TrustPrivacyLocale;
  /** Optional pre-rendered statement overrides. */
  noAccountLabel?: string;
  shareSafetyLabel?: string;
  analyticsDefaultOffLabel?: string;
  /** Pass-through className for layout positioning. */
  className?: string;
}

const COPY: Record<TrustPrivacyLocale, {
  noAccountLabel: string;
  shareSafetyLabel: string;
  analyticsDefaultOffLabel: string;
}> = {
  en: {
    noAccountLabel: 'No account needed to begin.',
    shareSafetyLabel: 'Birth details are never placed in share links.',
    analyticsDefaultOffLabel: 'Optional analytics is disabled by default.',
  },
  'zh-CN': {
    noAccountLabel: '无需账号即可开始。',
    shareSafetyLabel: '出生资料不会出现在分享链接中。',
    analyticsDefaultOffLabel: '可选分析默认关闭。',
  },
};

/**
 * Pure-server trust and privacy strip for the TianJi Love landing page.
 *
 * Each statement is grounded in current product behavior or the published
 * privacy policy. Keep this component free of activity counts, social-proof
 * claims, refresh timestamps, analytics calls, network requests, and env reads.
 */
export function TrustPrivacyBanner({
  locale,
  noAccountLabel,
  shareSafetyLabel,
  analyticsDefaultOffLabel,
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
          <span>{analyticsDefaultOffLabel ?? t.analyticsDefaultOffLabel}</span>
        </li>
      </ul>
    </aside>
  );
}

export default TrustPrivacyBanner;
