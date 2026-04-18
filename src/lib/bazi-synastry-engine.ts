export interface BaZiSynastryInput {
  year: { heavenlyStem: string; earthlyBranch: string; element: string };
  month: { heavenlyStem: string; earthlyBranch: string; element: string };
  day: { heavenlyStem: string; earthlyBranch: string; element: string };
  hour: { heavenlyStem: string; earthlyBranch: string; element: string };
  dayMasterElement: string;
  gender?: string;
}

export type SynastryRelationshipType =
  | 'he'
  | 'sanhe'
  | 'chong'
  | 'xing'
  | 'hai'
  | 'sheng'
  | 'ke'
  | 'none';

export interface SynastryRelationship {
  type: SynastryRelationshipType;
  score: number;
  description: string;
  descriptionZh: string;
}

export interface StemCompatibility {
  stem1: string;
  stem2: string;
  heMatch: boolean;
  score: number;
  description: string;
  descriptionZh: string;
}

export interface BranchCompatibility {
  branch1: string;
  branch2: string;
  relationships: SynastryRelationship[];
  heScore: number;
  sanheScore: number;
  chongScore: number;
  xingScore: number;
  haiScore: number;
  netScore: number;
  description: string;
  descriptionZh: string;
}

export type DayMasterRelation = 'same' | 'sheng' | 'ke' | '被我生' | '生我' | '被我克' | '克我' | 'none';

export interface DayMasterCompatibility {
  element1: string;
  element2: string;
  score: number;
  relation: DayMasterRelation;
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
  overallScore: number;
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
  coherencePass: boolean;
  coherenceWarnings: string[];
}

export interface ComputeBaZiSynastryOptions {
  strictMode?: boolean;
}

const STEM_HARMONY: Record<string, string> = {
  甲: '己', 乙: '庚', 丙: '辛', 丁: '壬', 戊: '癸',
  己: '甲', 庚: '乙', 辛: '丙', 壬: '丁', 癸: '戊',
};

const STEM_ELEMENTS: Record<string, string> = {
  甲: 'wood', 乙: 'wood',
  丙: 'fire', 丁: 'fire',
  戊: 'earth', 己: 'earth',
  庚: 'metal', 辛: 'metal',
  壬: 'water', 癸: 'water',
};

const STEM_POLARITY: Record<string, 'yang' | 'yin'> = {
  甲: 'yang', 丙: 'yang', 戊: 'yang', 庚: 'yang', 壬: 'yang',
  乙: 'yin', 丁: 'yin', 己: 'yin', 辛: 'yin', 癸: 'yin',
};

const BRANCH_HARMONY: Record<string, string> = {
  子: '丑', 丑: '子',
  寅: '亥', 亥: '寅',
  卯: '戌', 戌: '卯',
  辰: '酉', 酉: '辰',
  巳: '申', 申: '巳',
  午: '未', 未: '午',
};

const BRANCH_CLASH: Record<string, string> = {
  子: '午', 午: '子',
  丑: '未', 未: '丑',
  寅: '申', 申: '寅',
  卯: '酉', 酉: '卯',
  辰: '戌', 戌: '辰',
  巳: '亥', 亥: '巳',
};

const BRANCH_HARM_GROUPS: string[][] = [
  ['申', '子', '辰'],
  ['亥', '卯', '未'],
  ['寅', '午', '戌'],
  ['巳', '酉', '丑'],
];

const BRANCH_PUNISHMENT: Record<string, string[]> = {
  子: ['卯'],
  卯: ['子'],
  寅: ['巳', '申'],
  巳: ['寅', '申'],
  申: ['寅', '巳'],
  丑: ['戌', '未'],
  戌: ['丑', '未'],
  未: ['丑', '戌'],
};

const BRANCH_HARM: Record<string, string> = {
  子: '未', 未: '子',
  丑: '午', 午: '丑',
  寅: '巳', 巳: '寅',
  卯: '辰', 辰: '卯',
  申: '亥', 亥: '申',
  酉: '戌', 戌: '酉',
};

const GENERATES: Record<string, string> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
};

const CONTROLS: Record<string, string> = {
  wood: 'earth',
  fire: 'metal',
  earth: 'water',
  metal: 'wood',
  water: 'fire',
};

const PILLAR_WEIGHTS: Record<PillarPair['pillar'], number> = {
  year: 0.15,
  month: 0.25,
  day: 0.4,
  hour: 0.2,
};

