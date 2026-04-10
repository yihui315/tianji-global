'use client';

import { useEffect, useRef, useCallback } from 'react';
import { noise2D } from './perlin';

/**
 * Full-screen cosmic background canvas:
 * - 800+ stardust particles with Perlin-driven flicker
 * - Multi-layer CSS nebula gradients underneath
 * - Floating zodiac symbols (♈♉♊…) rendered on same canvas
 *
 * Skill: /floating-zodiac-particles (particles subsystem lives here)
 */

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  speedY: number;
  noiseSeed: number;
}

interface ZodiacSymbol {
  x: number;
  y: number;
  symbol: string;
  size: number;
  baseAlpha: number;
  rotation: number;
  noiseSeedX: number;
  noiseSeedY: number;
  noiseSeedR: number;
}

const ZODIAC = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const DECO = ['✦','⚝','✧','☆'];

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const zodiacRef = useRef<ZodiacSymbol[]>([]);

  const initParticles = useCallback((w: number, h: number) => {
    // Read density from CSS var (default 25 → ~800 particles at 1920×1080)
    const root = getComputedStyle(document.documentElement);
    const density = parseFloat(root.getPropertyValue('--particle-density') || '25');
    const count = Math.round((w * h) / (1920 * 1080) * density * 32);
    const particles: Particle[] = [];
    for (let i = 0; i < Math.max(count, 200); i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.2 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.3,
        speedY: Math.random() * 0.25 + 0.05,
        noiseSeed: Math.random() * 1000,
      });
    }
    particlesRef.current = particles;

    // Zodiac symbols
    const zodiacCount = Math.round(density * 1.2);
    const symbols: ZodiacSymbol[] = [];
    for (let i = 0; i < zodiacCount; i++) {
      const pool = i < zodiacCount * 0.7 ? ZODIAC : DECO;
      symbols.push({
        x: Math.random() * w,
        y: Math.random() * h,
        symbol: pool[Math.floor(Math.random() * pool.length)],
        size: Math.random() * 22 + 14,
        baseAlpha: Math.random() * 0.08 + 0.03,
        rotation: Math.random() * Math.PI * 2,
        noiseSeedX: Math.random() * 1000,
        noiseSeedY: Math.random() * 1000 + 500,
        noiseSeedR: Math.random() * 1000 + 1000,
      });
    }
    zodiacRef.current = symbols;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (time: number) => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      const t = time * 0.001; // seconds

      // — Stardust particles —
      particlesRef.current.forEach(p => {
        const flicker = noise2D(t * 0.4 + p.noiseSeed, p.noiseSeed) * 0.5 + 0.5;
        const alpha = p.baseAlpha * flicker;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,119,${alpha.toFixed(3)})`;
        ctx.fill();

        // Drift
        p.y += p.speedY;
        p.x += noise2D(t * 0.1 + p.noiseSeed, 0) * 0.15;
        if (p.y > h + 5) { p.y = -5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
      });

      // — Zodiac symbols —
      zodiacRef.current.forEach(z => {
        const dx = noise2D(t * 0.08 + z.noiseSeedX, z.noiseSeedY) * 30;
        const dy = noise2D(t * 0.06 + z.noiseSeedY, z.noiseSeedX) * 25;
        const dr = noise2D(t * 0.04 + z.noiseSeedR, 0) * 0.3;

        ctx.save();
        ctx.translate(z.x + dx, z.y + dy);
        ctx.rotate(z.rotation + dr);
        ctx.font = `${z.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(168,130,255,${z.baseAlpha.toFixed(3)})`;
        ctx.fillText(z.symbol, 0, 0);
        ctx.restore();

        // Slow vertical drift
        z.y += 0.02;
        if (z.y > h + 50) { z.y = -50; z.x = Math.random() * w; }
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [initParticles]);

  return (
    <>
      {/* Multi-layer CSS nebula background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 25% 35%, rgba(88,28,135,0.25) 0%, transparent 55%),
            radial-gradient(ellipse at 75% 65%, rgba(30,27,75,0.35) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 20%, rgba(124,58,237,0.12) 0%, transparent 45%),
            radial-gradient(ellipse at 60% 80%, rgba(139,92,246,0.08) 0%, transparent 40%),
            linear-gradient(180deg, #030014 0%, #0a0020 50%, #030014 100%)
          `,
        }}
      />
      {/* Canvas overlay for particles + zodiac */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{ opacity: 0.85 }}
      />
    </>
  );
}
