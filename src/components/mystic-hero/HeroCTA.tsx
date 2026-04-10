'use client';

import { useRef, useCallback, type MouseEvent } from 'react';

/**
 * CTA buttons with hover glow + mouse-trailing zodiac symbols.
 *
 * Button 1: "立即占卜你的命运"  — primary gradient (gold→purple)
 * Button 2: "探索今日星运"      — outlined, fill on hover
 */

const TRAIL_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','✦','⚝'];

export default function HeroCTA() {
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnSymbol = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const span = document.createElement('span');
    span.textContent = TRAIL_SYMBOLS[Math.floor(Math.random() * TRAIL_SYMBOLS.length)];
    span.className = 'mystic-trail-symbol';
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    container.appendChild(span);

    setTimeout(() => span.remove(), 1200);
  }, []);

  return (
    <div ref={containerRef} className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-10">
      {/* Primary CTA */}
      <a href="/fortune">
        <button
          onMouseMove={spawnSymbol}
          className="group relative px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-amber-400 via-purple-500 to-amber-400 bg-[length:200%_auto] animate-gradient-shift text-black font-bold text-base sm:text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_-8px_rgba(245,158,11,0.5)]"
        >
          <span className="relative z-10">✦ 立即占卜你的命运</span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-purple-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
        </button>
      </a>

      {/* Secondary CTA */}
      <a href="/western">
        <button
          onMouseMove={spawnSymbol}
          className="group relative px-8 py-4 sm:px-10 sm:py-5 border border-white/20 text-white/80 font-medium text-base sm:text-lg rounded-full transition-all duration-300 hover:border-amber-300/50 hover:text-amber-200 hover:bg-white/[0.04] hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(168,130,255,0.3)]"
        >
          <span className="relative z-10">☽ 探索今日星运</span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </a>
    </div>
  );
}
