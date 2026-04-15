'use client';

/**
 * GlassCardPro — 增强玻璃拟态卡片
 *
 * 基于 AI_Animation 的 glassmorphism 效果
 * 多层次玻璃效果 + 动态边框
 */

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { motion as motionReact } from 'framer-motion';

interface GlassCardProProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glow' | 'bordered' | 'gradient';
  intensity?: 'light' | 'medium' | 'heavy';
  hoverEffect?: boolean;
  onClick?: () => void;
}

const VARIANT_STYLES = {
  default: {
    bg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.08)',
    backdrop: 'blur(10px)'
  },
  glow: {
    bg: 'rgba(168,130,255,0.05)',
    border: 'rgba(168,130,255,0.3)',
    backdrop: 'blur(15px)'
  },
  bordered: {
    bg: 'rgba(255,255,255,0.02)',
    border: 'rgba(168,130,255,0.5)',
    backdrop: 'blur(8px)'
  },
  gradient: {
    bg: 'linear-gradient(135deg, rgba(168,130,255,0.1), rgba(236,72,153,0.05))',
    border: 'rgba(255,255,255,0.1)',
    backdrop: 'blur(12px)'
  }
};

const INTENSITY_LEVELS = {
  light: { blur: 10, opacity: 0.03, borderWidth: 1 },
  medium: { blur: 15, opacity: 0.06, borderWidth: 1.5 },
  heavy: { blur: 25, opacity: 0.1, borderWidth: 2 }
};

export default function GlassCardPro({
  children,
  className = '',
  variant = 'default',
  intensity = 'medium',
  hoverEffect = true,
  onClick
}: GlassCardProProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const variantStyle = VARIANT_STYLES[variant];
  const intensityStyle = INTENSITY_LEVELS[intensity];

  return (
    <motionReact.div
      ref={cardRef}
      className={`glass-card-pro ${className}`}
      onMouseMove={hoverEffect ? handleMouseMove : undefined}
      onMouseEnter={hoverEffect ? handleMouseEnter : undefined}
      onMouseLeave={hoverEffect ? handleMouseLeave : undefined}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {/* Background layer */}
      <div
        className="card-bg"
        style={{
          background: typeof variantStyle.bg === 'string' ? variantStyle.bg : undefined,
          backdropFilter: variantStyle.backdrop,
          borderRadius: '20px',
          position: 'absolute',
          inset: 0,
          border: `${intensityStyle.borderWidth}px solid ${variantStyle.border}`,
          opacity: intensityStyle.opacity,
          transition: 'all 0.3s ease'
        }}
      />

      {/* Gradient background */}
      {typeof variantStyle.bg === 'string' && variantStyle.bg.includes('gradient') && (
        <div
          className="card-gradient"
          style={{
            background: variantStyle.bg,
            borderRadius: '20px',
            position: 'absolute',
            inset: 0,
            border: `${intensityStyle.borderWidth}px solid ${variantStyle.border}`
          }}
        />
      )}

      {/* Glow effect on hover */}
      {isHovered && variant === 'glow' && (
        <motion.div
          className="card-glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            inset: '-20px',
            background: 'radial-gradient(circle at center, rgba(168,130,255,0.3) 0%, transparent 70%)',
            borderRadius: '40px',
            filter: 'blur(20px)',
            zIndex: -1
          }}
        />
      )}

      {/* Border shimmer on hover */}
      {isHovered && (
        <motion.div
          className="border-shimmer"
          initial={{ opacity: 0, x: '-100%' }}
          animate={{ opacity: 1, x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            borderRadius: '20px',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Content */}
      <div
        className="card-content"
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '24px',
          transform: 'translateZ(20px)'
        }}
      >
        {children}
      </div>

      {/* Corner decoration */}
      <div className="corner-decoration" style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60px',
        height: '60px',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: isHovered ? 'rgba(168,130,255,0.3)' : 'rgba(168,130,255,0.1)',
          transition: 'background 0.3s ease'
        }} />
      </div>

      <style jsx>{`
        .glass-card-pro {
          position: relative;
          cursor: pointer;
          transform-style: preserve-3d;
        }

        .card-bg, .card-gradient {
          pointer-events: none;
        }

        .card-content {
          transform: translateZ(20px);
        }
      `}</style>
    </motionReact.div>
  );
}

// Simple version without 3D effect
export function GlassCardSimple({
  children,
  className = '',
  variant = 'default',
  glow = false
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glow' | 'gradient';
  glow?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyle = VARIANT_STYLES[variant];

  return (
    <div
      className={`glass-simple ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="simple-bg"
        style={{
          background: typeof variantStyle.bg === 'string' ? variantStyle.bg : (variantStyle.bg as any)?.bg,
          backdropFilter: variantStyle.backdrop,
          borderRadius: '20px',
          border: `1px solid ${variantStyle.border}`,
          transition: 'all 0.3s ease',
          boxShadow: isHovered && glow
            ? '0 0 30px rgba(168,130,255,0.3), 0 8px 32px rgba(0,0,0,0.3)'
            : '0 8px 32px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ padding: '24px', position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </div>

      {/* Animated border on hover */}
      {isHovered && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(168,130,255,0.5), transparent)',
            animation: 'shimmer 1.5s ease-in-out infinite',
            backgroundSize: '200% 100%'
          }} />
        </div>
      )}

      <style jsx>{`
        .glass-simple {
          position: relative;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}