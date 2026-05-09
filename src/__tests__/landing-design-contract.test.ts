import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function publicAssetExists(assetPath: string) {
  return fs.existsSync(path.join(repoRoot, 'public', assetPath.replace(/^\//, '')));
}

describe('Tianji Love homepage contract', () => {
  it('uses a focused homepage entrypoint and reusable Love components', () => {
    const page = read('src/app/(main)/page.tsx');
    const component = read('src/components/home/TianjiLoveHome.tsx');

    expect(page).toContain("import { TianjiLoveHome } from '@/components/home/TianjiLoveHome'");
    expect(page).toContain('<TianjiLoveHome />');

    for (const componentName of [
      'HeroLoveSection',
      'BirthChartForm',
      'ReadingModeToggle',
      'InsightCards',
      'HowItWorks',
      'Testimonials',
      'FinalCTA',
      'CosmicFooter',
    ]) {
      expect(component).toContain(`function ${componentName}`);
    }
  });

  it('keeps the Love positioning and above-fold form CTA visible', () => {
    const component = read('src/components/home/TianjiLoveHome.tsx');

    expect(component).toContain('Love is the one force that bends fate.');
    expect(component).toContain('Discover your romantic patterns, emotional timing');
    expect(component).toContain('Discover patterns. Understand timing. Make clearer relationship choices.');
    expect(component).toContain('id="birth-chart-form"');
    expect(component).toContain('Start free love reading');
    expect(component).toContain('relationship-hero-master-16x9.jpg');
  });

  it('submits the birth chart form to the free reading funnel', () => {
    const component = read('src/components/home/TianjiLoveHome.tsx');

    expect(component).toContain('handleSessionSubmit');
    expect(component).toContain("fetch('/api/love-reading/session'");
    expect(component).toContain('router.push(payload.data.redirectUrl)');
    expect(component).toContain('onSubmit={handleSessionSubmit}');
    expect(component).not.toMatch(/stripe|checkout|supabase/i);
  });

  it('keeps trust language non-deterministic and privacy-safe', () => {
    const component = read('src/components/home/TianjiLoveHome.tsx');

    expect(component).toContain('self-reflection');
    expect(component).toContain('not medical, legal, or financial advice');
    expect(component).toContain('Private by design');
    expect(component).not.toMatch(/predict your future|find your soulmate|know exactly when love will arrive/i);
  });

  it('uses existing assets and reduced-motion support', () => {
    const component = read('src/components/home/TianjiLoveHome.tsx');
    const assetMatches = [...component.matchAll(/\/assets\/[^"'\s,)}`]+/g)].map((match) =>
      match[0].replace(/[.;]+$/, '')
    );

    expect(assetMatches.length).toBeGreaterThan(0);
    expect(assetMatches.filter((assetPath) => !publicAssetExists(assetPath))).toEqual([]);
    expect(component).toContain('prefers-reduced-motion');
    expect(component).toContain('aria-live="polite"');
  });
});
