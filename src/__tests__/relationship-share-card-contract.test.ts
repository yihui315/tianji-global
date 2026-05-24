import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('relationship-first viral share loop contract', () => {
  it('supports privacy-safe relationship share cards in all MVP social formats', () => {
    const cardRoute = read('src/app/api/share/card/route.tsx');

    expect(cardRoute).toContain('sanitizeRelationshipCardData');
    expect(cardRoute).toContain('RELATIONSHIP_CARD_FORMATS');
    expect(cardRoute).toContain("'og'");
    expect(cardRoute).toContain("'wechat_moments'");
    expect(cardRoute).toContain("'xiaohongshu'");
    expect(cardRoute).toContain("'douyin'");
    expect(cardRoute).toContain('serviceType === \'relationship\'');
    expect(cardRoute).toContain('RelationshipPatternCard');
    expect(cardRoute).toContain('Birth data hidden by default');
    expect(cardRoute).toContain('score');
    expect(cardRoute).toContain('headline');
    expect(cardRoute).toContain('oneLiner');
    expect(cardRoute).toContain('shareUrl');
    expect(cardRoute).not.toMatch(/birthDate|birthTime|birthLocation|timezone|rawQuestion|prompt|fullReport|fullResult/i);
  });

  it('adds relationship result share-card actions and safe analytics payload fields', () => {
    const result = read('src/components/relationship/RelationshipResult.tsx');

    expect(result).toContain('relationshipShareCardFormats');
    expect(result).toContain("shareMode: 'insight_card'");
    expect(result).toContain("fetch('/api/share/card'");
    expect(result).toContain('cardFormat');
    expect(result).toContain('relationship_share_success');
    expect(result).toContain('Download PNG');
    expect(result).toContain('Copy share text');
    expect(result).toContain('surface');
    expect(result).toContain('shareMode');
    expect(result).toContain('accessLevel');
    expect(result).not.toMatch(/birthDate|birthTime|birthLocation|rawQuestion|prompt|fullReport|fullResult/i);
  });

  it('keeps homepage proof honest and routes the viral loop to relationship/new', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');
    const proofStart = home.indexOf('const homepageRelationshipProof');
    const proofEnd = home.indexOf('const loveCopy');
    const proofBlock = home.slice(proofStart, proofEnd);

    expect(home).toContain('homepageRelationshipProof');
    expect(home).toContain('Free first signal');
    expect(home).toContain('Birth data hidden');
    expect(home).toContain('Share-ready result');
    expect(home).toContain('Unlock depth only when useful');
    expect(home).toContain("href('/relationship/new')");
    expect(proofBlock).not.toMatch(/500\+|25%|10%|20%|accurate prediction/i);
  });

  it('documents KPI mapping without adding a new analytics schema', () => {
    const runbook = read('docs/tianji-love-revenue-funnel-runbook.md');

    expect(runbook).toContain('Relationship-first viral loop KPI mapping');
    expect(runbook).toContain('DAU');
    expect(runbook).toContain('share rate');
    expect(runbook).toContain('conversion');
    expect(runbook).toContain('7-day retention');
    expect(runbook).toContain('No schema migration is required');
  });
});