const RELATION_LABELS: Record<Exclude<DayMasterRelation, 'none'>, { zh: string; en: string; score: number }> = {
  same: { zh: '同元素相逢，理解自然，彼此很容易读懂对方。', en: 'Same-element pairing creates easy recognition and mutual understanding.', score: 4 },
  sheng: { zh: '一方生扶另一方，关系里有明显的滋养与支持。', en: 'One element nourishes the other, creating a supportive bond.', score: 6 },
  生我: { zh: '对方的能量会托举你，但也要防止依赖失衡。', en: 'Your partner uplifts you, but dependency needs balance.', score: 5 },
  被我生: { zh: '你更容易成为付出的一方，要注意边界与节奏。', en: 'You may give more in the relationship, so boundaries matter.', score: 3 },
  ke: { zh: '元素相克带来摩擦，但也能形成推动成长的压力。', en: 'Controlling dynamics create friction, but can also push growth.', score: -4 },
  被我克: { zh: '你更容易占主导，关系需要更温和的力量分配。', en: 'You may become the dominant side, so gentler balance is needed.', score: -3 },
  克我: { zh: '对方会给你压力，权力感和节奏感需要重新协商。', en: 'Your partner may pressure you, so power and pace need negotiation.', score: -5 },
};

function normalizeElement(element: string): string {
  const normalized = element.toLowerCase();
  if (['wood', 'fire', 'earth', 'metal', 'water'].includes(normalized)) {
    return normalized;
  }
  if (element.includes('木')) return 'wood';
  if (element.includes('火')) return 'fire';
  if (element.includes('土')) return 'earth';
  if (element.includes('金')) return 'metal';
  if (element.includes('水')) return 'water';
  return 'earth';
}

function computeElementRelation(left: string, right: string): DayMasterRelation {
  const element1 = normalizeElement(left);
  const element2 = normalizeElement(right);

  if (element1 === element2) return 'same';
  if (GENERATES[element1] === element2) return '被我生';
  if (GENERATES[element2] === element1) return '生我';
  if (CONTROLS[element1] === element2) return '被我克';
  if (CONTROLS[element2] === element1) return '克我';
  return 'none';
}

function computeStemCompatibility(stem1: string, stem2: string): StemCompatibility {
  const relation = computeElementRelation(STEM_ELEMENTS[stem1] ?? 'earth', STEM_ELEMENTS[stem2] ?? 'earth');
  const heMatch = STEM_HARMONY[stem1] === stem2;
  let score = heMatch ? 10 : relation === 'none' ? 0 : RELATION_LABELS[relation].score;

  if (!heMatch && relation === 'same') {
    score += STEM_POLARITY[stem1] === STEM_POLARITY[stem2] ? 1 : 2;
  }

  return {
    stem1,
    stem2,
    heMatch,
    score,
    description: heMatch
      ? 'The heavenly stems form a classic He pairing.'
      : `The stems interact through a ${relation === 'none' ? 'neutral' : relation} elemental dynamic.`,
    descriptionZh: heMatch
      ? '天干形成经典相合结构。'
      : `天干之间呈现${relation === 'none' ? '中性' : relation}的五行动力。`,
  };
}

function computeBranchRelationships(branch1: string, branch2: string): SynastryRelationship[] {
  const relationships: SynastryRelationship[] = [];

  if (BRANCH_HARMONY[branch1] === branch2) {
    relationships.push({
      type: 'he',
      score: 8,
      description: 'The earthly branches form a Liu He bond.',
      descriptionZh: '地支六合，缘分容易靠近并形成稳定吸引。',
    });
  }

  if (BRANCH_HARM_GROUPS.some((group) => group.includes(branch1) && group.includes(branch2))) {
    relationships.push({
      type: 'sanhe',
      score: 6,
      description: 'The earthly branches belong to the same San He group.',
      descriptionZh: '地支三合，同频感强，彼此更容易进入同一个节奏。',
    });
  }

  if (BRANCH_CLASH[branch1] === branch2) {
    relationships.push({
      type: 'chong',
      score: -8,
      description: 'The branches clash, creating periodic tension.',
      descriptionZh: '地支相冲，关系里会出现明显的拉扯与变动。',
    });
  }

  if ((BRANCH_PUNISHMENT[branch1] ?? []).includes(branch2)) {
    relationships.push({
      type: 'xing',
      score: -5,
      description: 'The branches punish each other, surfacing as blame or friction.',
      descriptionZh: '地支相刑，容易形成内耗、委屈或责备循环。',
    });
  }

  if (BRANCH_HARM[branch1] === branch2) {
    relationships.push({
      type: 'hai',
      score: -4,
      description: 'The branches harm each other in subtle ways.',
      descriptionZh: '地支相害，表面无大冲突，底层却容易暗损彼此。',
    });
  }

  if (relationships.length === 0) {
    relationships.push({
      type: 'none',
      score: 0,
      description: 'No major classical branch interaction is present.',
      descriptionZh: '暂无明显的经典地支互动结构。',
    });
  }

  return relationships;
}

