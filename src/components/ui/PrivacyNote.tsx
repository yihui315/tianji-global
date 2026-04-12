'use client';

import { colors } from '@/design-system';
import { disclaimers } from '@/design-system/content-tokens';
import { useLanguage } from '@/hooks/useLanguage';

export interface PrivacyNoteProps {
  /** Extra class names */
  className?: string;
}

/**
 * PrivacyNote — Inline privacy assurance text.
 *
 * Renders the privacy disclaimer from content-tokens. Meant for use
 * near forms, footers, and data-input screens.
 */
export function PrivacyNote({ className = '' }: PrivacyNoteProps) {
  const { lang } = useLanguage();

  return (
    <p
      className={`text-xs leading-relaxed ${className}`}
      style={{ color: colors.textMuted }}
    >
      <span aria-hidden="true" className="mr-1">🔒</span>
      {disclaimers.privacy[lang]}
    </p>
  );
}
