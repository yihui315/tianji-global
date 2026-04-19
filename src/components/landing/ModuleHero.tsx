'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GlassCard } from '@/components/ui';

/* ═══════════════════════════════════════════════════════════════
   ModuleHero — Fullscreen hero with video/OG background
   Taste Rule: deep space black, violet/gold glow, cinematic luxury
   Used by: ziwei, bazi, yijing, tarot, western, fortune
   ═══════════════════════════════════════════════════════════════ */

interface ModuleHeroProps {
  titleCn: string;
  titleEn: string;
  tagline: string;
  videoSrc?: string;
  ogBgSrc?: string;
  accentColor?: string;
  goldColor?: string;
  children: React.ReactNode;
}

const DEEP_SPACE_BG = 'linear-gradient(160deg, #0a0a0a 0%, #1a0a3a 50%, #0a0a0a 100%)';

/* ── Canvas starfield ── */
function StarfieldCanvas({ accentColor = '#7c3aed' }: { accentColor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;
    const stars: { x: number; y: number; r: number; opacity: number; twinkle: number }[] = [];
    const N = 200;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      stars.length = 0;
      for (let i = 0; i < N; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.2,
          opacity: Math.random() * 0.7 + 0.1,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.twinkle += 0.012;
        const o = s.opacity * (0.6 + 0.4 * Math.sin(s.twinkle));
        const purple = Math.floor(150 + Math.sin(s.twinkle * 0.7) * 60);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${purple},${Math.floor(purple * 0.5)},255,${o})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
}

/* ── Main Hero ── */
export default function ModuleHero({
  titleCn,
  titleEn,
  tagline,
  videoSrc,
  ogBgSrc,
  accentColor = '#7c3aed',
  goldColor = '#D4AF37',
  children,
}: ModuleHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <motion.div
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{ height: '100svh', minHeight: '600px', outline: '3px solid lime', outlineOffset: '-3px' }}
    >
      {/* ── Background: video → og image → deep space gradient ── */}
      {videoSrc ? (
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.35) 40%, rgba(10,10,10,0.78) 85%, #0a0a0a 100%)',
              zIndex: 1,
            }}
          />
        </>
      ) : ogBgSrc ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${ogBgSrc})`, zIndex: 0 }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.82) 90%, #0a0a0a 100%)',
              zIndex: 1,
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: DEEP_SPACE_BG, zIndex: 0 }}
        />
      )}

      {/* ── Starfield canvas ── */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        <StarfieldCanvas accentColor={accentColor} />
      </div>

      {/* ── Nebula overlays ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${accentColor}18 0%, transparent 70%)`,
          zIndex: 3,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 80% 70%, ${goldColor}0D 0%, transparent 60%)`,
          zIndex: 3,
        }}
      />

      {/* ── Parallax content ── */}
      <motion.div
        style={{ y, opacity, zIndex: 10 }}
        className="relative flex flex-col items-center justify-center h-full px-6 pt-20"
      >
        {/* Chinese title — gold gradient */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-3"
        >
          <h1
            className="font-serif tracking-tight leading-none"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6.5rem)',
              background: `linear-gradient(135deg, ${goldColor} 0%, #F0D875 40%, ${goldColor} 60%, #C9A227 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 28px ${goldColor}4D)`,
              letterSpacing: '0.15em',
            }}
          >
            {titleCn}
          </h1>
        </motion.div>

        {/* English subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="text-center text-sm sm:text-base mb-8 tracking-[0.3em] uppercase"
          style={{ color: `${accentColor}B3` }}
        >
          {titleEn}
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center text-white/40 text-sm mb-10"
          style={{ letterSpacing: '0.05em' }}
        >
          {tagline}
        </motion.p>

        {/* Form — wrapped in GlassCard */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ outline: '3px solid cyan', outlineOffset: '4px' }}
        >
          {children}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-px h-6"
            style={{ background: `linear-gradient(to bottom, ${goldColor}80, transparent)` }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
