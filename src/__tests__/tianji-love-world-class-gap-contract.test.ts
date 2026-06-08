import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Tianji Love world-class gap remediation contract', () => {
  it('keeps relationship result Chinese copy readable at the trust and paywall moment', () => {
    const result = read('src/components/relationship/RelationshipResult.tsx');

    for (const readableCopy of [
      "score: '综合匹配'",
      "dimensions: '五维详情'",
      "currentPhase: '当前阶段'",
      "next30Days: '未来 30 天'",
      "copyLink: '复制安全分享链接'",
      "copied: '链接已复制'",
      "share: '分享关系摘要'",
      '分享内容默认不包含出生日期、出生时辰、出生地点或时区。',
    ]) {
      expect(result).toContain(readableCopy);
    }

    expect(result).not.toMatch(/缁煎|浜旂淮|褰撳|鏈|澶╂|閾炬帴|鍒嗕韩|鈥/);
  });

  it('defaults direct relationship entry to English for the Western launch funnel', () => {
    const client = read('src/app/relationship/new/client.tsx');

    expect(client).toContain("return isAppLanguage(queryLang) ? queryLang : 'en';");
    expect(client).not.toContain("return isAppLanguage(queryLang) ? queryLang : 'zh';");
  });

  it('routes the pricing secondary relationship CTA to the relationship flow', () => {
    const pricing = read('src/app/(main)/pricing/page.tsx');

    expect(pricing).toContain(
      `<TianjiLoveButton href={href('/relationship/new')} variant="secondary">{copy.hero.secondary}</TianjiLoveButton>`
    );
    expect(pricing).not.toContain(
      `<TianjiLoveButton href={href('/ask')} variant="secondary">{copy.hero.secondary}</TianjiLoveButton>`
    );
  });

  it('keeps launch-visible Tianji Love pages free of known mojibake glyphs', () => {
    const launchVisibleFiles = [
      'src/components/home/TianjiLoveHome.tsx',
      'src/app/(main)/ask/page.tsx',
      'src/app/(main)/draw/page.tsx',
      'src/app/(main)/pricing/page.tsx',
      'src/app/(main)/about/page.tsx',
      'src/app/login/page.tsx',
      'src/app/relationship/new/client.tsx',
      'src/components/relationship/RelationshipForm.tsx',
      'src/components/relationship/RelationshipResult.tsx',
      'src/components/relationship/RelationshipDimensionCard.tsx',
      'src/components/relationship/RelationshipRadar.tsx',
      'src/components/tianji-love/TianjiLovePrimitives.tsx',
      'src/app/(main)/pricing/success/page.tsx',
      'src/app/(main)/pricing/cancel/page.tsx',
      'src/app/(main)/legal/page.tsx',
      'src/app/(main)/legal/privacy/page.tsx',
      'src/app/(main)/legal/terms/page.tsx',
      'src/app/(main)/readings/page.tsx',
      'src/app/(main)/profile/page.tsx',
      'src/app/dashboard/page.tsx',
      'src/app/relationship/share/[slug]/client.tsx',
    ];

    const knownMojibakeGlyphs =
      /[\uFFFD\u6FB6\u934F\u93BB\u93C3\u6D7C\u9427\u95C5\u8930\u64B3\u93C8\u95BE\u70AC\u5E34\u9352\u7F01\u714E\u6D5C\u9286\u50A6\u951B\u934B\u9422\u7490\u95C0\u5A34\u59C1\u93B6\u9225\u6DC7\u942E\u6FCA\u5A09\u93D7\u95B2\u6E1A\u61B3\u95AB]/;

    for (const file of launchVisibleFiles) {
      expect(read(file), file).not.toMatch(knownMojibakeGlyphs);
    }
  });
});
