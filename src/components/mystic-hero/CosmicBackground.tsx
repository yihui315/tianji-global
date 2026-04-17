/**
 * CosmicBackground — Pure CSS nebula + star-field
 * No canvas, no Three.js — lightweight for Core Web Vitals
 * Taste Rule: deep space black + gold/purple nebula glow
 */
export default function CosmicBackground() {
  return (
    <>
      {/* Multi-layer CSS nebula gradient — gold/purple on #0a0a0a */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(42,10,58,0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, rgba(124,58,237,0.15) 0%, transparent 45%),
            radial-gradient(ellipse at 60% 40%, rgba(212,175,55,0.06) 0%, transparent 35%),
            radial-gradient(ellipse at 40% 80%, rgba(167,139,250,0.08) 0%, transparent 40%),
            #0a0a0a
          `,
        }}
      />
      {/* CSS star-field — 50 dots via box-shadow, opacity 0.4 */}
      <div className="star-field" aria-hidden="true" />
    </>
  );
}
