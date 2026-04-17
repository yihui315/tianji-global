'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui';
import { useLanguage } from '@/hooks/useLanguage';
import { colors } from '@/design-system';

/* ═══════════════════════════════════════════
   Canvas Starfield — pure canvas particle system
   ═══════════════════════════════════════════ */
function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number; twinkle: number }[] = [];
    const N = 220;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      stars.length = 0;
      for (let i = 0; i < N; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.2,
          speed: Math.random() * 0.12 + 0.02,
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
        // Purple-white star
        const purple = Math.floor(150 + Math.sin(s.twinkle * 0.7) * 60);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${purple}, ${Math.floor(purple * 0.5)}, 255, ${o})`;
        ctx.fill();
      }
      // Subtle constellation lines
      ctx.strokeStyle = 'rgba(168,130,255,0.04)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length - 1; i += 12) {
        const a = stars[i], b = stars[(i + 7) % stars.length];
        const dx = a.x - b.x, dy = a.y - b.y;
        if (Math.sqrt(dx * dx + dy * dy) < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
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
      style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #1a0a3a 50%, #0a0a0a 100%)' }}
    />
  );
}

/* ═══════════════════════════════════════════
   Input Form — birth info collector
   ═══════════════════════════════════════════ */
interface ZiweiFormProps {
  birthday: string;
  setBirthday: (v: string) => void;
  birthTime: number;
  setBirthTime: (v: number) => void;
  birthdayType: 'solar' | 'lunar';
  setBirthdayType: (v: 'solar' | 'lunar') => void;
  gender: 'male' | 'female';
  setGender: (v: 'male' | 'female') => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

function ZiweiForm({
  birthday, setBirthday, birthTime, setBirthTime,
  birthdayType, setBirthdayType, gender, setGender,
  onSubmit, isLoading,
}: ZiweiFormProps) {
  return (
    <GlassCard level="card" className="w-full max-w-sm border border-white/[0.06] bg-black/30 backdrop-blur-md rounded-2xl">
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-[10px] font-serif text-white/30 mb-1.5 tracking-widest uppercase">
            生日类型
          </label>
          <select
            value={birthdayType}
            onChange={e => setBirthdayType(e.target.value as 'solar' | 'lunar')}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white/80 bg-white/[0.04] border border-white/[0.06] focus:outline-none focus:border-purple-500/30 transition-all"
          >
            <option value="solar">阳历 / Solar</option>
            <option value="lunar">农历 / Lunar</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-serif text-white/30 mb-1.5 tracking-widest uppercase">
            生日
          </label>
          <input
            type="date"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white/80 bg-white/[0.04] border border-white/[0.06] focus:outline-none focus:border-purple-500/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-serif text-white/30 mb-1.5 tracking-widest uppercase">
            出生时辰
          </label>
          <select
            value={birthTime}
            onChange={e => setBirthTime(Number(e.target.value))}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white/80 bg-white/[0.04] border border-white/[0.06] focus:outline-none focus:border-purple-500/30 transition-all"
          >
            {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(h => {
              const times = ['子时 (23:00-00:59)','丑时 (01:00-02:59)','寅时 (03:00-04:59)','卯时 (05:00-06:59)','辰时 (07:00-08:59)','巳时 (09:00-10:59)','午时 (11:00-12:59)','未时 (13:00-14:59)','申时 (15:00-16:59)','酉时 (17:00-18:59)','戌时 (19:00-20:59)','亥时 (21:00-22:59)','子时尾 (23:00-23:59)'];
              return <option key={h} value={h}>{times[h]}</option>;
            })}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-serif text-white/30 mb-1.5 tracking-widest uppercase">
            性别
          </label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value as 'male' | 'female')}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white/80 bg-white/[0.04] border border-white/[0.06] focus:outline-none focus:border-purple-500/30 transition-all"
          >
            <option value="male">男 / Male</option>
            <option value="female">女 / Female</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.9) 0%, rgba(168,130,255,0.7) 100%)',
            color: '#0a0a0a',
            boxShadow: '0 4px 24px rgba(212,175,55,0.15)',
          }}
          onMouseEnter={e => {
            if (!isLoading) {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(212,175,55,0.25)';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(212,175,55,0.15)';
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              AI 解读中...
            </span>
          ) : '✨ 开启命盘解析'}
        </button>
      </form>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════
   Main Hero Component
   ═══════════════════════════════════════════ */
interface ZiweiHeroProps {
  birthday: string;
  setBirthday: (v: string) => void;
  birthTime: number;
  setBirthTime: (v: number) => void;
  birthdayType: 'solar' | 'lunar';
  setBirthdayType: (v: 'solar' | 'lunar') => void;
  gender: 'male' | 'female';
  setGender: (v: 'male' | 'female') => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function ZiweiHero(props: ZiweiHeroProps) {
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
      style={{ height: '100svh', minHeight: '600px' }}
    >
      {/* Canvas starfield */}
      <div className="absolute inset-0">
        <StarfieldCanvas />
      </div>

      {/* Nebula overlays — taste rule purple-gold gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(124,58,237,0.08) 0%, transparent 70%)',
      }}/>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 40% at 80% 70%, rgba(212,175,55,0.05) 0%, transparent 60%)',
      }}/>
      {/* Bottom fade to black */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, transparent 50%, #09090B 100%)',
      }}/>

      {/* Parallax content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center justify-center h-full px-6 pt-20"
      >
        {/* Gold Chinese title */}
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
              background: 'linear-gradient(135deg, #D4AF37 0%, #F0D875 40%, #D4AF37 60%, #C9A227 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(212,175,55,0.3))',
              letterSpacing: '0.15em',
            }}
          >
            紫微斗数
          </h1>
        </motion.div>

        {/* English subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="text-center text-sm sm:text-base mb-10 tracking-widest uppercase"
          style={{ color: 'rgba(168,130,255,0.7)', letterSpacing: '0.3em' }}
        >
          Zi Wei Dou Shu
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center text-white/40 text-sm mb-10"
          style={{ letterSpacing: '0.05em' }}
        >
          揭开你的命盘奥秘
        </motion.p>

        {/* Input form card — floating */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <ZiweiForm {...props} />
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
            style={{ background: 'linear-gradient(to bottom, rgba(212,175,55,0.5), transparent)' }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
