'use client';

import { motion } from 'framer-motion';
import { colors, scrollReveal, typography, variants, landingTokens } from '@/design-system';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export interface LandingSectionProps {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  children: React.ReactNode;
}

export default function LandingSection({
  id,
  eyebrow,
  title,
  subtitle,
  description,
  align = 'center',
  className,
  contentClassName,
  titleClassName,
  children,
}: LandingSectionProps) {
  const isCentered = align === 'center';

  return (
    <section
      id={id}
      className={cx('relative overflow-hidden px-6 py-16 sm:px-8 sm:py-24', className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{ background: landingTokens.section.spotlight }}
      />
      <div
        className={cx(
          'relative mx-auto',
          landingTokens.section.maxWidth,
          contentClassName
        )}
      >
        {(eyebrow || title || subtitle || description) && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={scrollReveal}
            variants={variants.fadeUp}
            className={cx(
              'mb-10 flex flex-col gap-4',
              isCentered ? 'items-center text-center' : 'items-start text-left'
            )}
          >
            {eyebrow && (
              <div className="flex items-center gap-3">
                <div
                  className="h-px w-10"
                  style={{ background: landingTokens.section.divider }}
                />
                <span
                  className="text-[0.68rem] font-medium uppercase tracking-[0.28em]"
                  style={{ color: colors.textTertiary }}
                >
                  {eyebrow}
                </span>
                <div
                  className="h-px w-10"
                  style={{ background: landingTokens.section.divider }}
                />
              </div>
            )}
            {title && (
              <h2
                className={cx('max-w-4xl text-balance', titleClassName)}
                style={{
                  ...typography.sectionTitle,
                  color: colors.textPrimary,
                }}
              >
                {title}
              </h2>
            )}
            {(subtitle || description) && (
              <div
                className={cx(
                  'text-sm leading-7 sm:text-base',
                  isCentered ? landingTokens.section.proseWidth : 'max-w-2xl'
                )}
                style={{ color: colors.textSecondary }}
              >
                {subtitle ?? description}
              </div>
            )}
          </motion.div>
        )}

        {children}
      </div>
    </section>
  );
}
