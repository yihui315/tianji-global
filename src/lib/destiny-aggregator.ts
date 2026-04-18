import type { ModuleResult, ModuleType, NormalizedPayload, UnifiedSection } from '@/types/module-result';
import type { DestinyProfile, TimingProfile } from '@/types/unified-profile';

const SECTION_PRIORITIES: Record<
  'identity' | 'relationship' | 'career' | 'wealth' | 'timing' | 'advice' | 'risk',
  ModuleType[]
> = {
  identity: ['bazi', 'ziwei', 'western', 'numerology', 'fortune', 'relationship', 'tarot', 'yijing', 'fengshui', 'electional', 'transit', 'solar-return'],
  relationship: ['relationship', 'ziwei', 'western', 'bazi', 'tarot', 'yijing', 'numerology', 'fortune', 'fengshui', 'electional', 'transit', 'solar-return'],
  career: ['bazi', 'ziwei', 'fortune', 'western', 'numerology', 'relationship', 'fengshui', 'electional', 'transit', 'solar-return', 'tarot', 'yijing'],
  wealth: ['bazi', 'ziwei', 'fortune', 'western', 'numerology', 'relationship', 'fengshui', 'electional', 'transit', 'solar-return', 'tarot', 'yijing'],
  timing: ['fortune', 'transit', 'solar-return', 'yijing', 'tarot', 'bazi', 'ziwei', 'western', 'numerology', 'relationship', 'fengshui', 'electional'],
  advice: ['tarot', 'yijing', 'relationship', 'fortune', 'bazi', 'ziwei', 'western', 'numerology', 'fengshui', 'electional', 'transit', 'solar-return'],
  risk: ['fortune', 'relationship', 'bazi', 'ziwei', 'western', 'numerology', 'transit', 'solar-return', 'tarot', 'yijing', 'fengshui', 'electional'],
};

function isMeaningfulSection(section?: UnifiedSection): section is UnifiedSection {
  if (!section) {
    return false;
  }

  return Boolean(
    section.headline ||
      section.summary ||
      (section.strengths && section.strengths.length > 0) ||
      (section.risks && section.risks.length > 0) ||
      (section.opportunities && section.opportunities.length > 0) ||
      (section.advice && section.advice.length > 0)
  );
}

function pickSection(results: ModuleResult[], sectionKey: keyof NormalizedPayload, priorities: ModuleType[]): UnifiedSection {
  for (const moduleType of priorities) {
    const candidate = results.find((result) => result.moduleType === moduleType);
    const section = candidate?.normalizedPayload[sectionKey];
    if (sectionKey !== 'summary' && isMeaningfulSection(section as UnifiedSection | undefined)) {
      return section as UnifiedSection;
    }
  }

  return {};
}

function pickSummary(results: ModuleResult[]): {
  headline?: string;
  oneLiner?: string;
  keywords?: string[];
  moduleType?: ModuleType;
} {
  for (const moduleType of SECTION_PRIORITIES.identity) {
    const candidate = results.find((result) => result.moduleType === moduleType);
    const summary = candidate?.normalizedPayload.summary;
    if (summary?.headline || summary?.oneLiner) {
      return {
        ...summary,
        moduleType,
      };
    }
  }

  return {};
}

function buildTimingProfile(results: ModuleResult[]): TimingProfile {
  const section = pickSection(results, 'timing', SECTION_PRIORITIES.timing);
  const timeline = results.find((result) => result.normalizedPayload.timeline)?.normalizedPayload.timeline;

  return {
    ...section,
    currentWindow: timeline?.currentPhase ?? section.summary,
    bestPeriods: timeline?.phases?.slice(0, 2).map((phase) => phase.label),
    pressurePeriods: timeline?.phases?.slice(2, 4).map((phase) => phase.label),
  };
}

function averageConfidence(results: ModuleResult[]): number {
  const scores = results
    .map((result) => result.confidenceScore)
    .filter((score): score is number => typeof score === 'number' && Number.isFinite(score));

  if (scores.length === 0) {
    return 0;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);
  return Number((total / scores.length).toFixed(2));
}

function uniqueModules(results: ModuleResult[]): ModuleType[] {
  return Array.from(new Set(results.map((result) => result.moduleType)));
}

export function aggregateDestinyProfile(
  profileId: string,
  results: ModuleResult[]
): Partial<DestinyProfile> {
  if (results.length === 0) {
    return {};
  }

  const summary = pickSummary(results);
  const identity = pickSection(results, 'identity', SECTION_PRIORITIES.identity);
  const relationship = pickSection(results, 'relationship', SECTION_PRIORITIES.relationship);
  const career = pickSection(results, 'career', SECTION_PRIORITIES.career);
  const wealth = pickSection(results, 'wealth', SECTION_PRIORITIES.wealth);
  const advice = pickSection(results, 'advice', SECTION_PRIORITIES.advice);
  const risk = pickSection(results, 'risk', SECTION_PRIORITIES.risk);
  const primaryIdentitySource = results.find((result) => result.moduleType === summary.moduleType) ?? results[0];

  return {
    userId: primaryIdentitySource.userId,
    profileId,
    identitySummary: {
      headline: summary.headline ?? identity.headline,
      summary: summary.oneLiner ?? identity.summary,
      strengths: identity.strengths,
      risks: identity.risks,
      opportunities: identity.opportunities,
      advice: identity.advice,
      confidence: identity.confidence ?? primaryIdentitySource.confidenceScore,
      traits: summary.keywords,
      corePattern: summary.oneLiner ?? identity.summary,
      elementBalance:
        Object.keys(primaryIdentitySource.normalizedPayload.structure ?? {}).length > 0
          ? (primaryIdentitySource.normalizedPayload.structure as Record<string, number>)
          : undefined,
    },
    energyProfile: primaryIdentitySource.normalizedPayload.structure ?? {},
    relationshipProfile: {
      ...relationship,
      style: relationship.headline ?? relationship.summary,
      attractionPattern: relationship.opportunities?.[0],
      conflictPattern: relationship.risks?.[0],
    },
    careerProfile: {
      ...career,
      workStyle: career.headline ?? career.summary,
      growthPattern: career.opportunities?.[0],
    },
    wealthProfile: {
      ...wealth,
      moneyPattern: wealth.headline ?? wealth.summary,
      volatility: wealth.risks?.[0],
    },
    timingProfile: buildTimingProfile(results),
    actionProfile: {
      ...advice,
      doMoreOf: advice.advice,
      avoid: risk.risks,
      discussSoon: relationship.advice,
    },
    riskProfile: risk,
    sourceModules: uniqueModules(results),
    confidenceScore: averageConfidence(results),
    lastRecomputedAt: new Date().toISOString(),
  };
}
