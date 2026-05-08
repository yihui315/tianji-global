import { describe, expect, it } from 'vitest';

import {
  detectSmartTitleLang,
  planSmartTitle,
  tokenizeSmartTitle,
} from '@/lib/smart-title';

describe('smart title typography engine', () => {
  it('detects Chinese, English, and mixed title language', () => {
    expect(detectSmartTitleLang('\u7d2b\u5fae\u6597\u6570\u63ed\u5f00\u4f60\u7684\u547d\u76d8\u5965\u79d8')).toBe('zh');
    expect(detectSmartTitleLang('Decode the structure of your destiny')).toBe('en');
    expect(detectSmartTitleLang('AI \u7cbe\u51c6\u547d\u76d8\u89e3\u6790')).toBe('mixed');
  });

  it('plans Chinese hero titles into balanced segments without orphan lines', () => {
    const plan = planSmartTitle('\u7d2b\u5fae\u6597\u6570\u63ed\u5f00\u4f60\u7684\u547d\u76d8\u6df1\u5c42\u7ed3\u6784\u4e0e\u65f6\u95f4\u5bc6\u7801', {
      lang: 'zh',
      maxLines: 2,
      priority: 'hero',
    });

    expect(plan.lang).toBe('zh');
    expect(plan.utilityClass).toContain('tj-smart-title-zh');
    expect(plan.segments).toHaveLength(2);
    expect(plan.segments.every((segment) => segment.length >= 4)).toBe(true);
  });

  it('keeps English titles word-safe and uses a wider measure', () => {
    const plan = planSmartTitle('Decode the structure of your destiny', {
      lang: 'en',
      maxLines: 2,
      priority: 'hero',
    });

    expect(plan.lang).toBe('en');
    expect(plan.utilityClass).toContain('tj-smart-title-en');
    expect(plan.maxCh).toBeGreaterThan(18);
    expect(plan.segments.join(' ')).toBe('Decode the structure of your destiny');
  });

  it('tokenizes mixed AI and Chinese titles for unified font rendering', () => {
    const tokens = tokenizeSmartTitle('AI \u7cbe\u51c6\u547d\u76d8\u89e3\u6790');

    expect(tokens).toEqual([
      { text: 'AI', kind: 'latin' },
      { text: ' ', kind: 'neutral' },
      { text: '\u7cbe\u51c6\u547d\u76d8\u89e3\u6790', kind: 'cjk' },
    ]);
  });

  it('does not start a new Chinese or mixed line with punctuation', () => {
    const plan = planSmartTitle('\u4e00\u4e2a\u9ad8\u7ea7 AI \u547d\u8fd0\u5e73\u53f0\uff0c\u4e3a\u60f3\u770b\u6e05\u65f6\u673a\u7684\u4eba\u800c\u751f\u3002', {
      lang: 'auto',
      maxLines: 2,
      priority: 'hero',
    });

    expect(plan.segments).toHaveLength(2);
    expect(plan.segments[1]).not.toMatch(/^[，。！？：；、,.!?;:]/);
  });

  it('removes punctuation from display titles for cinematic hero typography', () => {
    const chinesePlan = planSmartTitle('看清时机，掌握命运的下一步。', {
      lang: 'zh',
      maxLines: 2,
      priority: 'hero',
    });
    const englishPlan = planSmartTitle('See the timing. Move before destiny moves you.', {
      lang: 'en',
      maxLines: 2,
      priority: 'hero',
    });

    expect(chinesePlan.segments.join('')).toBe('看清时机掌握命运的下一步');
    expect(englishPlan.segments.join(' ')).toBe('See the timing Move before destiny moves you');
  });

  it('respects author supplied line breaks for cinematic title composition', () => {
    const plan = planSmartTitle('看清时机\n掌握下一步', {
      lang: 'zh',
      maxLines: 2,
      priority: 'hero',
    });

    expect(plan.segments).toEqual(['看清时机', '掌握下一步']);
  });

  it('keeps manually composed Chinese hero lines visually even', () => {
    const plan = planSmartTitle('看清时机\n掌握命运', {
      lang: 'zh',
      maxLines: 2,
      priority: 'hero',
    });

    expect(plan.segments).toEqual(['看清时机', '掌握命运']);
    expect(plan.segments.map((segment) => Array.from(segment).length)).toEqual([4, 4]);
  });
});
