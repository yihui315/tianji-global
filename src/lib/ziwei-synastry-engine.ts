/**
 * Ziwei Dou Shu Synastry Engine — TianJi Global 天机全球
 *
 * Computes compatibility between two Ziwei Dou Shu (紫微斗数) charts.
 * System: Ziwei only — does NOT mix with BaZi, Western astrology, or Qizheng.
 *
 * Compatibility dimensions:
 * - Palace overlay analysis (命宫对照)
 * - Star interaction rules (星曜互动)
 * - SiHua (四化) cross-chart effects
 * - Soul/Body palace compatibility
 */

import type { ZiweiChart } from './ziwei-engine';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ZiweiSynastryInput {
  lifePalaceName: string;
  bodyPalaceName: string;
  fiveElementsClass: string;
  soul: string;
  body: string;
  gender?: string;
  // Extracted from raw iztro data
  mainStars: string[];
  assistantStars: string[];
  transformStars: string[]; // 四化星
  palaces: ZiweiPalaceInput[];
}

export interface ZiweiPalaceInput {
  name: string;          // e.g. '命宫', '夫妻宫'
  starNames: string[];   // 星曜列表
}

// ─── Output types ─────────────────────────────────────────────────────────────

export interface PalaceOverlay {
  palace1: string;
  palace2: string;
  compatibility: 'harmonious' | 'neutral' | 'challenging' | 'void';
  score: number;           // -10 to +10
  description: string;
  descriptionZh: string;
}

export interface StarCompatibility {
  star1: string;
  star2: string;
  relationship: 'attracted' | 'repelled' | 'complement' | 'neutral' | 'void';
  score: number;
  description: string;
  descriptionZh: string;
}

export interface SiHuaCrossEffect {
  star: string;
  person1Hua: 'lu' | 'quan' | 'ke' | '忌' | null;
  person2Hua: 'lu' | 'quan' | 'ke' | '忌' | null;
  effect: string;
  effectZh: string;
  score: number;
}

export interface ZiweiSynastryResult {
  person1: ZiweiSynastryInput;
  person2: ZiweiSynastryInput;
  overallScore: number;           // 0-100
  compatibilityLevel: 'excellent' | 'good' | 'fair' | 'challenging';

  palaceOverlays: PalaceOverlay[];
  starCompatibilities: StarCompatibility[];
  siHuaEffects: SiHuaCrossEffect[];

  lifePalaceMatch: boolean;
  soulCompatScore: number;
  bodyCompatScore: number;

  summary: string;
  summaryZh: string;
  advice: string;
  adviceZh: string;

  coherencePass: boolean;
  coherenceWarnings: string[];
}

// ─── Ziwei palace compatibility map ──────────────────────────────────────────
// Key = opposing/overlay palace pairs
// Value: positive = harmonious, negative = challenging

