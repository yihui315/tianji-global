'use client';

/**
 * Shared cosmic background for /legal/* pages.
 *
 * Mirrors the token system used on /about and the homepage:
 *  - 暖金色星尘 rgba(212,175,119)
 *  - 浅紫色黄道符号 rgba(168,130,255)
 *  - 椭圆径向暗角 0.78
 *
 * prefers-reduced-motion 自动禁用粒子动画。
 */
export function LegalCosmicLayers() {
  return (
    <>
      <div aria-hidden className="tj-legal-stardust" />
      <div aria-hidden className="tj-legal-zodiac">
        <span style={{ left: '6%', top: '12%', animationDelay: '0s' }}>♈</span>
        <span style={{ left: '90%', top: '20%', animationDelay: '7s' }}>✦</span>
        <span style={{ left: '12%', top: '76%', animationDelay: '13s' }}>☾</span>
        <span style={{ left: '88%', top: '82%', animationDelay: '19s' }}>♓</span>
        <span style={{ left: '52%', top: '8%', animationDelay: '25s' }}>⚝</span>
      </div>
      <div aria-hidden className="tj-legal-vignette" />

      <style>{`
        .tj-legal-stardust {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(1.4px 1.4px at 18% 22%, rgba(212,175,119,0.78), transparent 60%),
            radial-gradient(1px 1px at 36% 74%, rgba(168,130,255,0.6), transparent 60%),
            radial-gradient(1.6px 1.6px at 64% 38%, rgba(212,175,119,0.7), transparent 60%),
            radial-gradient(1.2px 1.2px at 82% 64%, rgba(168,130,255,0.55), transparent 60%),
            radial-gradient(1px 1px at 8% 88%, rgba(212,175,119,0.55), transparent 60%);
          animation: tj-legal-twinkle 11s ease-in-out infinite;
        }
        .tj-legal-zodiac {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .tj-legal-zodiac span {
          position: absolute;
          font-family: serif;
          font-size: 28px;
          color: rgba(168, 130, 255, 0.07);
          animation: tj-legal-drift 30s ease-in-out infinite;
        }
        .tj-legal-vignette {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: radial-gradient(ellipse 80% 70% at 50% 50%, transparent 35%, rgba(0,0,0,0.78) 100%);
        }
        @keyframes tj-legal-twinkle {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.95; }
        }
        @keyframes tj-legal-drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.05; }
          50% { transform: translate(18px, -14px) rotate(7deg); opacity: 0.12; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tj-legal-stardust,
          .tj-legal-zodiac span {
            animation: none !important;
          }
        }
        @media (max-width: 640px) {
          .tj-legal-zodiac span { font-size: 22px; }
        }
      `}</style>
    </>
  );
}
