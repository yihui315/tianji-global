/**
 * Content moderation utilities for TianJi Global API
 * Handles sensitive word filtering and disclaimers
 */

export type DisclaimerType = 'yijing' | 'tarot' | 'bazi' | 'ziwei';

// -------------------------------------------------------------------
// Sensitive categories & keyword lists
// -------------------------------------------------------------------

export const SENSITIVE_CATEGORIES = [
  'gambling',
  'financial advice',
  'medical',
  'legal',
  'political',
  'adult',
] as const;

export type SensitiveCategory = (typeof SENSITIVE_CATEGORIES)[number];

// Bilingual keyword list — each entry is a regex-ready string (no leading/trailing anchors)
const SENSITIVE_PATTERNS: Array<{ pattern: string; category: SensitiveCategory }> = [
  // ── Gambling ──────────────────────────────────────────────────
  { pattern: '赌[博戏]|博彩|赌场|筹码|下注|开牌|骰子|轮盘|老虎机|时时彩|快三', category: 'gambling' },
  { pattern: 'gambling|casino|betting|bet|slot machine|roulette|poker|horse racing|lottery', category: 'gambling' },

  // ── Financial advice ──────────────────────────────────────────
  { pattern: '投资理财|炒股|基金|期货|外汇保证金|虚拟货币|数字货币|比特币|ICO|荐股|配资', category: 'financial advice' },
  { pattern: 'invest|stock market|trading|forex|crypto|bitcoin|trading signal|financ', category: 'financial advice' },

  // ── Medical ────────────────────────────────────────────────────
  { pattern: '看病|开药|处方|手术|住院|治疗方案|癌症|肿瘤|艾滋病|精神病|抑郁症|医院挂号', category: 'medical' },
  { pattern: 'medical advice|doctor|hospital|diagnosis|prescription|surgery|cancer|treatment plan|medication dosage', category: 'medical' },

  // ── Legal ──────────────────────────────────────────────────────
  { pattern: '律师|法律咨询|官司|诉讼|法院|判刑|坐牢|取保候审|逮捕|拘留', category: 'legal' },
  { pattern: 'lawyer|legal advice|lawsuit|court ruling|attorney|prosecutor|incarceration', category: 'legal' },

  // ── Political ───────────────────────────────────────────────────
  { pattern: '国家领导人|习近平|特朗普|拜登|主席|总理|总统|议员|抗议|示威|维权', category: 'political' },
  { pattern: 'politician|president|prime minister|government official|protest|demonstration|election', category: 'political' },

  // ── Adult ──────────────────────────────────────────────────────
  { pattern: '色情|黄色|裸体|性交易|援交|成人网站|一夜情', category: 'adult' },
  { pattern: 'porn|sex worker|escort|adult content|nude|explicit|nsfw', category: 'adult' },
];

/** Compiled regexes — built once at module load */
const compiledRe = SENSITIVE_PATTERNS.map(({ pattern, category }) => ({
  re: new RegExp(pattern, 'i'),
  category,
}));

// -------------------------------------------------------------------
// Main filtering function
// -------------------------------------------------------------------

export interface FilterResult {
  safe: boolean;
  filtered: string;
  flagged: boolean;
  matchedCategory?: SensitiveCategory;
}

/**
 * Checks `text` against all sensitive patterns.
 * - No match  → { safe: true, filtered: text, flagged: false }
 * - Match     → { safe: false, filtered: '[内容已屏蔽]', flagged: true, matchedCategory }
 */
export function filterSensitiveContent(text: string): FilterResult {
  if (!text || typeof text !== 'string') {
    return { safe: true, filtered: text ?? '', flagged: false };
  }

  for (const { re, category } of compiledRe) {
    if (re.test(text)) {
      return {
        safe: false,
        filtered: '[内容已屏蔽]',
        flagged: true,
        matchedCategory: category,
      };
    }
  }

  return { safe: true, filtered: text, flagged: false };
}

// -------------------------------------------------------------------
// Disclaimer helpers
// -------------------------------------------------------------------

const DISCLAIMERS: Record<DisclaimerType, { zh: string; en: string }> = {
  yijing: {
    zh: '【免责声明】本AI解读仅供娱乐参考，非专业命理或心理咨询。命运掌握在自己手中，请理性看待占卜结果。',
    en: '[Disclaimer] This AI interpretation is for entertainment purposes only and does not constitute professional divination or psychological counseling. Fate is in your own hands — please view divination results rationally.',
  },
  tarot: {
    zh: '【免责声明】本AI塔罗解读仅供娱乐参考，非专业心理咨询。卡片指引仅供参考，人生决定请遵循自己的判断。',
    en: '[Disclaimer] This AI tarot reading is for entertainment purposes only and does not constitute professional psychological counseling. Card guidance is for reference only; please follow your own judgment in life decisions.',
  },
  bazi: {
    zh: '【免责声明】本AI八字分析仅供娱乐参考，非专业命理咨询。命运掌握在自己手中，请理性看待分析结果。',
    en: '[Disclaimer] This AI Bazi analysis is for entertainment purposes only and does not constitute professional divination. Fate is in your own hands — please view the analysis rationally.',
  },
  ziwei: {
    zh: '【免责声明】本AI紫微斗数分析仅供娱乐参考，非专业命理咨询。命运掌握在自己手中，请理性看待分析结果。',
    en: '[Disclaimer] This AI Ziwu Doushu analysis is for entertainment purposes only and does not constitute professional divination. Fate is in your own hands — please view the analysis rationally.',
  },
};

/**
 * Prepends the appropriate bilingual disclaimer to `text`.
 * @param text  Original text (typically the AI interpretation)
 * @param type  Service type — controls which disclaimer is used
 */
export function addDisclaimer(text: string, type: DisclaimerType): string {
  if (!text) return text;
  const { zh, en } = DISCLAIMERS[type];
  // Check if text appears to be in English (ASCII-heavy) or Chinese
  const isEnglish = /[a-zA-Z]/.test(text) && text.replace(/[^a-zA-Z]/g, '').length > text.length / 2;
  return isEnglish ? `${en}\n\n${text}` : `${zh}\n\n${text}`;
}
