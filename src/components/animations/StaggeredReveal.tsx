'use client';

/**
 * StaggeredReveal — 依次渐显动画组件
 *
 * 基于 AI_Animation 的 staggered fade-in 动画模式
 * 用于内容依次展示，增强沉浸感
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StaggeredRevealProps {
  children: React.ReactNode[];
  staggerDelay?: number;      // 每个元素延迟 (ms)
  duration?: number;          // 动画时长 (s)
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  initialDelay?: number;      // 初始延迟 (ms)
  className?: string;
  staggerOnly?: boolean;       // true=只执行一次, false=每次可见时执行
  threshold?: number;         // 触发阈值 (0-1)
}

export default function StaggeredReveal({
  children,
  staggerDelay = 150,
  duration = 0.8,
  direction = 'up',
  initialDelay = 0,
  className = '',
  staggerOnly = false,
  threshold = 0.1
}: StaggeredRevealProps) {
  const [isVisible, setIsVisible] = useState(!staggerOnly);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 观察器模式
  useEffect(() => {
    if (staggerOnly) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [staggerOnly, threshold]);

  // 方向配置
  const directionVariants = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
    fade: { x: 0, y: 0 }
  };

  const offset = directionVariants[direction];

  return (
    <div ref={containerRef} className={`staggered-container ${className}`}>
      <AnimatePresence>
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              x: offset.x,
              y: offset.y
            }}
            animate={isVisible ? {
              opacity: 1,
              x: 0,
              y: 0
            } : {
              opacity: 0,
              x: offset.x,
              y: offset.y
            }}
            transition={{
              duration,
              delay: initialDelay + (index * staggerDelay) / 1000,
              ease: [0.22, 1, 0.36, 1]  // 自定义缓动曲线
            }}
            className="staggered-item"
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>

      <style jsx>{`
        .staggered-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>
    </div>
  );
}

// 网格布局版本
interface StaggeredGridProps {
  children: React.ReactNode[];
  columns?: number;
  staggerDelay?: number;
  duration?: number;
  gap?: number;
  className?: string;
}

export function StaggeredGrid({
  children,
  columns = 3,
  staggerDelay = 100,
  duration = 0.6,
  gap = 16,
  className = ''
}: StaggeredGridProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`staggered-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {children.map((child, index) => {
        // 计算行列索引，用于波浪效果
        const row = Math.floor(index / columns);
        const col = index % columns;
        const delay = (row + col) * staggerDelay / 1000;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
              duration,
              delay,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            {child}
          </motion.div>
        );
      })}

      <style jsx>{`
        .staggered-grid {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

// 单行依次显示
interface SequentialRevealProps {
  text: string;
  className?: string;
  staggerDelay?: number;
  staggerChars?: boolean;  // 按字符依次显示
}

export function SequentialReveal({
  text,
  className = '',
  staggerDelay = 50,
  staggerChars = true
}: SequentialRevealProps) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRevealed(prev => {
        if (prev >= text.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, staggerDelay);

    return () => clearInterval(timer);
  }, [text.length, staggerDelay]);

  return (
    <span className={`sequential-reveal ${className}`}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: i < revealed ? 1 : 0 }}
          transition={{ duration: 0.1 }}
          style={{
            display: char === ' ' ? 'inline' : 'inline-block',
            minWidth: char === ' ' ? '0.25em' : 'auto'
          }}
        >
          {char}
        </motion.span>
      ))}

      <style jsx>{`
        .sequential-reveal {
          display: inline;
        }
      `}</style>
    </span>
  );
}

// 进度条式渐显
interface RevealProgressProps {
  progress: number;  // 0-100
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

export function RevealProgress({
  progress,
  children,
  direction = 'left',
  className = ''
}: RevealProgressProps) {
  const [show, setShow] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // 计算元素在视口中的位置
      const scrollProgress = 1 - (elementTop / (windowHeight - elementHeight));
      setShow(scrollProgress >= 0);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getClipPath = () => {
    const p = Math.min(100, Math.max(0, progress));
    switch (direction) {
      case 'left': return `inset(0 ${100 - p}% 0 0)`;
      case 'right': return `inset(0 0 0 ${100 - p}%)`;
      case 'up': return `inset(${100 - p}% 0 0 0)`;
      case 'down': return `inset(0 0 ${100 - p}% 0)`;
      default: return 'none';
    }
  };

  return (
    <div ref={containerRef} className={`reveal-progress ${className}`}>
      <div
        className="reveal-mask"
        style={{
          clipPath: getClipPath(),
          transition: 'clip-path 0.1s ease-out'
        }}
      >
        {children}
      </div>

      <style jsx>{`
        .reveal-progress {
          position: relative;
        }
        .reveal-mask {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}