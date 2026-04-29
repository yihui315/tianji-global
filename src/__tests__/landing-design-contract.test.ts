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

describe('premium landing redesign contract', () => {
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

  it('keeps the homepage funnel and pricing checkout contract visible', () => {
    const home = read('src/app/(main)/page.tsx');
    const pricing = read('src/app/(main)/pricing/page.tsx');

    expect(home).toContain('BackgroundVideoHero');
    expect(home).toContain('useLanguage');
    expect(home).toContain("setLang(lang === 'zh' ? 'en' : 'zh')");
    expect(home).toContain('中文 EN');
    expect(home).toContain('Switch language English Chinese');
    expect(home).toContain('z-[999]');
    expect(home).toContain('homeCopy');
    expect(home).toContain('开始命运扫描');
    expect(home).toContain('看清此刻\\n再定去向');
    expect(home).toContain('三个关键判断');
    expect(home).toContain('六种读取方式 一条命运主线');
    expect(home).toContain('时机会先替你证明');
    expect(home).toContain('神秘感可以保留 判断必须清楚');
    expect(home).toContain('先看到关键结果 再决定要不要更深');
    expect(home).toContain('把最重要的问题先说清');
    expect(home).not.toContain('A luxury AI destiny platform for people who want timing, not noise.');
    expect(home).toContain("ctaHref={languageHref('/destiny/scan')}");
    expect(home).toContain('id="modules"');
    expect(home).toContain('LifeChart');
    expect(home).toContain('copy.trust.items.map');
    expect(home).toContain('FAQ');
    expect(home).toContain('/assets/videos/hero/home-hero-loop-6s-1080p.mp4');
    expect(home).toContain('/assets/images/hero/home-hero-master-16x9.jpg');

    expect(pricing).toContain("import { PLANS } from '@/lib/stripe'");
    expect(pricing).toContain("router.push(withLanguageParam('/login', language))");
    expect(pricing).toContain("fetch('/api/stripe/checkout'");
    expect(pricing).toContain('JSON.stringify({ planId })');
    expect(pricing).toContain('/assets/videos/hero/pricing-hero-loop-6s-1080p.mp4');
    expect(pricing).toContain('/assets/images/hero/pricing-hero-master-16x9.jpg');
  });

  it('keeps the new homepage copy aligned to the provided Chinese structure', () => {
    const home = read('src/app/(main)/page.tsx');
    expect(home).toContain('这次视觉升级会改变解读结果吗');
    expect(home).toContain('如果我是第一次使用 应该从哪里开始');
    expect(home).toContain('分享结果是安全的吗');
    expect(home).toContain('为什么首页还保留六个系统入口');
    expect(home).toContain('不是先听一套玄学解释');
    expect(home).toContain('把这一阶段最值得做的一步直接交给你');
  });

  it('uses SmartTitle to keep major homepage titles balanced', () => {
    const home = read('src/app/(main)/page.tsx');

    expect(home).toContain('title={copy.hero.title}');
    expect(home).toContain('text={copy.hero.panelTitle}');
    expect(home).toContain('text={module.title}');
    expect(home).toContain('text={copy.lifeChart.cardTitle}');
    expect(home).toContain('text={item.label}');
    expect(home).toContain('text={copy.premium.cardTitle}');
    expect(home).toContain('text={item.question}');
  });

  it('keeps homepage module card titles inside the card with restrained typography', () => {
    const home = read('src/app/(main)/page.tsx');

    expect(home).toContain('text={module.title}');
    expect(home).toContain('maxLines={2}');
    expect(home).toContain("max-w-[8.5ch]");
    expect(home).toContain("font-sans");
    expect(home).toContain("tracking-[-0.05em]");
    expect(home).toContain("min-h-[396px]");
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

    expect(layout).toContain("import { Noto_Sans_SC } from 'next/font/google'");
    expect(layout).toContain("variable: '--font-tianji-sans'");
    expect(layout).toContain('${tianjiSans.variable}');
    expect(globals).toContain('--font-tianji-display');
    expect(globals).toContain('--font-tianji-body');
    expect(globals).toContain('--font-tianji-display: var(--font-tianji-sans)');
    expect(globals).toContain('--font-tianji-body: var(--font-tianji-sans)');
    expect(globals).toContain('--font-instrument-serif: var(--font-tianji-display)');
    expect(globals).toContain('--font-barlow: var(--font-tianji-body)');
    expect(globals).not.toContain('--font-noto-serif-sc');
    expect(globals).not.toMatch(/font-family:\s*[^;]*(Songti SC|STSong|SimSun)/);

    expect(tailwind).toContain("fontFamily");
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
