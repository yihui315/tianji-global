'use client';

import { Lock } from 'lucide-react';
import { getLoveReadingComplianceParagraph } from '@/lib/copy/compliance';

interface LoveComplianceFooterProps {
  language: 'en' | 'zh';
  className?: string;
}

export function LoveComplianceFooter({ language, className = '' }: LoveComplianceFooterProps) {
  const text = getLoveReadingComplianceParagraph(language === 'zh-CN' ? 'zh' : language);

  return (
    <div className={`flex items-start gap-2 text-xs leading-5 text-[#f4d7a3]/48 ${className}`}>
      <Lock className="mt-0.5 h-3 w-3 shrink-0 text-[#d8b77b]/60" aria-hidden />
      <span>{text}</span>
    </div>
  );
}