function computeBranchCompatibility(branch1: string, branch2: string): BranchCompatibility {
  const relationships = computeBranchRelationships(branch1, branch2);
  const sumBy = (type: SynastryRelationshipType) =>
    relationships.filter((relationship) => relationship.type === type).reduce((sum, relationship) => sum + relationship.score, 0);

  const heScore = sumBy('he');
  const sanheScore = sumBy('sanhe');
  const chongScore = sumBy('chong');
  const xingScore = sumBy('xing');
  const haiScore = sumBy('hai');
  const netScore = heScore + sanheScore + chongScore + xingScore + haiScore;

  return {
    branch1,
    branch2,
    relationships,
    heScore,
    sanheScore,
    chongScore,
    xingScore,
    haiScore,
    netScore,
    description: netScore >= 10 ? 'Branch dynamics are strongly supportive.' : netScore <= -8 ? 'Branch dynamics are tense.' : 'Branch dynamics are mixed but manageable.',
    descriptionZh: netScore >= 10 ? '地支互动偏吉，彼此在节奏和情境里更容易共振。' : netScore <= -8 ? '地支互动偏紧张，关系需要更多耐心与修复能力。' : '地支互动有利有弊，整体可通过相处理顺。',
  };
}

function computeDayMasterCompatibility(chart1: BaZiSynastryInput, chart2: BaZiSynastryInput): DayMasterCompatibility {
  const relation = computeElementRelation(chart1.dayMasterElement, chart2.dayMasterElement);
  const label = relation === 'none'
    ? { zh: '两人的五行关系较为中性，更多要看四柱整体搭配。', en: 'The elemental relationship is neutral, so the full chart matters more.', score: 0 }
    : RELATION_LABELS[relation];

  return {
    element1: chart1.dayMasterElement,
    element2: chart2.dayMasterElement,
    score: label.score,
    relation,
    description: label.en,
    descriptionZh: label.zh,
  };
}

function deriveTenGod(dayStem1: string, dayStem2: string): { archetype: string; archetypeZh: string } {
  const relation = computeElementRelation(STEM_ELEMENTS[dayStem1] ?? 'earth', STEM_ELEMENTS[dayStem2] ?? 'earth');
  const samePolarity = STEM_POLARITY[dayStem1] === STEM_POLARITY[dayStem2];

  switch (relation) {
    case 'same':
      return samePolarity ? { archetype: 'Peer Mirror', archetypeZh: '比肩' } : { archetype: 'Competitive Twin', archetypeZh: '劫财' };
    case '生我':
      return samePolarity ? { archetype: 'Direct Resource', archetypeZh: '正印' } : { archetype: 'Indirect Resource', archetypeZh: '偏印' };
    case '被我生':
      return samePolarity ? { archetype: 'Creative Outlet', archetypeZh: '食神' } : { archetype: 'Sharp Expression', archetypeZh: '伤官' };
    case '被我克':
      return samePolarity ? { archetype: 'Direct Wealth', archetypeZh: '正财' } : { archetype: 'Indirect Wealth', archetypeZh: '偏财' };
    case '克我':
      return samePolarity ? { archetype: 'Direct Officer', archetypeZh: '正官' } : { archetype: 'Seven Killings', archetypeZh: '七杀' };
    default:
      return { archetype: 'Neutral Pairing', archetypeZh: '中性结构' };
  }
}

function computeTenGodArchetypes(chart1: BaZiSynastryInput, chart2: BaZiSynastryInput): TenGodArchetype[] {
  const pair = deriveTenGod(chart1.day.heavenlyStem, chart2.day.heavenlyStem);
  const score = ['比肩', '正印', '食神', '正财', '正官'].includes(pair.archetypeZh) ? 6 : pair.archetypeZh === '中性结构' ? 0 : 3;

  return [
    {
      archetype: pair.archetype,
      archetypeZh: pair.archetypeZh,
      score,
      description: `${pair.archetype} shapes the dominant emotional script between the two charts.`,
      descriptionZh: `${pair.archetypeZh}是这段关系里最容易浮现的互动原型。`,
    },
  ];
}

