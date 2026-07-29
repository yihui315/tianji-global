import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

import {
  buildZodiacMonthBridge,
  listZodiacBridgeSignPairs,
  MONTH_LABELS_EN,
  MONTH_LABELS_ZH,
} from '@/components/zodiac/zodiac-month-preview';

/**
 * TianJi Love landing P2 birth-month bridge contract — POST-REVIEW HARDENING.
 *
 * After explicit user-direction during the PR convergence task, this contract
 * now locks down that:
 *   - Every month maps to TWO possible Western zodiac signs (the pair that
 *     straddles the cusp inside that calendar month). A single sign must
 *     never be asserted for the visitor.
 *   - The copy uses "bridge / reflection / the day we do not ask for"
 *     framing. No "your zodiac sign is X" claim is allowed.
 *   - Month remains the ONLY birth input collected. Year / day / time /
 *     place are never asked for and are not part of the type signature.
 */
describe('TianJi Love landing P2 birth-month bridge contract', () => {
  it('returns TWO straddling signs per month in en and zh-CN with non-empty bridge copy', () => {
    const expectedEnPairs: ReadonlyArray<readonly [string, string]> = [
      ['Capricorn', 'Aquarius'],
      ['Aquarius', 'Pisces'],
      ['Pisces', 'Aries'],
      ['Aries', 'Taurus'],
      ['Taurus', 'Gemini'],
      ['Gemini', 'Cancer'],
      ['Cancer', 'Leo'],
      ['Leo', 'Virgo'],
      ['Virgo', 'Libra'],
      ['Libra', 'Scorpio'],
      ['Scorpio', 'Sagittarius'],
      ['Sagittarius', 'Capricorn'],
    ];
    const expectedZhPairs = expectedEnPairs.map(([a, b]) => [
      { Capricorn: '摩羯座', Aquarius: '水瓶座', Pisces: '双鱼座', Aries: '白羊座',
        Taurus: '金牛座', Gemini: '双子座', Cancer: '巨蟹座', Leo: '狮子座',
        Virgo: '处女座', Libra: '天秤座', Scorpio: '天蝎座', Sagittarius: '射手座' }[a],
      { Capricorn: '摩羯座', Aquarius: '水瓶座', Pisces: '双鱼座', Aries: '白羊座',
        Taurus: '金牛座', Gemini: '双子座', Cancer: '巨蟹座', Leo: '狮子座',
        Virgo: '处女座', Libra: '天秤座', Scorpio: '天蝎座', Sagittarius: '射手座' }[b],
    ] as const);

    for (const locale of ['en', 'zh-CN'] as const) {
      const pairs = listZodiacBridgeSignPairs(locale);
      expect(pairs).toHaveLength(12);
      const expected = locale === 'en' ? expectedEnPairs : expectedZhPairs;
      pairs.forEach((pair, idx) => {
        expect(pair).toEqual([...expected[idx]]);
      });

      for (let month = 0; month < 12; month += 1) {
        const bridge = buildZodiacMonthBridge(month, locale);

        // The bridge MUST return two distinct signs and never a single one.
        expect(bridge.signs).toHaveLength(2);
        expect(bridge.signs[0]).not.toBe(bridge.signs[1]);

        // All copy fields must be non-empty.
        expect(bridge.bridgeLine.length).toBeGreaterThanOrEqual(20);
        expect(bridge.bridgeHint.length).toBeGreaterThanOrEqual(10);
        expect(bridge.reflectionPrimary.length).toBeGreaterThanOrEqual(15);
        expect(bridge.reflectionSecondary.length).toBeGreaterThanOrEqual(15);

        // No fabricated numerals — no day-of-month, no payment, no prices.
        // bridgeHint may include the calendar date numerals for the cusp
        // (Jan 1–19 / Jan 20–31); that is the whole point of a bridge.
        // We still forbid them in bridgeLine itself.
        expect(bridge.bridgeLine).not.toMatch(/\d/);
        expect(bridge.reflectionPrimary).not.toMatch(/\d/);
        expect(bridge.reflectionSecondary).not.toMatch(/\d/);
        expect(bridge.bridgeLine.toLowerCase()).not.toContain('price');
        expect(bridge.bridgeHint.toLowerCase()).not.toContain('price');
        expect(bridge.reflectionPrimary).not.toContain('payment');
        expect(bridge.reflectionSecondary).not.toContain('payment');
      }
    }
  });

  it('rejects out-of-range month indices and unsupported locales', () => {
    expect(() => buildZodiacMonthBridge(-1, 'en')).toThrow();
    expect(() => buildZodiacMonthBridge(12, 'en')).toThrow();
    expect(() => buildZodiacMonthBridge(0.5, 'en')).toThrow();
    // @ts-expect-error — invalid locale supplied on purpose
    expect(() => buildZodiacMonthBridge(0, 'fr')).toThrow();
  });

  it('exposes bilingual month labels of equal length and parity', () => {
    expect(MONTH_LABELS_EN).toHaveLength(12);
    expect(MONTH_LABELS_ZH).toHaveLength(12);
    expect(MONTH_LABELS_EN[0]).toBe('January');
    expect(MONTH_LABELS_ZH[0]).toBe('一月');
    expect(MONTH_LABELS_EN[11]).toBe('December');
    expect(MONTH_LABELS_ZH[11]).toBe('十二月');
  });

  it('uses bridge / reflection framing and never asserts a single sign for the visitor', () => {
    const dataFile = read('src/components/zodiac/zodiac-month-preview.ts');
    const cardFile = read('src/components/zodiac/ZodiacMonthBridgeCard.tsx');
    const page = read('src/app/[locale]/page.tsx');

    // The data file must frame each month as a bridge of two straddling signs.
    expect(dataFile).toMatch(/between\s+\$\{primaryLabel\}\s+and\s+\$\{secondaryLabel\}/);
    expect(dataFile).toMatch(/站在\s+\$\{primaryLabel\}\s+与\s+\$\{secondaryLabel\}/);
    expect(dataFile).toMatch(/depends on the day we do not ask you for|取决于我们没问你的那个日子/);
    expect(dataFile).not.toMatch(/your zodiac sign is|你的星座是|your sign is /);
    expect(dataFile).not.toMatch(/we (will|shall) (predict|tell) you( your| the)/);

    // The bridge line language must not promise which side is the visitor's.
    for (let month = 0; month < 12; month += 1) {
      const bridge = buildZodiacMonthBridge(month, 'en');
      expect(bridge.bridgeLine.toLowerCase()).not.toContain('your sign is');
      expect(bridge.bridgeLine.toLowerCase()).not.toContain('you are ');
      const zhBridge = buildZodiacMonthBridge(month, 'zh-CN');
      expect(zhBridge.bridgeLine).not.toContain('你是 ');
    }

    // The component card must use the bridge data-testid, not a preview one.
    expect(cardFile).toContain('data-testid="zodiac-month-bridge-card"');
    expect(cardFile).not.toContain('zodiac-month-preview-card');

    // The page must import and mount ZodiacMonthBridgeCard.
    expect(page).toContain(
      "import { ZodiacMonthBridgeCard } from '@/components/zodiac/ZodiacMonthBridgeCard';",
    );
    expect(page).toMatch(/<ZodiacMonthBridgeCard[\s\S]*?\/>/);
    expect(page).not.toContain('ZodiacMonthPreviewCard');
  });

  it('renders ZodiacMonthBridgeCard as a client island with no fetch / network / analytics', () => {
    const card = read('src/components/zodiac/ZodiacMonthBridgeCard.tsx');

    // Intentional 'use client' since the component owns ephemeral form state.
    expect(card).toMatch(/^['"]use client['"]/m);
    // No network calls; bridge output is a pure static lookup.
    expect(card).not.toMatch(/\bfetch\s*\(/);
    expect(card).not.toMatch(/XMLHttpRequest|axios|EventSource|WebSocket|navigator\.sendBeacon/);

    // No analytics call sites in the code body (strip JSDoc/comments first).
    const codeOnly = card
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(codeOnly).not.toMatch(/\bstripe\b|\banalytics\b|\bsupabase\b|\bgtag\b/);
  });

  it('mounts ZodiacMonthBridgeCard on the landing page with bilingual bridge copy', () => {
    const page = read('src/app/[locale]/page.tsx');

    // Both locales must provide every preview copy field (renamed for bridge).
    expect(page).toContain("previewEyebrow: 'A birth-month reflection'");
    expect(page).toContain("previewEyebrow: '出生月份上的反思'");
    expect(page).toContain("previewIntro: 'Pick the month you were born.");
    expect(page).toContain("previewIntro: '点选你的出生月份");
    expect(page).toContain("previewReflectionsLabel: 'Both readings hold for your month.'");
    expect(page).toContain("previewReflectionsLabel: '这两条反思，对你的月份都成立。'");
    expect(page).toContain("previewCtaLabel: 'Go deeper with a private reading'");
    expect(page).toContain("previewCtaLabel: '继续做一次私密关系洞察'");

    // The mount point must be below the existing hero <section>, not inside it.
    const heroEnd = page.indexOf('</section>');
    const cardIdx = page.indexOf('<ZodiacMonthBridgeCard');
    expect(heroEnd).toBeGreaterThan(-1);
    expect(cardIdx).toBeGreaterThan(heroEnd);
  });
});
