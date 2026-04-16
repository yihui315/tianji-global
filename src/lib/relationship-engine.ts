// ─── Relationship Compatibility Engine ────────────────────────────────────────
// Rule-based scoring → AI generates human-readable explanations
// Philosophy: AI explains, not invents. Scoring is deterministic.

import type {
  RelationshipType,
  RelationshipReading,
  RelationshipDimensions,
  RelationshipDimensionScore,
  CompatibilityFeatures,
  RelationshipSummary,
  RelationshipTimeline,
  ApiResponse,
} from '@/types/relationship';

// ─── Element Compatibility Map ──────────────────────────────────────────────────
// How elements interact: [attraction_bonus, rhythm_compatibility]
const ELEMENT_COMPATIBILITY: Record<string, Record<string, [number, number]>> = {
  Fire:   { Fire: [90, 60], Earth: [40, 30], Metal: [20, 20], Water: [80, 70], Wood: [85, 80] },
  Earth:  { Fire: [40, 30], Earth: [90, 90], Metal: [85, 85], Water: [20, 20], Wood: [60, 70] },
  Metal:  { Fire: [20, 20], Earth: [85, 85], Metal: [90, 90], Water: [80, 70], Wood: [30, 40] },
  Water:  { Fire: [80, 70], Earth: [20, 20], Metal: [80, 70], Water: [90, 90], Wood: [60, 80] },
  Wood:   { Fire: [85, 80], Earth: [60, 70], Metal: [30, 40], Water: [60, 80], Wood: [90, 90] },
};

// ─── Extract features from birth data ─────────────────────────────────────────

export function extractCompatibilityFeatures(
  birthDate: string,
  birthTime?: string,
  birthLocation?: string,
): CompatibilityFeatures {
  // Derive element from birth date hash for pseudo-random but consistent distribution
  const dateNum = parseInt(birthDate.replace(/-/g, ''), 10);
  const elements = ['Fire', 'Earth', 'Metal', 'Water', 'Wood'];
  const idx = dateNum % 5;
  const dominant = elements[idx];
  const secondary = elements[(idx + 2) % 5];
  const weak = elements[(idx + 3) % 5];

  // Pace derived from birth hour
  let paceType: CompatibilityFeatures['paceType'] = 'steady';
  if (birthTime) {
    const hour = parseInt(birthTime.split(':')[0], 10);
    if (hour >= 6 && hour < 12) paceType = 'fast';
    else if (hour >= 21 || hour < 6) paceType = 'slow';
  }

  // Communication style from day of week
  const dayOfWeek = new Date(birthDate).getDay();
  const commTypes: CompatibilityFeatures['communicationType'][] = ['direct', 'reflective', 'guarded'];
  const communicationType = commTypes[dayOfWeek % 3];

  // Intimacy style from month
  const month = new Date(birthDate).getMonth();
  const intTypes: CompatibilityFeatures['intimacyType'][] = ['open', 'selective', 'cautious'];
  const intimacyType = intTypes[month % 3];

  // Stability from year parity
  const year = parseInt(birthDate.split('-')[0], 10);
  const stabTypes: CompatibilityFeatures['stabilityType'][] = ['stable', 'volatile', 'adaptive'];
  const stabilityType = stabTypes[year % 3];

  return {
    dominantElements: [dominant, secondary],
    weakElements: [weak],
    paceType,
    communicationType,
    intimacyType,
    stabilityType,
  };
}

// ─── Single Dimension Scoring ──────────────────────────────────────────────────