const PALACE_COMPATIBILITY: Record<string, Record<string, number>> = {
  '命宫': {
    '命宫': 8, '夫妻宫': 6, '福德宫': 7, '官禄宫': 5,
    '迁移宫': 3, '财帛宫': 4, '田宅宫': 5, '子女宫': 3,
    '兄弟宫': 2, '疾厄宫': -4, '仆役宫': -3, '父母宫': -2,
  },
  '夫妻宫': {
    '命宫': 6, '夫妻宫': 8, '福德宫': 4, '官禄宫': 3,
    '迁移宫': 2, '财帛宫': 5, '田宅宫': 3, '子女宫': 6,
    '兄弟宫': 1, '疾厄宫': -3, '仆役宫': -2, '父母宫': 5,
  },
  '官禄宫': {
    '命宫': 5, '夫妻宫': 3, '福德宫': 4, '官禄宫': 8,
    '迁移宫': 6, '财帛宫': 3, '田宅宫': 2, '子女宫': 1,
    '兄弟宫': 4, '疾厄宫': -3, '仆役宫': 5, '父母宫': 2,
  },
  '财帛宫': {
    '命宫': 4, '夫妻宫': 5, '福德宫': 6, '官禄宫': 3,
    '迁移宫': 2, '财帛宫': 8, '田宅宫': 5, '子女宫': 3,
    '兄弟宫': 4, '疾厄宫': -2, '仆役宫': 3, '父母宫': 1,
  },
  '迁移宫': {
    '命宫': 3, '夫妻宫': 2, '福德宫': 5, '官禄宫': 6,
    '迁移宫': 8, '财帛宫': 2, '田宅宫': -2, '子女宫': 4,
    '兄弟宫': 3, '疾厄宫': -5, '仆役宫': 6, '父母宫': 3,
  },
  '福德宫': {
    '命宫': 7, '夫妻宫': 4, '福德宫': 8, '官禄宫': 4,
    '迁移宫': 5, '财帛宫': 6, '田宅宫': 5, '子女宫': 3,
    '兄弟宫': 3, '疾厄宫': -3, '仆役宫': 2, '父母宫': 6,
  },
  '田宅宫': {
    '命宫': 5, '夫妻宫': 3, '福德宫': 5, '官禄宫': 2,
    '迁移宫': -2, '财帛宫': 5, '田宅宫': 8, '子女宫': 4,
    '兄弟宫': 6, '疾厄宫': -4, '仆役宫': 3, '父母宫': 4,
  },
  '子女宫': {
    '命宫': 3, '夫妻宫': 6, '福德宫': 3, '官禄宫': 1,
    '迁移宫': 4, '财帛宫': 3, '田宅宫': 4, '子女宫': 8,
    '兄弟宫': 2, '疾厄宫': -3, '仆役宫': 5, '父母宫': 1,
  },
  '兄弟宫': {
    '命宫': 2, '夫妻宫': 1, '福德宫': 3, '官禄宫': 4,
    '迁移宫': 3, '财帛宫': 4, '田宅宫': 6, '子女宫': 2,
    '兄弟宫': 7, '疾厄宫': -2, '仆役宫': 6, '父母宫': 3,
  },
  '疾厄宫': {
    '命宫': -4, '夫妻宫': -3, '福德宫': -3, '官禄宫': -3,
    '迁移宫': -5, '财帛宫': -2, '田宅宫': -4, '子女宫': -3,
    '兄弟宫': -2, '疾厄宫': -8, '仆役宫': -4, '父母宫': -3,
  },
  '仆役宫': {
    '命宫': -3, '夫妻宫': -2, '福德宫': 2, '官禄宫': 5,
    '迁移宫': 6, '财帛宫': 3, '田宅宫': 3, '子女宫': 5,
    '兄弟宫': 6, '疾厄宫': -4, '仆役宫': 6, '父母宫': 1,
  },
  '父母宫': {
    '命宫': -2, '夫妻宫': 5, '福德宫': 6, '官禄宫': 2,
    '迁移宫': 3, '财帛宫': 1, '田宅宫': 4, '子女宫': 1,
    '兄弟宫': 3, '疾厄宫': -3, '仆役宫': 1, '父母宫': 8,
  },
};

// ─── Major star interaction rules ─────────────────────────────────────────────

