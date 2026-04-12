'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { colors, radii, glass, shadows, transitions } from '@/design-system';

export type GlassLevel = 'soft' | 'strong' | 'card';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Glass intensity level */
  level?: GlassLevel;
  /** Enable framer-motion hover-lift animation */
  hoverLift?: boolean;
  /** Glow color on hover (set to empty string to disable) */
  glowColor?: string;
  /** HTML tag override */
  as?: 'div' | 'section' | 'article';
}

/**
 * GlassCard — Reusable glass-morphism container for TianJi.
 *
 * Three levels: soft (badges, pills), strong (panels), card (content cards).
 * Optionally animates on hover with a subtle lift + glow.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    {
      level = 'card',
      hoverLift = false,
      glowColor = '',
      as: Tag = 'div',
      className = '',
      style,
      children,
      ...props
    },
    ref
  ) {
    const glassStyle = glass[level];

    const mergedStyle: React.CSSProperties = {
      ...glassStyle,
      borderRadius: level === 'soft' ? radii.badge : radii.cardLg,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    };

    const baseClass = `${className}`;

    if (hoverLift) {
      const MotionTag = motion[Tag as 'div'];

      return (
        <MotionTag
          ref={ref}
          className={baseClass}
          style={mergedStyle}
          whileHover={{
            y: -4,
            scale: 1.01,
            boxShadow: glowColor
              ? shadows.glow(glowColor)
              : shadows.cardHover,
          }}
          transition={transitions.hoverLift}
          {...(props as React.ComponentProps<typeof MotionTag>)}
        >
          {children}
        </MotionTag>
      );
    }

    return (
      <Tag ref={ref} className={baseClass} style={mergedStyle} {...props}>
        {children}
      </Tag>
    );
  }
);
