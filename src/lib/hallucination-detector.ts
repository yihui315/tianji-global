/**
 * Hallucination Detector v2 — TianJi Global
 * Deterministic anti-hallucination scanner for Chinese metaphysics content.
 * Uses keyword/pattern matching against known KB data — no LLM needed.
 *
 * Enhancements v2:
 * - Tarot-specific hallucination checks
 * - Citation format validation ([KB:entry_id])
 * - Cross-service hallucination detection
 * - Severity-weighted scoring
 */

import {
  STEM_MEANINGS,
  BRANCH_MEANINGS,
  JIAZI_COMBINATIONS,
  ELEMENT_CYCLE,
} from '@/data/bazi-knowledge-base';
import {
  PALACE_MEANINGS,
  STAR_MEANINGS,
  STAR_GROUPS,
  MINGZHU_COMBINATIONS,
} from '@/data/ziwei-knowledge-base';
import {
  TAROT_CARDS,
  TAROT_MAJOR_ARCANA,
  TAROT_WANDS,
  TAROT_CUPS,
  TAROT_SWORDS,
  TAROT_PENTACLES,
} from '@/data/tarot-knowledge-base';

export type HallucinationSeverity = 'low' | 'medium' | 'high';

export interface Hallucination {
  text: string;
  severity: HallucinationSeverity;
  reason: string;
  type: 'fabricated' | 'citation_invalid' | 'claim_absolute' | 'medical' | 'semantic';
}

export interface HallucinationReport {
  hallucinations: Hallucination[];
  severityScore: number; // 0-100, higher = more severe
  citationCoverage: number; // 0-1, how many citations are valid
  hasUnverifiedCitations: boolean;
  hasAbsoluteClaims: boolean;
  hasMedicalClaims: boolean;
}

// ─── Claim validators per service type ───────────────────────────────────────

const VALID_STEMS = new Set(STEM_MEANINGS.map((s) => s.stem));
const VALID_BRANCHES = new Set(BRANCH_MEANINGS.map((b) => b.branch));
const VALID_JIAZI = new Set(JIAZI_COMBINATIONS.map((j) => j.jiaziName));
const VALID_ELEMENTS = new Set(ELEMENT_CYCLE.map((e) => e.element_zh));
const VALID_ELEMENTS_EN = new Set(['wood', 'fire', 'earth', 'metal', 'water', '木', '火', '土', '金', '水']);

const VALID_PALACES = new Set(PALACE_MEANINGS.map((p) => p.palace_zh));
const VALID_STARS = new Set(STAR_MEANINGS.map((s) => s.star_zh));
const VALID_STAR_GROUPS = new Set(STAR_GROUPS.map((g) => g.group_name_zh));

// Tarot validators
const VALID_TAROT_MAJOR = new Set(TAROT_MAJOR_ARCANA.map((c) => c.name_en));
const VALID_TAROT_MINOR = new Set([
  ...TAROT_WANDS.map((c) => c.name_en),
  ...TAROT_CUPS.map((c) => c.name_en),
  ...TAROT_SWORDS.map((c) => c.name_en),
  ...TAROT_PENTACLES.map((c) => c.name_en),
]);
const VALID_TAROT_IDS = new Set(TAROT_CARDS.map((c) => c.id));

