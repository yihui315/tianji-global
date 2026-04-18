'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface StarLayer {
  count: number;
  speed: number;
  sizeMin: number;
  sizeMax: number;
  colors: string[];
}

interface Star {
  x: number;
  y: number;
  z: number;
  layerIdx: number;
  angle: number;
  radius: number;
  twinkle: number;
  twinkleSpeed: number;
}

const STAR_LAYERS: StarLayer[] = [
  { count: 200, speed: 0.08, sizeMin: 0.3, sizeMax: 1.2, colors: ['200,210,255', '180,220,255', '160,200,255'] },
  { count: 80, speed: 0.15, sizeMin: 0.8, sizeMax: 2.0, colors: ['245,158,11', '253,211,77'] },
  { count: 40, speed: 0.25, sizeMin: 1.5, sizeMax: 3.0, colors: ['168,130,255', '124,58,237'] },
];

function createStars(width: number, height: number): Star[] {
  const stars: Star[] = [];

  STAR_LAYERS.forEach((layer, layerIdx) => {
    for (let index = 0; index < layer.count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.9 + 0.1;
      stars.push({
        x: Math.cos(angle) * radius * width * 0.4,
        y: Math.sin(angle) * radius * height * 0.35,
        z: radius,
        layerIdx,
        angle,
        radius,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.02,
      });
    }
  });

  return stars;
}

export default function DeepSpaceHero() {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const starY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const starOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  useEffect(() => {
    const canvasNode = canvasRef.current;
    if (!canvasNode) {
      return;
    }

    const context = canvasNode.getContext('2d');
    if (!context) {
      return;
    }

    let animationFrameId = 0;
    let frame = 0;
    let stars = createStars(window.innerWidth, window.innerHeight);

    const resize = () => {
      canvasNode.width = window.innerWidth;
      canvasNode.height = window.innerHeight;
      stars = createStars(canvasNode.width, canvasNode.height);
    };

    const project = (star: Star, centerX: number, centerY: number, fov: number) => {
      const scale = fov / (fov + star.z * 2);
      return {
        x: centerX + (star.x / star.z) * fov,
        y: centerY + (star.y / star.z) * fov,
        scale,
      };
    };

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, canvasNode.width, canvasNode.height);

      const background = context.createRadialGradient(
        canvasNode.width * 0.5,
        canvasNode.height * 0.4,
        0,
        canvasNode.width * 0.5,
        canvasNode.height * 0.4,
        canvasNode.width * 0.8
      );
      background.addColorStop(0, '#2a0a3a');
      background.addColorStop(0.4, '#150828');
      background.addColorStop(1, '#0a0a0a');
      context.fillStyle = background;
      context.fillRect(0, 0, canvasNode.width, canvasNode.height);

      const nebula = context.createRadialGradient(
        canvasNode.width * 0.75,
        canvasNode.height * 0.2,
        0,
        canvasNode.width * 0.75,
        canvasNode.height * 0.2,
        canvasNode.width * 0.35
      );
      nebula.addColorStop(0, 'rgba(245,158,11,0.04)');
      nebula.addColorStop(0.5, 'rgba(124,58,237,0.06)');
      nebula.addColorStop(1, 'transparent');
      context.fillStyle = nebula;
      context.fillRect(0, 0, canvasNode.width, canvasNode.height);

      const centerX = canvasNode.width / 2;
      const centerY = canvasNode.height / 2;
      const fov = 400;

      [...stars]
        .sort((left, right) => left.z - right.z)
        .forEach((star) => {
          const layer = STAR_LAYERS[star.layerIdx];
          star.angle += layer.speed * 0.002;
          star.x = Math.cos(star.angle) * star.radius * canvasNode.width * 0.4;
          star.y = Math.sin(star.angle) * star.radius * canvasNode.height * 0.35;
          star.twinkle += star.twinkleSpeed;

          const projection = project(star, centerX, centerY, fov);
          if (
            projection.x < -10 ||
            projection.x > canvasNode.width + 10 ||
            projection.y < -10 ||
            projection.y > canvasNode.height + 10
          ) {
            return;
          }

          const twinkleFactor = 0.5 + 0.5 * Math.sin(star.twinkle);
          const color = layer.colors[Math.floor(Math.random() * layer.colors.length)];
          const alpha = twinkleFactor * (0.4 + 0.6 * star.z) * 0.85;
          const radius = layer.sizeMin + (layer.sizeMax - layer.sizeMin) * star.z;

          context.beginPath();
          context.arc(projection.x, projection.y, radius, 0, Math.PI * 2);
          context.fillStyle = `rgba(${color},${alpha})`;
          context.fill();

          if (layer.speed > 0.12) {
            context.shadowColor = `rgba(${color},0.4)`;
            context.shadowBlur = 8 * star.z;
            context.fill();
            context.shadowBlur = 0;
          }
        });

      const constellationAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];
      const constellationRadius = Math.min(canvasNode.width, canvasNode.height) * 0.28;
      context.strokeStyle = 'rgba(168,130,255,0.06)';
      context.lineWidth = 0.5;

      for (let index = 0; index < constellationAngles.length; index += 1) {
        const angleA = constellationAngles[index] + frame * 0.0003;
        const angleB = constellationAngles[(index + 2) % constellationAngles.length] + frame * 0.0003;
        const x1 = centerX + Math.cos(angleA) * constellationRadius;
        const y1 = centerY + Math.sin(angleA) * constellationRadius * 0.85;
        const x2 = centerX + Math.cos(angleB) * constellationRadius;
        const y2 = centerY + Math.sin(angleB) * constellationRadius * 0.85;

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const headline = lang === 'zh' ? '知天命，顺天机' : 'Know Your Destiny';
  const subtitle =
    lang === 'zh' ? '从星盘格局读懂你的人生节律与成长方向' : 'Decode your life rhythms and growth path from the stars';
  const primaryCta = lang === 'zh' ? '免费测算' : 'Free Reading';
  const secondaryCta = lang === 'zh' ? 'Pro 订阅' : 'Pro Subscription';

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden" style={{ background: '#0a0a0a' }}>
      <motion.canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ y: starY, opacity: starOpacity }} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(42,10,58,0.7) 0%, transparent 70%)' }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(245,158,11,0.3), transparent)',
          boxShadow: '0 0 30px rgba(245,158,11,0.15)',
        }}
      />

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6"
        style={{ y: titleY, opacity: titleOpacity }}
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[10px] tracking-[0.3em] uppercase mb-6"
          style={{ color: 'rgba(245,158,11,0.6)' }}
        >
          {lang === 'zh' ? '天机 · 全球命运解读' : 'TianJi Global · Cosmic Destiny'}
        </motion.p>

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

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center text-sm sm:text-base mb-10 max-w-md leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <a
            href="/western"
            className="group relative flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-medium overflow-hidden transition-all duration-300"
            style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.35)',
              color: '#FCD34D',
            }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(245,158,11,0.12)', boxShadow: '0 0 24px rgba(245,158,11,0.2)' }}
            />
            <span className="relative z-10">{primaryCta}</span>
            <ArrowRight size={14} className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>

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
            <span>{secondaryCta}</span>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-6 text-[10px]"
          style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}
        >
          {lang === 'zh' ? '120,000+ 命运解读 · Swiss Ephemeris 精确星历' : '120,000+ readings · Swiss Ephemeris precision'}
        </motion.p>
      </motion.div>

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

      <div className="absolute inset-0 pointer-events-none z-20" style={{ boxShadow: 'inset 0 0 150px rgba(0,0,0,0.6)' }} />
    </section>
  );
}
