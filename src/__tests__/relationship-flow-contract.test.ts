import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { isUuidReadingId } from '@/lib/relationship-reading-store';

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
    expect(result).toContain("onUnlockClick={() => void handleUnlock('evidence_card')}");
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

  it('blocks relationship checkout for local fallback ids before starting checkout', () => {
    const result = read('src/components/relationship/RelationshipResult.tsx');

    expect(isUuidReadingId('4f3b8f3e-3e41-4fc7-a2ad-0b37ef8f4a2a')).toBe(true);
    expect(isUuidReadingId('rel_local_fallback')).toBe(false);
    expect(isUuidReadingId(null)).toBe(false);

    expect(result).toContain('isUuidReadingId(reading.id)');
    expect(result).toContain('relationship_checkout_blocked_missing_persisted_reading');
    expect(result).toContain('missing_uuid_reading_id');
    expect(result).toContain('We need to save this reading before checkout. Please try again in a moment.');
    expect(result.indexOf('isUuidReadingId(reading.id)')).toBeLessThan(result.indexOf("fetch('/api/checkout'"));
    expect(result.indexOf('relationship_checkout_blocked_missing_persisted_reading'))
      .toBeLessThan(result.indexOf("fetch('/api/checkout'"));
  });
});