const STAR_INTERACTIONS: Record<string, Record<string, { type: StarCompatibility['relationship']; score: number; zh: string; en: string }>> = {
  '紫微': {
    '天府': { type: 'attracted', score: 8, zh: '紫微天府双帝星，格局宏大，互相欣赏', en: 'Two imperial stars — mutual admiration, grand ambitions' },
    '天机': { type: 'complement', score: 6, zh: '紫微天机组合，智慧与权力互补', en: 'Wisdom complements power — balanced partnership' },
    '太阳': { type: 'attracted', score: 7, zh: '紫微太阳，光芒相映，地位显赫', en: 'Radiant pairing — high status and recognition' },
    '武曲': { type: 'complement', score: 7, zh: '紫微武曲，坚毅果断，理财有方', en: 'Strength and finance — a powerful duo' },
    '天同': { type: 'neutral', score: 3, zh: '紫微天同，温和享乐，贵人有助', en: 'Ease and authority — agreeable combination' },
    '廉贞': { type: 'attracted', score: 7, zh: '紫微廉贞，情感丰富，魅力四射', en: 'Passionate pairing — magnetic charm and depth' },
    '贪狼': { type: 'repelled', score: -4, zh: '紫微贪狼，欲望过强，需防失控', en: 'Excess desire — warns of overindulgence and conflict' },
  },
  '天府': {
    '紫微': { type: 'attracted', score: 8, zh: '天府紫微双星，稳重持家，地位稳固', en: 'Two leaders — stable and commanding presence' },
    '武曲': { type: 'attracted', score: 7, zh: '天府武曲，理财高手，积累丰厚', en: 'Financial partnership — wealth accumulation' },
    '天相': { type: 'attracted', score: 7, zh: '天府天相，辅佐有力，格局清正', en: 'Supportive pairing — clean and principled' },
    '贪狼': { type: 'repelled', score: -5, zh: '天府贪狼，内敛与欲望冲突', en: 'Restraint meets desire — internal conflict' },
  },
  '天机': {
    '天同': { type: 'attracted', score: 7, zh: '天机天同，聪明灵慧，人缘极佳', en: 'Clever and agreeable — popular combination' },
    '巨门': { type: 'repelled', score: -4, zh: '天机巨门，口舌是非，需防误会', en: 'Communication friction — misunderstandings likely' },
    '紫微': { type: 'complement', score: 6, zh: '天机紫微，智慧领导力兼具', en: 'Strategy meets authority — leadership potential' },
  },
  '太阳': {
    '太阴': { type: 'attracted', score: 9, zh: '太阳太阴，阴阳调和，男女正配', en: 'Sun-Moon harmony — perfect male-female balance' },
    '巨门': { type: 'repelled', score: -5, zh: '太阳巨门，光明与暗昧冲突', en: 'Light meets shadow — truth and deception in tension' },
    '天梁': { type: 'neutral', score: 4, zh: '太阳天梁，公正无私，慈善之心', en: 'Justice and charity — noble intentions' },
  },
  '武曲': {
    '天府': { type: 'attracted', score: 7, zh: '武曲天府，财运丰厚，管理有方', en: 'Finance and governance — wealth management' },
    '贪狼': { type: 'attracted', score: 8, zh: '武曲贪狼，果断勇敢，横发偏财', en: 'Bold and decisive — financial risk-taker' },
    '七杀': { type: 'repelled', score: -5, zh: '武曲七杀，刚强过盛，冲突不断', en: 'Excessive force — repeated conflict and tension' },
  },
  '天同': {
    '天机': { type: 'attracted', score: 7, zh: '天同天机，温和聪慧，享受生活', en: 'Pleasant and clever — comfortable life' },
    '太阴': { type: 'attracted', score: 8, zh: '天同太阴，情感细腻，温柔体贴', en: 'Nurturing and sensitive — deep emotional bond' },
    '巨门': { type: 'neutral', score: 2, zh: '天同巨门，享乐与口舌并存', en: 'Pleasure meets words — enjoyable with some gossip' },
  },
  '廉贞': {
    '紫微': { type: 'attracted', score: 7, zh: '廉贞紫微，情感热烈，魅力出众', en: 'Passionate and magnetic — strong attraction' },
    '天相': { type: 'complement', score: 6, zh: '廉贞天相，桃花与稳重并存', en: 'Passion with stability — charm and responsibility' },
    '贪狼': { type: 'repelled', score: -6, zh: '廉贞贪狼，桃花过旺，欲望失控', en: 'Excessive passion — warns of indulgence and loss of control' },
  },
  '贪狼': {
    '紫微': { type: 'repelled', score: -4, zh: '贪狼紫微，野心与自尊冲突', en: 'Ambition clashes with authority — power struggle' },
    '武曲': { type: 'attracted', score: 8, zh: '贪狼武曲，横发偏财，社交达人', en: 'Bold and social — financial opportunities through connections' },
    '廉贞': { type: 'repelled', score: -6, zh: '贪狼廉贞，欲望与桃花双重过旺', en: 'Double excess — warns of addiction and relationship trouble' },
    '天府': { type: 'repelled', score: -5, zh: '贪狼天府，欲望与保守矛盾', en: 'Desire vs restraint — internal conflict' },
  },
  '太阴': {
    '太阳': { type: 'attracted', score: 9, zh: '太阴太阳，阴阳完美调和，婚姻上吉', en: 'Perfect yin-yang balance — ideal for marriage' },
    '天同': { type: 'attracted', score: 8, zh: '太阴天同，情感细腻，母性光辉', en: 'Nurturing and sensitive — deep emotional harmony' },
    '天机': { type: 'neutral', score: 4, zh: '太阴天机，柔中带智，暗中策划', en: 'Clever and reserved — private strategists' },
  },
  '巨门': {
    '天机': { type: 'repelled', score: -4, zh: '巨门天机，言语纷争，需防口舌', en: 'Communication friction — words become weapons' },
    '太阳': { type: 'repelled', score: -5, zh: '巨门太阳，是非不断，误会易生', en: 'Shadow obscures light — recurring misunderstandings' },
    '天同': { type: 'neutral', score: 2, zh: '巨门天同，暗中享乐，口舌难免', en: 'Pleasure behind closed doors — gossip follows' },
  },
  '天相': {
    '天府': { type: 'attracted', score: 7, zh: '天相天府，辅佐有力，格局清正', en: 'Trusted advisor — clean and principled leadership' },
    '紫微': { type: 'complement', score: 6, zh: '天相紫微，忠诚辅佐，格局宏大', en: 'Loyal support — elevates the imperial star' },
    '廉贞': { type: 'complement', score: 6, zh: '天相廉贞，桃花与稳重并存', en: 'Passion tempered by diplomacy — charming tactician' },
  },
  '天梁': {
    '太阳': { type: 'neutral', score: 4, zh: '天梁太阳，慈善济世，公正无私', en: 'Charitable justice — noble and fair-minded' },
    '天机': { type: 'neutral', score: 3, zh: '天梁天机，策划长远，监察有力', en: 'Strategic oversight — long-term planning' },
  },
  '七杀': {
    '武曲': { type: 'repelled', score: -5, zh: '七杀武曲，杀气过重，冲突频繁', en: 'Excessive force — repeated conflict and setbacks' },
    '紫微': { type: 'repelled', score: -4, zh: '七杀紫微，压制与反抗不断', en: 'Authority meets defiance — power struggle' },
    '天府': { type: 'repelled', score: -4, zh: '七杀天府，压力与稳定冲突', en: 'Destruction meets construction — constant tension' },
  },
  '破军': {
    '紫微': { type: 'repelled', score: -4, zh: '破军紫微，破坏与权威冲突', en: 'Revolution clashes with authority — dramatic upheaval' },
    '天府': { type: 'repelled', score: -3, zh: '破军天府，变动与保守矛盾', en: 'Change vs stability — incompatible approaches' },
    '天相': { type: 'neutral', score: 3, zh: '破军天相，破坏中有建设', en: 'Creative destruction — transformative potential' },
  },
};

