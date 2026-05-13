import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function expectNoKnownMojibake(source: string) {
  expect(source).not.toMatch(/[�]|鈥|鈫|馃|锟|閳|娴|涓|鍏|瑙ｈ|闅愮|鏃舵|浼氬|璺宠|姝ｅ|杩斿|缁熶|鍛界|濉旂|漏/);
}

function firstHeaderBlock(source: string) {
  const tianjiHeader = source.indexOf('<TianjiLoveHeader');
  if (tianjiHeader >= 0) {
    const end = source.indexOf('/>', tianjiHeader);
    return source.slice(tianjiHeader, end + 2);
  }

  const customHeader = source.indexOf('<header');
  const end = source.indexOf('</header>', customHeader);
  return source.slice(customHeader, end + '</header>'.length);
}

describe('Tianji Love P0/P1 page visual contract', () => {
  it('keeps second-slice customer path nav aligned to Tianji Love-only labels', () => {
    const p0Pages = [
      'src/app/(main)/ask/page.tsx',
      'src/app/(main)/draw/page.tsx',
      'src/app/(main)/pricing/page.tsx',
      'src/app/(main)/about/page.tsx',
      'src/app/login/page.tsx',
      'src/app/relationship/new/client.tsx',
    ];

    for (const file of p0Pages) {
      const header = firstHeaderBlock(read(file));

      expect(header, file).toMatch(/Love Reading|copy\.nav\.loveReading|t\.nav\.loveReading/);
      expect(header, file).toMatch(/Ask|copy\.nav\.ask|t\.nav\.ask/);
      expect(header, file).toMatch(/Draw|copy\.nav\.draw|t\.nav\.draw/);
      expect(header, file).toMatch(/Pricing|copy\.nav\.pricing|t\.nav\.pricing/);
      expect(header, file).toMatch(/About|copy\.nav\.about|t\.nav\.about/);
      expect(header, file).toMatch(/Login|copy\.nav\.login|t\.nav\.login/);
      expect(header, file).toMatch(/\/relationship\/new/);
      expect(header, file).toMatch(/\/ask/);
      expect(header, file).toMatch(/\/draw/);
      expect(header, file).toMatch(/\/pricing/);
      expect(header, file).toMatch(/\/about/);
      expect(header, file).toMatch(/\/login/);
      expect(header, file).not.toMatch(/Compatibility|Timing|Privacy|copy\.nav\.compatibility|copy\.nav\.timing|copy\.nav\.privacy|t\.nav\.compatibility|t\.nav\.timing|t\.nav\.privacy/);
    }
  });

  it('keeps /draw as a Love Timing page while preserving preview and unlock APIs', () => {
    const page = read('src/app/(main)/draw/page.tsx');

    expect(page).toContain("fetch('/api/draw/preview'");
    expect(page).toContain("fetch('/api/draw/unlock'");
    expect(page).toContain('session_id');
    expect(page).toContain('tianji.draw.preview');
    expect(page).toContain('TianjiLoveShell');
    expect(page).toContain('TianjiLoveHeader');
    expect(page).toContain('TianjiLoveHeroImage');
    expect(page).toContain('Read the romantic timing around your next turn.');
    expect(page).toContain('看清下一次关系转折附近的时机。');
    expect(page).toContain('Reveal my timing window');
    expect(page).toContain('/assets/images/hero/tianji-love-couple-red-thread-16x9.png');
    expect(page).toContain('/assets/images/hero/tianji-love-moon-pavilion-16x9.png');
    expect(page).not.toContain('BackgroundVideoHero');
    expect(page).not.toContain('ModuleInputShell');
    expect(page).not.toContain('LanguageSwitch');
    expectNoKnownMojibake(page);
  });

  it('keeps /pricing on the existing Stripe checkout contract with Tianji Love visuals', () => {
    const page = read('src/app/(main)/pricing/page.tsx');

    expect(page).toContain("fetch('/api/stripe/checkout'");
    expect(page).toContain('body: JSON.stringify({ planId })');
    expect(page).toContain("router.push(href('/login'))");
    expect(page).toContain('TianjiLoveShell');
    expect(page).toContain('TianjiLoveHeader');
    expect(page).toContain('TianjiLoveFinalCta');
    expect(page).toContain('Go deeper only when the reading earns it.');
    expect(page).toContain('当一次解读真的有帮助，再进入更深一层。');
    expect(page).toContain('Paid plans unlock depth and history, not guaranteed predictions.');
    expect(page).toContain('出生资料默认保持私密，公开分享不展示生日、时间、地点或时区。');
    expect(page).not.toContain('bg-gradient-to-br from-purple');
    expectNoKnownMojibake(page);
  });

  it('keeps checkout return pages inside the Tianji Love shell', () => {
    const success = read('src/app/(main)/pricing/success/page.tsx');
    const cancel = read('src/app/(main)/pricing/cancel/page.tsx');
    const source = `${success}\n${cancel}`;

    expect(success).toContain('useSearchParams');
    expect(success).toContain('session_id');
    expect(source).toContain('TianjiLoveShell');
    expect(source).toContain('TianjiLoveHeader');
    expect(source).toContain('TianjiLoveFooter');
    expect(source).toContain("href('/dashboard')");
    expect(source).toContain("href('/pricing')");
    expect(source).toContain("href('/')");
    expect(source).toContain('Your deeper love practice is open.');
    expect(source).toContain('本次没有产生扣款。');
    expectNoKnownMojibake(source);
  });

  it('keeps clean Tianji Love metadata for the P0 conversion entries', () => {
    const pricing = read('src/app/(main)/pricing/layout.tsx');
    const draw = read('src/app/(main)/draw/layout.tsx');
    const ask = read('src/app/(main)/ask/layout.tsx');
    const relationship = read('src/app/relationship/new/page.tsx');
    const source = `${pricing}\n${draw}\n${ask}\n${relationship}`;

    expect(pricing).toContain('Tianji Love Pricing | Deeper Love Readings & Compatibility Reports');
    expect(draw).toContain('Tianji Love Timing | Relationship Turning Point Reading');
    expect(ask).toContain('Tianji Love Reading | Ask A Private Relationship Question');
    expect(relationship).toContain('Tianji Love Compatibility | Relationship Pattern Report');
    expect(source).not.toContain('TianJi Pro');
    expect(source).not.toContain('Three Cards');
    expect(source).not.toContain('Ask the Oracle');
    expectNoKnownMojibake(source);
  });

  it('keeps P1 trust, account, and legal pages on the Tianji Love shell', () => {
    const pages = [
      read('src/app/(main)/about/page.tsx'),
      read('src/app/(main)/legal/page.tsx'),
      read('src/app/(main)/legal/privacy/page.tsx'),
      read('src/app/(main)/legal/terms/page.tsx'),
      read('src/app/(main)/readings/page.tsx'),
      read('src/app/(main)/profile/page.tsx'),
      read('src/app/(main)/reading/[id]/page.tsx'),
      read('src/app/login/page.tsx'),
      read('src/app/dashboard/page.tsx'),
      read('src/app/dashboard/profile/[profileId]/page.tsx'),
    ];
    const source = pages.join('\n');

    expect(source).toContain('TianjiLoveShell');
    expect(source).toContain('TianjiLoveHeader');
    expect(source).toContain('TianjiLoveFooter');
    expect(source).toContain('A calmer way to read relationship patterns.');
    expect(source).toContain('Use Tianji Love as reflection, not certainty.');
    expect(source).toContain('Your readings, reports, and compatibility history');
    expect(source).toContain('Private profile center');
    expect(source).toContain('Your private relationship hub is connected');
    expect(source).not.toContain('GlassCard');
    expect(source).not.toContain('bg-gradient-to-br from-purple');
    expectNoKnownMojibake(source);
  });

  it('keeps auxiliary route headers on the shared Tianji Love-only primary nav', () => {
    const primitives = read('src/components/tianji-love/TianjiLovePrimitives.tsx');
    const primaryNav = primitives.slice(primitives.indexOf('const PRIMARY_NAV'), primitives.indexOf('const FOOTER_NAV'));
    const auxiliaryPages = [
      'src/app/dashboard/page.tsx',
      'src/app/dashboard/profile/[profileId]/page.tsx',
      'src/app/(main)/profile/page.tsx',
      'src/app/(main)/readings/page.tsx',
      'src/app/(main)/reading/[id]/page.tsx',
      'src/app/(main)/report/[id]/page.tsx',
      'src/app/(main)/legal/page.tsx',
      'src/app/(main)/legal/privacy/page.tsx',
      'src/app/(main)/legal/terms/page.tsx',
    ];

    for (const signal of [
      "{ label: 'Love Reading', href: '/relationship/new'",
      "{ label: 'Ask', href: '/ask'",
      "{ label: 'Draw', href: '/draw'",
      "{ label: 'Pricing', href: '/pricing'",
      "{ label: 'About', href: '/about'",
      "{ label: 'Login', href: '/login'",
    ]) {
      expect(primaryNav).toContain(signal);
    }

    expect(primaryNav).not.toMatch(/Compatibility|Timing|History|Profile|Privacy|Terms/);

    for (const file of auxiliaryPages) {
      const source = read(file);
      const header = firstHeaderBlock(source);

      expect(source, file).toContain('getTianjiLovePrimaryNav');
      expect(source, file).toContain('getTianjiLovePrimaryCta');
      expect(header, file).toContain('getTianjiLovePrimaryNav');
      expect(header, file).toContain('getTianjiLovePrimaryCta');
      expect(header, file).not.toMatch(/Compatibility|Timing|History|Profile|Privacy|Terms/);
      expect(header, file).not.toMatch(/t\.nav\.compatibility|t\.nav\.timing|t\.nav\.history|t\.nav\.profile|t\.nav\.privacy|t\.nav\.terms/);
    }
  });

  it('bridges account and legacy module surfaces away from the old purple shell', () => {
    const mainLayout = read('src/app/(main)/layout.tsx');
    const dashboard = read('src/app/dashboard/page.tsx');
    const dashboardProfile = read('src/app/dashboard/profile/[profileId]/page.tsx');
    const globals = read('src/app/globals.css');
    const tokens = read('src/design-system/design-tokens.ts');
    const landingTokens = read('src/design-system/landing-tokens.ts');

    expect(mainLayout).toContain('tj-love-app-surface');
    expect(dashboard).toContain('tianji-love-dashboard-page');
    expect(dashboardProfile).toContain('tianji-love-dashboard-profile-page');
    expect(globals).toContain('Tianji Love legacy surface bridge');
    expect(globals).toContain('linear-gradient(180deg, #050812 0%, #03040a 58%, #070914 100%)');
    expect(tokens).toContain("goldLight: '#FFE3B4'");
    expect(tokens).toContain("purpleLight: '#FF9C8B'");
    expect(landingTokens).toContain('rgba(255,124,130,0.11)');
  });

  it('keeps relationship share and report surfaces inside the Tianji Love shell without public birth data', () => {
    const share = read('src/app/relationship/share/[slug]/client.tsx');
    const report = read('src/app/(main)/report/[id]/page.tsx');
    const source = `${share}\n${report}`;

    expect(share).toContain("fetch(`/api/relationship/share?slug=${slug}`)");
    expect(share).toContain('TianjiLoveShell');
    expect(share).toContain('TianjiLoveHeader');
    expect(share).toContain('TianjiLovePanel');
    expect(share).toContain('RelationshipRadar');
    expect(share).toContain('Birth data hidden by default');
    expect(share).toContain('Birth date, birth time, birth location, and time zone are hidden by default.');
    expect(report).toContain('TianjiLoveShell');
    expect(report).toContain('TianjiLoveHeader');
    expect(report).toContain('Report ID');
    expect(source).not.toContain('linear-gradient(135deg, #0a0a1a');
    expect(source).not.toContain('GlassCard');
    expectNoKnownMojibake(source);
  });
});
