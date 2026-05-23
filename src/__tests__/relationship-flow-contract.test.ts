import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const relationshipFiles = [
  'src/app/relationship/new/client.tsx',
  'src/components/tianji-love/TianjiLovePrimitives.tsx',
  'src/components/relationship/RelationshipForm.tsx',
  'src/components/relationship/RelationshipResult.tsx',
  'src/components/relationship/RelationshipRadar.tsx',
  'src/components/relationship/RelationshipDimensionCard.tsx',
];

describe('Tianji Love relationship flow contract', () => {
  it('keeps /relationship/new as a frontend-only funnel into the existing analyze API', () => {
    const page = read('src/app/relationship/new/page.tsx');
    const client = read('src/app/relationship/new/client.tsx');

    expect(page).toContain('RelationshipNewClient');
    expect(client).toContain("fetch('/api/relationship/analyze'");
    expect(client).toContain('relationType: data.relationType');
    expect(client).toContain('lang: language');
    expect(client).toContain('personA: data.personA');
    expect(client).toContain('personB: data.personB');
    expect(client).not.toContain('/api/stripe');
    expect(client).not.toContain('getSupabase');
    expect(client).not.toContain("from('relationship");
  });

  it('carries Tianji Love language and route continuity through the relationship page', () => {
    const client = read('src/app/relationship/new/client.tsx');

    expect(client).toContain('withLanguageParam');
    expect(client).toContain("withLanguageParam('/relationship/new', next)");
    expect(client).toContain("href('/')");
    expect(client).toContain("href('/ask')");
    expect(client).toContain("href('/draw')");
    expect(client).toContain("href('/pricing')");
    expect(client).toContain("href('/about')");
    expect(client).toContain("href('/login')");
    expect(client).toContain("href('/legal/privacy')");
    expect(client).toContain('Love Reading');
    expect(client).toContain('Ask');
    expect(client).toContain('Draw');
    expect(client).not.toContain('copy.nav.compatibility');
    expect(client).not.toContain('copy.nav.timing');
    expect(client).toContain('Tianji Love relationship shell');
    expect(client).toContain('把两个人的星轨，读成一段关系场。');
    expect(client).toContain('Read two charts as one relational field.');
  });

  it('keeps relationship input copy readable and privacy-safe', () => {
    const form = read('src/components/relationship/RelationshipForm.tsx');

    expect(form).toContain('亲密关系');
    expect(form).toContain('灵魂友谊');
    expect(form).toContain('事业搭档');
    expect(form).toContain('出生资料只用于本次合盘计算');
    expect(form).toContain('public shares exclude date, time, location, and timezone by default');
    expect(form).toContain('required');
    expect(form).toContain('type="date"');
    expect(form).toContain('type="time"');
    expect(form).toContain('tianji-love-relationship-form');
    expect(form).toContain('relationship-form-submit');
  });

  it('keeps relationship sharing free of birth data by default', () => {
    const result = read('src/components/relationship/RelationshipResult.tsx');

    expect(result).toContain('includeBirthData: false');
    expect(result).toContain("shareMode: 'summary'");
    expect(result).toContain('分享内容默认不包含出生日期、出生时辰、出生地点或时区。');
    expect(result).toContain('Shared content excludes birth date, birth time, birth location, and timezone by default.');
    expect(result).not.toMatch(/shareSettings:\s*\{[^}]*includeBirthData:\s*true/s);
  });

  it('keeps the upgraded relationship surface free of known mojibake and deterministic claims', () => {
    const source = relationshipFiles.map((file) => read(file)).join('\n');

    expect(source).not.toMatch(/娑搢|閸弢|锟|澶╂満|鍏崇郴|浜插瘑|鐏甸瓊|鍑虹敓|鍒嗤韩|鎶婁袱|璇绘垚/);
    expect(source).not.toMatch(/蹇呭畾|淇濊瘉|guaranteed prediction|accurate prediction/i);
    expect(source).toContain('prefers-reduced-motion');
    expect(source).toContain('Relationship radar');
    expect(source).toContain('五维详情');
  });

  it('uses the Tianji Love visual system on the compatibility page', () => {
    const client = read('src/app/relationship/new/client.tsx');
    const source = `${client}\n${read('src/components/tianji-love/TianjiLovePrimitives.tsx')}`;

    for (const signal of [
      '@/components/tianji-love',
      'TianjiLoveShell',
      'TianjiLoveHeader',
      'TianjiLoveHeroImage',
      'TianjiLovePanel',
      'TianjiLoveFinalCta',
      'TianjiLoveFooter',
      'tianji-love-relationship-page',
      'tianji-love-stars',
      'tianji-love-shell-header',
      'tianji-love-logo-lockup',
      'tianji-love-compass-mark.png',
      'tianji-love-hero-couple-portrait.png',
      'tianji-love-hero-blend',
      'love-birth-chart-panel',
      'love-final-pavilion-cta',
      'Relationship Dynamics',
      'Privacy First',
    ]) {
      expect(source).toContain(signal);
    }

    expect(client).not.toContain('rounded-full border border-[#d8b77b]/55');
    expect(client).not.toContain('relationship-red-thread absolute');
  });

  it('uses shared Tianji Love form primitives for relationship inputs', () => {
    const form = read('src/components/relationship/RelationshipForm.tsx');
    const source = `${form}\n${read('src/components/tianji-love/TianjiLovePrimitives.tsx')}`;

    expect(form).toContain('@/components/tianji-love');
    expect(form).toContain('TianjiLoveFormField');
    expect(source).toContain('tianji-love-form-field');
    expect(form).toContain('tianji-love-relation-choice');
    expect(form).not.toContain('border-[#d8b77b]/42 text-[#d8b77b]');
  });
});
