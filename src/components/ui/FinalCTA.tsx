'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { colors, variants, scrollReveal } from '@/design-system';
import { sectionHeadings, ctaLabels, disclaimers } from '@/design-system/content-tokens';
import { useLanguage } from '@/hooks/useLanguage';
import { MysticButton } from './MysticButton';

export interface FinalCTAProps {
  /** Override CTA href */
  href?: string;
  /** Override subtitle text */
  subtitle?: string;
  /** Show helper text below CTA */
  helperText?: string;
  /** Extra class names */
  className?: string;
}

/**
 * FinalCTA — Full-width call-to-action section used near the bottom of pages.
 *
 * Consumes content-tokens for headline, CTA label, and subtitle.
 */
export function FinalCTA({
  href = '/western',
  subtitle,
  helperText,
  className = '',
}: FinalCTAProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: scrollReveal.once,
    margin: scrollReveal.margin,
  });
  const { lang, t } = useLanguage();

  const heading = sectionHeadings.finalCta[lang];
  const resolvedSubtitle = subtitle ?? t('cta.subtitle');
  const ctaLabel = ctaLabels.primary[lang];
  const resolvedHelper = helperText ?? t('hero.helper');

  return (
    <section
      ref={ref}
      className={`relative z-10 py-28 sm:py-36 overflow-hidden ${className}`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[120px]"
          style={{ background: colors.purpleDim }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          variants={variants.fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <p
            className="text-xs tracking-[0.3em] uppercase mb-6"
            style={{ color: colors.goldDim }}
          >
            Destiny Awaits
          </p>
          <h2
            className="text-3xl sm:text-5xl font-serif mb-6"
            style={{ color: colors.textPrimary }}
          >
            {heading}
          </h2>
          <p
            className="text-sm mb-10 max-w-md mx-auto leading-relaxed"
            style={{ color: colors.textTertiary }}
          >
            {resolvedSubtitle}
          </p>
          <div className="text-center">
            <MysticButton variant="solid" size="lg" href={href}>
              {ctaLabel}
            </MysticButton>
            {resolvedHelper && (
              <p
                className="text-xs mt-4"
                style={{ color: colors.textTertiary }}
              >
                {resolvedHelper}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