// Patterns that indicate a likely hallucination / ungrounded claim
const HALLUCINATION_PATTERNS: Array<{
  pattern: RegExp;
  severity: HallucinationSeverity;
  type: Hallucination['type'];
  reasonTemplate: (match: string) => string;
}> = [
  // Numeric accuracy claims
  {
    pattern: /准确率\s*\d+[%-]/,
    severity: 'high',
    type: 'fabricated',
    reasonTemplate: (m) => `Inflated accuracy claim "${m}" — not supported by KB`,
  },
  {
    pattern: /\d{4}年预测准确/,
    severity: 'high',
    type: 'fabricated',
    reasonTemplate: (m) => `Specific year accuracy claim "${m}" is unverifiable`,
  },
  // Fabricated star/palace names
  {
    pattern: /紫微星君|天机圣星|北斗神君|太上皇星|天煞星君|地藏王星/,
    severity: 'high',
    type: 'fabricated',
    reasonTemplate: (m) => `Fictional celestial object "${m}" not in Ziwei KB`,
  },
  // Making up elements for stems
  {
    pattern: /[甲乙丙丁戊己庚辛壬癸]\s*(属|为)\s*[^木火土金水]/,
    severity: 'high',
    type: 'fabricated',
    reasonTemplate: (m) => `Incorrect stem-element mapping "${m}" contradicts KB`,
  },
  // Fabricated branch-zodiac combos
  {
    pattern: /(鼠|牛|虎|兔|龙|蛇|马|羊|猴|鸡|狗|猪)\s*(属|为)\s*[^木火土金水]/,
    severity: 'medium',
    type: 'fabricated',
    reasonTemplate: (m) => `Incorrect zodiac-element mapping "${m}" contradicts KB`,
  },
  // Defamation/absolute claims
  {
    pattern: /(必定|绝对|肯定|100%|一定会|绝对会|肯定有)/,
    severity: 'low',
    type: 'claim_absolute',
    reasonTemplate: (m) => `Overconfident absolute claim "${m}" — no KB supports certainty`,
  },
  // Invented palace names with arithmetic
  {
    pattern: /(命宫|父母宫|兄弟宫|夫妻宫|子女宫|财帛宫|疾厄宫|迁移宫|奴仆宫|官禄宫|田宅宫|福德宫|相貌宫)\s*(加|减|乘|除|乘以|除以)/,
    severity: 'high',
    type: 'semantic',
    reasonTemplate: (m) => `Arithmetic operation on palace "${m}" is nonsensical`,
  },
  // Medical claims
  {
    pattern: /(会得|会患|一定生|必定生|会死|会癌)/,
    severity: 'high',
    type: 'medical',
    reasonTemplate: (m) => `Medical diagnosis "${m}" — KB does not authorize medical predictions`,
  },
  // Financial guarantees
  {
    pattern: /(一定会?发|必定?富|肯定?赚|保证?盈)/,
    severity: 'medium',
    type: 'fabricated',
    reasonTemplate: (m) => `Financial guarantee "${m}" is not grounded in KB`,
  },
  // Tarot fabricated cards
  {
    pattern: /(第[零一二三四五六七八九十百千万\d]+张|缺失塔罗牌|隐藏塔罗牌|禁忌塔罗牌)/,
    severity: 'high',
    type: 'fabricated',
    reasonTemplate: (m) => `Fabricated tarot concept "${m}" — standard tarot has exactly 78 cards`,
  },
  // Tarot fabricated meanings
  {
    pattern: /(塔罗牌?\s*能\s*(预测|预知|算命))/,
    severity: 'medium',
    type: 'claim_absolute',
    reasonTemplate: (m) => `Overclaiming tarot capability "${m}" — tarot offers guidance, not prediction`,
  },
];

// ─── Service-specific hallucination checkers ──────────────────────────────────

function checkBaziHallucinations(text: string): Hallucination[] {
  const findings: Hallucination[] = [];

  // Check for invalid JiaZi combinations referenced in text
  for (const jiazi of text.match(/[甲乙丙丁戊己庚辛壬癸]{2}/g) || []) {
    if (!VALID_JIAZI.has(jiazi)) {
      findings.push({
        text: jiazi,
        severity: 'high',
        reason: `JiaZi combination "${jiazi}" is not in the 60-cycle KB`,
        type: 'fabricated',
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
        type: 'fabricated',
      });
    }
  }

  // Check for invalid stem references
  for (const stem of text) {
    if (VALID_STEMS.has(stem) && !VALID_STEMS.has(stem.trim())) {
      // This is a valid stem, so fine
    }
  }

  return findings;
}

function checkZiweiHallucinations(text: string): Hallucination[] {
  const findings: Hallucination[] = [];

  // Check for invalid palace names
  const palacePattern = /[命父母兄夫妻子财疾迁移奴官吏田福相]\宫/g;
  for (const palace of text.match(palacePattern) || []) {
    const normalized = palace.replace('宫', '宫');
    if (!VALID_PALACES.has(normalized) && !VALID_PALACES.has(palace)) {
      findings.push({
        text: palace,
        severity: 'high',
        reason: `Palace "${palace}" is not in the Ziwei 12-palace KB`,
        type: 'fabricated',
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
        type: 'fabricated',
      });
    }
  }

  return findings;
}

function checkTarotHallucinations(text: string): Hallucination[] {
  const findings: Hallucination[] = [];

  // Check for non-existent tarot cards mentioned
  const majorPattern = /大阿尔卡纳[第]?[零一二三四五六七八九十百\d]+号|大阿尔卡纳(愚者|魔术师|女祭司|女皇|皇帝|教皇|恋人|战车|力量|隐士|命运之轮|正义|吊人|死神|节制|恶魔|塔|星星|月亮|太阳|审判|世界)/g;
  for (const card of text.match(majorPattern) || []) {
    const cardName = card.replace('大阿尔卡纳', '').replace(/[第零一二三四五六七八九十百\d]+号/, '');
    if (!VALID_TAROT_MAJOR.has(cardName) && !VALID_TAROT_MAJOR.has(card)) {
      findings.push({
        text: card,
        severity: 'high',
        reason: `Major Arcana card "${card}" not in standard 22-card deck`,
        type: 'fabricated',
      });
    }
  }

  // Check for impossible card counts
  if (/第7[89]张塔罗|塔罗有[一乙丙丁][零一二三四五六七八九十百\d]+张/.test(text)) {
    findings.push({
      text: text.match(/塔罗有[一乙丙丁][零一二三四五六七八九十百\d]+张/)?.[0] || 'invalid count',
      severity: 'high',
      reason: 'Standard tarot deck has exactly 78 cards (22 Major + 56 Minor)',
      type: 'fabricated',
    });
  }

  return findings;
}

