'use client';

/**
 * PageChrome — Cinematic page background, in one line.
 *
 * The TianJi cinematic chrome is exactly three layers stacked behind content:
 *   1. base black gradient (landingTokens.section.pageBackground)
 *   2. soft star field (CSS class `.star-field` from globals.css)
 *   3. single top spotlight (landingTokens.section.spotlight)
 *
 * Pages used to hand-roll these three divs (or worse, ad-hoc Tailwind blobs).
 * That is the #1 source of "页面太乱" — palette drift, blob-pile, layered
 * gradients fighting each other.
 *
 * Use this component as the very first child of every page <main>:
 *
 *   <main className="relative min-h-screen overflow-x-hidden text-white">
 *     <PageChrome />
 *     <div className="relative z-10">{...content...}</div>
 *   </main>
 *
 * See `.claude/skills/tianji-cinematic/SKILL.md` §3 for the full law.
 */

import { landingTokens } from '@/design-system';

export interface PageChromeProps {
  /**
   * Disable the star field. Use only on routes where it would be visually
   * redundant (e.g. inside an iframe-embedded share card).
   */
  disableStars?: boolean;
  /**
   * Disable the top spotlight. Use only when the page renders a
   * BackgroundVideoHero immediately below — the hero already provides its
   * own vignette and the spotlight would double-light.
   */
  disableSpotlight?: boolean;
}

export default function PageChrome({
  disableStars = false,
  disableSpotlight = false,
}: PageChromeProps = {}) {
  return (
    <>
      {/* Layer 0 — base black gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: landingTokens.section.pageBackground }}
      />
      {/* Layer 1 — soft star field */}
      {!disableStars && (
        <div className="star-field" aria-hidden="true" />
      )}
      {/* Layer 2 — top spotlight */}
      {!disableSpotlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
          style={{ background: landingTokens.section.spotlight }}
        />
      )}
    </>
  );
}
