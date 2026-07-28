import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('TianJi Love landing P1 social-proof contract', () => {
  it('ships a pure-server SocialProofBanner with no client-only or analytics dependencies', () => {
    const banner = read('src/components/landing/SocialProofBanner.tsx');

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

  it('renders SocialProofBanner inside [locale]/page.tsx with both locales', () => {
    const page = read('src/app/[locale]/page.tsx');

    expect(page).toContain("import { SocialProofBanner } from '@/components/landing/SocialProofBanner';");
    expect(page).toMatch(/<SocialProofBanner\s+locale=\{locale\}/);

    // The banner must be placed above steps.map (it is the social-proof anchor
    // before the 3-step explainer).
    const bannerIdx = page.indexOf('<SocialProofBanner ');
    const stepsIdx = page.indexOf('{t.steps.map(');
    expect(bannerIdx).toBeGreaterThan(-1);
    expect(stepsIdx).toBeGreaterThan(bannerIdx);
  });

  it('exposes bilingual copy in banner for en and zh-CN', () => {
    const banner = read('src/components/landing/SocialProofBanner.tsx');

    // Type alias declares the supported locale union.
    expect(banner).toMatch(/type SocialProofLocale\s*=\s*'en'\s*\|\s*'zh-CN'/);
    // Copy map covers both locales. JS allows `en:` shorthand key syntax
    // (no quotes needed) but requires quotes around `zh-CN`; accept both.
    expect(banner).toMatch(/(?:'zh-CN'|"zh-CN"):\s*\{/);
    expect(banner).toMatch(/(?:^|\s)en:\s*\{/);

    // Default copy must exist in both scripts.
    expect(banner).toContain('Private relationship readings are being shared with care every day.');
    expect(banner).toContain('每天都有新的私密关系解读被谨慎地分享出去。');

    // Both locales must include a "refreshed" label so refreshed-at renders.
    expect(banner).toContain('Last refreshed');
    expect(banner).toContain('最近更新');
  });

  it('does not render numeric claim or marketing-style percentage in copy', () => {
    const banner = read('src/components/landing/SocialProofBanner.tsx');

    // Static text only — no fabricated numeric claim that could mis-state usage.
    // We strip rgba()/rgb()/hex color codes first so design tokens don't
    // false-positive the regex (e.g. rgba(212,175,119,...)).
    const codeOnly = banner
      .replace(/rgba\([^)]*\)/g, 'rgba()')
      .replace(/rgb\([^)]*\)/g, 'rgb()')
      .replace(/#[0-9a-fA-F]{3,8}/g, '#hex');

    // Look at COPY literals only, not at design-system color references.
    const copyBlock = banner.match(/const COPY[\s\S]*?\n\};/);
    expect(copyBlock, 'copy block exists').toBeTruthy();
    expect(copyBlock![0]).not.toMatch(/\d+,\d{3}/); // no fake "1,247 visitors"
    expect(copyBlock![0]).not.toMatch(/\d+%/); // no fake % claim
    // Use codeOnly to satisfy "no never used" lint warning if any.
    void codeOnly;
  });
});
