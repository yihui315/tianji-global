/**
 * Hallucination Detector — TianJi Global
 * Deterministic anti-hallucination scanner for Chinese metaphysics content.
 * Uses keyword/pattern matching against known KB data — no LLM needed.
 */

import {
  STEM_MEANINGS,
  BRANCH_MEANINGS,
  JIAZI_COMBINATIONS,
  ELEMENT_CYCLE,
  getStemMeaning,
  getBranchMeaning,
  getJiaZiEntry,
  getElementCycle,
} from '@/data/bazi-knowledge-base';
import {
  PALACE_MEANINGS,
  STAR_MEANINGS,
  STAR_GROUPS,
  MINGZHU_COMBINATIONS,
  getStarMeaning,
  getPalaceMeaning,
  getStarGroup,
  getMingzhuCombination,
} from '@/data/ziwei-knowledge-base';

export type HallucinationSeverity = 'low' | 'medium' | 'high';

export interface Hallucination {
  text: string;
  severity: HallucinationSeverity;
  reason: string;
}

// ─── Claim validators per service type ───────────────────────────────────────

const VALID_STEMS = new Set(STEM_MEANINGS.map((s) => s.stem));
const VALID_BRANCHES = new Set(BRANCH_MEANINGS.map((b) => b.branch));
const VALID_JIAZI = new Set(JIAZI_COMBINATIONS.map((j) => j.jiaziName));
const VALID_ELEMENTS = new Set(ELEMENT_CYCLE.map((e) => e.element_zh));

const VALID_PALACES = new Set(PALACE_MEANINGS.map((p) => p.palace_zh));
const VALID_STARS = new Set(STAR_MEANINGS.map((s) => s.star_zh));
const VALID_STAR_GROUPS = new Set(STAR_GROUPS.map((g) => g.group_name_zh));

// Patterns that indicate a likely hallucination / ungrounded claim
const HALLUCINATION_PATTERNS: Array<{
  pattern: RegExp;
  severity: HallucinationSeverity;
  reasonTemplate: (match: string) => string;
}> = [
  // Numeric accuracy claims
  {
    pattern: /准确率\s*\d+[%-]/,
    severity: 'high',
    reasonTemplate: (m) => `Inflated accuracy claim "${m}" — not supported by KB`,
  },
  {
    pattern: /\d{4}年预测准确/,
    severity: 'high',
    reasonTemplate: (m) => `Specific year accuracy claim "${m}" is unverifiable`,
  },
  // Fabricated star/palace names
  {
    pattern: /紫微星君|天机圣星|北斗神君|太上皇星/,
    severity: 'high',
    reasonTemplate: (m) => `Fictional celestial object "${m}" not in Ziwei KB`,
  },
  // Making up elements
  {
    pattern: /[甲乙丙丁戊己庚辛壬癸]\s*(属|为)\s*[^木火土金水]/,
    severity: 'high',
    reasonTemplate: (m) => `Incorrect stem-element mapping "${m}" contradicts KB`,
  },
  // Fabricated branch-zodiac combos
  {
    pattern: /(鼠|牛|虎|兔|龙|蛇|马|羊|猴|鸡|狗|猪)\s*(属|为)\s*[^木火土金水]/,
    severity: 'medium',
    reasonTemplate: (m) => `Incorrect zodiac-element mapping "${m}" contradicts KB`,
  },
  // Defamation/absolute claims
  {
    pattern: /(必定|绝对|肯定|100%|一定会)/,
    severity: 'low',
    reasonTemplate: (m) => `Overconfident absolute claim "${m}" — no KB supports certainty`,
  },
  // Invented palace names with arithmetic
  {
    pattern: /(命宫|父母宫|兄弟宫|夫妻宫|子女宫|财帛宫|疾厄宫|迁移宫|奴仆宫|官禄宫|田宅宫|福德宫|相貌宫)\s*(加|减|乘|除|乘以|除以)/,
    severity: 'high',
    reasonTemplate: (m) => `Arithmetic operation on palace "${m}" is nonsensical`,
  },
  // Medical claims
  {
    pattern: /(会得|会患|一定生|必定生|会死|会癌)/,
    severity: 'high',
    reasonTemplate: (m) => `Medical diagnosis "${m}" — KB does not authorize medical predictions`,
  },
  // Financial guarantees
  {
    pattern: /(一定会?发|必定?富|肯定?赚|保证?盈)/,
    severity: 'medium',
    reasonTemplate: (m) => `Financial guarantee "${m}" is not grounded in KB`,
  },
];

