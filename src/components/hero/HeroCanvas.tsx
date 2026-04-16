'use client';

import { useEffect, useRef } from 'react';
import { ArrowUpRight, Play } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function HeroCanvas() {
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const zodiacVideoRef = useRef<HTMLVideoElement>(null);
  const tarotVideoRef = useRef<HTMLVideoElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // ── BlurText Animation ──
  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLSpanElement>('.blur-word');
    if (!words.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLSpanElement;
            const delay = Number(target.dataset.delay ?? 0);
            setTimeout(() => {
              target.classList.add('visible');
            }, delay);
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.1 }
    );

    words.forEach((w) => observer.observe(w));
    return () => observer.disconnect();
  }, []);

  // ── Canvas Star Animation ──
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    const canvas = canvasEl;
    const context = ctx;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.25 + 0.04,
      opacity: Math.random() * 0.6 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
    }));

    const CONSTELLATIONS: [number, number][][] = [
      [[0.2, 0.35], [0.35, 0.25], [0.5, 0.38]],
      [[0.62, 0.18], [0.76, 0.28], [0.72, 0.44], [0.56, 0.38]],
      [[0.1, 0.6], [0.22, 0.52], [0.3, 0.65]],
    ];

    let frame = 0;
    let animId: number;

    function draw() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      stars.forEach((s) => {
        s.twinkle += 0.02;
        const alpha = s.opacity * (0.5 + 0.5 * Math.sin(s.twinkle));
        context.beginPath();
        context.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(220,210,255,${alpha})`;
        context.fill();
        s.y -= s.speed;
        if (s.y < -2) {
          s.y = canvas.height + 2;
          s.x = Math.random() * canvas.width;
        }
      });

      context.strokeStyle = 'rgba(180,160,255,0.1)';
      context.lineWidth = 0.5;
      CONSTELLATIONS.forEach((conn) => {
        for (let i = 0; i < conn.length - 1; i++) {
          const [ax, ay] = conn[i];
          const [bx, by] = conn[i + 1];
          const ox = Math.sin(frame * 0.003 + i) * 6;
          const oy = Math.cos(frame * 0.003 + i) * 6;
          context.beginPath();
          context.moveTo(ax * canvas.width + ox, ay * canvas.height + oy);
          context.lineTo(bx * canvas.width + ox, by * canvas.height + oy);
          context.stroke();
        }
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    // Floating particles
    function spawnParticle() {
      if (!document.body) return;
      const p = document.createElement('div');
      p.style.cssText = [
        'position:fixed;width:2px;height:2px;',
        'background:rgba(200,180,255,0.6);border-radius:50%;',
        `left:${Math.random() * 100}%;top:${60 + Math.random() * 30}%;`,
        'pointer-events:none;z-index:20;',
        `animation:floatParticle ${5 + Math.random() * 4}s ease-out forwards;`,
      ].join('');
      document.body.appendChild(p);
      setTimeout(() => { if (p.parentNode) p.remove(); }, 10000);
    }
    const particleInterval = setInterval(spawnParticle, 3000);

    // Video autoplay enforcement — all three layers
    const allVideos = [heroVideoRef.current, zodiacVideoRef.current, tarotVideoRef.current];
    allVideos.forEach((v) => {
      if (!v) return;
      v.addEventListener('error', () => { if (v) v.style.display = 'none'; });
      v.addEventListener('stalled', () => { if (v) v.style.display = 'none'; });
      v.play().catch(() => {});
    });

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(particleInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Split heading text into blur-word spans
  const headingText = lang === 'zh' ? '命运 已书写' : 'Destiny Awaits';
  const words = headingText.split(' ');

  return (
    <div className="hero-root">
      {/* Layer 1: Pure black */}
      <div className="hero-layer-bg" />

      {/* Layer 2: Hero video */}
      <video
        ref={heroVideoRef}
        className="hero-video-bg"
        autoPlay
        loop
        muted={true}
        playsInline
      >
        <source src="/assets/hero/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Layer 3: Zodiac particles overlay */}
      <video
        ref={zodiacVideoRef}
        className="hero-zodiac-particles"
        autoPlay
        loop
        muted={true}
        playsInline
      >
        <source src="/assets/hero/zodiac-particles.mp4" type="video/mp4" />
      </video>

      {/* Layer 4: Canvas stars */}
      <canvas ref={canvasRef} className="hero-stars-canvas" />

      {/* Layer 5: Tarot card overlay */}
      <video
        ref={tarotVideoRef}
        className="hero-tarot-overlay"
        autoPlay
        loop
        muted={true}
        playsInline
      >
        <source src="/assets/hero/tarot-overlay.mp4" type="video/mp4" />
      </video>

      {/* Layer 4: Dark overlay */}
      <div className="hero-layer-overlay" />

      {/* Layer 5: Bottom fade */}
      <div className="hero-layer-fade" />

      {/* Layer 6: Vignette */}
      <div className="hero-layer-vignette" />

      {/* ── Content Layer ── */}
      <div className="hero-content">
        {/* Badge */}
        <div className="hero-badge">
          <span className="hero-badge-new">{lang === 'zh' ? '全新' : 'New'}</span>
          <span>{lang === 'zh' ? 'AI驱动命运解读' : 'AI-Powered Fortune Telling'}</span>
        </div>

        {/* Heading with BlurText animation */}
        <h1 ref={headingRef} className="hero-heading">
          {words.map((word, i) => (
            <span
              key={i}
              className="blur-word"
              data-delay={i * 120}
            >
              {word}
              {i < words.length - 1 ? '\u00A0' : ''}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          {lang === 'zh' ? (
            <>
              紫微 · 八字 · 星盘 · 塔罗<br />
              中西命理全覆盖<br />
              AI赋能 · 精准解读
            </>
          ) : (
            <>
              Zi Wei · BaZi · Western Chart · Tarot<br />
              East meets West divination<br />
              AI-powered precision readings
            </>
          )}
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta">
          <a href="/birth-data" className="btn-glass btn-glass-solid">
            {lang === 'zh' ? '开始探索' : 'Get Started'} <ArrowUpRight size={16} strokeWidth={2} />
          </a>
          <a href="/dashboard" className="btn-glass btn-glass-outline">
            {lang === 'zh' ? '观看演示' : 'Watch Demo'} <Play size={14} strokeWidth={2} />
          </a>
        </div>
      </div>

      {/* ── Partners Bar ── */}
      <div className="hero-partners">
        <div className="hero-partners-badge">
          {lang === 'zh' ? '全球命运探索者信赖' : 'Trusted by fortune seekers worldwide'}
        </div>
        <div className="hero-partners-names">
          {(lang === 'zh'
            ? ['紫微斗数', '八字命理', '易经', '西方星盘', '塔罗']
            : ['Zi Wei', 'BaZi', 'Yi Jing', 'Western Chart', 'Tarot']
          ).map((name) => (
            <span key={name} className="hero-partner-name">{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