function scoreDimension(
  featuresA: CompatibilityFeatures,
  featuresB: CompatibilityFeatures,
  dimension: 'attraction' | 'communication' | 'conflict' | 'rhythm' | 'longTerm',
): number {
  const { ELEMENT_COMPATIBILITY: ELEM } = { ELEMENT_COMPATIBILITY };

  switch (dimension) {
    case 'attraction': {
      // Element complementarity + opposite pull
      const elemScore = ELEM[featuresA.dominantElements[0]]?.[featuresB.dominantElements[0]]?.[0] ?? 50;
      // Different but complementary types attract more
      const typeDiff = featuresA.paceType !== featuresB.paceType ? 15 : 0;
      return Math.min(100, Math.round(elemScore + typeDiff));
    }

    case 'communication': {
      // Same communication type = better
      const match = featuresA.communicationType === featuresB.communicationType ? 25 : 0;
      // Element affects expressiveness
      const elemBase = ELEM[featuresA.dominantElements[0]]?.[featuresB.dominantElements[0]]?.[0] ?? 50;
      return Math.min(100, Math.round(elemBase * 0.6 + match + 20));
    }

    case 'conflict': {
      // Rhythm mismatch drives conflict potential
      const rhythmDiff = featuresA.paceType !== featuresB.paceType ? 20 : 0;
      // Guarded + open = high tension
      const tension =
        (featuresA.intimacyType === 'guarded' && featuresB.intimacyType === 'open') ||
        (featuresA.intimacyType === 'open' && featuresB.intimacyType === 'guarded')
          ? 25
          : 0;
      // Base compatibility
      const elemBase = ELEM[featuresA.dominantElements[0]]?.[featuresB.dominantElements[0]]?.[0] ?? 50;
      // Higher raw score = less conflict risk
      return Math.max(0, Math.min(100, Math.round(elemBase - rhythmDiff - tension + 15)));
    }

    case 'rhythm': {
      // Same pace = best rhythm match
      const paceMatch = featuresA.paceType === featuresB.paceType ? 30 :
        (featuresA.paceType === 'steady' || featuresB.paceType === 'steady') ? 15 : 0;
      const elemScore = ELEM[featuresA.dominantElements[0]]?.[featuresB.dominantElements[0]]?.[1] ?? 50;
      return Math.min(100, Math.round(elemScore * 0.7 + paceMatch));
    }

    case 'longTerm': {
      // Stability compatibility
      const stabMatch = featuresA.stabilityType === featuresB.stabilityType ? 20 :
        (featuresA.stabilityType === 'adaptive' || featuresB.stabilityType === 'adaptive') ? 10 : 0;
      // Element long-term harmony
      const elemScore = ELEM[featuresA.dominantElements[0]]?.[featuresB.dominantElements[0]]?.[0] ?? 50;
      // Communication repair potential
      const repair = featuresA.communicationType === featuresB.communicationType ? 10 : 5;
      return Math.min(100, Math.round(elemScore * 0.65 + stabMatch + repair));
    }

    default:
      return 50;
  }
}

// ─── Score to Label Mapping ───────────────────────────────────────────────────

function scoreLabel(dimension: 'attraction' | 'communication' | 'conflict' | 'rhythm' | 'longTerm', score: number, lang = 'zh'): string {
  const labels: Record<string, Record<string, string>> = {
    attraction: {
      zh: score > 80 ? '非常强烈' : score > 60 ? '较强吸引' : score > 40 ? '中等吸引' : '较弱吸引',
      en: score > 80 ? 'Very strong' : score > 60 ? 'Strong attraction' : score > 40 ? 'Moderate attraction' : 'Mild attraction',
    },
    communication: {
      zh: score > 80 ? '非常顺畅' : score > 60 ? '较好沟通' : score > 40 ? '需要磨合' : '沟通困难',
      en: score > 80 ? 'Very smooth' : score > 60 ? 'Good communication' : score > 40 ? 'Needs work' : 'Difficult',
    },
    conflict: {
      zh: score > 75 ? '和谐少冲突' : score > 55 ? '可控张力' : score > 35 ? '冲突明显' : '高冲突风险',
      en: score > 75 ? 'Harmonious' : score > 55 ? 'Manageable tension' : score > 35 ? 'Visible conflict' : 'High tension',
    },
    rhythm: {
      zh: score > 75 ? '节奏高度契合' : score > 55 ? '节奏较一致' : score > 35 ? '节奏差异' : '节奏错位',
      en: score > 75 ? 'Highly aligned' : score > 55 ? 'Generally aligned' : score > 35 ? 'Different pacing' : 'Misaligned timing',
    },
    longTerm: {
      zh: score > 75 ? '长期潜力优秀' : score > 55 ? '有长期发展潜力' : score > 35 ? '需要主动经营' : '长期挑战大',
      en: score > 75 ? 'Excellent long-term potential' : score > 55 ? 'Good long-term potential' : score > 35 ? 'Requires effort' : 'Challenging long-term',
    },
  };
  return labels[dimension]?.[lang] ?? labels[dimension]?.['en'] ?? '';
}

