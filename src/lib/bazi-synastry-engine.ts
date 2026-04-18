/**
 * BaZi Synastry Engine — TianJi Global 天机全球
 *
 * Computes compatibility between two BaZi (Four Pillars) charts.
 * System: BaZi only — does NOT mix with Ziwei, Western astrology, or Qizheng.
 *
 * Compatibility dimensions:
 * - Day Master (日主) interaction
 * - Heavenly Stems (天干) — 5 He 合
 * - Earthly Branches (地支) — 6 He, 3 He, 6 Chong, 3 Xing, 6 Hai
 * - Five Elements (五行) synthesis
 * - Ten Gods (十神) archetypes
 */

import type { BaZiChart } from './bazi';

// ─── Shared BaZi types from bazi.js ─────────────────────────────────────────

export interface BaZiSynastryInput {
  year: { heavenlyStem: string; earthlyBranch: string; element: string };
  month: { heavenlyStem: string; earthlyBranch: string; element: string };
  day: { heavenlyStem: string; earthlyBranch: string; element: string };
  hour: { heavenlyStem: string; earthlyBranch: string; element: string };
  dayMasterElement: string;
  gender?: string;
}

// ─── Output types ─────────────────────────────────────────────────────────────

export interface SynastryRelationship {
  type: 'he' | 'chong' | 'xing' | 'hai' | 'sheng' | 'ke' | 'none';
  score: number;       // positive = harmonious, negative = challenging
  description: string;
  descriptionZh: string;
}

export interface StemCompatibility {
  stem1: string;
  stem2: string;
  heMatch: boolean;
  score: number;       // -10 to +10
  description: string;
  descriptionZh: string;
}

export interface BranchCompatibility {
  branch1: string;
  branch2: string;
  relationships: SynastryRelationship[];
  heScore: number;     // 六合
  sanheScore: number;   // 三合
  chongScore: number;  // 六冲
  xingScore: number;   // 三刑
  haiScore: number;    // 六害
  netScore: number;
  description: string;
  descriptionZh: string;
}

export interface DayMasterCompatibility {
  element1: string;    // 日主五行
  element2: string;
  score: number;       // -20 to +20
  relation: 'same' | 'sheng' | 'ke' | '被我生' | '生我' | '被我克' | '克我';
  description: string;
  descriptionZh: string;
}

export interface TenGodArchetype {
  archetype: string;
  archetypeZh: string;
  score: number;
  description: string;
  descriptionZh: string;
}

export interface PillarPair {
  pillar: 'year' | 'month' | 'day' | 'hour';
  stem: StemCompatibility;
  branch: BranchCompatibility;
  pillarScore: number;
}

export interface BaZiSynastryResult {
  person1: BaZiSynastryInput;
  person2: BaZiSynastryInput;
  overallScore: number;           // 0-100
  compatibilityLevel: 'excellent' | 'good' | 'fair' | 'challenging';

  dayMaster: DayMasterCompatibility;
  tenGodArchetypes: TenGodArchetype[];
  pillarPairs: PillarPair[];

  stemHeCount: number;
  branchHeCount: number;
  branchChongCount: number;
  branchSanheCount: number;
  branchXingCount: number;
  branchHaiCount: number;

  summary: string;
  summaryZh: string;
  advice: string;
  adviceZh: string;