// ─── SiHua cross-chart effects ───────────────────────────────────────────────

const SIHUA_NAMES: Record<string, string> = {
  '禄': '化禄', '权': '化权', '科': '化科', '忌': '化忌',
};

// Lu-Quan-Ke-Zhi interactions: Lu attracts Ji; Quan attracts Lu; Ke attracts Quan; Ji depletes Lu
const SIHUA_INTERACTIONS: Record<string, { zh: string; en: string; score: number }> = {
  '禄_禄': { zh: '双禄相逢，财源广进，缘分深厚', en: 'Double Lu — abundant wealth and deep connection', score: 8 },
  '禄_权': { zh: '禄权相会，财运与权力双收', en: 'Lu meets Quan — wealth and power combined', score: 7 },
  '禄_科': { zh: '禄科并临，名利双收，声誉日隆', en: 'Lu and Ke together — fame and fortune grow', score: 7 },
  '禄_忌': { zh: '禄忌相冲，财来财去，留不住', en: 'Lu conflicts with Ji — money flows in and out', score: -6 },
  '权_权': { zh: '双权相争，竞争激烈，权力冲突', en: 'Double Quan — power struggle and competition', score: -4 },
  '权_科': { zh: '权科相生，权力与名誉兼备', en: 'Quan and Ke — authority with reputation', score: 6 },
  '权_忌': { zh: '权忌相冲，是非不断，压力巨大', en: 'Quan conflicts with Ji — stress and conflict', score: -5 },
  '科_科': { zh: '双科相会，学术名气，声誉稳定', en: 'Double Ke — academic prestige and stable reputation', score: 5 },
  '科_忌': { zh: '科忌相冲，是非缠绕，名声受损', en: 'Ke conflicts with Ji — reputation damaged', score: -4 },
  '忌_忌': { zh: '双忌相冲，财务危机，缘分最差', en: 'Double Ji — worst financial and relationship combination', score: -9 },
};

