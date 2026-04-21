'use client';

import { GlassCard } from '@/components/ui';
import { colors, landingTokens, typography } from '@/design-system';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export interface ModuleInputShellProps {
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export default function ModuleInputShell({
  eyebrow,
  title,
  description,
  footer,
  className,
  children,
}: ModuleInputShellProps) {
  return (
    <GlassCard
      level="strong"
      className={cx(
        'relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 p-6 sm:p-8',
        className
      )}
      style={{
        boxShadow: landingTokens.glass.glow,
        border: landingTokens.glass.strongOutline,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-px"
        style={{ background: landingTokens.section.divider }}
      />

      {(eyebrow || title || description) && (
        <div className="mb-6 flex flex-col gap-3">
          {eyebrow && (
            <span
              className="text-[0.68rem] uppercase tracking-[0.28em]"
              style={{ color: colors.textTertiary }}
            >
              {eyebrow}
            </span>
          )}
          {title && (
            <h3
              style={{
                ...typography.cardTitle,
                color: colors.textPrimary,
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              }}
            >
              {title}
            </h3>
          )}
          {description && (
            <div className="text-sm leading-6" style={{ color: colors.textSecondary }}>
              {description}
            </div>
          )}
        </div>
      )}

      <div className="space-y-5">{children}</div>

      {footer && (
        <div
          className="mt-6 border-t pt-4 text-xs"
          style={{
            borderColor: colors.borderSubtle,
            color: colors.textTertiary,
          }}
        >
          {footer}
        </div>
      )}
    </GlassCard>
  );
}
