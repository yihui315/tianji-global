import { describe, expect, it } from 'vitest';
import { aggregateDestinyProfile } from '../../lib/destiny-aggregator';
import type { ModuleResult } from '../../types/module-result';

function createResult(partial: Partial<ModuleResult>): ModuleResult {
  return {
    id: partial.id ?? 'result-1',
    sessionId: partial.sessionId ?? 'session-1',
    userId: partial.userId ?? 'user-1',
    profileId: partial.profileId ?? 'profile-1',
    moduleType: partial.moduleType ?? 'bazi',
    version: partial.version ?? 'v1',
    title: partial.title,
    summary: partial.summary,
    rawPayload: partial.rawPayload ?? {},
    normalizedPayload: partial.normalizedPayload ?? { summary: {} },
    confidenceScore: partial.confidenceScore,
    isPremium: partial.isPremium ?? false,
    createdAt: partial.createdAt ?? new Date().toISOString(),
    updatedAt: partial.updatedAt ?? new Date().toISOString(),
  };
}

describe('destiny-aggregator', () => {
  it('prefers identity modules for summary and timing modules for timing windows', () => {
    const profile = aggregateDestinyProfile('profile-1', [
      createResult({
        moduleType: 'fortune',
        confidenceScore: 90,
        normalizedPayload: {
          summary: { headline: 'Timing lens', oneLiner: 'Fast-moving cycle' },
          timing: { headline: 'Expansion window', summary: 'The next quarter favors structured moves.' },
          timeline: {
            currentPhase: 'Expansion window',
            phases: [
              { range: '0-30d', label: 'Build', description: 'Lay foundations.' },
              { range: '30-90d', label: 'Launch', description: 'Go public.' },
            ],
          },
        },
      }),
      createResult({
        id: 'result-2',
        moduleType: 'bazi',
        confidenceScore: 80,
        normalizedPayload: {
          summary: {
            headline: 'Late-rising strategist',
            oneLiner: 'You grow through depth, timing, and clear judgment.',
            keywords: ['strategic', 'disciplined', 'patient'],
          },
          identity: {
            headline: 'Built for depth',
            summary: 'Your strongest gains come from compounding insight over time.',
            strengths: ['pattern recognition'],
          },
          career: {
            headline: 'Judgment over speed',
            summary: 'Work compounds when you stay selective.',
            opportunities: ['long-range planning'],
          },
          wealth: {
            headline: 'Wave-based growth',
            summary: 'Money grows in phases rather than straight lines.',
            risks: ['overextension'],
          },
        },
      }),
    ]);

    expect(profile.identitySummary?.headline).toBe('Late-rising strategist');
    expect(profile.identitySummary?.traits).toContain('strategic');
    expect(profile.timingProfile?.headline).toBe('Expansion window');
    expect(profile.timingProfile?.bestPeriods).toEqual(['Build', 'Launch']);
    expect(profile.careerProfile?.headline).toBe('Judgment over speed');
    expect(profile.confidenceScore).toBe(85);
    expect(profile.sourceModules).toEqual(['fortune', 'bazi']);
  });
});
