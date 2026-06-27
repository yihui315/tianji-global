import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const knownMojibakePattern =
  /[�]|鈥|鈫|锟|閳|娴|涓撲|鍏崇|瑙ｈ|闅愮|鏃舵|浼氬|楼19\.9/;

describe('paid launch pricing and checkout copy contract', () => {
  it('keeps Love Premium report pricing on the canonical CNY contract', () => {
    const revenueContract = read('src/lib/love-reading/revenue-contract.ts');
    const relationshipResult = read('src/components/relationship/RelationshipResult.tsx');
    const loveCheckoutButton = read('src/components/love-reading/LoveReportCheckoutButton.tsx');
    const localizedPricing = read('src/app/[locale]/pricing/page.tsx');

    expect(revenueContract).toContain("currency: 'cny'");
    expect(revenueContract).toContain('amountMinor: 1990');
    expect(revenueContract).toContain("display: '¥19.9'");

    for (const source of [relationshipResult, loveCheckoutButton]) {
      expect(source).toContain('¥19.9');
      expect(source).toContain('CNY');
    }
    expect(localizedPricing).toContain('LOVE_PREMIUM_DISPLAY_PRICE');
    expect(localizedPricing).toContain("LOVE_PREMIUM_REPORT_PRICE.display");

    expect(`${relationshipResult}\n${localizedPricing}`).not.toMatch(/\$4\.99|\$12\.99|\$9\.99/);
  });

  it('keeps paid launch copy readable, gated, and free of unsafe claims', () => {
    const sources = [
      'src/app/(main)/pricing/page.tsx',
      'src/app/[locale]/pricing/page.tsx',
      'src/app/(main)/ask/page.tsx',
      'src/app/[locale]/love-reading/page.tsx',
      'src/app/relationship/new/client.tsx',
      'src/components/relationship/RelationshipResult.tsx',
      'src/components/love-reading/LoveReportCheckoutButton.tsx',
      'src/lib/love-reading/revenue-contract.ts',
    ].map(read).join('\n');

    expect(sources).not.toMatch(knownMojibakePattern);
    expect(sources).not.toMatch(/100% accuracy|100% accurate|fake testimonial|fake revenue/i);
    expect(sources).not.toMatch(/guaranteed (reunion|reply|commitment|outcome)/i);
    expect(sources).toContain('Paid access adds depth, not certainty.');
    expect(sources).toContain('Checkout remains gated until test-mode smoke passes.');
    expect(sources).toContain('test-mode payment gate is configured');
  });
});