  // Cultural coherence gate — must pass before sending to AI narrative
  coherencePass: boolean;
  coherenceWarnings: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

// 天干相合 (Tian Gan Xiang He) — 5 pairs
const TIANGAN_HE: Record<string, string> = {
  '甲': '己', '己': '甲',
  '乙': '庚', '庚': '乙',
  '丙': '辛', '辛': '丙',
  '丁': '壬', '壬': '丁',
  '戊': '癸', '癸': '戊',
};

// 天干相克
const TIANGAN_XIANGKE: Record<string, Record<string, number>> = {
  '甲': { '庚': -8, '辛': -5, '戊': 3, '己': 2, '丁': 4, '丙': 5, '壬': -3, '癸': -2 },
  '乙': { '庚': 5, '辛': -8, '己': 4, '戊': 2, '丁': -5, '丙': -3, '壬': 4, '癸': 3 },
  '丙': { '庚': -3, '辛': -8, '己': -5, '戊': -2, '丁': 3, '甲': 5, '壬': -2, '癸': -3 },
  '丁': { '庚': 4, '辛': 5, '己': -2, '戊': -3, '丙': 3, '甲': 4, '壬': -8, '癸': -5 },
  '戊': { '庚': 5, '辛': 3, '己': -2, '戊': 0, '丁': -3, '甲': 3, '壬': -5, '癸': -8 },
  '己': { '庚': 3, '辛': 5, '己': 0, '戊': -2, '丁': -4, '甲': 2, '壬': -3, '癸': -5 },
  '庚': { '庚': 0, '辛': 3, '己': 3, '戊': 5, '丁': -4, '甲': -8, '壬': -3, '癸': -5 },
  '辛': { '庚': 3, '辛': 0, '己': 5, '戊': 3, '丁': -5, '甲': -5, '壬': -4, '癸': -3 },
  '壬': { '庚': -3, '辛': -4, '己': -3, '戊': -5, '丁': -8, '甲': -3, '壬': 0, '癸': 5 },
  '癸': { '庚': -5, '辛': -3, '己': -5, '戊': -8, '丁': -5, '甲': -2, '壬': 5, '癸': 0 },
};

// 地支相合 (Di Zhi Liu He)
const DIZHI_LIUHE: Record<string, string> = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午',
};

// 地支三合 (Di Zhi San He) — groups of 3
const DIZHI_SANHE: Record<string, string[]> = {
  '申': ['子', '辰'], '子': ['申', '辰'], '辰': ['申', '子'],
  '亥': ['卯', '未'], '卯': ['亥', '未'], '未': ['亥', '卯'],
  '寅': ['午', '戌'], '午': ['寅', '戌'], '戌': ['寅', '午'],
  '巳': ['酉', '丑'], '酉': ['巳', '丑'], '丑': ['巳', '酉'],
};

// 地支六冲 (Di Zhi Liu Chong)
const DIZHI_LIUCHONG: Record<string, string> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
};

// 地支三刑 (Di Zhi San Xing)
const DIZHI_SANXING: Record<string, string[]> = {
  '子': ['卯'], '卯': ['子'],
  '寅': ['巳', '申'], '巳': ['寅', '申'], '申': ['寅', '巳'],
  '丑': ['戌', '未'], '戌': ['丑', '未'], '未': ['丑', '戌'],
  '辰': ['午', '酉', '亥'], '午': ['辰', '酉'], '酉': ['辰', '午'], '亥': ['辰'],
};

// 地支六害 (Di Zhi Liu Hai)
const DIZHI_LIUHAI: Record<string, string> = {
  '子': ['未'], '未': ['子'],
  '丑': ['午'], '午': ['丑'],
  '寅': ['巳'], '巳': ['寅'],
  '卯': ['辰'], '辰': ['卯'],
  '申': ['亥'], '亥': ['申'],
  '酉': ['戌'], '戌': ['酉'],
};

// 地支五行
const BRANCH_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 天干五行
const STEM_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 日主五行关系
const WUXING_RELATION: Record<string, Record<string, string>> = {
  '木': { '木': 'same', '火': 'sheng', '土': 'ke', '金': '被我克', '水': '生我' },
  '火': { '木': 'ke', '火': 'same', '土': 'sheng', '金': '被我克', '水': '生我' },
  '土': { '木': 'sheng', '火': 'ke', '土': 'same', '金': 'sheng', '水': 'ke' },
  '金': { '木': '生我', '火': '生我', '土': 'ke', '金': 'same', '水': 'sheng' },
  '水': { '木': 'sheng', '火': 'ke', '土': '被我克', '金': 'ke', '水': 'same' },
};

// 五行相生分数
const WUXING_SHENG: Record<string, Record<string, number>> = {
  '木': { '火': 8, '水': 5, '土': -3, '金': -5 },
  '火': { '土': 8, '木': 5, '金': -3, '水': -5 },
  '土': { '金': 8, '火': 5, '水': -3, '木': -5 },
  '金': { '水': 8, '土': 5, '木': -3, '火': -5 },
  '水': { '木': 8, '金': 5, '火': -3, '土': -5 },
};

