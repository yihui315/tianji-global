import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

/**
 * TianJi Love landing P1 trust-privacy contract — POST-REVIEW HARDENING.
 *
 * The earlier SocialProofBanner was renamed and rewritten as a
 * TrustPrivacyBanner. After explicit user-direction during the PR
 * convergence task, this contract now locks down what MUST remain:
 *   - only the three verifiable privacy / no-account / share-safety facts
 *   - no fabricated "X readers / day" or social-proof claims
 *   - no editorial "refreshed at" stamp or static landmarks phrasing
 *   - no hardcoded numerals (other than the static ordinal "no account #1")
 */
describe('TianJi Love landing P1 trust-privacy contract', () => {
  it('ships a pure-server TrustPrivacyBanner with no client-only or analytics dependencies', () => {
    const banner = read('src/components/landing/TrustPrivacyBanner.tsx');

    // Pure server component: no 'use client', no browser-only APIs.
    expect(banner).not.toMatch(/^['"]use client['"]/m);
    expect(banner).not.toMatch(/\bfetch\s*\(/);
    expect(banner).not.toMatch(/useEffect|useState|useRouter|useSession/);

    // No analytics / billing / privacy-sensitive runtime paths in the code body.
    // We scan only code lines (strip /* */ and // comments first) so we don't
    // false-positive on negative guardrails like "no birth details ever" in JSDoc.
    const codeOnly = banner
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(codeOnly).not.toMatch(/\bstripe\b|\banalytics\b|\bsupabase\b|\bpayment\b/);
  });

  it('renders TrustPrivacyBanner inside [locale]/page.tsx with both locales', () => {
    const page = read('src/app/[locale]/page.tsx');

    expect(page).toContain(
      "import { TrustPrivacyBanner } from '@/components/landing/TrustPrivacyBanner';",
    );
    expect(page).toMatch(/<TrustPrivacyBanner\s+locale=\{locale\}/);

    // TrustPrivacyBanner must be placed above the steps explainer.
    const bannerIdx = page.indexOf('<TrustPrivacyBanner ');
    const stepsIdx = page.indexOf('{t.steps.map(');
    expect(bannerIdx).toBeGreaterThan(-1);
    expect(stepsIdx).toBeGreaterThan(bannerIdx);
  });

  it('exposes only the three verifiable trust facts in en and zh-CN', () => {
    const banner = read('src/components/landing/TrustPrivacyBanner.tsx');

    // Type alias declares the supported locale union.
    expect(banner).toMatch(/type TrustPrivacyLocale\s*=\s*'en'\s*\|\s*'zh-CN'/);
    expect(banner).toMatch(/(?:'zh-CN'|"zh-CN"):\s*\{/);
    expect(banner).toMatch(/(?:^|\s)en:\s*\{/);

    // Three required fields exist on the COPY map.
    expect(banner).toContain('noAccountLabel:');
    expect(banner).toContain('shareSafetyLabel:');
    expect(banner).toContain('noResaleLabel:');

    // en copy must contain the three specific fact strings.
    expect(banner).toContain('No account needed to begin.');
    expect(banner).toContain('Birth details are never placed in share links.');
    expect(banner).toContain('We do not sell or trade your answers.');

    // zh-CN copy must contain the three specific fact strings.
    expect(banner).toContain('无需账号即可开始。');
    expect(banner).toContain('出生资料不会出现在分享链接中。');
    expect(banner).toContain('我们不会出售或交换你的回答。');
  });

  it('does not render fabricated social-proof or refreshed-at stamp language', () => {
    const banner = read('src/components/landing/TrustPrivacyBanner.tsx');

    // Strip rgba()/rgb()/hex color codes first so design tokens don't
    // false-positive the regex (e.g. rgba(212,175,119,...)).
    void banner
      .replace(/rgba\([^)]*\)/g, 'rgba()')
      .replace(/rgb\([^)]*\)/g, 'rgb()')
      .replace(/#[0-9a-fA-F]{3,8}/g, '#hex');

    // Look at COPY literals only, not at design-system color references.
    const copyBlock = banner.match(/const COPY[\s\S]*?\n\};/);
    expect(copyBlock, 'copy block exists').toBeTruthy();
    const copyText = copyBlock![0];

    // No fabricated activity / readership claims.
    expect(copyText).not.toMatch(/relationship readings are being shared|被分享|被谨慎地分享出去/);
    expect(copyText).not.toMatch(/\b(1,247|10K|users today|people|visitors|每天都|每天都有新的)/i);
    expect(copyText).not.toMatch(/今日|每天|日活|周活/);

    // No refresh-stamp / editorial cadence phrasing.
    expect(copyText).not.toMatch(/refreshed|最近更新|上月更新|每日更新|每月更新/);
    expect(copyText).not.toMatch(/static landmark/);
    expect(copyText).not.toMatch(/(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/); // YYYY-MM-DD stamp
  });

  it('does not contain fabricated numeric counts or marketing percentages', () => {
    const banner = read('src/components/landing/TrustPrivacyBanner.tsx');
    const copyBlock = banner.match(/const COPY[\s\S]*?\n\};/);
    expect(copyBlock, 'copy block exists').toBeTruthy();
    const copyText = copyBlock![0];

    // No fake "1,247 visitors" formatted numbers or % claims anywhere in COPY.
    expect(copyText).not.toMatch(/\d+,\d{3}/);
    expect(copyText).not.toMatch(/\d+%/);
  });
});
