'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function DocumentLanguage() {
  const pathname = usePathname();

  useEffect(() => {
    const queryLanguage = new URLSearchParams(window.location.search).get('lang');
    const storedLanguage = localStorage.getItem('tianji-lang');
    const isChinese = pathname.startsWith('/zh-CN') || queryLanguage === 'zh' || storedLanguage === 'zh';
    document.documentElement.lang = isChinese ? 'zh-CN' : 'en';
  }, [pathname]);

  return null;
}
