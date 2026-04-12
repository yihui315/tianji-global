'use client';

import { motion } from 'framer-motion';
import { colors, radii, glass, variants } from '@/design-system';

export interface StatBadgeProps {
  /** Stat value, e.g. "50K+" */
  value: string;
  /** Label, e.g. "用户信赖" */
  label: string;
  /** Optional icon (emoji or React node) */
  icon?: React.ReactNode;
  /** Extra class names */
  className?: string;
}

/**
 * StatBadge — Compact stat display used in social-proof and hero sections.
 */
export function StatBadge({
  value,
  label,
  icon,
  className = '',
}: StatBadgeProps) {
  return (
    <motion.div
      variants={variants.scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`flex items-center gap-3 px-4 py-2.5 ${className}`}
      style={{
        ...glass.soft,
        borderRadius: radii.badge,
      }}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <div className="flex flex-col">
        <span
          className="text-lg font-semibold"
          style={{ color: colors.textPrimary }}
        >
          {value}
        </span>
        <span
          className="text-[10px] leading-tight"
          style={{ color: colors.textTertiary }}
        >
          {label}
        </span>
      </div>
    </motion.div>
  );
}
