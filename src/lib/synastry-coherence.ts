/**
 * Synastry Coherence Checker — TianJi Global
 *
 * Cultural coherence rules specific to synastry (合盘) reports.
 * Extends the base Cultural Coherence Checker with synastry-specific rules.
 *
 * KEY RULE: A synastry report must use the SAME divination system for BOTH persons.
 * Mixing BaZi synastry with Ziwei synastry in the same report is a CRITICAL violation.
 */

import type { CoherenceResult, CoherenceViolation } from './cultural-coherence';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SynastrySystemType = 'bazi' | 'ziwei' | 'qizheng' | 'western';

export interface SynastryCoherenceInput {
  systemType: SynastrySystemType;
  person1Data: Record<string, unknown>;
  person2Data: Record<string, unknown>;
  reportContent?: string;
  language?: 'zh' | 'en';
}

export interface SynastryCoherenceResult extends CoherenceResult {
  systemConsistency: boolean;
  systemConsistencyViolations: string[];
  crossSystemWarnings: string[];
}

// ─── Synastry-specific forbidden patterns ────────────────────────────────────
// These are violations when found in synastry reports

const BAZI_KEYWORDS = ['日主', '天干', '地支', '十神', '用神', '大运', '流年', '比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印', '月令', '四柱', '丙丁', '甲乙', '戊己', '庚辛', '壬癸', '子丑', '寅卯', '辰巳', '午未', '申酉', '戌亥', '甲子', '甲己', '乙庚', '丙辛', '丁壬', '戊癸'];

const ZIWEI_KEYWORDS = ['命宫', '身宫', '紫微星', '天府星', '天机星', '太阳星', '武曲星', '天同星', '廉贞星', '贪狼星', '太阴星', '巨门星', '天相星', '天梁星', '七杀星', '破军星', '化禄', '化权', '化科', '化忌', '四化星', '星曜', '宫位', '北斗', '南斗', '紫微斗数'];

const QIZHENG_KEYWORDS = ['七政四余', '恒星黄道', '升度', '脱度', '二十八宿', '罗睺', '计都', '紫气', '月孛', '木星', '火星', '土星', '金星', '水星', '太阳', '太阴', '升度表', '天球', '黄道带', '回归黄道'];

const WESTERN_KEYWORDS = ['上升星座', '下降星座', '天顶星座', '天底星座', 'Ascendant', 'Midheaven', 'IC', 'DC', 'AC', 'MC', '宫头', '整宫制', '等分制', '恒星黄道', '回归黄道', '上升点', '下降点', '天顶', '天底'];

// ─── System consistency checker ───────────────────────────────────────────────

/**
 * Checks whether a synastry report mixes divination systems.
 * CRITICAL RULE: Both persons MUST use the same system in a single synastry report.
 */
export function checkSystemConsistency(input: SynastryCoherenceInput): {
  consistent: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Check if person1 and person2 data contain system-specific keywords
  const p1Content = JSON.stringify(input.person1Data).toLowerCase();
  const p2Content = JSON.stringify(input.person2Data).toLowerCase();

  // Count system indicators in each person's data
  const countKeywords = (content: string, keywords: string[]): number =>
    keywords.filter(kw => content.includes(kw.toLowerCase())).length;

  const p1Systems = {
    bazi: countKeywords(p1Content, BAZI_KEYWORDS),
    ziwei: countKeywords(p1Content, ZIWEI_KEYWORDS),
    qizheng: countKeywords(p1Content, QIZHENG_KEYWORDS),
    western: countKeywords(p1Content, WESTERN_KEYWORDS),
  };

  const p2Systems = {
    bazi: countKeywords(p2Content, BAZI_KEYWORDS),
    ziwei: countKeywords(p2Content, ZIWEI_KEYWORDS),
    qizheng: countKeywords(p2Content, QIZHENG_KEYWORDS),
    western: countKeywords(p2Content, WESTERN_KEYWORDS),
  };

  const p1Primary = Object.entries(p1Systems).sort((a, b) => b[1] - a[1])[0];
  const p2Primary = Object.entries(p2Systems).sort((a, b) => b[1] - a[1])[0];

  // Both should match the declared systemType
  if (p1Primary[0] !== input.systemType && p1Primary[1] > 2) {
    violations.push(
      `Person 1 data contains ${p1Primary[0]} system keywords but report declares ${input.systemType}`
    );
  }

  if (p2Primary[0] !== input.systemType && p2Primary[1] > 2) {
    violations.push(
      `Person 2 data contains ${p2Primary[0]} system keywords but report declares ${input.systemType}`
    );
  }

  return {
    consistent: violations.length === 0,
    violations,
  };
}