function dimensionSummary(dimension: string, score: number, lang = 'zh'): string {
  const summaries: Record<string, Record<string, string>> = {
    attraction_zh: score > 80 ? '你们之间存在强烈的自然吸引和情感好奇心，这种磁场往往在初次接触时就很明显。' :
                   score > 60 ? '存在明显的吸引力，双方容易被对方的特点所触动。' :
                   score > 40 ? '吸引力的建立需要更多时间，初期较为平淡。' : '吸引不是你们关系的主要驱动力。',
    attraction_en: score > 80 ? 'There is a strong natural pull and emotional curiosity between you.' :
                   score > 60 ? 'There is clear attraction and emotional resonance.' :
                   score > 40 ? 'Attraction builds gradually over time.' : 'Attraction is not the main driver of this connection.',
    communication_zh: score > 80 ? '你们的沟通方式高度契合，能够轻松理解彼此的表达习惯。' :
                     score > 60 ? '沟通整体顺畅，偶尔需要澄清，但理解能力较强。' :
                     score > 40 ? '沟通需要双方主动调整风格，初期容易产生误解。' : '表达方式差异较大，需要有意识地建立沟通规则。',
    communication_en: score > 80 ? 'Your communication styles are highly compatible and you understand each other easily.' :
                      score > 60 ? 'Communication is generally smooth with occasional need for clarification.' :
                      score > 40 ? 'Different expression styles require conscious effort to align.' : 'Major communication gaps need intentional bridge-building.',
    conflict_zh: score > 75 ? '冲突在你们关系中较少出现，即使有分歧也能较快修复。' :
                 score > 55 ? '冲突可被管理，关键在于建立"冲突后修复"的共识。' :
                 score > 35 ? '冲突模式明显，需要学习如何建设性地处理分歧。' : '冲突是当前关系的主要挑战，需要专业支持。',
    conflict_en: score > 75 ? 'Conflict is rare in your relationship and repair comes easily.' :
                 score > 55 ? 'Conflict is manageable; establish post-friction repair rituals.' :
                 score > 35 ? 'Conflict patterns are visible; learn constructive disagreement.' : 'Conflict is a major challenge requiring conscious management.',
    rhythm_zh: score > 75 ? '你们在情感节奏上高度同步，几乎不需要互相适应。' :
               score > 55 ? '节奏整体一致，轻微差异可通过沟通调节。' :
               score > 35 ? '节奏差异明显，一方可能感到被催促或被拖慢。' : '节奏错位是关系的持续张力源。',
    rhythm_en: score > 75 ? 'Your emotional rhythms are highly synchronized.' :
               score > 55 ? 'Generally aligned with minor pacing differences.' :
               score > 35 ? 'Noticeable pacing gaps—one may feel rushed or held back.' : 'Timing misalignment is a constant source of friction.',
    longTerm_zh: score > 75 ? '长期关系基础扎实，稳定性高，成长空间大。' :
                 score > 55 ? '具备长期发展潜力，需要建立共同习惯和期待管理。' :
                 score > 35 ? '长期关系需要主动投资，双方的成长方向需要定期对齐。' : '长期稳定性存在较大挑战，需要双方共同努力。',
    longTerm_en: score > 75 ? 'Strong foundation for a lasting relationship with high stability.' :
                 score > 55 ? 'Good long-term potential with intentional habit-building.' :
                 score > 35 ? 'Long-term success requires active investment and alignment.' : 'Significant long-term stability challenges need concerted effort.',
  };
  const key = `${dimension}_${lang}`;
  return summaries[key] ?? summaries[`${dimension}_en`] ?? '';
}

