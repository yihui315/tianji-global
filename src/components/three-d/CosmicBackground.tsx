'use client';

/**
 * CosmicBackground — 全屏宇宙背景
 */

import { useEffect, useRef } from 'react';

interface CosmicBackgroundProps {
  children?: React.ReactNode;
  particleCount?: number;
  nebulaIntensity?: number;
}

export default function CosmicBackground({
  children,
  particleCount = 200,
  nebulaIntensity = 0.3
}: CosmicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: Array<{ x: number; y: number; size: number; speed: number; opacity: number }> = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvasEl.width,
        y: Math.random() * canvasEl.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      // Nebula gradient
      const gradient = ctx.createRadialGradient(
        canvasEl.width * 0.2, canvasEl.height * 0.3, 0,
        canvasEl.width * 0.2, canvasEl.height * 0.3, canvasEl.width * 0.5
      );
      gradient.addColorStop(0, `rgba(124, 58, 237, ${nebulaIntensity * 0.3})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

      const gradient2 = ctx.createRadialGradient(
        canvasEl.width * 0.8, canvasEl.height * 0.7, 0,
        canvasEl.width * 0.8, canvasEl.height * 0.7, canvasEl.width * 0.4
      );
      gradient2.addColorStop(0, `rgba(236, 72, 153, ${nebulaIntensity * 0.2})`);
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

      // Particles
      particles.forEach(p => {
        p.y -= p.speed;
        if (p.y < -10) {
          p.y = canvasEl.height + 10;
          p.x = Math.random() * canvasEl.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();

        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(168, 130, 255, ${p.opacity * 0.3})`;
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [particleCount, nebulaIntensity]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      {children}
    </div>
  );
}
