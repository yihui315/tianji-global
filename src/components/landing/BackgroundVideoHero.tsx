'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { colors, landingTokens, scrollReveal, typography, variants } from '@/design-system';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export interface BackgroundVideoHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  videoSrc?: string;
  posterSrc?: string;
  imageSrc?: string;
  align?: 'left' | 'center';
  children?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  stats?: Array<{ label: string; value: string }>;
  className?: string;
  contentClassName?: string;
}

export default function BackgroundVideoHero({
  eyebrow,
  title,
  subtitle,
  description,
  videoSrc,
  posterSrc,
  imageSrc,
  align = 'left',
  children,
  actions,
  meta,
  ctaLabel,
  ctaHref = '#',
  secondaryCtaLabel,
  secondaryCtaHref = '#',
  stats,
  className,
  contentClassName,
}: BackgroundVideoHeroProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const isCentered = align === 'center';

  return (
    <section
      ref={heroRef}
      className={cx(
        'relative isolate overflow-hidden bg-[#050508]',
        landingTokens.hero.minHeight,
        className
      )}
    >
      <motion.div className="absolute inset-0" style={{ scale: mediaScale }}>
        {posterSrc || imageSrc ? (
          <img
            src={posterSrc || imageSrc}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        {videoSrc ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterSrc}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : !posterSrc && !imageSrc ? (
          <div
            className="absolute inset-0"
            style={{ background: landingTokens.section.pageBackground }}
          />
        ) : null}
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: landingTokens.hero.overlay }}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{ background: landingTokens.hero.vignette }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: landingTokens.hero.topGlow }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: landingTokens.hero.sideGlow }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#050508]" />

      <motion.div
        style={{ y: contentY }}
        className="relative mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-6 py-24 sm:px-8"
      >
        <div
          className={cx(
            'grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,460px)] lg:items-end',
            isCentered && 'lg:grid-cols-1'
          )}
        >
          <motion.div
            initial={false}
            animate="visible"
            variants={variants.stagger}
            className={cx(
              'flex flex-col gap-6',
              isCentered ? 'items-center text-center' : 'items-start text-left',
              contentClassName
            )}
          >
            {eyebrow && (
              <motion.span
                initial={false}
                className="rounded-full border px-4 py-2 text-[0.68rem] uppercase tracking-[0.28em]"
                style={{
                  borderColor: colors.borderStrong,
                  color: colors.textSecondary,
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {eyebrow}
              </motion.span>
            )}

            <motion.h1
              initial={false}
              className="max-w-4xl text-balance"
              style={{
                ...typography.hero,
                color: colors.textPrimary,
                letterSpacing: '-0.04em',
                textShadow: '0 0 40px rgba(124,58,237,0.22)',
              }}
            >
              {title}
            </motion.h1>

            {subtitle && (
              <motion.div
                initial={false}
                className="text-sm uppercase tracking-[0.35em]"
                style={{ color: colors.textTertiary }}
              >
                {subtitle}
              </motion.div>
            )}

            {description && (
              <motion.div
                initial={false}
                className={cx(
                  'max-w-2xl text-sm leading-7 sm:text-base',
                  isCentered && 'mx-auto'
                )}
                style={{ color: colors.textSecondary }}
              >
                {description}
              </motion.div>
            )}

            {(actions || ctaLabel || secondaryCtaLabel) && (
              <motion.div
                initial={false}
                className={cx('flex flex-wrap gap-4', isCentered && 'justify-center')}
              >
                {actions}
                {ctaLabel && (
                  <a
                    href={ctaHref}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-amber-100"
                  >
                    {ctaLabel}
                  </a>
                )}
                {secondaryCtaLabel && (
                  <a
                    href={secondaryCtaHref}
                    className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-amber-200/40 hover:text-white"
                  >
                    {secondaryCtaLabel}
                  </a>
                )}
              </motion.div>
            )}

            {(meta || stats?.length) && (
              <motion.div initial={false}>
                {meta}
                {stats?.length ? (
                  <div className="grid gap-3 pt-2 sm:grid-cols-3">
                    {stats.map((stat) => (
                      <div
                        key={`${stat.label}-${stat.value}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 backdrop-blur-xl"
                      >
                        <div className="text-lg font-serif text-white/90">{stat.value}</div>
                        <div className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-white/35">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            )}
          </motion.div>

          {children && (
            <motion.div
              initial={false}
              animate="visible"
              variants={variants.fadeUp}
              className={cx(isCentered && 'mx-auto w-full max-w-2xl')}
            >
              {children}
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