function dimensionStrengths(dimension: string, score: number, lang = 'zh'): string[] {
  const strengths: Record<string, { zh: string[]; en: string[] }> = {
    attraction: {
      zh: ['快速建立情感连接', '磁场相互吸引', '容易产生共同话题'],
      en: ['Quick emotional bonding', 'Magnetic chemistry', 'Natural shared interests'],
    },
    communication: {
      zh: ['能够诚实表达', '理解对方的沉默', '沟通意图一致'],
      en: ['Honest expression', 'Understanding silences', 'Aligned communication intent'],
    },
    conflict: {
      zh: ['有修复意愿', '争吵后能和好', '不会冷战太久'],
      en: ['Willingness to repair', 'Reconciliation after friction', 'No prolonged coldness'],
    },
    rhythm: {
      zh: ['懂得留白', '不过分依赖对方节奏', '可以独立也可以同步'],
      en: ['Comfortable with space', 'Independent yet synchronized', 'Flexible timing'],
    },
    longTerm: {
      zh: ['价值观较为一致', '愿意共同成长', '对关系有长期承诺'],
      en: ['Aligned values', 'Mutual growth mindset', 'Long-term commitment to relationship'],
    },
  };
  const arr = strengths[dimension]?.[lang] ?? strengths[dimension]?.en ?? [];
  if (score > 60) return arr.slice(0, 2);
  return arr.slice(0, 1);
}

function dimensionRisks(dimension: string, score: number, lang = 'zh'): string[] {
  const risks: Record<string, { zh: string[]; en: string[] }> = {
    attraction: {
      zh: score > 80 ? ['容易过度理想化', '忽视现实差异'] : ['吸引力建立慢', '初期动力不足'],
      en: score > 80 ? ['Risk of idealization', 'Overlooking real differences'] : ['Slow attraction building', 'Low initial momentum'],
    },
    communication: {
      zh: ['容易误解对方语气', '假设对方理解自己', '回避深度对话'],
      en: ['Misreading tone', 'Assuming being understood', 'Avoiding deep conversations'],
    },
    conflict: {
      zh: score > 55 ? ['冲动反应', '用沉默惩罚对方'] : ['激烈争吵', '翻旧账', '拒绝妥协'],
      en: score > 55 ? ['Impulsive reactions', 'Using silence as punishment'] : ['Intense arguments', 'Old grievances resurface', 'Refusing compromise'],
    },
    rhythm: {
      zh: score > 35 ? ['一方感到被催促', '节奏差异产生摩擦'] : ['长期节奏错位', '生活步调难以协调'],
      en: score > 35 ? ['One feels rushed', 'Pacing friction'] : ['Chronic misalignment', 'Life pace difficult to sync'],
    },
    longTerm: {
      zh: ['隐性期待未管理', '假设对方知道自己的需求', '忽视关系维护'],
      en: ['Unspoken expectations', 'Assuming partner knows needs', 'Neglecting relationship maintenance'],
    },
  };
  const arr = risks[dimension]?.[lang] ?? risks[dimension]?.en ?? [];
  if (score < 45) return arr;
  return arr.slice(0, 1);
}

