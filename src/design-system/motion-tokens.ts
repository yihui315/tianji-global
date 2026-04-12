/**
 * TianJi Design System — Motion Tokens
 *
 * Unified animation presets consumed by framer-motion and CSS animations.
 * Every animated component should reference these tokens instead of
 * defining inline durations / easings.
 */

import type { Variants, Transition } from 'framer-motion';

// ────────────────────────────────────────────
// 1. Easing Curves
// ────────────────────────────────────────────
export const easings = {
  /** Default ease-out for entrances */
  out: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  /** Smooth deceleration */
  outQuart: [0.165, 0.84, 0.44, 1] as [number, number, number, number],
  /** Gentle spring-like */
  outBack: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  /** Subtle ease-in-out for looping */
  inOut: [0.42, 0, 0.58, 1] as [number, number, number, number],
} as const;

// ────────────────────────────────────────────
// 2. Duration Presets (seconds)
// ────────────────────────────────────────────
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.4,
  slow: 0.7,
  slower: 1.0,
  /** Used for breathing / ambient loops */
  ambient: 3.0,
} as const;

// ────────────────────────────────────────────
// 3. Transition Presets
// ────────────────────────────────────────────
export const transitions = {
  fadeIn: {
    duration: durations.slow,
    ease: easings.out,
  } satisfies Transition,

  lineDraw: {
    duration: durations.slower,
    ease: easings.outQuart,
  } satisfies Transition,

  radarPulse: {
    duration: durations.ambient,
    ease: easings.inOut,
    repeat: Infinity,
    repeatType: 'loop',
  } satisfies Transition,

  hoverLift: {
    duration: durations.fast,
    ease: easings.outBack,
  } satisfies Transition,

  scrollReveal: {
    duration: durations.slow,
    ease: easings.out,
  } satisfies Transition,

  staggerChildren: {
    staggerChildren: 0.08,
    delayChildren: 0.1,
  } satisfies Transition,
} as const;

// ────────────────────────────────────────────
// 4. Variant Presets (framer-motion)
// ────────────────────────────────────────────
export const variants = {
  /** Standard fade-in from below */
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: transitions.fadeIn,
    },
  } satisfies Variants,

  /** Fade-in from right (for staggered cards) */
  fadeRight: {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: transitions.fadeIn,
    },
  } satisfies Variants,

  /** Scale-in for badges and chips */
  scaleIn: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: transitions.fadeIn,
    },
  } satisfies Variants,

  /** Stagger container */
  stagger: {
    hidden: {},
    visible: {
      transition: transitions.staggerChildren,
    },
  } satisfies Variants,

  /** Hover lift for interactive cards */
  hoverLift: {
    rest: { y: 0, scale: 1 },
    hover: {
      y: -4,
      scale: 1.02,
      transition: transitions.hoverLift,
    },
  } satisfies Variants,

  /** Line draw for SVG paths */
  lineDraw: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: transitions.lineDraw,
    },
  } satisfies Variants,
} as const;

// ────────────────────────────────────────────
// 5. Perlin / Breathing Presets
// ────────────────────────────────────────────
export const breathing = {
  /** Default breathing speed (Perlin time scale) */
  speed: 0.0003,
  /** Slow dreamy mode */
  speedSlow: 0.00015,
  /** Amplitude limits */
  translateX: 2,   // ±px
  translateY: 3,   // ±px
  rotate: 0.3,     // ±deg
  scale: 0.002,    // ±
  /** Seed offset between channels */
  seedOffset: 333,
} as const;

// ────────────────────────────────────────────
// 6. Scroll Reveal Defaults
// ────────────────────────────────────────────
export const scrollReveal = {
  /** IntersectionObserver / useInView margin */
  margin: '-80px',
  /** Trigger once */
  once: true,
} as const;