// 十神关系定义（同性相克更激烈）
const TEN_GODS: Record<string, Record<string, string>> = {
  // 日干为甲
  '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
  '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
  '丙': { '甲': '正印', '乙': '偏印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
  '丁': { '甲': '偏印', '乙': '正印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
  '戊': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '正财', '癸': '偏财' },
  '己': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '偏财', '癸': '正财' },
  '庚': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
  '辛': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
  '壬': { '甲': '食神', '乙': '伤官', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '比肩', '癸': '劫财' },
  '癸': { '甲': '伤官', '乙': '食神', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '劫财', '癸': '比肩' },
};

// 十神吉凶分数
const TEN_GOD_SCORE: Record<string, number> = {
  '正印': 8, '偏印': -3,
  '正官': 9, '七杀': -6,
  '正财': 8, '偏财': 4,
  '食神': 7, '伤官': -5,
  '比肩': 2, '劫财': -7,
};

// 十神互动描述
const TEN_GOD_DESCRIPTIONS: Record<string, { zh: string; en: string }> = {
  '正印': { zh: '正印代表学业、贵人、母亲缘分。正印相生者，智慧开明，机遇不断。', en: 'Zheng Yin (Direct Print) represents wisdom, mentors, and maternal bonds. Positive interaction brings clarity and opportunity.' },
  '偏印': { zh: '偏印（枭神）代表独立思考、非正统技艺。过于旺则阴沉孤僻。', en: 'Pian Yin (Oblique Print) represents unconventional thinking and skills. Excess can lead to isolation.' },
  '正官': { zh: '正官代表名誉、地位、领导力。正官相生者，仕途顺遂，名声清正。', en: 'Zheng Guan (Direct Officer) represents honor, status, and leadership. Favorable for career and reputation.' },
  '七杀': { zh: '七杀代表挑战、压力、竞争。七杀旺者敢于冒险，但易有冲突。', en: 'Qi Sha (Seven Killings) represents challenges and pressure. Can drive ambition but creates tension.' },
  '正财': { zh: '正财代表正当收入、理财能力、男命妻星。正财相合者，财运稳定。', en: 'Zheng Cai (Direct Wealth) represents earned income and financial management. Stable wealth indicator.' },
  '偏财': { zh: '偏财代表投资、意外之财、社交能力。偏财旺者善于交际，财运波动大。', en: 'Pian Cai (Oblique Wealth) represents investment and social luck. Brings opportunity but with volatility.' },
  '食神': { zh: '食神代表才华、创意、享受。食神生财者，创意变现能力强。', en: 'Shi Shen (Food God) represents talent, creativity, and enjoyment. Creative and expressive energy.' },
  '伤官': { zh: '伤官代表创新、口才、反叛。伤官配印则才华横溢，伤官无制则叛逆乖张。', en: 'Shang Guan (Hurting Officer) represents innovation and rebellion. Brilliant when balanced, disruptive otherwise.' },
  '比肩': { zh: '比肩代表兄弟姐妹、同事、合作伙伴。比肩相助者，人际中多同行者。', en: 'Bi Jian (Equal Shoulder) represents peers and partners. Indicates solidarity but also rivalry.' },
  '劫财': { zh: '劫财代表竞争、破财、口舌。劫财旺者需防财务纠纷和感情争夺。', en: 'Jie Cai (Robbery Wealth) represents competition and financial risk. Warns of rivalry in money and relationships.' },
};

// ─── Core calculation functions ───────────────────────────────────────────────

/**
 * Compute compatibility between two Heavenly Stems (天干)
 */
