'use client';

import { colors } from '@/design-system';
import { disclaimers } from '@/design-system/content-tokens';
import { useLanguage } from '@/hooks/useLanguage';

export interface ResponsibleUseNoticeProps {
  /** Extra class names */
  className?: string;
}

/**
 * ResponsibleUseNotice — Warm, brief disclaimer about responsible use.
 *
 * Required on every page and report that presents interpretive content,
 * per the Voice & Tone guidelines.
 */
export function ResponsibleUseNotice({ className = '' }: ResponsibleUseNoticeProps) {
  const { lang } = useLanguage();

  return (
    <p
      className={`text-xs leading-relaxed max-w-lg mx-auto text-center ${className}`}
      style={{ color: colors.textMuted }}
    >
      {disclaimers.responsible[lang]}
    </p>
  );
}
