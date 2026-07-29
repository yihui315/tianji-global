import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

import {
  buildZodiacMonthPreview,
  listZodiacPreviewSigns,
  MONTH_LABELS_EN,
  MONTH_LABELS_ZH,
} from '@/components/zodiac/zodiac-month-preview';

describe('TianJi Love landing P2 zodiac month-preview contract', () => {
  it('resolves every month (0–11) to a zodiac sign in en and zh-CN with non-empty copy', () => {
    // Authoritative month→sign map (same as inside buildZodiacMonthPreview).
    const monthToSign = [
      'Capricorn', 'Aquarius', 'Pisces',
      'Aries', 'Taurus', 'Gemini',
      'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius',
    ] as const;

    // Localized labels per sign, in the same order as ZODIAC_SIGNS.
    const localizedLabels: Record<'en' | 'zh-CN', readonly string[]> = {
      en: [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
      ],
      'zh-CN': [
        '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
        '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座',
      ],
    };

    for (const locale of ['en', 'zh-CN'] as const) {
      const signs = listZodiacPreviewSigns(locale);
      expect(signs).toEqual(localizedLabels[locale]);

      for (let month = 0; month < 12; month += 1) {
        const preview = buildZodiacMonthPreview(month, locale);
        expect(preview.month).toBe(month);

        // The sign name must match the localized label for the configured month.
        const signIndexInZodiacOrder = (
          ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
           'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] as const
        ).indexOf(monthToSign[month]);
        expect(preview.sign).toBe(localizedLabels[locale][signIndexInZodiacOrder]);

        // Line + hint must be non-empty, single-sentence-ish, and never mention pricing.
        expect(preview.line.length).toBeGreaterThanOrEqual(15);
        expect(preview.hint.length).toBeGreaterThanOrEqual(5);
        expect(preview.line).not.toMatch(/\d/);
        expect(preview.hint).not.toMatch(/\d/);
        expect(preview.line.toLowerCase()).not.toContain('price');
        expect(preview.hint.toLowerCase()).not.toContain('price');
        expect(preview.line).not.toContain('¥');
        expect(preview.hint).not.toContain('¥');
        expect(preview.line).not.toContain('payment');
        expect(preview.hint).not.toContain('payment');
      }
    }
  });

  it('rejects out-of-range month indices and unsupported locales', () => {
    expect(() => buildZodiacMonthPreview(-1, 'en')).toThrow();
    expect(() => buildZodiacMonthPreview(12, 'en')).toThrow();
    expect(() => buildZodiacMonthPreview(0.5, 'en')).toThrow();
    // @ts-expect-error — invalid locale supplied on purpose
    expect(() => buildZodiacMonthPreview(0, 'fr')).toThrow();
  });

  it('exposes bilingual month labels of equal length and parity', () => {
    expect(MONTH_LABELS_EN).toHaveLength(12);
    expect(MONTH_LABELS_ZH).toHaveLength(12);
    // Both arrays exist; index-by-index parity is meaningful for the dropdown.
    expect(MONTH_LABELS_EN[0]).toBe('January');
    expect(MONTH_LABELS_ZH[0]).toBe('一月');
    expect(MONTH_LABELS_EN[11]).toBe('December');
    expect(MONTH_LABELS_ZH[11]).toBe('十二月');
  });

  it('renders ZodiacMonthPreviewCard as a client island with no fetch / network / analytics', () => {
    const card = read('src/components/zodiac/ZodiacMonthPreviewCard.tsx');

    // Intentional 'use client' since the component owns ephemeral form state.
    expect(card).toMatch(/^['"]use client['"]/m);
    // No network calls; preview is pure static lookup.
    expect(card).not.toMatch(/\bfetch\s*\(/);
    expect(card).not.toMatch(/XMLHttpRequest|axios|EventSource|WebSocket|navigator\.sendBeacon/);

    // No analytics call sites in the code body.
    // Strip /* */ and // comments first so JSDoc/negation notes don't false-positive.
    const codeOnly = card
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(codeOnly).not.toMatch(/\bstripe\b|\banalytics\b|\bsupabase\b|\bgtag\b/);
  });

  it('mounts ZodiacMonthPreviewCard on the landing page with bilingual copy', () => {
    const page = read('src/app/[locale]/page.tsx');

    expect(page).toContain(
      "import { ZodiacMonthPreviewCard } from '@/components/zodiac/ZodiacMonthPreviewCard';",
    );
    expect(page).toMatch(/<ZodiacMonthPreviewCard[\s\S]*?\/>/);

    // Both locales must provide every preview copy field.
    expect(page).toContain("previewEyebrow: 'A 30-second private signal'");
    expect(page).toContain("previewEyebrow: '30 秒私密信号'");
    expect(page).toContain("previewIntro: 'Pick the month you were born.");
    expect(page).toContain("previewIntro: '点选你的出生月份");
    expect(page).toContain("previewCtaLabel: 'Go deeper with a private reading'");
    expect(page).toContain("previewCtaLabel: '继续做一次私密关系洞察'");

    // The component must be mounted below the existing hero <section>, not inside it,
    // so the hero structure remains untouched.
    const heroEnd = page.indexOf('</section>');
    const cardIdx = page.indexOf('<ZodiacMonthPreviewCard');
    expect(heroEnd).toBeGreaterThan(-1);
    expect(cardIdx).toBeGreaterThan(heroEnd);
  });
});