function computeStemCompatibility(stem1: string, stem2: string): StemCompatibility {
  const heMatch = TIANGAN_HE[stem1] === stem2;
  const score = heMatch ? 10 : (TIANGAN_XIANGKE[stem1]?.[stem2] ?? 0);

  const heDescriptions: Record<string, { zh: string; en: string }> = {
    '甲己': { zh: '甲己相合，土运主导，中正平和，信用为先', en: 'Jiayi combine — earthy energy, stability and trust' },
    '乙庚': { zh: '乙庚相合，金运主导，义气深重，刚柔并济', en: 'Yigeng combine — metallic energy, loyalty and balance' },
    '丙辛': { zh: '丙辛相合，火金相融，锐意进取，果断决断', en: 'Bingxin combine — fire and metal fusion, ambition and decisiveness' },
    '丁壬': { zh: '丁壬相合，水火既济，智谋深远，情感丰富', en: 'Dingren combine — water-fire harmony, intellectual and emotional depth' },
    '戊癸': { zh: '戊癸相合，火土相生，务实诚信，稳重可靠', en: 'Wugui combine — earthy stability, practical and reliable' },
  };

  const match = heDescriptions[`${stem1}${stem2}`] ?? heDescriptions[`${stem2}${stem1}`];

  if (heMatch && match) {
    return {
      stem1, stem2, heMatch: true, score,
      description: match.en,
      descriptionZh: match.zh,
    };
  }

  const xiangkeDescriptions: Record<string, string> = {
    '甲庚': '甲木庚金相克，同事竞争，关系紧张',
    '辛丙': '辛金丙火相克，意见不合，易生摩擦',
    '乙辛': '乙木辛金相克，方向不同，理念差异',
    '壬丁': '壬水丁火相冲，情感拉扯，内心矛盾',
    '戊癸': '戊土癸水相克，缺乏信任，相处困难',
  };

  const desc = xiangkeDescriptions[`${stem1}${stem2}`] ?? xiangkeDescriptions[`${stem2}${stem1}`] ??
    (score > 5 ? '天干相生相助，关系和谐互助' : score > 0 ? '天干略有助力，相处尚可' : score < -5 ? '天干相克严重，冲突明显' : '天干相克，相处需磨合');

  return {
    stem1, stem2, heMatch, score,
    description: desc,
    descriptionZh: desc,
  };
}

/**
 * Compute all relationships between two Earthly Branches (地支)
 */
function computeBranchRelationships(branch1: string, branch2: string): SynastryRelationship[] {
  const relationships: SynastryRelationship[] = [];

  // 六合
  if (DIZHI_LIUHE[branch1] === branch2) {
    relationships.push({
      type: 'he', score: 8,
      description: '地支六合，缘分深厚，互相吸引',
      descriptionZh: '地支六合，缘分深厚，互相吸引',
    });
  }

  // 三合
  const sanhe1 = DIZHI_SANHE[branch1] ?? [];
  if (sanhe1.includes(branch2)) {
    relationships.push({
      type: 'sanhe', score: 6,
      description: '地支三合，志同道合，共同进退',
      descriptionZh: '地支三合，志同道合，共同进退',
    });
  }

  // 六冲
  if (DIZHI_LIUCHONG[branch1] === branch2) {
    relationships.push({
      type: 'chong', score: -8,
      description: '地支六冲，理念冲突，变动频繁',
      descriptionZh: '地支六冲，理念冲突，变动频繁',
    });
  }

  // 三刑
  const sanxing1 = DIZHI_SANXING[branch1] ?? [];
  if (sanxing1.includes(branch2)) {
    relationships.push({
      type: 'xing', score: -6,
      description: '地支三刑，互相伤害，矛盾激化',
      descriptionZh: '地支三刑，互相伤害，矛盾激化',
    });
  }

  // 六害
  if (DIZHI_LIUHAI[branch1] === branch2) {
    relationships.push({
      type: 'hai', score: -4,
      description: '地支六害，暗中相害，缘分有损',
      descriptionZh: '地支六害，暗中相害，缘分有损',
    });
  }

  return relationships;
}

/**
 * Compute full branch compatibility between two branches
 */
function computeBranchCompatibility(branch1: string, branch2: string): BranchCompatibility {
  const relationships = computeBranchRelationships(branch1, branch2);

  const heScore = relationships.filter(r => r.type === 'he').reduce((s, r) => s + r.score, 0);
  const sanheScore = relationships.filter(r => r.type === 'sanhe').reduce((s, r) => s + r.score, 0);
  const chongScore = relationships.filter(r => r.type === 'chong').reduce((s, r) => s + r.score, 0);
  const xingScore = relationships.filter(r => r.type === 'xing').reduce((s, r) => s + r.score, 0);
  const haiScore = relationships.filter(r => r.type === 'hai').reduce((s, r) => s + r.score, 0);
  const netScore = heScore + sanheScore + chongScore + xingScore + haiScore;

  let description = '';
  let descriptionZh = '';

  if (netScore >= 12) {
    description = 'Branch compatibility is excellent — strong He and Sanhe connections.';
    descriptionZh = '地支关系极好，六合三合旺盛，缘分深厚';
  } else if (netScore >= 5) {
    description = 'Branch compatibility is good — positive connections outweigh negatives.';
    descriptionZh = '地支关系良好，正面互动为主';
  } else if (netScore >= -5) {
    description = 'Branch compatibility is neutral — balanced with some challenges.';
    descriptionZh = '地支关系一般，利弊参半';
  } else {
    description = 'Branch compatibility is challenging — multiple negative interactions present.';
    descriptionZh = '地支关系挑战较多，需要双方包容';
  }

  return {
    branch1, branch2, relationships,
    heScore, sanheScore, chongScore, xingScore, haiScore,
    netScore,
    description,
    descriptionZh,
  };
}

