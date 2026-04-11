'use client';

import { useEffect, useRef } from 'react';

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const zodiacVideoRef = useRef<HTMLVideoElement>(null);
  const tarotVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Canvas star animation (runs alongside videos)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random() * 0.7 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
    }));

    const CONSTELLATIONS: [number, number][][] = [
      [[0.2, 0.3], [0.35, 0.25], [0.5, 0.35]],
      [[0.6, 0.2], [0.75, 0.28], [0.7, 0.42], [0.55, 0.38]],
      [[0.1, 0.6], [0.22, 0.52], [0.3, 0.65]],
    ];

    let frame = 0;
    let animId: number;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      stars.forEach((s) => {
        s.twinkle += 0.02;
        const alpha = s.opacity * (0.6 + 0.4 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,210,255,${alpha})`;
        ctx.fill();
        s.y -= s.speed;
        if (s.y < -2) {
          s.y = canvas.height + 2;
          s.x = Math.random() * canvas.width;
        }
      });

      ctx.strokeStyle = 'rgba(212,175,55,0.12)';
      ctx.lineWidth = 0.6;
      CONSTELLATIONS.forEach((conn) => {
        for (let i = 0; i < conn.length - 1; i++) {
          const [ax, ay] = conn[i];
          const [bx, by] = conn[i + 1];
          const ox = Math.sin(frame * 0.003 + i) * 8;
          const oy = Math.cos(frame * 0.003 + i) * 8;
          ctx.beginPath();
          ctx.moveTo(ax * canvas.width + ox, ay * canvas.height + oy);
          ctx.lineTo(bx * canvas.width + ox, by * canvas.height + oy);
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    // Video error fallback — show canvas + CSS bg instead
    const videos = [
      heroVideoRef.current,
      zodiacVideoRef.current,
      tarotVideoRef.current,
    ];
    videos.forEach((v) => {
      if (!v) return;
      v.addEventListener('error', () => {
        if (v) v.style.display = 'none';
      });
      v.addEventListener('stalled', () => {
        if (v) v.style.display = 'none';
      });
    });

    // Floating particles
    function spawnParticle() {
      if (!document.body) return;
      const p = document.createElement('div');
      p.style.cssText = [
        'position:fixed;width:2px;height:2px;',
        'background:rgba(212,175,55,0.7);border-radius:50%;',
        `left:${Math.random() * 100}%;top:${70 + Math.random() * 25}%;`,
        'pointer-events:none;z-index:20;',
        `animation:floatParticle ${5 + Math.random() * 4}s ease-out forwards;`,
      ].join('');
      document.body.appendChild(p);
      setTimeout(() => {
        if (p.parentNode) p.remove();
      }, 10000);
    }
    const particleInterval = setInterval(spawnParticle, 3000);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(particleInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="heroLoading">
      {/* CSS 宇宙背景（视频备用） */}
      <div className="cosmicBg" />

      {/* 1. 主背景视频 */}
      <video
        ref={heroVideoRef}
        className="heroVideo"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/assets/hero/hero-video.mp4" type="video/mp4" />
      </video>

      {/* 2. Canvas 星空（叠加在视频上） */}
      <canvas ref={canvasRef} className="starsCanvas" />

      {/* 3. 粒子星座连线视频 */}
      <video
        ref={zodiacVideoRef}
        className="zodiacParticles"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/assets/hero/zodiac-particles.mp4" type="video/mp4" />
      </video>

      {/* 4. 塔罗卡叠加视频 */}
      <video
        ref={tarotVideoRef}
        className="tarotOverlay"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/assets/hero/tarot-overlay.mp4" type="video/mp4" />
      </video>

      {/* 5. 水晶球暗角 */}
      <div className="vignette" />

      {/* 内容层 */}
      <div className="heroContent">
        <h1 className="heroTitle">预知未来</h1>
        <p className="heroSubtitle">命运已书写</p>
        <div className="heroDivider" />
        <p className="heroDesc">
          融合东方命理与西方占星<br />
          AI 解读你的专属人生剧本
        </p>
        <div className="ctaGroup">
          <a href="/birth-data" className="btnPrimary">立即测算</a>
          <a href="/dashboard" className="btnGhost">探索功能</a>
        </div>
      </div>

      <div className="bottomTag">TianJi Global · 玄学科技</div>
    </div>
  );
}
