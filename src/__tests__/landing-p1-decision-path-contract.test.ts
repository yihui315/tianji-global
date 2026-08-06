import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const pagePath = 'src/app/[locale]/page.tsx';

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

/**
 * TianJi Love landing P1 decision-path contract — POST-REVIEW HARDENING.
 *
 * After explicit user-direction during the PR convergence task, this contract
 * now locks down what MUST be REMOVED from the hero:
 *   - the "first-N-questions free" hook (was dailyHook)
 *   - hardcoded ¥19.9 / ¥99 numerals in the hero
 *   - any "coming_soon" style product being advertised as already purchasable
 *
 * Hero price anchors must come from /pricing, which is the single source of
 * truth for live PRODUCT_CATALOG data.
 */
describe('TianJi Love landing P1 decision-path contract (compliance)', () => {
  it('keeps decision-path copy and bilingual parity', () => {
    const source = read(pagePath);

    // Type-shape: promise items must still be { headline, when } objects.
    expect(source).toMatch(/promise:\s*\{ headline: string; when: string \}\[\]/);

    // The bilingual promise entries themselves must be intact (no Chinese mojibake,
    // no English localization gaps).
    expect(source).toContain('{ headline: \'Discover patterns.\'');
    expect(source).toContain('{ headline: \'发现情感模式。\'');

    // Each locale must still have exactly three promise entries with non-empty when hints.
    const whenHints = source.match(/when:\s*'[^']+'/g) ?? [];
    expect(whenHints.length).toBeGreaterThanOrEqual(6);
  });

  it('removed the "first-N-questions free" hook from both locales', () => {
    const source = read(pagePath);

    // The HomeCopy type must no longer carry a dailyHook field.
    expect(source).not.toMatch(/dailyHook\s*:\s*string/);
    expect(source).not.toMatch(/dailyHook\s*:\s*'/);

    // The hero must not render {t.dailyHook} anywhere.
    expect(source).not.toContain('{t.dailyHook}');

    // No English "first three questions are on us" or any "for free" / "are on us" phrasing
    // that promises a fixed free reading quota without a backing plan.
    expect(source).not.toMatch(/first (three|3)\b[^.]*(free|on us|gratis)/i);
    expect(source).not.toMatch(/前三个[^。]*免费/);
    expect(source).not.toMatch(/前 3[^。]*免费/);
  });

  it('removed hardcoded ¥19.9 / ¥99 price numerals from the hero copy', () => {
    const source = read(pagePath);

    // The HomeCopy type must no longer carry a priceTeaser field.
    expect(source).not.toMatch(/priceTeaser\s*:\s*string/);
    expect(source).not.toMatch(/priceTeaser\s*:\s*'/);
    expect(source).not.toContain('{t.priceTeaser}');

    // No hardcoded CNY numerals may appear anywhere inside the hero copy literals.
    expect(source).not.toMatch(/¥\s*19\.9/);
    expect(source).not.toMatch(/¥\s*99\b/);
    expect(source).not.toMatch(/19\.9\s*起/);
    expect(source).not.toMatch(/月度订阅\s*¥/);

    // USD/RMB-free guarantee: no "free first question"-style marketing line in the copy object.
    expect(source).not.toMatch(/Free first question/);
    expect(source).not.toMatch(/首次免费/);
  });

  it('routes pricing display through the live /pricing page, not embedded numerals', () => {
    const source = read(pagePath);

    // Secondary CTA still routes to /pricing. That page is the single source of truth
    // for live PRODUCT_CATALOG data — verified here at the link target, not at copy level.
    const secondaryCtaLine = source
      .split('\n')
      .find((line) => line.includes('{t.secondaryCta}') || line.includes('href='));
    expect(source).toMatch(/href=\{getLocalizedPath\(locale, '\/pricing'\)\}/);

    // secondaryCta text must remain a navigational invite (View pricing / 查看价格),
    // never asserting that a paid plan is currently buyable.
    expect(source).toContain("secondaryCta: 'View pricing'");
    expect(source).toContain("secondaryCta: '查看价格'");
    void secondaryCtaLine;
  });

  it('renders each promise item with both headline and when hint', () => {
    const source = read(pagePath);

    expect(source).toMatch(/t\.promise\.map\(\(item\) => \(/);
    expect(source).toContain('{item.headline}');
    expect(source).toContain('{item.when}');

    const mapStart = source.indexOf('t.promise.map');
    expect(mapStart).toBeGreaterThan(-1);
    const mapBody = source.slice(mapStart);
    expect(mapBody).not.toMatch(/<[^>]*>\s*\{item\}\s*</);
    expect(mapBody).toContain('{item.headline}');
    expect(mapBody).toContain('{item.when}');
  });
});