/**
 * Compute Day Master (日主) compatibility
 */
function computeDayMasterCompatibility(
  chart1: BaZiSynastryInput,
  chart2: BaZiSynastryInput
): DayMasterCompatibility {
  const el1 = chart1.dayMasterElement;
  const el2 = chart2.dayMasterElement;
  const relation = WUXING_RELATION[el1]?.[el2] ?? 'none';
  const relationReverse = WUXING_RELATION[el2]?.[el1] ?? 'none';

  let score = 0;
  if (relation === 'same') score = 4;
  else if (relation === 'sheng') score = 6;
  else if (relation === '生我') score = 5;
  else if (relation === 'ke') score = -4;
  else if (relation === '被我克') score = 3;
  else if (relation === '被我生') score = -3;

  const descriptions: Record<string, { zh: string; en: string }> = {
    'same': { zh: `两人日主皆为${el1}，性格相近，沟通顺畅，但竞争意识强`, en: `Both Day Masters are ${el1} — similar nature, smooth communication, strong peer rivalry` },
    'sheng': { zh: `${el1}生日主${el2}，一方付出多，另一方接受支持`, en: `${el1} generates ${el2} — one gives, the other receives support` },
    '克我': { zh: `${el2}克日主${el1}，需防对方压力和控制`, en: `${el2} controls ${el1} — potential pressure and control from partner` },
    '被我克': { zh: `${el1}克日主${el2}，一方控制欲强，另一方受压`, en: `${el1} controls ${el2} — one dominant, the other pressured` },
    '被我生': { zh: `${el1}生日主${el2}，一方付出多，另一方接受支持`, en: `${el1} generates ${el2} — one gives, the other receives support` },
  };

  const desc = descriptions[relation] ?? { zh: `${el1}与${el2}关系复杂，需具体分析`, en: `${el1} and ${el2} have a complex relationship requiring detailed analysis` };

  return { element1: el1, element2: el2, score, relation, ...desc };
}

/**
 * Compute Ten Gods archetypes for the relationship
 * Based on the day stems of each person
 */
function computeTenGodArchetypes(chart1: BaZiSynastryInput, chart2: BaZiSynastryInput): TenGodArchetype[] {
  const archetypes: TenGodArchetype[] = [];
  const dayStem1 = chart1.day.heavenlyStem;
  const dayStem2 = chart2.day.heavenlyStem;

  const tenGod = TEN_GODS[dayStem1]?.[dayStem2] ?? TEN_GODS[dayStem2]?.[dayStem1] ?? '比肩';
  const score = TEN_GOD_SCORE[tenGod] ?? 0;
  const desc = TEN_GOD_DESCRIPTIONS[tenGod] ?? { zh: '关系以比肩为主，平等互助', en: 'Relationship primarily as equals — mutual support and solidarity' };

  archetypes.push({
    archetype: tenGod,
    archetypeZh: tenGod,
    score,
    ...desc,
  });

  return archetypes;
}

/**
 * Compute pillar-by-pillar compatibility
 */
function computePillarPairs(chart1: BaZiSynastryInput, chart2: BaZiSynastryInput): PillarPair[] {
  const pillars: Array<'year' | 'month' | 'day' | 'hour'> = ['year', 'month', 'day', 'hour'];
  const pairs: PillarPair[] = [];

  for (const pillar of pillars) {
    const s1 = chart1[pillar].heavenlyStem;
    const s2 = chart2[pillar].heavenlyStem;
    const b1 = chart1[pillar].earthlyBranch;
    const b2 = chart2[pillar].earthlyBranch;

    const stem = computeStemCompatibility(s1, s2);
    const branch = computeBranchCompatibility(b1, b2);

    // Weights: day pillar most important, then month, then year, then hour
    const weights: Record<string, number> = { day: 0.4, month: 0.3, year: 0.2, hour: 0.1 };
    const pillarScore = stem.score * weights[pillar] * 2 + branch.netScore * weights[pillar];

    pairs.push({ pillar, stem, branch, pillarScore });
  }

  return pairs;
}

