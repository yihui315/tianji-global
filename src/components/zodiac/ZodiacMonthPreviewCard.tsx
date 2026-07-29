'use client';

import { useMemo, useState } from 'react';
import {
  MONTH_LABELS_EN,
  MONTH_LABELS_ZH,
  type ZodiacPreviewLocale,
  buildZodiacMonthPreview,
} from './zodiac-month-preview';

export interface ZodiacMonthPreviewCardProps {
  locale: ZodiacPreviewLocale;
  /** Pre-rendered eyebrow title (already localized server-side). */
  eyebrow: string;
  /** Pre-rendered body intro (already localized server-side). */
  intro: string;
  /** Pre-rendered prompt copy above the dropdown (already localized). */
  prompt: string;
  /** Pre-rendered placeholder shown before the user picks a month. */
  placeholder: string;
  /** Pre-rendered hint shown under the result line (already localized). */
  followupLabel: string;
  /** Pre-rendered CTA label (already localized). */
  ctaLabel: string;
  /** CTA href used as `<Link>` target when the user opts in. */
  ctaHref: string;
}

/**
 * ZodiacMonthPreviewCard — interactive month picker that renders a deterministic
 * reflection preview. Client component on purpose: it owns ephemeral form state.
 *
 * Privacy posture:
 * - No fetch, no analytics, no server round-trip.
 * - No birth year, birth time, birth place is ever collected.
 * - The chosen month stays in local React state and is not sent anywhere.
 *
 * Visual posture:
 * - Uses inline Tailwind classes consistent with the existing landing hero
 *   palette (rgba(212,175,119,*) and rgba(8,14,28,*) tones).
 * - Pure client island; safe to mount on the otherwise-server landing page.
 */
export function ZodiacMonthPreviewCard({
  locale,
  eyebrow,
  intro,
  prompt,
  placeholder,
  followupLabel,
  ctaLabel,
  ctaHref,
}: ZodiacMonthPreviewCardProps) {
  const months = locale === 'en' ? MONTH_LABELS_EN : MONTH_LABELS_ZH;
  const [chosen, setChosen] = useState<number | null>(null);

  const preview = useMemo(() => {
    if (chosen === null) return null;
    try {
      return buildZodiacMonthPreview(chosen, locale);
    } catch {
      // Defensive: buildZodiacMonthPreview only throws on out-of-range /
      // unsupported locale, both of which we guard against in this component.
      return null;
    }
  }, [chosen, locale]);

  return (
    <div
      data-testid="zodiac-month-preview-card"
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

      {preview ? (
        <div
          data-testid="zodiac-month-preview-result"
          className="mt-5 rounded-2xl border border-white/12 bg-black/30 p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(252,230,191)]">
            {preview.sign}
          </p>
          <p className="mt-2 text-lg leading-snug text-white/90">{preview.line}</p>
          <p className="mt-3 text-xs leading-relaxed text-white/58">{followupLabel}</p>
          <p className="mt-1 text-sm leading-relaxed text-white/74">{preview.hint}</p>
          <a
            href={ctaHref}
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

export default ZodiacMonthPreviewCard;