function dimensionAdvice(dimension: string, score: number, lang = 'zh'): string[] {
  const advice: Record<string, { zh: string[]; en: string[] }> = {
    attraction: {
      zh: ['放慢期待建立的速度', '主动看到对方的完整性而非理想化'],
      en: ['Slow down expectation-building', 'See the whole person, not an ideal'],
    },
    communication: {
      zh: ['先确认理解，再表达观点', '给沉默留出空间而非解读为拒绝'],
      en: ['Confirm understanding before responding', 'Allow silence without reading into it'],
    },
    conflict: {
      zh: ['建立"暂停-回归"规则', '争吵后约定和好方式'],
      en: ['Establish pause-and-return rules', 'Agree on reconciliation rituals after arguments'],
    },
    rhythm: {
      zh: ['直接命名节奏差异', '不对对方的节奏做情绪化解读'],
      en: ['Name pace differences directly', 'Don\'t emotionally interpret pacing differences'],
    },
    longTerm: {
      zh: ['建立共同习惯而非共同假设', '定期讨论长期期待'],
      en: ['Build shared habits, not shared assumptions', 'Discuss long-term expectations regularly'],
    },
  };
  const arr = advice[dimension]?.[lang] ?? advice[dimension]?.en ?? [];
  return arr;
}

// ─── Top Pattern Generator ─────────────────────────────────────────────────────

function generateTopPattern(
  dimensions: RelationshipDimensions,
  relationType: RelationshipType,
  lang = 'zh',
): string {
  const patterns: Record<RelationshipType, Array<{ condition: (d: RelationshipDimensions) => boolean; zh: string; en: string }>> = {
    romantic: [
      { condition: d => d.attraction.score > 80 && d.rhythm.score < 50,
        zh: '高吸引 + 节奏错位型', en: 'High Attraction, Unaligned Rhythm' },
      { condition: d => d.communication.score > 75 && d.conflict.score > 65,
        zh: '顺畅沟通 + 高张力型', en: 'Smooth Communication, High Tension' },
      { condition: d => d.longTerm.score > 75,
        zh: '长期潜力优秀型', en: 'High Long-Term Potential' },
      { condition: d => d.attraction.score > 70 && d.attraction.score < 85,
        zh: '稳定吸引型', en: 'Steady Attraction' },
      { condition: d => d.conflict.score < 45,
        zh: '高冲突型', en: 'High Conflict Pattern' },
      { condition: d => d.rhythm.score > 70,
        zh: '节奏同步型', en: 'Rhythm-Synchronized' },
    ],
    friendship: [
      { condition: d => d.communication.score > 75,
        zh: '灵魂朋友型', en: 'Soulmate Friendship' },
      { condition: d => d.rhythm.score > 70,
        zh: '节奏合拍型', en: 'Effortless Sync' },
      { condition: d => d.attraction.score > 65,
        zh: '相互激励型', en: 'Mutual Inspiration' },
    ],
    work: [
      { condition: d => d.communication.score > 75,
        zh: '高效协作型', en: 'Efficient Collaboration' },
      { condition: d => d.longTerm.score > 70,
        zh: '长期搭档型', en: 'Long-Term Partnership' },
      { condition: d => d.conflict.score > 60,
        zh: '建设性张力型', en: 'Constructive Tension' },
    ],
  };

  const candidates = patterns[relationType] ?? patterns.romantic;
  for (const p of candidates) {
    if (p.condition(dimensions)) {
      return p[lang] ?? p.en;
    }
  }
  return lang === 'zh' ? '多元互补型' : 'Diversely Complementary';
}

// ─── Summary Generator ─────────────────────────────────────────────────────────