/**
 * Compute overall synastry score from all dimensions
 */
function computeOverallScore(
  dayMaster: DayMasterCompatibility,
  pillarPairs: PillarPair[],
  archetypes: TenGodArchetype[]
): { overallScore: number; level: BaZiSynastryResult['compatibilityLevel'] } {
  // Weighted average: day master (30%), pillar pairs (50%), ten god (20%)
  const dmWeight = 0.3;
  const pillarWeight = 0.5;
  const tgWeight = 0.2;

  const dmScore = dayMaster.score; // -20 to +20 → normalize to 0-100
  const dmNorm = ((dmScore + 20) / 40) * 100;

  const pillarAvg = pillarPairs.reduce((s, p) => s + p.pillarScore, 0) / pillarPairs.length; // roughly -10 to +10
  const pillarNorm = ((pillarAvg + 10) / 20) * 100;

  const tgAvg = archetypes.reduce((s, a) => s + a.score, 0) / archetypes.length; // roughly -10 to +10
  const tgNorm = ((tgAvg + 10) / 20) * 100;

  const overallScore = Math.round(dmNorm * dmWeight + pillarNorm * pillarWeight + tgNorm * tgWeight);
  const clamped = Math.max(0, Math.min(100, overallScore));

  let level: BaZiSynastryResult['compatibilityLevel'] = 'challenging';
  if (clamped >= 75) level = 'excellent';
  else if (clamped >= 60) level = 'good';
  else if (clamped >= 40) level = 'fair';

  return { overallScore: clamped, level };
}

/**
 * Generate summary text
 */
