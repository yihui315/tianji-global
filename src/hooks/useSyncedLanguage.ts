'use client';

import { useCallback, useEffect, useState } from 'react';

import { useLanguage } from '@/hooks/useLanguage';
import { resolveAppLanguage, type AppLanguage } from '@/lib/language-routing';

export function useSyncedLanguage(defaultLanguage?: AppLanguage) {
  const { lang, setLang } = useLanguage();
  const [language, setLanguageState] = useState<AppLanguage>(defaultLanguage ?? lang);

  useEffect(() => {
    setLanguageState(lang);
  }, [lang]);

  useEffect(() => {
    const queryLang = new URLSearchParams(window.location.search).get('lang');
    const nextLanguage = resolveAppLanguage({
      queryLang,
      storedLang: localStorage.getItem('tianji-lang'),
      navigatorLanguage: navigator.language,
      fallback: lang,
    });

    setLanguageState(nextLanguage);
    localStorage.setItem('tianji-lang', nextLanguage);
    if (nextLanguage !== lang) setLang(nextLanguage);
  }, [lang, setLang]);

  const setLanguage = useCallback(
    (nextLanguage: AppLanguage) => {
      setLanguageState(nextLanguage);
      setLang(nextLanguage);
    },
    [setLang]
  );

  return [language, setLanguage] as const;
}
