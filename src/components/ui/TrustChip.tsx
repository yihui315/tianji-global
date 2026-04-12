'use client';

import { motion } from 'framer-motion';
import { colors, radii, glass, variants } from '@/design-system';

export interface TrustChipProps {
  /** Short trust label, e.g. "Bank-grade encryption" */
  label: string;
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Accent color override */
  accentColor?: string;
  /** Extra class names */
  className?: string;
}

/**
 * TrustChip — Small inline badge communicating a trust signal.
 *
 * Used near pricing cards, footers, and CTAs.
 */
export function TrustChip({
  label,
  icon,
  accentColor = colors.successGreen,
  className = '',
}: TrustChipProps) {
  return (
    <motion.span
      variants={variants.scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium ${className}`}
      style={{
        ...glass.soft,
        borderRadius: radii.badge,
        color: accentColor,
        border: `1px solid ${accentColor}33`,
      }}
    >
      {icon && <span className="text-xs">{icon}</span>}
      {label}
    </motion.span>
  );
}
