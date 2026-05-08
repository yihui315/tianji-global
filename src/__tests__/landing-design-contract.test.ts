import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

const moduleContracts = [
  {
    slug: 'ziwei',
    endpoint: '/api/ziwei',
    requiredSignals: ['Iztrolabe', 'saveReading'],
  },
  {
    slug: 'bazi',
    endpoint: '/api/bazi',
    requiredSignals: ['BaZiChat', 'saveReading'],
  },
  {
    slug: 'yijing',
    endpoint: '/api/yijing?enhanceWithAI=true',
    requiredSignals: ['SharePanel', 'PDFDownloadButton', 'saveReading'],
  },
  {
    slug: 'tarot',
    endpoint: '/api/tarot',
    requiredSignals: ['drawCards', 'PDFDownloadButton', 'saveReading'],
  },
  {
    slug: 'western',
    endpoint: '/api/western',
    requiredSignals: ['AstroChart', 'PDFDownloadButton', 'saveReading'],
  },
  {
    slug: 'fortune',
    endpoint: '/api/fortune?',
    requiredSignals: ['LifeChart', 'handleGenerate'],
  },
] as const;

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function publicAssetExists(assetPath: string) {
  return fs.existsSync(path.join(repoRoot, 'public', assetPath.replace(/^\//, '')));
}

describe('Tianji Love landing redesign contract', () => {
  it('keeps the redesign override active for visual-only work', () => {
    const override = read('src/app/(main)/AGENTS.override.md');

    expect(override).toContain('Visual / motion upgrade only');
    expect(override).toContain('Do NOT modify:');
    expect(override).toContain('src/app/api/**');
    expect(override).toContain('src/lib/stripe*');
    expect(override).toContain('Do not touch experiments/**');
  });

  it('keeps all referenced /assets media files present', () => {
    const checkedFiles = [
      'src/app/(main)/page.tsx',
      'src/components/home/TianjiLoveHome.tsx',
      'src/app/(main)/pricing/page.tsx',
      ...moduleContracts.map(({ slug }) => `src/app/(main)/${slug}/page.tsx`),
    ];

    const missing = checkedFiles.flatMap((file) => {
      const content = read(file);
      const matches = [...content.matchAll(/\/assets\/[^"'\s,)}`]+/g)].map((match) =>
        match[0].replace(/[.;]+$/, '')
      );

      return matches
        .filter((assetPath) => !publicAssetExists(assetPath))
        .map((assetPath) => `${file} -> ${assetPath}`);
    });

    expect(missing).toEqual([]);
  });

  it('matches the supplied Tianji Love reference homepage contract', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');

    for (const signal of [
      'tianji-love-couple-red-thread-16x9.png',
      'tianji-love-moon-pavilion-16x9.png',
      'tianji-love-logo-mark.png',
      'tianji-love-compass-mark.png',
      'tianji-love-icon-private-lock.png',
      'tianji-love-icon-personalized.png',
      'tianji-love-icon-clarity-compass.png',
      'tianji-love-icon-karmic-orbit.png',
      'tianji-love-icon-relationship-rings.png',
      'tianji-love-icon-future-hourglass.png',
      'tianji-love-divider-long.png',
      'tianji-love-emma.png',
      'tianji-love-sophie.png',
      'tianji-love-olivia.png',
      'Compatibility',
      'Love Reading',
      'Timing',
      'How It Works',
      'Pricing',
      'Get Started',
      'COSMIC INSIGHTS. REAL-LOVE GUIDANCE.',
      'Love is the one force that',
      'bends fate.',
      'Start My Love Reading',
      'See Compatibility Report',
      'Private & Secure',
      'Personalized Insights',
      'Designed for Clarity',
      'Align Your Birth Chart',
      'Birth Year',
      'Select year',
      'Solo Reading',
      'Couple Reading',
      'Reveal My First Love Insight',
      'Karmic Patterns',
      'Relationship Dynamics',
      'Future Timing',
      'Deep Analysis',
      'Emotional Compatibility',
      'Privacy First',
      'Actionable Guidance',
      'Enter Your Details',
      'We Map the Pattern',
      'Receive Clear Guidance',
      'People Found Clarity at Turning Points',
      'Emma',
      'Sophie',
      'Olivia',
      'tianji-love-testimonial-avatar',
      'Your next chapter may already be written in the stars.',
    ]) {
      expect(home).toContain(signal);
    }

    expect(home).not.toContain('Replace these tone samples with verified beta feedback before launch.');
    expect(publicAssetExists('/assets/images/hero/tianji-love-couple-red-thread-16x9.png')).toBe(true);
    expect(publicAssetExists('/assets/images/hero/tianji-love-moon-pavilion-16x9.png')).toBe(true);
    expect(publicAssetExists('/assets/images/brand/tianji-love-logo-mark.png')).toBe(true);
    expect(publicAssetExists('/assets/images/brand/tianji-love-compass-mark.png')).toBe(true);
    expect(publicAssetExists('/assets/images/icons/tianji-love-icon-private-lock.png')).toBe(true);
    expect(publicAssetExists('/assets/images/icons/tianji-love-icon-personalized.png')).toBe(true);
    expect(publicAssetExists('/assets/images/icons/tianji-love-icon-clarity-compass.png')).toBe(true);
    expect(publicAssetExists('/assets/images/icons/tianji-love-icon-karmic-orbit.png')).toBe(true);
    expect(publicAssetExists('/assets/images/icons/tianji-love-icon-relationship-rings.png')).toBe(true);
    expect(publicAssetExists('/assets/images/icons/tianji-love-icon-future-hourglass.png')).toBe(true);
    expect(publicAssetExists('/assets/images/decor/tianji-love-divider-long.png')).toBe(true);
    expect(publicAssetExists('/assets/images/avatars/tianji-love-emma.png')).toBe(true);
    expect(publicAssetExists('/assets/images/avatars/tianji-love-sophie.png')).toBe(true);
    expect(publicAssetExists('/assets/images/avatars/tianji-love-olivia.png')).toBe(true);
  });

  it('applies the module landing template without changing core endpoints', () => {
    for (const { slug, endpoint, requiredSignals } of moduleContracts) {
      const file = `src/app/(main)/${slug}/page.tsx`;
      const content = read(file);

      for (const primitive of [
        'BackgroundVideoHero',
        'ModuleInputShell',
        'ScrollNarrativeSection',
        'ResultScaffold',
        'ShareSection',
      ]) {
        expect(content, `${slug} should use ${primitive}`).toContain(primitive);
      }

      expect(content, `${slug} should keep endpoint ${endpoint}`).toContain(endpoint);
      expect(content).toContain(`/assets/videos/hero/${slug}-hero-loop-6s-1080p.mp4`);
      expect(content).toContain(`/assets/images/posters/${slug}-hero-poster-16x9.jpg`);
      expect(content).toContain(`/assets/images/hero/${slug}-hero-master-16x9.jpg`);
      expect(content).toContain(`/assets/images/og/${slug}-og-bg-1200x630.jpg`);

      for (const signal of requiredSignals) {
        expect(content, `${slug} should preserve ${signal}`).toContain(signal);
      }
    }
  });

  it('replaces / with the Tianji Love conversion homepage without changing pricing checkout', () => {
    const page = read('src/app/(main)/page.tsx');
    const home = read('src/components/home/TianjiLoveHome.tsx');
    const pricing = read('src/app/(main)/pricing/page.tsx');

    expect(page).toContain("import TianjiLoveHome from '@/components/home/TianjiLoveHome'");
    expect(page).toContain('return <TianjiLoveHome />');

    expect(home).toContain('Tianji Love');
    expect(home).toContain('tianji.love');
    expect(home).toContain('天机');
    expect(home).toContain('世间万物皆有定数');
    expect(home).toContain('Love is the one force that');
    expect(home).toContain('bends fate.');
    expect(home).toContain('/relationship/new');
    expect(home).toContain('/ask');
    expect(home).toContain('/draw');
    expect(home).toContain('/pricing');
    expect(home).toContain('withLanguageParam');

    expect(pricing).toContain("import { PLANS } from '@/lib/stripe'");
    expect(pricing).toContain("router.push(withLanguageParam('/login', language))");
    expect(pricing).toContain("fetch('/api/stripe/checkout'");
    expect(pricing).toContain('JSON.stringify({ planId })');
  });

  it('keeps the Tianji Love form as a front-end funnel into existing routes', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');

    for (const signal of [
      'Birth Year',
      'Month',
      'Day',
      'Time',
      'Solo Reading',
      'Couple Reading',
      "mode === 'solo' ? '/ask' : '/relationship/new'",
      "router.push(href(mode === 'solo' ? '/ask' : '/relationship/new'))",
      'withLanguageParam',
    ]) {
      expect(home).toContain(signal);
    }
  });

  it('keeps the visual system aligned to the supplied Tianji Love image', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');

    for (const signal of [
      'tianji-love-couple-red-thread-16x9.png',
      'tianji-love-moon-pavilion-16x9.png',
      'tianji-love-red-thread',
      'tianji-love-orbit',
      'tianji-love-glyph',
      'TianjiLoveIcon',
      'tianji-love-hero-visual',
      'tianji-love-birth-form',
      'tianji-love-select-grid',
      'tianji-love-nav-links',
      'min-width: 900px',
      'prefers-reduced-motion',
      'Karmic Patterns',
      'Relationship Dynamics',
      'Future Timing',
      'HowItWorks',
      'LoveTestimonials',
      'FinalCta',
    ]) {
      expect(home).toContain(signal);
    }
  });

  it('keeps new homepage Chinese readable and free of known mojibake markers', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');

    expect(home).toContain('在这里，我们以星轨、关系与时机');
    expect(home).toContain('所有解读都用于自我理解与关系沟通');
    expect(home).not.toMatch(/娑搢|閸弢|锟|澶╂満|鍏崇郴/);
  });

  it('prevents SmartTitle planned Chinese lines from wrapping into orphan characters', () => {
    const globals = read('src/app/globals.css');
    const lineRule = globals.match(/\.tj-smart-title-line\s*\{[^}]+\}/s)?.[0] ?? '';

    expect(lineRule).toContain('display: block');
    expect(lineRule).toContain('white-space: nowrap');
  });

  it('uses one unified TianJi font system for Chinese and English surfaces', () => {
    const layout = read('src/app/layout.tsx');
    const globals = read('src/app/globals.css');
    const tailwind = read('tailwind.config.js');

    expect(layout).not.toContain('next/font/google');
    expect(globals).toContain('--font-tianji-sans: "Segoe UI"');
    expect(globals).toContain('--font-tianji-display');
    expect(globals).toContain('--font-tianji-body');
    expect(globals).toContain('--font-tianji-display: var(--font-tianji-sans)');
    expect(globals).toContain('--font-tianji-body: var(--font-tianji-sans)');
    expect(globals).toContain('--font-instrument-serif: var(--font-tianji-display)');
    expect(globals).toContain('--font-barlow: var(--font-tianji-body)');
    expect(globals).not.toContain('--font-noto-serif-sc');
    expect(globals).not.toMatch(/font-family:\s*[^;]*(Songti SC|STSong|SimSun)/);

    expect(tailwind).toContain('fontFamily');
    expect(tailwind).toContain("serif: ['var(--font-instrument-serif)', 'serif']");
    expect(tailwind).toContain("sans: ['var(--font-barlow)', 'sans-serif']");
  });

  it('keeps public share handoffs free of sensitive birth fields', () => {
    for (const { slug } of moduleContracts) {
      const content = read(`src/app/(main)/${slug}/page.tsx`);

      expect(content, `${slug} share URLs should not expose birth fields`).not.toMatch(
        /shareUrl=\{?`[^`]*(birthday|birthDate|birthTime|birthLocation|timezone)/i
      );
      expect(content, `${slug} animated share data should be sanitized`).not.toMatch(
        /const\s+(resultData|shareData)\s*=\s*\{[^}]*\b(birthday|birthDate|birthTime|birthLocation|timezone)\b/s
      );
    }
  });
});
