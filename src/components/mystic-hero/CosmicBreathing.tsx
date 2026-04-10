'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { noise2D } from './perlin';

/**
 * Skill: /cosmic-breathing-wobble
 *
 * Wraps children and applies ultra-subtle Perlin-noise-driven transform:
 *   translateX ±2px · translateY ±3px · rotate ±0.3deg · scale 0.998–1.002
 *
 * All channels use different noise seeds so movement is organic & never repeats.
 * Intensity controlled via --wobble-intensity CSS variable (0–1).
 * Respects prefers-reduced-motion.
 */

interface Props {
  children: ReactNode;
  className?: string;
}

export default function CosmicBreathing({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const seedX = Math.random() * 999;
    const seedY = seedX + 333;
    const seedR = seedX + 666;
    const seedS = seedX + 999;

    const tick = (time: number) => {
      const root = getComputedStyle(document.documentElement);
      const intensity = parseFloat(root.getPropertyValue('--wobble-intensity') || '0.6');
      const speed = parseFloat(root.getPropertyValue('--breathing-speed') || '0.0003');
      const t = time * speed;

      const tx = noise2D(t + seedX, seedX) * 2 * intensity;
      const ty = noise2D(t + seedY, seedY) * 3 * intensity;
      const rot = noise2D(t + seedR, seedR) * 0.3 * intensity;
      const sc = 1 + noise2D(t + seedS, seedS) * 0.002 * intensity;

      el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${sc.toFixed(4)})`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
