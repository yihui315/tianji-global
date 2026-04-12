'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { colors, radii, shadows, transitions } from '@/design-system';

export type MysticButtonVariant = 'solid' | 'outline' | 'ghost';
export type MysticButtonSize = 'sm' | 'md' | 'lg';

export interface MysticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: MysticButtonVariant;
  size?: MysticButtonSize;
  href?: string;
  /** When true, renders as a motion element with hover-lift */
  animated?: boolean;
}

const sizeClasses: Record<MysticButtonSize, string> = {
  sm: 'px-5 py-2 text-xs',
  md: 'px-8 py-3 text-sm',
  lg: 'px-10 py-4 text-base sm:px-12 sm:py-5 sm:text-lg',
};

const variantStyles: Record<MysticButtonVariant, React.CSSProperties> = {
  solid: {
    background: colors.textPrimary,
    color: '#000',
    boxShadow: '0 0 30px rgba(255,255,255,0.15)',
  },
  outline: {
    background: 'rgba(255,255,255,0.02)',
    color: colors.textSecondary,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: shadows.softGlass,
    border: `1px solid ${colors.borderStrong}`,
  },
  ghost: {
    background: 'transparent',
    color: colors.textSecondary,
    border: 'none',
  },
};

/**
 * MysticButton — Primary interactive button for TianJi.
 *
 * Supports three variants (solid / outline / ghost), three sizes,
 * optional href (renders <a>), and framer-motion hover animation.
 */
export const MysticButton = forwardRef<HTMLButtonElement, MysticButtonProps>(
  function MysticButton(
    {
      variant = 'solid',
      size = 'md',
      href,
      animated = true,
      className = '',
      children,
      style,
      ...props
    },
    ref
  ) {
    const baseClass = `inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 cursor-pointer ${sizeClasses[size]} ${className}`;

    const mergedStyle: React.CSSProperties = {
      ...variantStyles[variant],
      borderRadius: radii.button,
      fontFamily: 'var(--font-barlow), sans-serif',
      letterSpacing: '0.05em',
      ...style,
    };

    /* If href is provided, render an <a> tag */
    if (href) {
      if (animated) {
        return (
          <motion.a
            href={href}
            className={baseClass}
            style={mergedStyle}
            whileHover={{ y: -2, scale: 1.03 }}
            transition={transitions.hoverLift}
          >
            {children}
          </motion.a>
        );
      }
      return (
        <a href={href} className={baseClass} style={mergedStyle}>
          {children}
        </a>
      );
    }

    /* Button element */
    if (animated) {
      return (
        <motion.button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={baseClass}
          style={mergedStyle}
          whileHover={{ y: -2, scale: 1.03 }}
          transition={transitions.hoverLift}
          {...(props as React.ComponentProps<typeof motion.button>)}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <button ref={ref} className={baseClass} style={mergedStyle} {...props}>
        {children}
      </button>
    );
  }
);
