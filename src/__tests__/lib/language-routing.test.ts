import { describe, expect, it } from 'vitest';

import {
  moduleLandingCopy,
  resolveAppLanguage,
  withLanguageParam,
  type AppLanguage,
} from '@/lib/language-routing';

describe('language routing', () => {
  it('preserves Chinese language when linking from the homepage to module pages', () => {
    expect(withLanguageParam('/tarot', 'zh')).toBe('/tarot?lang=zh');
    expect(withLanguageParam('/pricing#plans', 'zh')).toBe('/pricing?lang=zh#plans');
  });

  it('does not rewrite page anchors or external links', () => {
    expect(withLanguageParam('#modules', 'zh')).toBe('#modules');
    expect(withLanguageParam('https://example.com/tarot', 'zh')).toBe(
      'https://example.com/tarot'
    );
  });

  it('prefers explicit URL language over stored and browser language', () => {
    const language: AppLanguage = resolveAppLanguage({
      queryLang: 'zh',
      storedLang: 'en',
      navigatorLanguage: 'en-US',
    });

    expect(language).toBe('zh');
  });

  it('provides Chinese landing copy for the homepage second-level destinations', () => {
    for (const moduleKey of ['bazi', 'yijing', 'tarot', 'western', 'fortune', 'pricing'] as const) {
      expect(moduleLandingCopy[moduleKey].zh.hero.title).toMatch(/[\u4e00-\u9fff]/);
      expect(moduleLandingCopy[moduleKey].zh.primaryCta).toMatch(/[\u4e00-\u9fff]/);
    }
  });
});
