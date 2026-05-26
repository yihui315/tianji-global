import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Tianji Love relationship evidence contract', () => {
  it('attaches relationship evidence at analysis and result boundaries', () => {
    const analyzeRoute = read('src/app/api/relationship/analyze/route.ts');
    const engine = read('src/lib/relationship-engine.ts');
    const result = read('src/components/relationship/RelationshipResult.tsx');
    const resultPage = read('src/app/relationship/result/[id]/page.tsx');
    const typeFile = read('src/types/relationship.ts');

    expect(analyzeRoute).toContain('buildRelationshipEvidence');
    expect(engine).toContain("accessLevel: 'free'");
    expect(engine).toContain('lockedSections');
    expect(engine).toContain('buildRelationshipEvidence');
    expect(resultPage).toContain('buildRelationshipEvidence');
    expect(result).toContain('DivinationEvidenceCard');
    expect(result).toContain("route=\"relationship\"");
    expect(result).toContain('paid={isFull}');
    expect(typeFile).toContain('evidence?: DivinationEvidence');
  });

  it('keeps relationship evidence tied to free/full boundaries without exposing birth data', () => {
    const result = read('src/components/relationship/RelationshipResult.tsx');
    const store = read('src/lib/relationship-reading-store.ts');
    const evidence = read('src/lib/divination/evidence.ts');

    expect(result).toContain("reading.accessLevel === 'full' || reading.isPremium");
    expect(result).toContain('onUnlockClick={handleUnlock}');
    expect(store).toContain("accessLevel: isPremium ? 'full' : 'free'");
    expect(store).toContain('markRelationshipReadingPremium');
    expect(evidence).toContain('buildRelationshipEvidence');
    expect(evidence).toContain('privateValues');
    expect(evidence).not.toMatch(/birthDate|birthTime|birthLocation|timezone/i);
  });

  it('keeps share and analytics paths privacy-safe', () => {
    const result = read('src/components/relationship/RelationshipResult.tsx');
    const shareRoute = read('src/app/api/relationship/share/route.ts');
    const analyticsTypes = read('src/lib/analytics/relationship-events.ts');
    const analyticsRoute = read('src/app/api/analytics/relationship/route.ts');
    const evidenceAnalytics = read('src/lib/analytics/divination-events.ts');

    expect(result).toContain('includeBirthData: false');
    expect(result).toContain("shareMode: 'summary'");
    expect(shareRoute).not.toContain('https://tianji.global/relationship/share');
    expect(analyticsTypes).toContain('relationship_result_view');
    expect(analyticsTypes).toContain('relationship_unlock_click');
    expect(analyticsRoute).toContain('isSupabaseMutationDisabled');
    expect(evidenceAnalytics).toContain('paid_unlock_from_evidence_clicked');
    expect(evidenceAnalytics).toContain('divination_accuracy_feedback_submitted');
    expect(evidenceAnalytics).not.toMatch(/rawQuestion|birthDate|birthTime|birthLocation|timezone|fullReport|prompt/i);
  });

  it('uses Pretext for stable relationship result text layout without private data coupling', () => {
    const packageJson = JSON.parse(read('package.json')) as { dependencies?: Record<string, string> };
    const hook = read('src/components/relationship/usePretextTextLayout.ts');
    const result = read('src/components/relationship/RelationshipResult.tsx');
    const dimension = read('src/components/relationship/RelationshipDimensionCard.tsx');

    expect(packageJson.dependencies?.['@chenglou/pretext']).toMatch(/^\^0\.0\.7/);
    expect(hook).toContain("from '@chenglou/pretext'");
    expect(hook).toContain('ResizeObserver');
    expect(hook).toContain('whiteSpace');
    expect(hook).toContain('catch');
    expect(result).toContain('headlineLayout');
    expect(result).toContain('nextMoveLayout');
    expect(dimension).toContain('summaryLayout');
    expect(hook).not.toMatch(/birthDate|birthTime|birthLocation|timezone/);
  });
});