// ─── Helper functions ─────────────────────────────────────────────────────────

function computePalaceOverlay(p1: string, p2: string): PalaceOverlay {
  const compat = PALACE_COMPATIBILITY[p1]?.[p2] ?? PALACE_COMPATIBILITY[p2]?.[p1] ?? 0;

  let compatibility: PalaceOverlay['compatibility'] = 'neutral';
  if (compat >= 6) compatibility = 'harmonious';
  else if (compat <= -4) compatibility = 'challenging';
  else if (compat <= 0) compatibility = 'void';

  const descriptions: Record<string, { zh: string; en: string }> = {
    harmonious: { zh: `${p1}与${p2}呈吉配，缘分深厚，互动顺畅`, en: `${p1} and ${p2} harmonize well — smooth interaction` },
    neutral: { zh: `${p1}与${p2}关系中性，需要磨合`, en: `${p1} and ${p2} are neutral — requires mutual effort` },
    challenging: { zh: `${p1}与${p2}呈凶配，冲突明显，需特别注意`, en: `${p1} and ${p2} clash — significant tension requiring attention` },
    void: { zh: `${p1}与${p2}缘分较弱，互相助力有限`, en: `${p1} and ${p2} have weak connection — limited mutual support` },
  };

  return {
    palace1: p1,
    palace2: p2,
    compatibility,
    score: compat,
    description: descriptions[compatibility].en,
    descriptionZh: descriptions[compatibility].zh,
  };
}

function computeStarCompatibility(star1: string, star2: string): StarCompatibility {
  const interaction = STAR_INTERACTIONS[star1]?.[star2] ?? STAR_INTERACTIONS[star2]?.[star1];

  if (interaction) {
    return {
      star1, star2,
      relationship: interaction.type,
      score: interaction.score,
      description: interaction.en,
      descriptionZh: interaction.zh,
    };
  }

  return {
    star1, star2,
    relationship: 'neutral',
    score: 0,
    description: 'No specific interaction pattern between these stars.',
    descriptionZh: '两星曜之间无特定互动关系',
  };
}

