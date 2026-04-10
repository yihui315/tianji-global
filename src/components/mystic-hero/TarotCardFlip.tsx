'use client';

import { useEffect, useRef } from 'react';
import { noise2D } from './perlin';

/**
 * Skill: /tarot-card-flip
 *
 * Decorative tarot cards that slowly rotate in 3D space using Perlin noise.
 * Purely visual, non-interactive. Rendered as CSS-styled divs.
 * Hidden on mobile (< 1024px) for performance.
 */

interface TarotDecorProps {
  position: 'left' | 'right';
}

export default function TarotCardFlip({ position }: TarotDecorProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const seed = position === 'left' ? 42 : 137;

    const tick = (time: number) => {
      const t = time * 0.00015;
      const rotY = noise2D(t + seed, seed) * 35; // ±35deg Y rotation
      const rotX = noise2D(t + seed + 50, seed + 50) * 8;
      const ty = noise2D(t * 0.7 + seed + 100, seed + 100) * 15;

      el.style.transform = `perspective(800px) rotateY(${rotY.toFixed(1)}deg) rotateX(${rotX.toFixed(1)}deg) translateY(${ty.toFixed(1)}px)`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [position]);

  const isLeft = position === 'left';

  return (
    <div
      ref={cardRef}
      className="hidden lg:block absolute z-[3]"
      style={{
        width: 100,
        height: 150,
        [isLeft ? 'left' : 'right']: '8%',
        top: isLeft ? '25%' : '35%',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Front face */}
      <div
        className="absolute inset-0 rounded-xl border border-purple-400/20"
        style={{
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, rgba(88,28,135,0.25) 0%, rgba(124,58,237,0.15) 100%)',
          boxShadow: '0 0 30px rgba(124,58,237,0.1)',
        }}
      >
        <div className="flex flex-col items-center justify-center h-full text-purple-300/30">
          <span className="text-3xl">✦</span>
          <span className="text-[8px] mt-2 tracking-widest opacity-50">TAROT</span>
        </div>
      </div>
      {/* Back face */}
      <div
        className="absolute inset-0 rounded-xl border border-amber-400/15"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(245,158,11,0.1) 100%)',
        }}
      >
        <div className="flex flex-col items-center justify-center h-full text-amber-300/25">
          <span className="text-3xl">☽</span>
          <span className="text-[8px] mt-2 tracking-widest opacity-40">DESTINY</span>
        </div>
      </div>
    </div>
  );
}
