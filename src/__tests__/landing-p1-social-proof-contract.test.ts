import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('TianJi Love landing P1 trust-privacy contract', () => {
  it('ships a pure-server TrustPrivacyBanner with no client-only or network dependencies', () => {
    const banner = read('src/components/landing/TrustPrivacyBanner.tsx');

    expect(banner).not.toMatch(/^['"]use client['"]/m);
    expect(banner).not.toMatch(/\bfetch\s*\(/);
    expect(banner).not.toMatch(/useEffect|useState|useRouter|useSession/);

    const codeOnly = banner
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(codeOnly).not.toMatch(/\bstripe\b|\bsupabase\b|\bpayment\b|\bgtag\b/);
  });

  it('renders TrustPrivacyBanner above the landing steps', () => {
    const page = read('src/app/[locale]/page.tsx');

    expect(page).toContain(
      "import { TrustPrivacyBanner } from '@/components/landing/TrustPrivacyBanner';",
    );
    expect(page).toMatch(/<TrustPrivacyBanner\s+locale=\{locale\}/);

    const bannerIdx = page.indexOf('<TrustPrivacyBanner ');
    const stepsIdx = page.indexOf('{t.steps.map(');
    expect(bannerIdx).toBeGreaterThan(-1);
    expect(stepsIdx).toBeGreaterThan(bannerIdx);
  });

  it('exposes three policy-grounded facts in both locales', () => {
    const banner = read('src/components/landing/TrustPrivacyBanner.tsx');

    expect(banner).toContain('noAccountLabel:');
    expect(banner).toContain('shareSafetyLabel:');
    expect(banner).toContain('analyticsDefaultOffLabel:');

    expect(banner).toContain('No account needed to begin.');
    expect(banner).toContain('Birth details are never placed in share links.');
    expect(banner).toContain('Optional analytics is disabled by default.');

    expect(banner).toContain('无需账号即可开始。');
    expect(banner).toContain('出生资料不会出现在分享链接中。');
    expect(banner).toContain('可选分析默认关闭。');
  });

  it('does not claim data resale behavior not stated in the current privacy policy', () => {
    const banner = read('src/components/landing/TrustPrivacyBanner.tsx');

    expect(banner).not.toMatch(/sell or trade your answers/i);
    expect(banner).not.toMatch(/出售或交换你的回答/);
    expect(banner).not.toContain('noResaleLabel');
  });

  it('does not render fabricated social-proof, refresh, or numeric claims', () => {
    const banner = read('src/components/landing/TrustPrivacyBanner.tsx');
    const copyBlock = banner.match(/const COPY[\s\S]*?\n\};/);
    expect(copyBlock, 'copy block exists').toBeTruthy();
    const copyText = copyBlock![0];

    expect(copyText).not.toMatch(/readings are being shared|被分享|每天|users today|visitors/i);
    expect(copyText).not.toMatch(/refreshed|最近更新|每日更新|每月更新/i);
    expect(copyText).not.toMatch(/\d+,\d{3}|\d+%/);
    expect(copyText).not.toMatch(/(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/);
  });
});