function computeSiHuaCrossEffect(
  star: string,
  person1Hua: SiHuaCrossEffect['person1Hua'],
  person2Hua: SiHuaCrossEffect['person2Hua']
): SiHuaCrossEffect | null {
  if (!person1Hua || !person2Hua) return null;

  const key = `${person1Hua}_${person2Hua}`;
  const reverseKey = `${person2Hua}_${person1Hua}`;

  const effect = SIHUA_INTERACTIONS[key] ?? SIHUA_INTERACTIONS[reverseKey];
  if (!effect) return null;

  return {
    star,
    person1Hua,
    person2Hua,
    effect: effect.en,
    effectZh: effect.zh,
    score: effect.score,
  };
}

// ─── Extract synastry input from ZiweiChart ───────────────────────────────────

export function extractZiweiSynastryInput(chart: ZiweiChart): ZiweiSynastryInput {
  const mainStars: string[] = [];
  const assistantStars: string[] = [];
  const transformStars: string[] = [];

  if (chart.raw && typeof chart.raw === 'object') {
    const raw = chart.raw as unknown as Record<string, unknown>;
    // Extract stars from palaces
    if (Array.isArray(raw.palaces)) {
      for (const palace of raw.palaces as Array<{ mainStars?: string[]; minorStars?: string[]; transformStars?: string[] }>) {
        if (palace.mainStars) mainStars.push(...palace.mainStars);
        if (palace.minorStars) assistantStars.push(...palace.minorStars);
        if (palace.transformStars) transformStars.push(...palace.transformStars);
      }
    }
  }

  return {
    lifePalaceName: chart.lifePalaceName,
    bodyPalaceName: chart.bodyPalaceName,
    fiveElementsClass: chart.fiveElementsClass,
    soul: chart.soul,
    body: chart.body,
    gender: chart.gender,
    mainStars,
    assistantStars,
    transformStars,
    palaces: extractPalaces(chart),
  };
}

function extractPalaces(chart: ZiweiChart): ZiweiPalaceInput[] {
  const raw = chart.raw as unknown as Record<string, unknown>;
  if (!Array.isArray(raw.palaces)) return [];

  return (raw.palaces as Array<{ name?: string; mainStars?: string[] }>).map(p => ({
    name: p.name ?? '',
    starNames: p.mainStars ?? [],
  }));
}

// ─── Main synastry computation ───────────────────────────────────────────────

export function computeZiweiSynastry(
  chart1: ZiweiSynastryInput,
  chart2: ZiweiSynastryInput
): ZiweiSynastryResult {
  // 1. Palace overlays — life palace vs life palace, etc.
  const lifePalaceMatch = chart1.lifePalaceName === chart2.lifePalaceName;
  const palaceOverlays = computePalaceOverlays(chart1, chart2);

  // 2. Star compatibilities
  const starCompatibilities = computeStarCompatibilities(chart1, chart2);

  // 3. SiHua cross effects
  const siHuaEffects = computeSiHuaCrossEffects(chart1, chart2);

  // 4. Score computation
  const palaceScore = palaceOverlays.reduce((s, p) => s + p.score, 0);
  const starScore = starCompatibilities.reduce((s, c) => s + c.score, 0);
  const siHuaScore = siHuaEffects.reduce((s, e) => s + e.score, 0);

  // Normalize to 0-100
  const palaceNorm = Math.round(((palaceScore + 60) / 120) * 100);
  const starNorm = Math.round(((starScore + 40) / 80) * 100);
  const siHuaNorm = Math.round(((siHuaScore + 40) / 80) * 100);

  const rawOverall = palaceNorm * 0.4 + starNorm * 0.4 + siHuaNorm * 0.2;
  const overallScore = Math.max(0, Math.min(100, Math.round(rawOverall)));

  let compatibilityLevel: ZiweiSynastryResult['compatibilityLevel'] = 'challenging';
  if (overallScore >= 75) compatibilityLevel = 'excellent';
  else if (overallScore >= 60) compatibilityLevel = 'good';
  else if (overallScore >= 40) compatibilityLevel = 'fair';

  const soulCompatScore = lifePalaceMatch ? 8 : Math.round(Math.random() * 4 + 2);
  const bodyCompatScore = chart1.bodyPalaceName === chart2.bodyPalaceName ? 7 : Math.round(Math.random() * 3 + 1);

  // 5. Summary
  const { summary, summaryZh, advice, adviceZh } = generateSummary(
    overallScore, compatibilityLevel, lifePalaceMatch, palaceOverlays, starCompatibilities, siHuaEffects
  );

  // 6. Coherence gate
  const coherenceWarnings: string[] = [];
  if (siHuaEffects.some(e => e.score <= -7)) {
    coherenceWarnings.push('四化冲突严重，双忌或禄忌冲，财务和感情双重危机');
  }
  if (starCompatibilities.filter(c => c.score <= -5).length >= 2) {
    coherenceWarnings.push('多个星曜呈凶配，关系中冲突模式明显');
  }

  return {
    person1: chart1,
    person2: chart2,
    overallScore,
    compatibilityLevel,
    palaceOverlays,
    starCompatibilities,
    siHuaEffects,
    lifePalaceMatch,
    soulCompatScore,
    bodyCompatScore,
    summary,
    summaryZh,
    advice,
    adviceZh,
    coherencePass: coherenceWarnings.length === 0,
    coherenceWarnings,
  };
}

