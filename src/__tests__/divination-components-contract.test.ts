import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const forbiddenCopy = /guaranteed|will definitely|100%|destined|curse|doom|unavoidable fate/i;
const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('divination evidence UI contracts', () => {
  it('defines the reusable evidence card and accuracy feedback controls', () => {
    const evidenceCard = read('src/components/divination/DivinationEvidenceCard.tsx');
    const feedback = read('src/components/divination/AccuracyFeedback.tsx');

    expect(evidenceCard).toContain('Evidence layer');
    expect(evidenceCard).toContain('Core judgment');
    expect(evidenceCard).toContain('Evidence signals');
    expect(evidenceCard).toContain('Unlock the deeper reading');
    expect(feedback).toContain('Yes, very');
    expect(feedback).toContain('Somewhat');
    expect(feedback).toContain('Not really');
    expect(`${evidenceCard}\n${feedback}`).not.toMatch(forbiddenCopy);
  });

  it('wires Ask, Draw, and Relationship surfaces to evidence components', () => {
    const askPage = read('src/app/(main)/ask/page.tsx');
    const tarotPage = read('src/app/(main)/tarot/page.tsx');
    const relationshipResult = read('src/components/relationship/RelationshipResult.tsx');
    const drawAlias = read('src/app/(main)/draw/page.tsx');

    expect(askPage).toContain('buildAskEvidence');
    expect(askPage).toContain('route="ask"');
    expect(tarotPage).toContain('buildDrawEvidence');
    expect(tarotPage).toContain('route="draw"');
    expect(relationshipResult).toContain('buildRelationshipEvidence');
    expect(relationshipResult).toContain('route="relationship"');
    expect(drawAlias).toContain('redirect("/tarot")');
    expect(`${askPage}\n${tarotPage}\n${relationshipResult}`).not.toMatch(forbiddenCopy);
  });
});
