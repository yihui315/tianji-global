import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const relationshipFiles = [
  'src/app/relationship/new/client.tsx',
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
    expect(client).toContain("href('/pricing')");
    expect(client).toContain("href('/legal/privacy')");
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

    expect(source).not.toMatch(/涓|瀹|鍏|鈥|馃|鍒嗘瀽涓|鍏崇郴鍚|�/);
    expect(source).not.toMatch(/必定|保证|guaranteed prediction|accurate prediction/i);
    expect(source).toContain('prefers-reduced-motion');
    expect(source).toContain('Relationship radar');
    expect(source).toContain('五维详情');
  });
});