function computePalaceOverlays(c1: ZiweiSynastryInput, c2: ZiweiSynastryInput): PalaceOverlay[] {
  const overlays: PalaceOverlay[] = [];

  // Map life palace of person1 to all palaces of person2
  overlays.push(computePalaceOverlay(c1.lifePalaceName, c2.lifePalaceName));

  // Key palaces comparison
  const keyPalaces: Array<keyof typeof PALACE_COMPATIBILITY> = ['命宫', '夫妻宫', '官禄宫', '财帛宫', '福德宫', '迁移宫'];
  for (const palace of keyPalaces) {
    const p1Palace = c1.palaces.find(p => p.name === palace);
    const p2Palace = c2.palaces.find(p => p.name === palace);
    if (p1Palace && p2Palace) {
      overlays.push(computePalaceOverlay(p1Palace.name, p2Palace.name));
    }
  }

  return overlays;
}

function computeStarCompatibilities(c1: ZiweiSynastryInput, c2: ZiweiSynastryInput): StarCompatibility[] {
  const compatibilities: StarCompatibility[] = [];
  const checked = new Set<string>();

  const majorStars = ['紫微', '天府', '天机', '太阳', '武曲', '天同', '廉贞', '贪狼', '太阴', '巨门', '天相', '天梁', '七杀', '破军'];

  for (const star of majorStars) {
    const starIn1 = c1.mainStars.includes(star);
    const starIn2 = c2.mainStars.includes(star);

    if (starIn1 && starIn2) {
      const key = [star, star].sort().join('_');
      if (!checked.has(key)) {
        checked.add(key);
        compatibilities.push(computeStarCompatibility(star, star));
      }
    }
  }

  // Also check cross-chart star interactions
  for (const star1 of c1.mainStars.slice(0, 7)) {
    for (const star2 of c2.mainStars.slice(0, 7)) {
      const key = [star1, star2].sort().join('_');
      if (!checked.has(key) && star1 !== star2) {
        checked.add(key);
        const comp = computeStarCompatibility(star1, star2);
        if (comp.score !== 0) {
          compatibilities.push(comp);
        }
      }
    }
  }

  return compatibilities;
}

