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
    expect(client).toContain('Reveal the hidden pattern between two people.');
    expect(client).toContain('Start Free Compatibility Reading');
    expect(client).toContain('What your reading will show');
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
    expect(form).toContain('Birth location is reserved for advanced reports.');
    expect(form).toContain('tianji-love-relationship-form');
    expect(form).toContain('relationship-form-submit');
  });

  it('keeps relationship sharing free of birth data by default', () => {
    const result = read('src/components/relationship/RelationshipResult.tsx');

    expect(result).toContain('includeBirthData: false');
    expect(result).toContain("shareMode: 'summary'");
    expect(result).toContain("source: 'relationship'");
    expect(result).toContain('relationshipReadingId: reading.id');
    expect(result).toContain('Unlock the Full Relationship Pattern');
    expect(result).toContain('Share link could not be created. Please save your reading first.');
    expect(result).toContain('Symbolic compatibility engine + guided interpretation');
    expect(result).toContain('分享内容默认不包含出生日期、出生时辰、出生地点或时区。');
    expect(result).toContain('Shared content excludes birth date, birth time, birth location, and timezone by default.');
    expect(result).not.toMatch(/shareSettings:\s*\{[^}]*includeBirthData:\s*true/s);
  });

  it('keeps relationship share links on the configured app origin', () => {
    const shareRoute = read('src/app/api/relationship/share/route.ts');

    expect(shareRoute).toContain('process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin');
    expect(shareRoute).toContain("replace(/\\/$/, '')");
    expect(shareRoute).not.toContain('https://tianji.global/relationship/share');
  });

  it('records free access state and the P0 funnel analytics events', () => {
    const engine = read('src/lib/relationship-engine.ts');
    const store = read('src/lib/relationship-reading-store.ts');
    const resultPage = read('src/app/relationship/result/[id]/page.tsx');
    const analyticsTypes = read('src/lib/analytics/relationship-events.ts');
    const analyticsRoute = read('src/app/api/analytics/relationship/route.ts');
    const source = `${analyticsTypes}\n${analyticsRoute}\n${read('src/app/relationship/new/client.tsx')}\n${read('src/components/relationship/RelationshipResult.tsx')}`;

    expect(engine).toContain("accessLevel: 'free'");
    expect(engine).toContain('lockedSections');
    expect(store).toContain('markRelationshipReadingPremium');
    expect(store).toContain('getRelationshipReadingById');
    expect(resultPage).toContain('RelationshipResult');
    expect(resultPage).toContain('server-side payment verification');

    for (const eventName of [
      'relationship_page_view',
      'relationship_form_start',
      'relationship_form_submit',
      'relationship_analysis_success',
      'relationship_result_view',
      'relationship_unlock_click',
      'relationship_checkout_start',
      'relationship_checkout_success',
      'relationship_share_click',
      'relationship_copy_success',
      'relationship_error',
    ]) {
      expect(source).toContain(eventName);
    }
  });

  it('keeps the upgraded English relationship surface free of known mojibake and deterministic claims', () => {
    const source = `${read('src/components/relationship/RelationshipResult.tsx')}\n${read('src/components/tianji-love/TianjiLovePrimitives.tsx')}`;

    expect(source).not.toMatch(/蹇呭畾|淇濊瘉|guaranteed prediction|accurate prediction/i);
    expect(source).toContain('prefers-reduced-motion');
    expect(source).toContain('Relationship radar');
    expect(source).toContain('First Compatibility Signal');
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
      'First Signal',
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
