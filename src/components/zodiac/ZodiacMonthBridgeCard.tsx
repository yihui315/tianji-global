'use client';

import { useMemo, useState } from 'react';
import {
  MONTH_LABELS_EN,
  MONTH_LABELS_ZH,
  type ZodiacPreviewLocale,
  buildZodiacMonthBridge,
} from './zodiac-month-preview';

export interface ZodiacMonthBridgeCardProps {
  locale: ZodiacPreviewLocale;
  /** Pre-rendered eyebrow title (already localized server-side). */
  eyebrow: string;
  /** Pre-rendered body intro (already localized server-side). */
  intro: string;
  /** Pre-rendered prompt copy above the dropdown (already localized). */
  prompt: string;
  /** Pre-rendered placeholder shown before the user picks a month. */
  placeholder: string;
  /**
   * Pre-rendered label rendered just above the per-sign reflections
   * (already localized, e.g. "Both readings hold for your month.").
   */
  reflectionsLabel: string;
  /** Pre-rendered CTA label (already localized). */
  ctaLabel: string;
  /** CTA href used as `<Link>` target when the user opts in. */
  ctaHref: string;
}

/**
 * ZodiacMonthBridgeCard — interactive month picker that renders a deterministic
 * bridge reflection for the chosen month. Client component on purpose: it
 * owns ephemeral form state.
 *
 * Privacy / honesty posture:
 *  - No fetch, no analytics, no server round-trip.
 *  - No birth year, birth time, birth place is ever collected.
 *  - The chosen month stays in local React state and is not transmitted.
 *  - The result frame is *bridge*, not *reading*: it presents the two
 *    Western zodiac signs that straddle the cusp inside that month, and
 *    it explicitly states that the day (which we never ask for) is
 *    what would determine the side. We never claim a specific sign for
 *    the visitor.
 */
export function ZodiacMonthBridgeCard({
  locale,
  eyebrow,
  intro,
  prompt,
  placeholder,
  reflectionsLabel,
  ctaLabel,
  ctaHref,
}: ZodiacMonthBridgeCardProps) {
  const months = locale === 'en' ? MONTH_LABELS_EN : MONTH_LABELS_ZH;
  const [chosen, setChosen] = useState<number | null>(null);

  const bridge = useMemo(() => {
    if (chosen === null) return null;
    try {
      return buildZodiacMonthBridge(chosen, locale);
    } catch {
      // Defensive: buildZodiacMonthBridge only throws on out-of-range /
      // unsupported locale, both of which we guard against in this component.
      return null;
    }
  }, [chosen, locale]);

  return (
    <div
      data-testid="zodiac-month-bridge-card"
      data-locale={locale}
      className="rounded-3xl border border-[rgba(212,175,119,0.28)] bg-[rgba(8,14,28,0.72)] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.36)] backdrop-blur-md"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(252,230,191)]">
        {eyebrow}
      </p>
      <p className="mt-3 max-w-xl text-base leading-7 text-white/78">{intro}</p>

      <label className="mt-5 block text-sm font-medium text-white/66" htmlFor="zodiac-month-select">
        {prompt}
      </label>
      <div className="mt-2 flex flex-wrap gap-3">
        <select
          id="zodiac-month-select"
          data-testid="zodiac-month-select"
          value={chosen ?? ''}
          onChange={(event) => {
            const next = event.target.value;
            if (next === '') {
              setChosen(null);
              return;
            }
            const parsed = Number(next);
            setChosen(Number.isInteger(parsed) ? parsed : null);
          }}
          className="min-w-[180px] rounded-full border border-white/16 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white outline-none transition-colors hover:border-white/34 focus:border-[rgb(252,230,191)]"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {months.map((label, idx) => (
            <option key={label} value={idx}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {bridge ? (
        <div
          data-testid="zodiac-month-bridge-result"
          className="mt-5 rounded-2xl border border-white/12 bg-black/30 p-4"
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(252,230,191)]"
            data-testid="zodiac-month-bridge-signs"
          >
            {bridge.signs[0]} <span aria-hidden="true">·</span> {bridge.signs[1]}
          </p>
          <p className="mt-2 text-lg leading-snug text-white/90" data-testid="zodiac-month-bridge-line">
            {bridge.bridgeLine}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/58">{bridge.bridgeHint}</p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(252,230,191)]">
            {reflectionsLabel}
          </p>
          <div className="mt-2 grid gap-3">
            <div
              className="rounded-xl border border-white/10 bg-black/20 p-3"
              data-testid="zodiac-month-bridge-reflection-primary"
            >
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/52">
                {bridge.signs[0]}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-white/82">{bridge.reflectionPrimary}</p>
            </div>
            <div
              className="rounded-xl border border-white/10 bg-black/20 p-3"
              data-testid="zodiac-month-bridge-reflection-secondary"
            >
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/52">
                {bridge.signs[1]}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-white/82">{bridge.reflectionSecondary}</p>
            </div>
          </div>

          <a
            href={ctaHref}
            data-testid="zodiac-month-bridge-cta"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,119,0.5)] bg-[rgb(212,175,119)] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_18px_60px_rgba(212,175,119,0.26)] transition-transform hover:translate-y-[-1px]"
          >
            {ctaLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default ZodiacMonthBridgeCard;
