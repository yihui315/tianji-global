'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * DeepSpaceHero — 2026 Top-tier Cosmic Landing Hero
 *
 * Taste Rule: 深空黑背景 (#0a0a0a → #2a0a3a 星云紫金渐变)
 *            大留白、克制金紫光效、神秘奢华感
 *
 * Features:
 * - Full-screen canvas 3D starfield (Earth → Ziwei star chart zoom)
 * - Parallax layers: stars (slow) / nebula (medium) / title (fast)
 * - Golden大字 "知天命，顺天机" + subtitle
 * - Two CTA buttons: 免费测算 / Pro订阅
 * - Scroll indicator with pulse animation
 */
export default function DeepSpaceHero() {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms — different speeds per layer
  const starY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const nebulaY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const starOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  // ── Canvas 3D Starfield Animation ──────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Taste Rule palette: deep space black + nebula purple-gold
    const STAR_LAYERS = [
      { count: 200, speed: 0.08, sizeMin: 0.3, sizeMax: 1.2, colors: ['200,210,255', '180,220,255', '160,200,255'] },
      { count: 80, speed: 0.15, sizeMin: 0.8, sizeMax: 2.0, colors: ['245,158,11', '253,211,77'] }, // gold stars
      { count: 40, speed: 0.25, sizeMin: 1.5, sizeMax: 3.0, colors: ['168,130,255', '124,58,237'] }, // purple stars
    ];

    interface Star {
      x: number; y: number; z: number;
      layerIdx: number;
      angle: number; radius: number;
      twinkle: number; twinkleSpeed: number;
    }

    const allStars: Star[] = [];
    STAR_LAYERS.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.9 + 0.1; // 0.1 to 1.0 (far to near)
        allStars.push({
          x: 0, y: 0, z: radius,
          layerIdx: li,
          angle,
          radius,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.01 + Math.random() * 0.02,
        });
      }
    });

    // Projection: 3D sphere → 2D with perspective
    const project = (s: Star, cx: number, cy: number, fov: number) => {
      const r = s.z;
      const sx = cx + (s.x / r) * fov;
      const sy = cy + (s.y / r) * fov;
      const scale = fov / (fov + s.z * 2);
      return { x: sx, y: sy, scale, r };
    };

    function draw() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background: deep space gradient — Taste Rule #0a0a0a → #2a0a3a
      const bgGrad = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.4, 0,
        canvas.width * 0.5, canvas.height * 0.4, canvas.width * 0.8
      );
      bgGrad.addColorStop(0, '#2a0a3a');   // nebula purple (center)
      bgGrad.addColorStop(0.4, '#150828');
      bgGrad.addColorStop(1, '#0a0a0a');    // deep space black (edges)
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle gold nebula glow (top-right — Taste Rule: restrained)
      const nebulaGrad = ctx.createRadialGradient(
        canvas.width * 0.75, canvas.height * 0.2, 0,
        canvas.width * 0.75, canvas.height * 0.2, canvas.width * 0.35
      );
      nebulaGrad.addColorStop(0, 'rgba(245,158,11,0.04)');
      nebulaGrad.addColorStop(0.5, 'rgba(124,58,237,0.06)');
      nebulaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 400;

      // Draw stars: far (dim/small) first, near (bright/large) last
      const sorted = [...allStars].sort((a, b) => a.z - b.z);

      sorted.forEach((star) => {
        const layer = STAR_LAYERS[star.layerIdx];

        // Slow rotation (Earth rotation feel)
        star.angle += layer.speed * 0.002;
        star.x = Math.cos(star.angle) * star.radius * canvas.width * 0.4;
        star.y = Math.sin(star.angle) * star.radius * canvas.height * 0.35;

        // Twinkle
        star.twinkle += star.twinkleSpeed;
        const twinkleFactor = 0.5 + 0.5 * Math.sin(star.twinkle);

        const proj = project(star, cx, cy, fov);

        // Cull off-screen
        if (proj.x < -10 || proj.x > canvas.width + 10 ||
            proj.y < -10 || proj.y > canvas.height + 10) return;

        const colorIdx = Math.floor(Math.random() * layer.colors.length);
        const color = layer.colors[colorIdx];
        const alpha = twinkleFactor * (0.4 + 0.6 * star.z) * 0.85;

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, layer.sizeMin + (layer.sizeMax - layer.sizeMin) * star.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.fill();

        // Glow for near/fast stars
        if (layer.speed > 0.12) {
          ctx.shadowColor = `rgba(${color},0.4)`;
          ctx.shadowBlur = 8 * star.z;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw faint constellation lines (Ziwei star chart aesthetic)
      const constellationAngles = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3];
      const constRadius = Math.min(canvas.width, canvas.height) * 0.28;
      ctx.strokeStyle = 'rgba(168,130,255,0.06)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < constellationAngles.length; i++) {
        const a1 = constellationAngles[i] + frame * 0.0003;
        const a2 = constellationAngles[(i + 2) % constellationAngles.length] + frame * 0.0003;
        const x1 = cx + Math.cos(a1) * constRadius;
        const y1 = cy + Math.sin(a1) * constRadius * 0.85;
        const x2 = cx + Math.cos(a2) * constRadius;
        const y2 = cy + Math.sin(a2) * constRadius * 0.85;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Headline text — Taste Rule: 金大字
  const headline = lang === 'zh' ? '知天命，顺天机' : 'Know Your Destiny';
  const subtitle = lang === 'zh'
    ? '从星辰格局读懂你的命运蓝图'
    : 'Decode your cosmic blueprint from the stars';
  const ctaPrimary = lang === 'zh' ? '免费测算' : 'Free Reading';
  const ctaSecondary = lang === 'zh' ? 'Pro 订阅' : 'Pro Subscription';

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ background: '#0a0a0a' }}
    >
      {/* ── Canvas Background ── */}
      <motion.canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ y: starY, opacity: starOpacity }}
      />

      {/* ── Nebula gradient overlay (purple-gold, restrained) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(42,10,58,0.7) 0%, transparent 70%)',
        }}
      />

      {/* ── Gold glow top accent ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(245,158,11,0.3), transparent)',
          boxShadow: '0 0 30px rgba(245,158,11,0.15)',
        }}
      />

      {/* ── Title Layer (parallax + fade on scroll) ── */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6"
        style={{ y: titleY, opacity: titleOpacity }}
      >
        {/* Overline label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[10px] tracking-[0.3em] uppercase mb-6"
          style={{ color: 'rgba(245,158,11,0.6)' }}
        >
          {lang === 'zh' ? '天机 · 全球命运解读' : 'TianJi Global · Cosmic Destiny'}
        </motion.p>

        {/* Main headline — Golden large serif (Taste Rule: 金大字) */}
        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center leading-none tracking-tight mb-6"
          style={{
            fontFamily: 'var(--font-instrument-serif), Georgia, serif',
            fontSize: 'clamp(3rem, 9vw, 7rem)',
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#FFFFFF',
            textShadow: '0 0 80px rgba(245,158,11,0.2), 0 0 40px rgba(245,158,11,0.1)',
          }}
        >
          {headline}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center text-sm sm:text-base mb-10 max-w-md leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}
        >
          {subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          {/* Primary CTA — Gold border, transparent bg */}
          <a
            href="/western"
            className="group relative flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-medium overflow-hidden transition-all duration-300"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.35)',
              color: '#FCD34D',
            }}
          >
            {/* Hover glow */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(245,158,11,0.12)', boxShadow: '0 0 24px rgba(245,158,11,0.2)' }}
            />
            <span className="relative z-10">{ctaPrimary}</span>
            <ArrowRight
              size={14}
              className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </a>

          {/* Secondary CTA — Outline only, subtle */}
          <a
            href="/pricing"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-all duration-300"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            <Zap size={12} style={{ color: 'rgba(168,130,255,0.7)' }} />
            <span>{ctaSecondary}</span>
          </a>
        </motion.div>

        {/* Social proof micro line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-6 text-[10px]"
          style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}
        >
          {lang === 'zh' ? '120,000+ 命运已解读 · Swiss Ephemeris 精确星历' : '120,000+ readings · Swiss Ephemeris precision'}
        </motion.p>
      </motion.div>

      {/* ── Scroll Indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {lang === 'zh' ? '向下探索' : 'Scroll to explore'}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }}
        />
      </motion.div>

      {/* ── Vignette (subtle, Taste Rule: restrained) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          boxShadow: 'inset 0 0 150px rgba(0,0,0,0.6)',
        }}
      />
    </section>
  );
}
