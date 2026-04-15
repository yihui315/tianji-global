'use client';

/**
 * CosmicParticles — 星尘粒子背景动画
 *
 * 基于 AI_Animation 的粒子系统模式
 * 用于占卜页面的宇宙星空背景
 */

import { useEffect, useRef } from 'react';

interface ParticleConfig {
  count?: number;
  color?: string;
  speed?: number;
  size?: number;
}

export default function CosmicParticles({
  count = 150,
  color = '168, 130, 255', // 紫色星尘
  speed = 0.3,
  size = 2
}: ParticleConfig) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 粒子类
    class Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      alphaDirection: number;
      color: string;

      constructor(canvas: HTMLCanvasElement) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * size + 0.5;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = -Math.random() * speed - 0.1; // 向上飘动
        this.alpha = Math.random();
        this.alphaDirection = Math.random() > 0.5 ? 1 : -1;
        this.color = color;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha += this.alphaDirection * 0.01;

        // 透明度边界
        if (this.alpha >= 1) this.alphaDirection = -1;
        if (this.alpha <= 0) this.alphaDirection = 1;

        // 循环
        if (this.y < -10) {
          this.y = canvas.height + 10;
          this.x = Math.random() * canvas.width;
        }
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.fill();

        // 星芒效果
        if (this.radius > 1.5) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${this.color}, ${this.alpha * 0.2})`;
          ctx.fill();
        }
      }
    }

    // 初始化粒子
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(canvas));
    }

    // 星座连接线
    interface Star {
      x: number;
      y: number;
      size: number;
      twinkle: number;
      twinkleSpeed: number;
    }

    const stars: Star[] = [];
    for (let i = 0; i < 30; i++) {
      stars.push({
        x: Math.random() * (window.innerWidth || 1920),
        y: Math.random() * (window.innerHeight || 1080),
        size: Math.random() * 2 + 1,
        twinkle: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005
      });
    }

    // 动画循环
    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制背景渐变
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, 'rgba(10, 5, 30, 0.3)');
      gradient.addColorStop(1, 'rgba(3, 0, 20, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制粒子
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      // 绘制星座
      stars.forEach(star => {
        star.twinkle += star.twinkleSpeed;
        const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      // 绘制星座连接线（随机）
      if (Math.random() < 0.02) { // 偶尔闪烁
        ctx.strokeStyle = 'rgba(168, 130, 255, 0.1)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x;
            const dy = stars[i].y - stars[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
              ctx.beginPath();
              ctx.moveTo(stars[i].x, stars[i].y);
              ctx.lineTo(stars[j].x, stars[j].y);
              ctx.stroke();
            }
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [count, color, speed, size]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(180deg, #030014 0%, #0a0a1e 50%, #1a0a3e 100%)'
      }}
    />
  );
}