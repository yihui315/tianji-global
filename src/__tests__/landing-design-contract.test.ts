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
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8').replace(/\r\n/g, '\n');
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
      'Love Reading',
      'Ask',
      'Draw',
      'Pricing',
      'Get Started',
      'Free First, Deeper When Useful',
      'PRIVATE LOVE REFLECTION. CLEARER NEXT STEPS.',
      'Read the pattern in love',
      'before you choose.',
      'Start Free Love Reading',
      'Ask One Question',
      'Draw Three Cards',
      'About Tianji Love',
      'Private & Secure',
      'Personalized Insights',
      'Designed for Clarity',
      'Align Your Birth Chart',
      'Birth Year',
      'Select year',
      'Solo Reading',
      'Couple Reading',
      'Reveal My First Love Insight',
      'Love Reading',
      'Ask One Question',
      'Draw Three Cards',
      'Private by default',
      'Reflection, not certainty',
      'No fear-based selling',
      'Secure unlocks',
      'Start free',
      'Unlock depth',
      'Return with history',
      'People Used Tianji Love For Clearer Reflection',
      'Emma',
      'Sophie',
      'Olivia',
      'tianji-love-testimonial-avatar',
      'Start with the free signal. Unlock depth only when it helps.',
      'Tianji Love first-viewport reference',
      'love-hero-reference-grid',
      'love-hero-art-couple',
      'love-birth-chart-panel',
      'love-final-pavilion-cta',
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

  it('keeps legacy module landing primitives on the Tianji Love visual bridge', () => {
    const files = [
      'src/components/landing/BackgroundVideoHero.tsx',
      'src/components/landing/ModuleInputShell.tsx',
      'src/components/landing/ScrollNarrativeSection.tsx',
      'src/components/landing/ResultScaffold.tsx',
      'src/components/landing/ShareSection.tsx',
    ];
    const source = files.map(read).join('\n');

    for (const signal of [
      '#03040a',
      '#050812',
      '#070b16',
      '#b57248',
      '#ff5c63',
      '#ff7c82',
      '#ffe3b4',
      'rounded-lg',
      'rounded-xl',
      'ReactNode',
    ]) {
      expect(source).toContain(signal);
    }

    expect(source).toContain("color.toLowerCase() === '#7c3aed'");
    expect(source).not.toContain('rounded-full bg-white');
    expect(source).not.toContain('border-white/10');
    expect(source).not.toContain('text-white/35');
    expect(source).not.toContain('#1a0a3a');
    expect(source).not.toContain("letterSpacing: '0.1em'");
    expect(source).not.toMatch(/鈥|鈫|馃|锟|閳|娴|瑙ｈ|闅愮|鏃舵|浼氬|璺宠|姝ｅ|杩斿|缁熶|鍛界|濉旂/);
  });

  it('replaces / with the Tianji Love conversion homepage without changing pricing checkout', () => {
    const page = read('src/app/(main)/page.tsx');
    const home = read('src/components/home/TianjiLoveHome.tsx');
    const pricing = read('src/app/(main)/pricing/page.tsx');

    expect(page).toContain("import TianjiLoveHome from '@/components/home/TianjiLoveHome'");
    expect(page).toContain('return <TianjiLoveHome />');

    expect(home).toContain('Tianji Love');
    expect(home).toContain('tianji.love');
    expect(home).toContain('天机爱');
    expect(home).toContain('宇宙洞察，真实的爱之指引。');
    expect(home).toContain('爱是唯一能让命运转弯的力量。');
    expect(home).toContain('开始关系解读');
    expect(home).toContain('问一个问题');
    expect(home).toContain('抽三张牌');
    expect(home).not.toContain('澶╂満');
    expect(home).not.toContain('涓栭棿');
    expect(home).not.toContain('鐖');
    expect(home).not.toContain('鍏崇郴');
    expect(home).toContain('Read the pattern in love');
    expect(home).toContain('before you choose.');
    expect(home).toContain('/relationship/new');
    expect(home).toContain('/ask');
    expect(home).toContain('/draw');
    expect(home).toContain('/pricing');
    expect(home).toContain('withLanguageParam');

    expect(pricing).toContain("import { PLANS, type PlanId } from '@/lib/stripe'");
    expect(pricing).toContain("router.push(href('/login'))");
    expect(pricing).toContain("fetch('/api/stripe/checkout'");
    expect(pricing).toContain('JSON.stringify({ planId })');
  });

  it('keeps the homepage nav and hero prioritized around Tianji Love-only paths', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');
    const englishCopy = home.slice(home.indexOf('  en: {'), home.indexOf('  zh: {'));
    const englishNav = englishCopy.slice(englishCopy.indexOf('nav: ['), englishCopy.indexOf('],\n    hero'));

    for (const signal of [
      "{ label: 'Love Reading', href: '/relationship/new' }",
      "{ label: 'Ask', href: '/ask' }",
      "{ label: 'Draw', href: '/draw' }",
      "{ label: 'Pricing', href: '/pricing' }",
      "{ label: 'About', href: '/about' }",
      "{ label: 'Login', href: '/login' }",
    ]) {
      expect(englishNav).toContain(signal);
    }

    for (const retiredMainPath of [
      'Compatibility',
      'Timing',
      'How It Works',
      '/bazi',
      '/ziwei',
      '/yijing',
      '/tarot',
      '/western',
      '/fortune',
      '/destiny/scan',
      '/love-match',
      '/celebrity-match',
    ]) {
      expect(englishNav).not.toContain(retiredMainPath);
    }

    const primaryCta = home.indexOf("href={href('/relationship/new')}");
    const askCta = home.indexOf("href={href('/ask')}");
    const drawCta = home.indexOf("href={href('/draw')}");
    const aboutCta = home.indexOf("href={href('/about')}");

    expect(primaryCta).toBeGreaterThanOrEqual(0);
    expect(askCta).toBeGreaterThan(primaryCta);
    expect(drawCta).toBeGreaterThan(askCta);
    expect(aboutCta).toBeGreaterThan(drawCta);
    expect(home).toContain('Start Free Love Reading');
    expect(home).toContain('Ask One Question');
    expect(home).toContain('Draw Three Cards');
    expect(home).toContain('About Tianji Love');
  });

  it('keeps the core route and copy contract for English, Chinese, and pricing', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');
    const pricing = read('src/app/(main)/pricing/page.tsx');
    const englishCopy = home.slice(home.indexOf('  en: {'), home.indexOf('  zh: {'));
    const chineseCopy = home.slice(home.indexOf('  zh: {'), home.indexOf('} satisfies Record<AppLanguage, LoveCopy>'));

    for (const route of ['/relationship/new', '/ask', '/draw', '/about', '/pricing', '/login']) {
      expect(home).toContain(route);
    }

    expect(englishCopy).toContain('free relationship reflection');
    expect(englishCopy).toContain('compatibility');
    expect(englishCopy).toContain('reflection, not certainty');
    expect(englishCopy).not.toMatch(/[\u4e00-\u9fff]/);
    expect(chineseCopy).toContain('天机爱');
    expect(chineseCopy).toContain('开始关系解读');
    expect(chineseCopy).toContain('问一个问题');
    expect(chineseCopy).toContain('抽三张牌');
    expect(pricing).toContain('Paid plans unlock depth and history, not guaranteed predictions.');
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

  it('keeps homepage language bootstrap one-shot to avoid render loops', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');
    const languageBootstrapEffect = home.match(
      /useEffect\(\(\) => \{[\s\S]*?resolveInitialLanguage\(\)[\s\S]*?\}, \[lang, setLang\]\);/
    )?.[0] ?? '';

    expect(home).toContain('initialLanguageSyncedRef');
    expect(languageBootstrapEffect).toContain('if (initialLanguageSyncedRef.current) return;');
    expect(languageBootstrapEffect).toContain('initialLanguageSyncedRef.current = true;');
    expect(languageBootstrapEffect).toContain('setActiveLang((currentLang)');
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
      'Love Reading',
      'Ask One Question',
      'Draw Three Cards',
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
