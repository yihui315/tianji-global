'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { colors, radii, variants, scrollReveal } from '@/design-system';
import { sectionHeadings } from '@/design-system/content-tokens';
import { useLanguage } from '@/hooks/useLanguage';

export interface HowItWorksStep {
  /** Step number label, e.g. "01" */
  step: string;
  /** Icon (emoji or React node) */
  icon: React.ReactNode;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
}

export interface HowItWorksStepsProps {
  /** Array of steps to display */
  steps: HowItWorksStep[];
  /** Extra class names */
  className?: string;
}

/**
 * HowItWorksSteps — Three-step explainer section.
 *
 * Renders a heading (from content-tokens) and an animated 3-column grid.
 */
export function HowItWorksSteps({
  steps,
  className = '',
}: HowItWorksStepsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: scrollReveal.once,
    margin: scrollReveal.margin,
  });
  const { lang } = useLanguage();

  return (
    <div ref={ref} className={`text-center ${className}`}>
      <motion.h2
        variants={variants.fadeUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="text-4xl sm:text-5xl font-serif mb-12 sm:mb-16"
        style={{ color: colors.textPrimary }}
      >
        {sectionHeadings.howItWorks[lang]}
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
        {steps.map((item, i) => (
          <motion.div
            key={item.step}
            variants={variants.fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ delay: i * 0.15 }}
            className="text-center group"
          >
            <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, ${colors.purpleDim}, ${colors.goldDim})`,
                }}
              />
              <span className="text-3xl relative z-10">{item.icon}</span>
            </div>
            <div
              className="text-5xl sm:text-6xl font-serif mb-3"
              style={{ color: colors.goldDim }}
            >
              {item.step}
            </div>
            <h3
              className="text-lg sm:text-xl font-serif mb-1"
              style={{ color: colors.textPrimary }}
            >
              {item.title}
            </h3>
            <p className="text-sm" style={{ color: colors.textTertiary }}>
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
