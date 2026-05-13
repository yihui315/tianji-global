'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef, type CSSProperties, type ReactNode } from 'react';
import SmartTitle from '@/components/SmartTitle';
import { colors, landingTokens, typography, variants } from '@/design-system';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function hasCjkText(value: ReactNode) {
  return typeof value === 'string' && /[\u3400-\u9fff]/.test(value);
}

export interface BackgroundVideoHeroProps {
  eyebrow?: string;
  title: ReactNode;
  titleClassName?: string;
  titleStyle?: CSSProperties;
  subtitle?: ReactNode;
  description?: ReactNode;
  videoSrc?: string;
  posterSrc?: string;
  imageSrc?: string;
  align?: 'left' | 'center';
  children?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
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
  titleClassName,
  titleStyle,
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
  const titleUsesCjk = hasCjkText(title);
  const subtitleUsesCjk = hasCjkText(subtitle);
  const ctaUsesCjk = hasCjkText(ctaLabel);
  const secondaryCtaUsesCjk = hasCjkText(secondaryCtaLabel);
  const heroTitleStyle = {
    ...typography.hero,
    color: colors.textPrimary,
    fontSize: titleUsesCjk ? 'clamp(3.25rem, 6.4vw, 5.05rem)' : typography.hero.fontSize,
    lineHeight: titleUsesCjk ? 0.98 : typography.hero.lineHeight,
    fontStyle: titleUsesCjk ? ('normal' as const) : typography.hero.fontStyle,
    letterSpacing: '0',
    textShadow: titleUsesCjk
      ? '0 24px 90px rgba(0,0,0,0.65), 0 0 34px rgba(216,183,123,0.18)'
      : '0 0 40px rgba(255,124,130,0.18)',
    ...titleStyle,
  };

  return (
    <section
      ref={heroRef}
      className={cx('relative isolate overflow-hidden bg-[#03040a]', landingTokens.hero.minHeight, className)}
    >
      <motion.div className="absolute inset-0" style={{ scale: mediaScale }}>
        {posterSrc || imageSrc ? (
          <Image
            src={(posterSrc || imageSrc) as string}
            alt=""
            aria-hidden="true"
            priority
            fill
            sizes="100vw"
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
          <div className="absolute inset-0" style={{ background: landingTokens.section.pageBackground }} />
        ) : null}
      </motion.div>

      <div className="pointer-events-none absolute inset-0" style={{ background: landingTokens.hero.overlay }} />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ background: landingTokens.hero.vignette }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: landingTokens.hero.topGlow }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: landingTokens.hero.sideGlow }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#03040a]" />

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
            className={cx('flex flex-col gap-6', isCentered ? 'items-center text-center' : 'items-start text-left', contentClassName)}
          >
            {eyebrow ? (
              <motion.span
                initial={false}
                className="rounded-lg border px-4 py-2 text-[0.68rem] uppercase tracking-[0.28em]"
                style={{
                  borderColor: colors.borderStrong,
                  color: colors.textSecondary,
                  background: 'rgba(7,11,22,0.66)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {eyebrow}
              </motion.span>
            ) : null}

            {typeof title === 'string' ? (
              <motion.div initial={false} className="w-full">
                <SmartTitle
                  as="h1"
                  text={title}
                  priority="hero"
                  maxLines={2}
                  align={align}
                  className={titleClassName}
                  style={heroTitleStyle}
                />
              </motion.div>
            ) : (
              <motion.h1 initial={false} className={cx('max-w-4xl text-balance', titleClassName)} style={heroTitleStyle}>
                {title}
              </motion.h1>
            )}

            {subtitle ? (
              <motion.div
                initial={false}
                className={cx('text-sm', subtitleUsesCjk ? 'tracking-[0.08em]' : 'uppercase tracking-[0.35em]')}
                style={{ color: colors.textTertiary }}
              >
                {subtitle}
              </motion.div>
            ) : null}

            {description ? (
              <motion.div
                initial={false}
                className={cx('max-w-2xl text-sm leading-7 sm:text-base', isCentered && 'mx-auto')}
                style={{ color: colors.textSecondary }}
              >
                {description}
              </motion.div>
            ) : null}

            {(actions || ctaLabel || secondaryCtaLabel) ? (
              <motion.div initial={false} className={cx('flex flex-wrap gap-4', isCentered && 'justify-center')}>
                {actions}
                {ctaLabel ? (
                  <a
                    href={ctaHref}
                    className={cx(
                      'rounded-lg border border-[#ffb49e]/60 bg-[#ff5c63] px-6 py-3 text-sm font-semibold text-[#fff7e6] shadow-[0_0_28px_rgba(255,92,99,0.28)] transition hover:bg-[#ff7c82]',
                      ctaUsesCjk ? 'tracking-[0.08em]' : 'uppercase tracking-[0.18em]'
                    )}
                  >
                    {ctaLabel}
                  </a>
                ) : null}
                {secondaryCtaLabel ? (
                  <a
                    href={secondaryCtaHref}
                    className={cx(
                      'rounded-lg border border-[#b57248]/42 bg-[#070b16]/64 px-6 py-3 text-sm font-semibold text-[#ffe3b4] transition hover:border-[#ffe3b4]/54 hover:text-[#fff4dd]',
                      secondaryCtaUsesCjk ? 'tracking-[0.08em]' : 'uppercase tracking-[0.18em]'
                    )}
                  >
                    {secondaryCtaLabel}
                  </a>
                ) : null}
              </motion.div>
            ) : null}

            {(meta || stats?.length) ? (
              <motion.div initial={false}>
                {meta}
                {stats?.length ? (
                  <div className="grid gap-3 pt-2 sm:grid-cols-3">
                    {stats.map((stat) => (
                      <div
                        key={`${stat.label}-${stat.value}`}
                        className="rounded-lg border border-[#b57248]/28 bg-[#070b16]/66 px-4 py-3 backdrop-blur-xl"
                      >
                        <div className="font-serif text-lg text-[#ffe3b4]">{stat.value}</div>
                        <div
                          className={cx(
                            'mt-1 text-[0.65rem] text-[#d8b77b]/50',
                            hasCjkText(stat.label) ? 'tracking-[0.06em]' : 'uppercase tracking-[0.18em]'
                          )}
                        >
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            ) : null}
          </motion.div>

          {children ? (
            <motion.div initial={false} animate="visible" variants={variants.fadeUp} className={cx(isCentered && 'mx-auto w-full max-w-2xl')}>
              {children}
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </section>
  );
}
