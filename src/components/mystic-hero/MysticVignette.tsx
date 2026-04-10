'use client';

/**
 * Skill: /create-mystic-vignette
 *
 * Crystal-ball radial vignette overlay.
 * Simulates "destiny mirror" / "scrying orb" dark edges with faint starlight glow.
 * Intensity controlled via --vignette-intensity CSS variable.
 */

export default function MysticVignette() {
  return (
    <div
      className="fixed inset-0 z-[2] pointer-events-none"
      style={{
        background: `
          radial-gradient(
            ellipse 75% 70% at 50% 50%,
            transparent 25%,
            rgba(10,0,30,0.35) 55%,
            rgba(5,0,15,0.75) 80%,
            rgba(2,0,8,0.92) 100%
          )
        `,
        opacity: 'var(--vignette-intensity, 0.8)',
        /* Faint starlight rim glow */
        boxShadow: 'inset 0 0 180px rgba(168,130,255,0.04), inset 0 0 60px rgba(245,158,11,0.02)',
      }}
    />
  );
}
