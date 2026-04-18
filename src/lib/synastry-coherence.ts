import type { SystemType } from './cultural-coherence';

export type SynastrySystemType = Extract<SystemType, 'bazi' | 'ziwei' | 'qizheng' | 'western'>;

export interface SynastryCoherenceInput {
  systemType: SynastrySystemType;
  person1Data: Record<string, unknown>;
  person2Data: Record<string, unknown>;
  reportContent?: string;
  language?: 'zh' | 'en';
}

export interface SynastryCoherenceViolation {
  code: 'system_boundary' | 'color_semantics' | 'naming_consistency';
  type: 'system_boundary' | 'color_semantics' | 'naming_consistency';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  found: string[];
  suggestion?: string;
  position?: number;
}

export interface SynastryCoherenceResult {
  valid: boolean;
  violations: SynastryCoherenceViolation[];
  warnings: string[];
  suggestions: string[];
  confidence: number;
  checkedAt: string;
  system: SynastrySystemType;
  systemConsistency: boolean;
  systemConsistencyViolations: string[];
  crossSystemWarnings: string[];
}

const BAZI_KEYWORDS = ['八字', '日主', '天干', '地支', '十神', '四柱', '大运', '流年'];
const ZIWEI_KEYWORDS = ['命宫', '身宫', '紫微', '天府', '四化', '斗数', '宫位', '星曜'];
const QIZHENG_KEYWORDS = ['七政四余', '罗睺', '计都', '二十八宿', '恒星黄道'];
const WESTERN_KEYWORDS = ['ascendant', 'midheaven', 'rising sign', 'house cusp', 'zodiac', '上升星座'];

function countKeywords(content: string, keywords: string[]): number {
  return keywords.filter((keyword) => content.includes(keyword.toLowerCase())).length;
}

export function checkSystemConsistency(input: SynastryCoherenceInput): {
  consistent: boolean;
  violations: string[];
} {
  const person1Content = JSON.stringify(input.person1Data).toLowerCase();
  const person2Content = JSON.stringify(input.person2Data).toLowerCase();

  const scoreSystems = (content: string) => ({
    bazi: countKeywords(content, BAZI_KEYWORDS),
    ziwei: countKeywords(content, ZIWEI_KEYWORDS),
    qizheng: countKeywords(content, QIZHENG_KEYWORDS),
    western: countKeywords(content, WESTERN_KEYWORDS),
  });

  const violations: string[] = [];
  const person1Primary = Object.entries(scoreSystems(person1Content)).sort((a, b) => b[1] - a[1])[0];
  const person2Primary = Object.entries(scoreSystems(person2Content)).sort((a, b) => b[1] - a[1])[0];

  if (person1Primary && person1Primary[0] !== input.systemType && person1Primary[1] > 2) {
    violations.push(`Person 1 data looks like ${person1Primary[0]} rather than ${input.systemType}.`);
  }
  if (person2Primary && person2Primary[0] !== input.systemType && person2Primary[1] > 2) {
    violations.push(`Person 2 data looks like ${person2Primary[0]} rather than ${input.systemType}.`);
  }

  return {
    consistent: violations.length === 0,
    violations,
  };
}

export interface CrossSystemDetection {
  detected: boolean;
  mixedSystems: SynastrySystemType[];
  evidence: string[];
  severity: 'none' | 'warning' | 'critical';
}

export function detectCrossSystemMixing(
  reportContent: string,
  declaredSystem: SynastrySystemType
): CrossSystemDetection {
  const content = reportContent.toLowerCase();
  const counts: Record<SynastrySystemType, number> = {
    bazi: countKeywords(content, BAZI_KEYWORDS),
    ziwei: countKeywords(content, ZIWEI_KEYWORDS),
    qizheng: countKeywords(content, QIZHENG_KEYWORDS),
    western: countKeywords(content, WESTERN_KEYWORDS),
  };

  const mixedSystems: SynastrySystemType[] = [];
  const evidence: string[] = [];

  for (const [system, count] of Object.entries(counts) as Array<[SynastrySystemType, number]>) {
    if (system !== declaredSystem && count >= 2) {
      mixedSystems.push(system);
      evidence.push(`Found ${count} ${system} markers in a ${declaredSystem} synastry report.`);
    }
  }

  const criticalMix = counts.bazi >= 2 && counts.ziwei >= 2;

  return {
    detected: mixedSystems.length > 0 || criticalMix,
    mixedSystems,
    evidence,
    severity: criticalMix ? 'critical' : mixedSystems.length > 0 ? 'warning' : 'none',
  };
}