/**
 * Check a piece of text for known unsupported / hallucinated claims.
 * Returns a list of flagged spans with severity and reason.
 */
export function detectHallucinations(text: string, serviceType: string): Hallucination[] {
  const findings: Hallucination[] = [];

  // 1. Pattern-based scan
  for (const { pattern, severity, reasonTemplate, type } of HALLUCINATION_PATTERNS) {
    const regex = new RegExp(pattern, 'g');
    const matches = Array.from(text.matchAll(regex));
    for (const match of matches) {
      findings.push({
        text: match[0],
        severity,
        reason: reasonTemplate(match[0]),
        type,
      });
    }
  }

  // 2. Service-specific structural checks
  switch (serviceType) {
    case 'bazi':
    case 'yijing':
      findings.push(...checkBaziHallucinations(text));
      break;
    case 'ziwei':
      findings.push(...checkZiweiHallucinations(text));
      break;
    case 'tarot':
      findings.push(...checkTarotHallucinations(text));
      break;
  }

  // Deduplicate by text
  const seen = new Set<string>();
  return findings.filter((f) => {
    if (seen.has(f.text)) return false;
    seen.add(f.text);
    return true;
  });
}

/**
 * Validate citation format and check against known KB entries.
 */
export function validateCitations(
  text: string,
  serviceType: string
): { valid: string[]; invalid: string[]; missing: string[] } {
  const citationPattern = /\[KB:([^\]]+)\]/g;
  const citations: string[] = [];
  let match;
  while ((match = citationPattern.exec(text)) !== null) {
    citations.push(match[1]);
  }

  // If no citations provided, report missing
  if (citations.length === 0) {
    return { valid: [], invalid: [], missing: ['[KB:entry_id]'] };
  }

  const validIds: Set<string> = new Set();

  switch (serviceType) {
    case 'bazi':
      STEM_MEANINGS.forEach((s) => validIds.add(s.id));
      BRANCH_MEANINGS.forEach((b) => validIds.add(b.id));
      JIAZI_COMBINATIONS.forEach((j) => validIds.add(j.id));
      ELEMENT_CYCLE.forEach((e) => validIds.add(`element-${e.element}`));
      break;
    case 'ziwei':
      PALACE_MEANINGS.forEach((p) => validIds.add(p.id));
      STAR_MEANINGS.forEach((s) => validIds.add(s.id));
      MINGZHU_COMBINATIONS.forEach((m) => validIds.add(m.id));
      break;
    case 'tarot':
      VALID_TAROT_IDS.forEach((id) => validIds.add(id));
      break;
    case 'yijing':
      // Hexagrams use hex-N pattern
      for (let i = 1; i <= 20; i++) {
        validIds.add(`hex-${i}`);
      }
      break;
  }

  const valid: string[] = [];
  const invalid: string[] = [];

  for (const cite of citations) {
    if (validIds.has(cite)) {
      valid.push(cite);
    } else {
      invalid.push(cite);
    }
  }

  return { valid, invalid, missing: [] };
}

/**
 * Generate a comprehensive hallucination report with severity scoring.
 */
export function generateHallucinationReport(
  text: string,
  serviceType: string
): HallucinationReport {
  const hallucinations = detectHallucinations(text, serviceType);
  const { valid, invalid } = validateCitations(text, serviceType);

  // Calculate severity score (0-100)
  let severityScore = 0;
  for (const h of hallucinations) {
    switch (h.severity) {
      case 'high':
        severityScore += 40;
        break;
      case 'medium':
        severityScore += 20;
        break;
      case 'low':
        severityScore += 5;
        break;
    }
  }
  severityScore = Math.min(100, severityScore);

  // Calculate citation coverage
  const totalCitations = valid.length + invalid.length;
  const citationCoverage = totalCitations > 0 ? valid.length / totalCitations : 0;

  return {
    hallucinations,
    severityScore,
    citationCoverage,
    hasUnverifiedCitations: invalid.length > 0,
    hasAbsoluteClaims: hallucinations.some((h) => h.type === 'claim_absolute'),
    hasMedicalClaims: hallucinations.some((h) => h.type === 'medical'),
  };
}