// ─── Cross-system detection in report content ──────────────────────────────────

export interface CrossSystemDetection {
  detected: boolean;
  mixedSystems: SynastrySystemType[];
  evidence: string[];
  severity: 'critical' | 'warning';
}

export function detectCrossSystemMixing(
  reportContent: string,
  declaredSystem: SynastrySystemType
): CrossSystemDetection {
  const content = reportContent.toLowerCase();
  const evidence: string[] = [];
  const mixedSystems: SynastrySystemType[] = [];

  const baziCount = BAZI_KEYWORDS.filter(kw => content.includes(kw.toLowerCase())).length;
  const ziweiCount = ZIWEI_KEYWORDS.filter(kw => content.includes(kw.toLowerCase())).length;
  const qizhengCount = QIZHENG_KEYWORDS.filter(kw => content.includes(kw.toLowerCase())).length;
  const westernCount = WESTERN_KEYWORDS.filter(kw => content.includes(kw.toLowerCase())).length;

  const threshold = 3;

  if (baziCount >= threshold && declaredSystem !== 'bazi') {
    mixedSystems.push('bazi');
    evidence.push(`Found ${baziCount} BaZi-specific keywords in ${declaredSystem} report`);
  }
  if (ziweiCount >= threshold && declaredSystem !== 'ziwei') {
    mixedSystems.push('ziwei');
    evidence.push(`Found ${ziweiCount} Ziwei-specific keywords in ${declaredSystem} report`);
  }
  if (qizhengCount >= threshold && declaredSystem !== 'qizheng') {
    mixedSystems.push('qizheng');
    evidence.push(`Found ${qizhengCount} Qizheng-specific keywords in ${declaredSystem} report`);
  }
  if (westernCount >= threshold && declaredSystem !== 'western') {
    mixedSystems.push('western');
    evidence.push(`Found ${westernCount} Western astrology keywords in ${declaredSystem} report`);
  }

  // Special critical case: BaZi concepts in Ziwei report or vice versa
  const criticalMix =
    (baziCount >= 2 && ziweiCount >= 2);

  return {
    detected: mixedSystems.length > 0 || criticalMix,
    mixedSystems,
    evidence,
    severity: criticalMix ? 'critical' : mixedSystems.length > 0 ? 'warning' : 'none' as const,
  };
}

// ─── Synastry-specific color semantics ───────────────────────────────────────

/**
 * Returns color usage warnings for synastry reports.
 * Color semantics differ between systems AND between cultural contexts.
 */
export function checkSynastryColorSemantics(
  reportContent: string,
  systemType: SynastrySystemType,
  language: 'zh' | 'en' = 'zh'
): CoherenceViolation[] {
  const violations: CoherenceViolation[] = [];
  const content = reportContent.toLowerCase();

  const colorMentions: Array<{ color: string; patterns: string[] }> = [
    {
      color: '红色/红',
      patterns: ['红色', '红光', '红字', '赤色', 'red color', 'red glow'],
    },
    {
      color: '白色/白',
      patterns: ['白色', '白虎', '白字', 'white color', 'white light'],
    },
    {
      color: '黄色/黄',
      patterns: ['黄色', '黄道', '金黄色', 'yellow color'],
    },
    {
      color: '黑色/黑',
      patterns: ['黑色', '玄色', '黑字', 'black color', 'black light'],
    },
  ];

  for (const { color, patterns } of colorMentions) {
    const found = patterns.some(p => content.includes(p.toLowerCase()));
    if (!found) continue;

    // In BaZi context, red is auspicious (红红火火)
    // In Western astrology context, red = Mars = aggression/conflict
    if (color === '红色/红' && systemType === 'western') {
      violations.push({
        type: 'color_semantics',
        severity: 'warning',
        message: `Color '${color}' in Western astrology context carries Mars/aggression meaning, not auspiciousness. Use culturally appropriate framing.`,
        suggestion: 'Frame red as "Martian energy" or "fire energy" rather than auspicious/positive',
        position: -1,
      });
    }

    // In BaZi/Ziwei context, red = auspicious, but context matters
    if (color === '红色/红' && (systemType === 'bazi' || systemType === 'ziwei')) {
      // This is generally fine, but check for overstatement
      violations.push({
        type: 'color_semantics',
        severity: 'info',
        message: `Color '${color}' is generally auspicious in ${systemType} context — verify no Western astrology Mars connotations are mixed in`,
        suggestion: 'OK for BaZi/Ziwei — ensure no Western astrology concepts are adjacent',
        position: -1,
      });
    }
  }

  return violations;
}

