'use client';

import { motion } from 'framer-motion';
import {
  colors,
  radii,
  glass,
  shadows,
  variants,
  transitions,
} from '@/design-system';
import { MysticButton } from './MysticButton';

export interface PricingFeature {
  label: string;
  included: boolean;
}

export interface PricingCardProps {
  /** Plan name, e.g. "Stellar" */
  name: string;
  /** Short tagline */
  tagline: string;
  /** Price display, e.g. "$9.9" */
  price: string;
  /** Period label, e.g. "/mo" */
  period: string;
  /** Feature list */
  features: PricingFeature[];
  /** CTA label */
  ctaLabel: string;
  /** CTA href */
  ctaHref?: string;
  /** Highlight this card as popular */
  highlighted?: boolean;
  /** Identity badge text, e.g. "Most Popular" */
  identityBadge?: string;
  /** Extra class names */
  className?: string;
}

/**
 * PricingCard — Single pricing tier card with glass style.
 */
export function PricingCard({
  name,
  tagline,
  price,
  period,
  features,
  ctaLabel,
  ctaHref = '#',
  highlighted = false,
  identityBadge,
  className = '',
}: PricingCardProps) {
  return (
    <motion.div
      variants={variants.fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`flex flex-col p-6 sm:p-8 ${className}`}
      style={{
        ...(highlighted ? glass.strong : glass.card),
        borderRadius: radii.cardLg,
        border: highlighted
          ? `1px solid ${colors.gold}33`
          : `1px solid ${colors.borderSubtle}`,
        boxShadow: highlighted
          ? shadows.glow(colors.goldDim)
          : glass.card.boxShadow,
      }}
    >
      {/* Header */}
      <div className="mb-6">
        {identityBadge && (
          <span
            className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-3"
            style={{
              background: highlighted ? colors.goldDim : colors.purpleDim,
              color: highlighted ? colors.gold : colors.purpleLight,
            }}
          >
            {identityBadge}
          </span>
        )}
        <h3
          className="text-lg font-medium"
          style={{ color: colors.textPrimary }}
        >
          {name}
        </h3>
        <p
          className="text-xs mt-1"
          style={{ color: colors.textTertiary }}
        >
          {tagline}
        </p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <span
          className="text-4xl font-semibold"
          style={{ color: colors.textPrimary }}
        >
          {price}
        </span>
        <span
          className="text-sm ml-1"
          style={{ color: colors.textTertiary }}
        >
          {period}
        </span>
      </div>

      {/* Features */}
      <ul className="flex-1 flex flex-col gap-2.5 mb-8">
        {features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-xs"
            style={{
              color: f.included ? colors.textSecondary : colors.textMuted,
            }}
          >
            <span
              className="mt-0.5 flex-shrink-0"
              style={{
                color: f.included ? colors.successGreen : colors.textMuted,
              }}
            >
              {f.included ? '✓' : '—'}
            </span>
            {f.label}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <MysticButton
        variant={highlighted ? 'solid' : 'outline'}
        size="md"
        href={ctaHref}
        className="w-full justify-center"
      >
        {ctaLabel}
      </MysticButton>
    </motion.div>
  );
}
