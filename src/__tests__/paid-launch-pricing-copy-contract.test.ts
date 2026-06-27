import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOVE_PREMIUM_REPORT_PRICE } from '@/lib/love-reading/revenue-contract';

const repoRoot = process.cwd();
const yenPrice = '\u00a519.9';
const lovePremiumZh = 'Love Premium \u5b8c\u6574\u62a5\u544a';
const relationshipUnlockZh = `\u89e3\u9501\u5b8c\u6574\u5173\u7cfb\u62a5\u544a - ${yenPrice}`;

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const paidLaunchFiles = [
  'src/app/(main)/pricing/page.tsx',
  'src/app/(main)/pricing/layout.tsx',
  'src/app/[locale]/pricing/page.tsx',
  'src/components/relationship/RelationshipResult.tsx',
  'src/components/love-reading/LoveReportCheckoutButton.tsx',
  'src/lib/love-reading/revenue-contract.ts',
  'src/lib/stripe.ts',
];

const knownMojibakeTokens = [
  '\uFFFD',
  '\u9225',
  '\u922B',
  '\u9993',
  '\u951F',
  '\u95B3',
  '\u6FBE\u2562',
  '\u6D93\u5D8F',
  '\u53E7\u7EEF',
  '\u7479\uFF48',
  '\u95C2\u545A',
  '\u95C5\u6117',
  '\u93C3\u8235',
  '\u7F02\u4F7A',
  '\u6F0F',
];

const mojibakePattern = new RegExp(knownMojibakeTokens.map(escapeRegExp).join('|'));

describe('paid launch pricing copy contract', () => {
  it('keeps customer-facing paid launch copy free of known mojibake signatures', () => {
    for (const file of paidLaunchFiles) {
      expect(read(file), file).not.toMatch(mojibakePattern);
    }
  });

  it('uses the canonical Love Premium price across pricing and checkout surfaces', () => {
    expect(LOVE_PREMIUM_REPORT_PRICE).toEqual({
      currency: 'cny',
      amountMinor: 1990,
      display: yenPrice,
    });

    const pricing = read('src/app/(main)/pricing/page.tsx');
    const localizedPricing = read('src/app/[locale]/pricing/page.tsx');
    const relationship = read('src/components/relationship/RelationshipResult.tsx');
    const checkoutButton = read('src/components/love-reading/LoveReportCheckoutButton.tsx');
    const pricingLayout = read('src/app/(main)/pricing/layout.tsx');

    for (const source of [pricing, localizedPricing, relationship]) {
      expect(source).toContain(yenPrice);
      expect(source).not.toContain('$4.99');
      expect(source).not.toContain('$12.99');
      expect(source).not.toContain('Relationship Destiny Report');
    }

    expect(pricing).toContain('Love Premium Report');
    expect(localizedPricing).toContain('Love Premium report');
    expect(localizedPricing).toContain(lovePremiumZh);
    expect(relationship).toContain(`Unlock the Full Relationship Report - ${yenPrice}`);
    expect(relationship).toContain(relationshipUnlockZh);
    expect(checkoutButton).toContain('LOVE_PREMIUM_REPORT_PRICE.display');
    expect(pricingLayout).toContain("priceCurrency: 'CNY'");
    expect(pricingLayout).toContain("price: '19.90'");
  });

  it('keeps Ask and Draw one-time prices distinct from Love Premium pricing', () => {
    const pricing = read('src/app/(main)/pricing/page.tsx');
    const localizedPricing = read('src/app/[locale]/pricing/page.tsx');
    const ask = read('src/lib/ask-question.ts');
    const draw = read('src/lib/quick-draw.ts');

    expect(ask).toContain("ASK_QUESTION_UNLOCK_PRICE_DISPLAY = '$1.99'");
    expect(draw).toContain("QUICK_DRAW_UNLOCK_PRICE_DISPLAY = '$2.99'");
    expect(`${pricing}\n${localizedPricing}`).toContain('$1.99');
    expect(`${pricing}\n${localizedPricing}`).toContain('$2.99');
    expect(`${pricing}\n${localizedPricing}`).toContain('Paid unlocks add depth, not certainty');
    expect(`${pricing}\n${localizedPricing}`).not.toMatch(/100% accurate|guaranteed outcome|fake testimonial|real user revenue|verified conversion rate/i);
  });
});