// ─── Main synastry coherence check ────────────────────────────────────────────

export function checkSynastryCoherence(input: SynastryCoherenceInput): SynastryCoherenceResult {
  const violations: CoherenceViolation[] = [];
  const warnings: string[] = [];

  // 1. System consistency check (CRITICAL)
  const { consistent, violations: systemViolations } = checkSystemConsistency(input);
  if (!consistent) {
    for (const v of systemViolations) {
      violations.push({
        type: 'system_boundary',
        severity: 'critical',
        message: `System consistency violation: ${v}`,
        suggestion: 'Ensure both persons use the same divination system in a synastry report',
        position: -1,
      });
    }
  }

  // 2. Cross-system detection in report content
  if (input.reportContent) {
    const crossSystem = detectCrossSystemMixing(input.reportContent, input.systemType);
    if (crossSystem.detected) {
      for (const ev of crossSystem.evidence) {
        violations.push({
          type: 'system_boundary',
          severity: crossSystem.severity,
          message: `Cross-system mixing detected: ${ev}`,
          suggestion: `Do not mix ${crossSystem.mixedSystems.join(' and ')} concepts in a ${input.systemType} synastry report`,
          position: -1,
        });
      }
      warnings.push(...crossSystem.evidence);
    }

    // 3. Color semantics check
    const colorViolations = checkSynastryColorSemantics(
      input.reportContent,
      input.systemType,
      input.language ?? 'zh'
    );
    violations.push(...colorViolations);
  }

  // 4. Named entity consistency (person names, titles)
  if (input.reportContent) {
    const nameCheck = checkPersonNamingConsistency(input.reportContent, input.person1Data, input.person2Data);
    if (nameCheck.violations.length > 0) {
      violations.push(...nameCheck.violations);
    }
  }

  const criticalCount = violations.filter(v => v.severity === 'critical').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;

  return {
    valid: violations.filter(v => v.severity === 'critical').length === 0,
    violations,
    warnings,
    suggestions: violations.map(v => v.suggestion).filter(Boolean),
    confidence: Math.max(0, 1 - (criticalCount * 0.3 + warningCount * 0.1)),
    systemConsistency: consistent,
    systemConsistencyViolations: systemViolations,
    crossSystemWarnings: warnings,
  };
}

// ─── Person naming consistency ────────────────────────────────────────────────

function checkPersonNamingConsistency(
  reportContent: string,
  person1Data: Record<string, unknown>,
  person2Data: Record<string, unknown>
): { violations: CoherenceViolation[] } {
  const violations: CoherenceViolation[] = [];

  const name1 = typeof person1Data.name === 'string' ? person1Data.name : '';
  const name2 = typeof person2Data.name === 'string' ? person2Data.name : '';

  // If names are provided, they should appear in the report
  if (name1 && !reportContent.includes(name1) && reportContent.length > 100) {
    violations.push({
      type: 'naming_consistency',
      severity: 'warning',
      message: `Person 1 name "${name1}" not found in report content`,
      suggestion: 'Include both persons\' names in the synastry report for personalization',
      position: -1,
    });
  }

  if (name2 && !reportContent.includes(name2) && reportContent.length > 100) {
    violations.push({
      type: 'naming_consistency',
      severity: 'warning',
      message: `Person 2 name "${name2}" not found in report content`,
      suggestion: 'Include both persons\' names in the synastry report for personalization',
      position: -1,
    });
  }

  // Check that the report refers to both persons consistently
  const reportLower = reportContent.toLowerCase();
  if (name1 && name2) {
    const bothMentioned =
      reportLower.includes(name1.toLowerCase()) &&
      reportLower.includes(name2.toLowerCase());

    if (!bothMentioned && reportContent.length > 200) {
      violations.push({
        type: 'naming_consistency',
        severity: 'warning',
        message: 'Both persons should be explicitly mentioned by name in the synastry report',
        suggestion: 'Use names to personalize the synastry narrative for each person',
        position: -1,
      });
    }
  }

  return { violations };
}

// ─── Wrapper for use in synastry pipeline ─────────────────────────────────────

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
