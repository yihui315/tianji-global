'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { variants, scrollReveal } from '@/design-system';
import { sectionHeadings } from '@/design-system/content-tokens';
import { useLanguage } from '@/hooks/useLanguage';

export interface SectionHeaderProps {
  /** Key into sectionHeadings content token */
  titleKey?: keyof typeof sectionHeadings;
  /** Override: raw title string (takes precedence over titleKey) */
  title?: string;
  /** Optional badge shown above the title */
  badge?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Extra class names */
  className?: string;
}

/**
 * SectionHeader — Consistent section heading with scroll-reveal animation.
 *
 * Can be driven by content-token keys or raw strings.
 */
export function SectionHeader({
  titleKey,
  title,
  badge,
  subtitle,
  className = '',
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: scrollReveal.once,
    margin: scrollReveal.margin,
  });
  const { lang } = useLanguage();

  const resolvedTitle =
    title ?? (titleKey ? sectionHeadings[titleKey][lang] : '');

  return (
    <motion.div
      ref={ref}
      variants={variants.fadeUp}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={`text-center mb-12 sm:mb-16 ${className}`}
    >
      {badge && (
        <div className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-amber-300/80">
          {badge}
        </div>
      )}
      <h2 className="text-4xl sm:text-5xl font-serif text-white">
        {resolvedTitle}
      </h2>
      {subtitle && (
        <p className="mt-4 text-sm sm:text-base text-white/40 max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