function generateSummary(
  result: Pick<BaZiSynastryResult, 'overallScore' | 'compatibilityLevel' | 'stemHeCount' | 'branchHeCount' | 'branchChongCount' | 'branchSanheCount' | 'pillarPairs' | 'dayMaster'>,
  language: 'zh' | 'en'
): { summary: string; summaryZh: string; advice: string; adviceZh: string } {
  const { overallScore, compatibilityLevel, stemHeCount, branchHeCount, branchChongCount, branchSanheCount, pillarPairs, dayMaster } = result;

  const dayMasterZh: Record<string, string> = {
    'same': '两人日主五行相同，性格相近',
    'sheng': '日主相生关系，一方付出更多',
    'ke': '日主相克关系，存在权力张力',
    '生我': '日主被生日主，得贵人相助',
    '克我': '日主被克日主，需防外界压力',
  };

  const levelZh: Record<string, string> = {
    excellent: '姻缘极配，天作之合',
    good: '缘分上佳，相处融洽',
    fair: '缘分一般，需要经营',
    challenging: '挑战较大，谨慎对待',
  };

  const levelEn: Record<string, string> = {
    excellent: 'Excellent match — destined compatibility',
    good: 'Good match — harmonious relationship',
    fair: 'Fair compatibility — requires effort',
    challenging: 'Challenging — proceed with caution',
  };

  const stemHeZh = stemHeCount >= 2 ? `天干${stemHeCount}合相合，命运纽带强` : stemHeCount === 1 ? '天干有1合相合' : '天干无合相';
  const branchHeZh = branchHeCount >= 2 ? `地支${branchHeCount}组六合/三合，缘分深厚` : branchHeCount === 1 ? '地支有1组合相' : '地支合相较少';
  const chongZh = branchChongCount >= 2 ? `但地支${branchChongCount}组冲克，关系波动` : branchChongCount === 1 ? '有1组地支冲克' : '无明显冲克';

  const summaryZh = `${dayMasterZh[dayMaster.relation] || '日主关系复杂'}。${stemHeZh}，${branchHeZh}${chongZh}。综合评分${overallScore}分，${levelZh[compatibilityLevel]}。`;

  const stemHeEn = stemHeCount >= 2 ? `${stemHeCount} stem combinations` : stemHeCount === 1 ? '1 stem combination' : 'no stem He matches';
  const branchHeEn = branchSanheCount >= 2 ? `${branchSanheCount} Sanhe groups` : branchSanheCount === 1 ? '1 Sanhe group' : 'few Sanhe connections';

  const summary = `Day Master ${dayMaster.relation}: ${dayMaster.descriptionZh}. ${stemHeEn} found. ${branchHeEn}. Overall score: ${overallScore}/100. ${levelEn[compatibilityLevel]}.`;

  const adviceZh = compatibilityLevel === 'excellent'
    ? '珍惜这份缘分，携手共进，互相成就。流年吉利时婚娶或合作更佳。'
    : compatibilityLevel === 'good'
    ? '缘分不错，日常相处中多沟通理解。五行互补处多加欣赏，冲突处耐心磨合。'
    : compatibilityLevel === 'fair'
    ? '关系需要用心经营。多关注对方的五行需求，在重要决策前多商量。适当听取专业命理建议。'
    : '挑战较多，不建议仓促确定关系。如已在一起，需注意流年变化，在不利年份格外小心。';

  const advice = compatibilityLevel === 'excellent'
    ? 'Treasure this connection. Marry or partner during favorable transit years for best outcomes.'
    : compatibilityLevel === 'good'
    ? 'A solid connection — focus on communication and appreciating each other\'s strengths.'
    : compatibilityLevel === 'fair'
    ? 'The relationship needs conscious effort. Consult a BaZi expert for major decisions.'
    : 'Significant challenges — avoid rushing into commitment. If already partnered, be extra cautious during unfavorable transits.';

  return { summary, summaryZh, advice, adviceZh };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface ComputeBaZiSynastryOptions {
  language?: 'zh' | 'en';
}

export function computeBaZiSynastry(
  chart1: BaZiSynastryInput,
  chart2: BaZiSynastryInput,
  _options?: ComputeBaZiSynastryOptions
): BaZiSynastryResult {
  // 1. Day master compatibility
  const dayMaster = computeDayMasterCompatibility(chart1, chart2);

  // 2. Ten god archetypes
  const tenGodArchetypes = computeTenGodArchetypes(chart1, chart2);

  // 3. Pillar pairs
  const pillarPairs = computePillarPairs(chart1, chart2);

  // 4. Count relationships
  const stemHeCount = pillarPairs.filter(p => p.stem.heMatch).length;
  const branchHeCount =
    pillarPairs.filter(p => p.branch.heScore > 0).length +
    pillarPairs.filter(p => p.branch.sanheScore > 0).length;
  const branchChongCount = pillarPairs.filter(p => p.branch.chongScore < 0).length;
  const branchSanheCount = pillarPairs.filter(p => p.branch.sanheScore > 0).length;
  const branchXingCount = pillarPairs.filter(p => p.branch.xingScore < 0).length;
  const branchHaiCount = pillarPairs.filter(p => p.branch.haiScore < 0).length;

  // 5. Overall score
  const { overallScore, level: compatibilityLevel } = computeOverallScore(dayMaster, pillarPairs, tenGodArchetypes);

  // 6. Summary and advice
  const { summary, summaryZh, advice, adviceZh } = generateSummary(
    { overallScore, compatibilityLevel, stemHeCount, branchHeCount, branchChongCount, branchSanheCount, pillarPairs, dayMaster },
    'zh'
  );

  // 7. Cultural coherence gate
  const coherenceWarnings: string[] = [];
  // BaZi synastry is pure BaZi — no cross-system violations expected here
  // But check for critical negative patterns
  if (branchChongCount >= 3) coherenceWarnings.push('三组以上地支冲克，关系动荡风险高');
  if (dayMaster.score <= -15) coherenceWarnings.push('日主相克严重，相处难度大');

  return {
    person1: chart1,
    person2: chart2,
    overallScore,
    compatibilityLevel,
    dayMaster,
    tenGodArchetypes,
    pillarPairs,
    stemHeCount,
    branchHeCount,
    branchChongCount,
    branchSanheCount,
    branchXingCount,
    branchHaiCount,
    summary,
    summaryZh,
    advice,
    adviceZh,
    coherencePass: coherenceWarnings.length === 0,
    coherenceWarnings,
  };
}
