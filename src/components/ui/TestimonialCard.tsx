'use client';

import { motion } from 'framer-motion';
import { colors, radii, glass, variants } from '@/design-system';

export interface TestimonialCardProps {
  /** Quote text */
  quote: string;
  /** Author name */
  author: string;
  /** Location, e.g. "London" */
  location: string;
  /** Optional avatar (emoji, URL, or React node) */
  avatar?: React.ReactNode;
  /** Extra class names */
  className?: string;
}

/**
 * TestimonialCard — Social-proof card with glass background.
 */
export function TestimonialCard({
  quote,
  author,
  location,
  avatar,
  className = '',
}: TestimonialCardProps) {
  return (
    <motion.div
      variants={variants.fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`flex flex-col justify-between p-6 ${className}`}
      style={{
        ...glass.card,
        borderRadius: radii.cardLg,
      }}
    >
      {/* Quote */}
      <p
        className="text-sm leading-relaxed mb-6"
        style={{ color: colors.textSecondary }}
      >
        &ldquo;{quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        {avatar && (
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{
              background: colors.purpleDim,
              color: colors.purpleLight,
            }}
          >
            {avatar}
          </span>
        )}
        <div>
          <span
            className="text-xs font-medium block"
            style={{ color: colors.textPrimary }}
          >
            {author}
          </span>
          <span
            className="text-[10px]"
            style={{ color: colors.textMuted }}
          >
            {location}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