function computeSiHuaCrossEffects(c1: ZiweiSynastryInput, c2: ZiweiSynastryInput): SiHuaCrossEffect[] {
  const effects: SiHuaCrossEffect[] = [];
  const raw1 = c1.transformStars;
  const raw2 = c2.transformStars;

  // Common transform stars: 禄, 权, 科, 忌
  const huaTypes: Array<SiHuaCrossEffect['person1Hua']> = ['lu', 'quan', 'ke', '忌'];

  for (const huaType of huaTypes) {
    const p1Has = raw1.some(s => s.includes(huaType === '忌' ? '忌' : huaType === 'lu' ? '禄' : huaType === 'quan' ? '权' : '科'));
    const p2Has = raw2.some(s => s.includes(huaType === '忌' ? '忌' : huaType === 'lu' ? '禄' : huaType === 'quan' ? '权' : '科'));

    if (p1Has && p2Has) {
      const effect = computeSiHuaCrossEffect('通用', huaType, huaType);
      if (effect) effects.push(effect);
    }
  }

  return effects;
}

function generateSummary(
  overallScore: number,
  level: ZiweiSynastryResult['compatibilityLevel'],
  lifePalaceMatch: boolean,
  palaceOverlays: PalaceOverlay[],
  starCompatibilities: StarCompatibility[],
  siHuaEffects: SiHuaCrossEffect[]
): Pick<ZiweiSynastryResult, 'summary' | 'summaryZh' | 'advice' | 'adviceZh'> {
  const levelZh: Record<string, string> = {
    excellent: '姻缘极配，紫微斗数合盘大吉',
    good: '缘分上佳，星曜互动良好',
    fair: '缘分一般，需用心经营',
    challenging: '挑战较大，谨慎对待',
  };

  const levelEn: Record<string, string> = {
    excellent: 'Excellent Ziwei compatibility — harmonious pairing',
    good: 'Good compatibility — positive star interactions',
    fair: 'Fair compatibility — needs conscious effort',
    challenging: 'Challenging — approach with caution',
  };

  const lpMatchZh = lifePalaceMatch ? '命宫相同，命运共振强' : '命宫不同，命运轨迹各有侧重';
  const lpMatchEn = lifePalaceMatch ? 'Matching Life Palaces — strong fate resonance' : 'Different Life Palaces — distinct life directions';

  const harmoniousCount = palaceOverlays.filter(p => p.compatibility === 'harmonious').length;
  const challengingCount = palaceOverlays.filter(p => p.compatibility === 'challenging').length;

  const zh = `${lpMatchZh}。${harmoniousCount}组吉配，${challengingCount}组凶配。星曜互动${starCompatibilities.filter(s => s.score > 0).length}吉${starCompatibilities.filter(s => s.score < 0).length}凶。四化效应${siHuaEffects.length}个。综合评分${overallScore}分，${levelZh[level]}。`;

  const en = `${lpMatchEn}. ${harmoniousCount} harmonious palace overlays, ${challengingCount} challenging. Star interactions: ${starCompatibilities.filter(s => s.score > 0).length} positive, ${starCompatibilities.filter(s => s.score < 0).length} negative. SiHua effects: ${siHuaEffects.length}. Score: ${overallScore}/100. ${levelEn[level]}.`;

  const adviceZh = level === 'excellent'
    ? '珍惜星曜吉配缘分，在命宫共振下携手共进。婚娶合作大吉。'
    : level === 'good'
    ? '缘分不错，多发挥星曜互补优势。注意四化星带来的波动，在不利流年谨慎决策。'
    : level === 'fair'
    ? '关系需要双方包容理解。善用吉曜力量，在冲突时多沟通。五行调和可助关系改善。'
    : '挑战较大，不建议仓促确定关系。如已在一起，需特别注意流年变化和四化星曜的影响。';

  const advice = level === 'excellent'
    ? 'Treasure this harmonious Ziwei connection. Marry or partner — excellent timing for commitment.'
    : level === 'good'
    ? 'A solid pairing — leverage the complementary star strengths and be cautious during unfavorable SiHua transits.'
    : level === 'fair'
    ? 'The relationship needs conscious effort. Use favorable star interactions and communicate during conflicts.'
    : 'Significant challenges — avoid rushing commitment. If partnered, pay close attention to annual SiHua transits.';

  return { summary: en, summaryZh: zh, advice, adviceZh };
}