function generateSummary(
  dimensions: RelationshipDimensions,
  relationType: RelationshipType,
  pattern: string,
  lang = 'zh',
): RelationshipSummary {
  const overallAvg = Math.round(
    (dimensions.attraction.score + dimensions.communication.score +
     dimensions.conflict.score + dimensions.rhythm.score + dimensions.longTerm.score) / 5,
  );

  const headlines: Record<string, Record<string, string>> = {
    romantic: {
      zh: overallAvg > 70 ? '相互吸引，成长同步' : overallAvg > 50 ? '有差异，但吸引力存在' : '需要主动经营的一对',
      en: overallAvg > 70
        ? 'You feel something real — synchronized growth is already underway'
        : overallAvg > 50
        ? 'The attraction is genuine — the question is whether you\'re both ready to meet it'
        : 'The pull between you is honest — without intention, it stays still',
    },
    friendship: {
      zh: overallAvg > 70 ? '默契十足的朋友' : overallAvg > 50 ? '可以深聊的伙伴' : '需要跨越差异的朋友',
      en: overallAvg > 70
        ? 'You understand each other in ways that don\'t need explaining'
        : overallAvg > 50
        ? 'This friendship has real depth — the gap is in how much you let it be seen'
        : 'You\'re compatible enough to matter to each other — that\'s worth something',
    },
    work: {
      zh: overallAvg > 70 ? '高效互信的搭档' : overallAvg > 50 ? '有潜力的合作关系' : '需要磨合的工作伙伴',
      en: overallAvg > 70
        ? 'You work well together — the trust is there, now it\'s about pace'
        : overallAvg > 50
        ? 'This partnership has potential — the question is who adjusts first'
        : 'You\'re functional as colleagues — bridging differences is where the work begins',
    },
  };

  const oneLiners: Record<string, Record<string, string>> = {
    romantic: {
      zh: dimensions.attraction.score > 70
        ? '你们之间的连接感很强，节奏同步是接下来最重要的课题。'
        : '吸引是真实的，但建立深度信任需要时间和有意识的沟通。',
      en: dimensions.attraction.score > 70
        ? 'You feel the connection — but are you building it, or just experiencing it?'
        : 'The attraction is honest — without intention, it simply stays still.',
    },
    friendship: {
      zh: '你们的友谊建立在相互理解之上，沟通让你们的关系持续加深。',
      en: 'You get each other — but how much of that are you actually letting be seen?',
    },
    work: {
      zh: '合作关系的效果取决于你们能否有效管理节奏和沟通风格的差异。',
      en: 'The foundation is real — what happens next depends on how you handle the gaps.',
    },
  };

  return {
    headline: headlines[relationType]?.[lang] ?? headlines[relationType]?.en ?? '',
    oneLiner: oneLiners[relationType]?.[lang] ?? oneLiners[relationType]?.en ?? '',
    keywords: [
      scoreLabel('attraction', dimensions.attraction.score, lang),
      scoreLabel('communication', dimensions.communication.score, lang),
      scoreLabel('rhythm', dimensions.rhythm.score, lang),
    ],
  };
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function generateTimeline(dimensions: RelationshipDimensions, relationType: RelationshipType, lang = 'zh'): RelationshipTimeline {
  const phaseZh = dimensions.rhythm.score > 60
    ? '关系稳定发展期'
    : dimensions.conflict.score < 50
      ? '张力磨合期'
      : '初始建立期';
  const phaseEn = dimensions.rhythm.score > 60
    ? 'Stable relationship development'
    : dimensions.conflict.score < 50
      ? 'Tension and calibration period'
      : 'Initial bonding phase';

  const next30Zh = dimensions.communication.score < 60
    ? '建议进行至少一次深度对话，明确双方期待'
    : '适合共同体验新活动，加深连接';
  const next30En = dimensions.communication.score < 60
    ? 'Consider at least one deep conversation to align expectations'
    : 'Good time for shared new experiences to deepen connection';

  return {
    currentPhase: lang === 'zh' ? phaseZh : phaseEn,
    next30Days: lang === 'zh' ? next30Zh : next30En,
  };
}

// ─── Master Analyzer ──────────────────────────────────────────────────────────

export interface AnalyzeResult {
  reading: RelationshipReading;
  dbData: {
    scoreOverall: number;
    scoreAttraction: number;
    scoreCommunication: number;
    scoreConflict: number;
    scoreRhythm: number;
    scoreLongTerm: number;
    summary: RelationshipSummary;
    dimensions: RelationshipDimensions;
    timeline: RelationshipTimeline;
  };
}

export function analyzeRelationship(
  personABirthDate: string,
  personBBirthDate: string,
  relationType: RelationshipType,
  personANickname: string,
  personBNickname: string,
  personABirthTime?: string,
  personBBirthTime?: string,
  lang = 'zh',
): AnalyzeResult {
  // Extract features from birth data
  const featuresA = extractCompatibilityFeatures(personABirthDate, personABirthTime);
  const featuresB = extractCompatibilityFeatures(personBBirthDate, personBBirthTime);

  // Score all five dimensions
  const scoreAttraction = scoreDimension(featuresA, featuresB, 'attraction');
  const scoreCommunication = scoreDimension(featuresA, featuresB, 'communication');
  const scoreConflict = scoreDimension(featuresA, featuresB, 'conflict');
  const scoreRhythm = scoreDimension(featuresA, featuresB, 'rhythm');
  const scoreLongTerm = scoreDimension(featuresA, featuresB, 'longTerm');

  const overallScore = Math.round(
    (scoreAttraction + scoreCommunication + scoreConflict + scoreRhythm + scoreLongTerm) / 5,
  );

  // Build dimension objects
  const dimensions: RelationshipDimensions = {
    attraction: {
      score: scoreAttraction,
      label: scoreLabel('attraction', scoreAttraction, lang),
      summary: dimensionSummary('attraction', scoreAttraction, lang),
      strengths: dimensionStrengths('attraction', scoreAttraction, lang),
      risks: dimensionRisks('attraction', scoreAttraction, lang),
      advice: dimensionAdvice('attraction', scoreAttraction, lang),
    },
    communication: {
      score: scoreCommunication,
      label: scoreLabel('communication', scoreCommunication, lang),
      summary: dimensionSummary('communication', scoreCommunication, lang),
      strengths: dimensionStrengths('communication', scoreCommunication, lang),
      risks: dimensionRisks('communication', scoreCommunication, lang),
      advice: dimensionAdvice('communication', scoreCommunication, lang),
    },
    conflict: {
      score: scoreConflict,
      label: scoreLabel('conflict', scoreConflict, lang),
      summary: dimensionSummary('conflict', scoreConflict, lang),
      strengths: dimensionStrengths('conflict', scoreConflict, lang),
      risks: dimensionRisks('conflict', scoreConflict, lang),
      advice: dimensionAdvice('conflict', scoreConflict, lang),
    },
    rhythm: {
      score: scoreRhythm,
      label: scoreLabel('rhythm', scoreRhythm, lang),
      summary: dimensionSummary('rhythm', scoreRhythm, lang),
      strengths: dimensionStrengths('rhythm', scoreRhythm, lang),
      risks: dimensionRisks('rhythm', scoreRhythm, lang),
      advice: dimensionAdvice('rhythm', scoreRhythm, lang),
    },
    longTerm: {
      score: scoreLongTerm,
      label: scoreLabel('longTerm', scoreLongTerm, lang),
      summary: dimensionSummary('longTerm', scoreLongTerm, lang),
      strengths: dimensionStrengths('longTerm', scoreLongTerm, lang),
      risks: dimensionRisks('longTerm', scoreLongTerm, lang),
      advice: dimensionAdvice('longTerm', scoreLongTerm, lang),
    },
  };

  const topPattern = generateTopPattern(dimensions, relationType, lang);
  const summary = generateSummary(dimensions, relationType, topPattern, lang);
  const timeline = generateTimeline(dimensions, relationType, lang);

  const dbData = {
    scoreOverall: overallScore,
    scoreAttraction,
    scoreCommunication,
    scoreConflict,
    scoreRhythm,
    scoreLongTerm,
    summary,
    dimensions,
    timeline,
  };

  const reading: RelationshipReading = {
    id: `rel_${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    relationType,
    personA: { nickname: personANickname },
    personB: { nickname: personBNickname },
    overallScore,
    dimensions,
    summary,
    timeline,
    isPremium: false,
    createdAt: new Date().toISOString(),
  };

  return { reading, dbData };
}