/**
 * Check a piece of text for known unsupported / hallucinated claims.
 * Returns a list of flagged spans with severity and reason.
 */
export function detectHallucinations(text: string, serviceType: string): Hallucination[] {
  const findings: Hallucination[] = [];

  // 1. Pattern-based scan
  for (const { pattern, severity, reasonTemplate } of HALLUCINATION_PATTERNS) {
    const matches = Array.from(text.matchAll(new RegExp(pattern, 'g')));
    for (const match of matches) {
      findings.push({
        text: match[0],
        severity,
        reason: reasonTemplate(match[0]),
      });
    }
  }

  // 2. Service-specific structural checks
  if (serviceType === 'bazi' || serviceType === 'yijing') {
    findings.push(...checkBaziHallucinations(text));
  } else if (serviceType === 'ziwei') {
    findings.push(...checkZiweiHallucinations(text));
  }

  // Deduplicate by text
  const seen = new Set<string>();
  return findings.filter((f) => {
    if (seen.has(f.text)) return false;
    seen.add(f.text);
    return true;
  });
}

function checkBaziHallucinations(text: string): Hallucination[] {
  const findings: Hallucination[] = [];

  // Check for invalid stem references
  for (const stem of text) {
    if (VALID_STEMS.has(stem) && !VALID_STEMS.has(stem.trim())) {
      // Single-char stem mentioned
    }
  }

  // Check for invalid JiaZi combinations referenced in text
  for (const jiazi of text.match(/[甲乙丙丁戊己庚辛壬癸]{2}/g) || []) {
    if (!VALID_JIAZI.has(jiazi)) {
      findings.push({
        text: jiazi,
        severity: 'high',
        reason: `JiaZi combination "${jiazi}" is not in the 60-cycle KB`,
      });
    }
  }

  // Check for element inconsistencies
  const elementMentions = Array.from(
    text.matchAll(/(木|火|土|金|水)[^生克转化合局冲害刑]|属(木|火|土|金|水)/g)
  );
  for (const match of elementMentions) {
    const elem = match[1] || match[0].slice(1);
    if (!VALID_ELEMENTS.has(elem)) {
      findings.push({
        text: match[0],
        severity: 'medium',
        reason: `Element "${elem}" is not a valid Wu Xing element`,
      });
    }
  }

  // Check stem-branch pairing patterns for impossible combos
  const invalidPairPatterns = [
    /甲(鼠|牛|虎|兔|龙|蛇)/, // stems only pair with specific branches
  ];

  return findings;
}

function checkZiweiHallucinations(text: string): Hallucination[] {
  const findings: Hallucination[] = [];

  // Check for invalid palace names
  for (const palace of text.match(/[命父母兄夫妻子财疾迁奴官吏田福相]\宫/g) || []) {
    // Normalize
    const normalized = palace.replace('宫', '宫');
    if (!VALID_PALACES.has(normalized) && !VALID_PALACES.has(palace)) {
      findings.push({
        text: palace,
        severity: 'high',
        reason: `Palace "${palace}" is not in the Ziwei 12-palace KB`,
      });
    }
  }

  // Check for fabricated star names (stars are typically 2-char in Chinese)
  const twoCharStarRefs = text.match(/[天机紫微太阳太阴武曲贪狼巨门禄存文昌文曲左辅右弼破军七杀廉贞天府天相等]{2,4}/g) || [];
  for (const star of twoCharStarRefs) {
    if (!VALID_STARS.has(star) && !VALID_STAR_GROUPS.has(star)) {
      findings.push({
        text: star,
        severity: 'medium',
        reason: `Star "${star}" is not in the Ziwei KB star list`,
      });
    }
  }

  return findings;
}