export function checkSynastryColorSemantics(
  reportContent: string,
  systemType: SynastrySystemType
): SynastryCoherenceViolation[] {
  if (systemType === 'western' && reportContent.toLowerCase().includes('红')) {
    return [
      {
        code: 'color_semantics',
        type: 'color_semantics',
        severity: 'warning',
        message: 'Red language in Western synastry can imply Martian conflict rather than auspicious energy.',
        found: ['红'],
        suggestion: 'Frame red as passion, heat, or Mars symbolism instead of default positivity.',
        position: -1,
      },
    ];
  }

  return [];
}

function checkPersonNamingConsistency(
  reportContent: string,
  person1Data: Record<string, unknown>,
  person2Data: Record<string, unknown>
): SynastryCoherenceViolation[] {
  const violations: SynastryCoherenceViolation[] = [];
  const name1 = typeof person1Data.name === 'string' ? person1Data.name : '';
  const name2 = typeof person2Data.name === 'string' ? person2Data.name : '';

  if (name1 && reportContent.length > 100 && !reportContent.includes(name1)) {
    violations.push({
      code: 'naming_consistency',
      type: 'naming_consistency',
      severity: 'warning',
      message: `Person 1 name "${name1}" is missing from the narrative.`,
      found: [name1],
      suggestion: 'Use both names in the report so it feels specific and grounded.',
      position: -1,
    });
  }

  if (name2 && reportContent.length > 100 && !reportContent.includes(name2)) {
    violations.push({
      code: 'naming_consistency',
      type: 'naming_consistency',
      severity: 'warning',
      message: `Person 2 name "${name2}" is missing from the narrative.`,
      found: [name2],
      suggestion: 'Use both names in the report so it feels specific and grounded.',
      position: -1,
    });
  }

  return violations;
}

export function checkSynastryCoherence(input: SynastryCoherenceInput): SynastryCoherenceResult {
  const violations: SynastryCoherenceViolation[] = [];
  const warnings: string[] = [];

  const systemConsistency = checkSystemConsistency(input);
  for (const message of systemConsistency.violations) {
    violations.push({
      code: 'system_boundary',
      type: 'system_boundary',
      severity: 'critical',
      message,
      found: [input.systemType],
      suggestion: 'Use one divination system for both people before generating synastry.',
      position: -1,
    });
  }

  if (input.reportContent) {
    const crossSystem = detectCrossSystemMixing(input.reportContent, input.systemType);
    for (const message of crossSystem.evidence) {
      violations.push({
        code: 'system_boundary',
        type: 'system_boundary',
        severity: crossSystem.severity === 'critical' ? 'critical' : 'warning',
        message,
        found: crossSystem.mixedSystems,
        suggestion: `Keep the report inside the ${input.systemType} system boundary.`,
        position: -1,
      });
      warnings.push(message);
    }

    violations.push(...checkSynastryColorSemantics(input.reportContent, input.systemType));
    violations.push(...checkPersonNamingConsistency(input.reportContent, input.person1Data, input.person2Data));
  }

  const criticalCount = violations.filter((violation) => violation.severity === 'critical').length;
  const warningCount = violations.filter((violation) => violation.severity === 'warning').length;

  return {
    valid: criticalCount === 0,
    violations,
    warnings,
    suggestions: violations.flatMap((violation) => (violation.suggestion ? [violation.suggestion] : [])),
    confidence: Math.max(0, 1 - criticalCount * 0.35 - warningCount * 0.1),
    checkedAt: new Date().toISOString(),
    system: input.systemType,
    systemConsistency: systemConsistency.consistent,
    systemConsistencyViolations: systemConsistency.violations,
    crossSystemWarnings: warnings,
  };
}

export interface SynastryCoherenceOptions {
  language?: 'zh' | 'en';
  strictMode?: boolean;
}

export function validateSynastryReport(
  person1: Record<string, unknown>,
  person2: Record<string, unknown>,
  systemType: SynastrySystemType,
  reportContent?: string,
  options?: SynastryCoherenceOptions
): SynastryCoherenceResult {
  return checkSynastryCoherence({
    systemType,
    person1Data: person1,
    person2Data: person2,
    reportContent,
    language: options?.language ?? 'zh',
  });
}