function computePillarPairs(chart1: BaZiSynastryInput, chart2: BaZiSynastryInput): PillarPair[] {
  const pillars: PillarPair['pillar'][] = ['year', 'month', 'day', 'hour'];
  return pillars.map((pillar) => {
    const stem = computeStemCompatibility(chart1[pillar].heavenlyStem, chart2[pillar].heavenlyStem);
    const branch = computeBranchCompatibility(chart1[pillar].earthlyBranch, chart2[pillar].earthlyBranch);
    const pillarScore = (stem.score * 0.6 + branch.netScore * 0.4) * PILLAR_WEIGHTS[pillar] * 4;
    return { pillar, stem, branch, pillarScore };
  });
}

function computeOverallScore(
  dayMaster: DayMasterCompatibility,
  pillarPairs: PillarPair[],
  archetypes: TenGodArchetype[]
): { overallScore: number; level: BaZiSynastryResult['compatibilityLevel'] } {
  const pillarScore = pillarPairs.reduce((sum, pair) => sum + pair.pillarScore, 0);
  const archetypeScore = archetypes.reduce((sum, archetype) => sum + archetype.score, 0);
  const overallScore = Math.max(0, Math.min(100, Math.round(58 + dayMaster.score * 2 + pillarScore + archetypeScore * 1.5)));

  if (overallScore >= 78) return { overallScore, level: 'excellent' };
  if (overallScore >= 62) return { overallScore, level: 'good' };
  if (overallScore >= 45) return { overallScore, level: 'fair' };
  return { overallScore, level: 'challenging' };
}

function generateSummary(
  overallScore: number,
  compatibilityLevel: BaZiSynastryResult['compatibilityLevel'],
  branchChongCount: number
): Pick<BaZiSynastryResult, 'summary' | 'summaryZh' | 'advice' | 'adviceZh'> {
  return {
    summary: `This pairing scores ${overallScore}/100 with a ${compatibilityLevel} compatibility profile.`,
    summaryZh: `这组八字合盘当前分数为 ${overallScore}/100，整体属于${compatibilityLevel === 'excellent' ? '上佳' : compatibilityLevel === 'good' ? '良好' : compatibilityLevel === 'fair' ? '中等' : '挑战较多'}结构。`,
    advice: branchChongCount > 0
      ? 'Pay special attention to conflict repair and timing when clashes are activated.'
      : 'Lean into the supportive pillars and build routines that reinforce trust.',
    adviceZh: branchChongCount > 0
      ? '若冲的数量较多，关系更需要修复机制、沟通节奏和冲突后的复盘。'
      : '当合与三合较多时，最适合通过固定节奏、共同计划和长期承诺来放大优势。',
  };
}

export function computeBaZiSynastry(
  chart1: BaZiSynastryInput,
  chart2: BaZiSynastryInput,
  _options?: ComputeBaZiSynastryOptions
): BaZiSynastryResult {
  const dayMaster = computeDayMasterCompatibility(chart1, chart2);
  const pillarPairs = computePillarPairs(chart1, chart2);
  const tenGodArchetypes = computeTenGodArchetypes(chart1, chart2);
  const { overallScore, level } = computeOverallScore(dayMaster, pillarPairs, tenGodArchetypes);

  const stemHeCount = pillarPairs.filter((pair) => pair.stem.heMatch).length;
  const branchHeCount = pillarPairs.reduce((sum, pair) => sum + pair.branch.relationships.filter((relationship) => relationship.type === 'he').length, 0);
  const branchSanheCount = pillarPairs.reduce((sum, pair) => sum + pair.branch.relationships.filter((relationship) => relationship.type === 'sanhe').length, 0);
  const branchChongCount = pillarPairs.reduce((sum, pair) => sum + pair.branch.relationships.filter((relationship) => relationship.type === 'chong').length, 0);
  const branchXingCount = pillarPairs.reduce((sum, pair) => sum + pair.branch.relationships.filter((relationship) => relationship.type === 'xing').length, 0);
  const branchHaiCount = pillarPairs.reduce((sum, pair) => sum + pair.branch.relationships.filter((relationship) => relationship.type === 'hai').length, 0);

  const coherenceWarnings: string[] = [];
  if (branchChongCount >= 2) {
    coherenceWarnings.push('Multiple branch clashes indicate recurring tension cycles that need repair rituals.');
  }
  if (dayMaster.relation === '克我' || dayMaster.relation === '被我克') {
    coherenceWarnings.push('Power balance is a central theme in this pairing.');
  }

  return {
    person1: chart1,
    person2: chart2,
    overallScore,
    compatibilityLevel: level,
    dayMaster,
    tenGodArchetypes,
    pillarPairs,
    stemHeCount,
    branchHeCount,
    branchChongCount,
    branchSanheCount,
    branchXingCount,
    branchHaiCount,
    ...generateSummary(overallScore, level, branchChongCount),
    coherencePass: coherenceWarnings.length === 0,
    coherenceWarnings,
  };
}
