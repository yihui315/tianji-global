'use client';

/**
 * GlowButton — 脉冲发光按钮
 *
 * 基于 AI_Animation 的发光效果模式
 * 用于CTA和重要操作按钮
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

type GlowVariant = 'primary' | 'secondary' | 'accent' | 'warning';
type GlowSize = 'sm' | 'md' | 'lg';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: GlowVariant;
  size?: GlowSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  language?: 'zh' | 'en';
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<GlowVariant, { gradient: string; glow: string; border: string }> = {
  primary: {
    gradient: 'linear-gradient(135deg, #7C3AED, #A782FF)',
    glow: 'rgba(168, 130, 255, 0.6)',
    border: 'rgba(168, 130, 255, 0.5)'
  },
  secondary: {
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    glow: 'rgba(245, 158, 11, 0.4)',
    border: 'rgba(245, 158, 11, 0.4)'
  },
  accent: {
    gradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
    glow: 'rgba(236, 72, 153, 0.6)',
    border: 'rgba(236, 72, 153, 0.5)'
  },
  warning: {
    gradient: 'linear-gradient(135deg, #EF4444, #F87171)',
    glow: 'rgba(239, 68, 68, 0.5)',
    border: 'rgba(239, 68, 68, 0.5)'
  }
};

const SIZE_STYLES: Record<GlowSize, { padding: string; fontSize: string; iconSize: string }> = {
  sm: { padding: '8px 16px', fontSize: '12px', iconSize: '14px' },
  md: { padding: '12px 24px', fontSize: '14px', iconSize: '16px' },
  lg: { padding: '16px 32px', fontSize: '16px', iconSize: '20px' }
};

export default function GlowButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  language = 'zh',
  fullWidth = false
}: GlowButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const style = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <motion.button
      className={`glow-button ${fullWidth ? 'full-width' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      style={{
        background: style.gradient,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        border: `1px solid ${style.border}`,
        borderRadius: '12px',
        color: 'white',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        position: 'relative',
        overflow: 'hidden',
        width: fullWidth ? '100%' : 'auto',
        boxShadow: isHovered && !disabled
          ? `0 0 30px ${style.glow}, 0 0 60px ${style.glow}`
          : `0 0 15px ${style.glow}`,
        transition: 'box-shadow 0.3s ease, transform 0.2s ease'
      }}
    >
      {/* Ripple effect */}
      {isHovered && !disabled && (
        <motion.div
          className="ripple"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Pulse animation ring */}
      {isHovered && !disabled && (
        <motion.div
          className="pulse-ring"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.2, 0.5]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '16px',
            border: `2px solid ${style.border}`,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Content */}
      <div className="btn-content" style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
        {loading ? (
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%'
            }}
          />
        ) : icon ? (
          <span style={{ fontSize: sizeStyle.iconSize }}>{icon}</span>
        ) : null}

        <span>{children}</span>
      </div>

      <style jsx>{`
        .glow-button {
          font-family: inherit;
          outline: none;
          user-select: none;
        }

        .glow-button.full-width {
          width: 100%;
        }

        .ripple {
          border-radius: 50%;
        }

        .pulse-ring {
          pointer-events: none;
        }
      `}</style>
    </motion.button>
  );
}

// Icon button variant
export function GlowIconButton({
  icon,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  label
}: {
  icon: string;
  onClick?: () => void;
  variant?: GlowVariant;
  size?: GlowSize;
  disabled?: boolean;
  label: string;
}) {
  const style = VARIANT_STYLES[variant];
  const sizeMap: Record<GlowSize, string> = { sm: '36px', md: '44px', lg: '52px' };

  return (
    <motion.button
      className="glow-icon-btn"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        borderRadius: '50%',
        background: style.gradient,
        border: `1px solid ${style.border}`,
        boxShadow: `0 0 20px ${style.glow}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px',
        color: 'white'
      }}
      aria-label={label}
    >
      {icon}
    </motion.button>
  );
}