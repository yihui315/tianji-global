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
        (featuresA.intimacyType === 'cautious' && featuresB.intimacyType === 'open') ||
        (featuresA.intimacyType === 'open' && featuresB.intimacyType === 'cautious')
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

function scoreLabel(
  dimension: 'attraction' | 'communication' | 'conflict' | 'rhythm' | 'longTerm',
  score: number,
  lang: 'zh' | 'en' = 'zh',
): string {
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

function dimensionSummary(dimension: string, score: number, lang: 'zh' | 'en' = 'zh'): string {
  const summaries: Record<string, string> = {
    attraction_zh: score > 80 ? '你们之间存在强烈的自然吸引和情感好奇心，这种磁场往往在初次接触时就很明显。' :
                   score > 60 ? '存在明显的吸引力，双方容易被对方的特点所触动。' :
                   score > 40 ? '吸引力的建立需要更多时间，初期较为平淡。' : '吸引不是你们关系的主要驱动力。',
    attraction_en: score > 80 ? 'You feel the pull between you — strong, sometimes almost overwhelming. The question is whether you\'re both feeling it at the same intensity.' :
                   score > 60 ? 'There\'s real attraction here. It\'s not always loud, but it\'s consistent — when you\'re both present.' :
                   score > 40 ? 'The attraction is honest — but without intention, it stays where it is.' : 'Attraction isn\'t the main language of this connection. That doesn\'t mean depth isn\'t there.',
    communication_zh: score > 80 ? '你们的沟通方式高度契合，能够轻松理解彼此的表达习惯。' :
                     score > 60 ? '沟通整体顺畅，偶尔需要澄清，但理解能力较强。' :
                     score > 40 ? '沟通需要双方主动调整风格，初期容易产生误解。' : '表达方式差异较大，需要有意识地建立沟通规则。',
    communication_en: score > 80 ? 'You understand each other\'s silences as much as the words. That\'s rare — and worth protecting.' :
                      score > 60 ? 'Communication is a strength. The risk is assuming you\'re clearer than you are — check in more than you think you need to.' :
                      score > 40 ? 'You understand each other partly. The gap is in how much you\'re both willing to be understood.' : 'Communication takes real effort here. The work is worth it — if you both keep showing up for it.',
    conflict_zh: score > 75 ? '冲突在你们关系中较少出现，即使有分歧也能较快修复。' :
                 score > 55 ? '冲突可被管理，关键在于建立"冲突后修复"的共识。' :
                 score > 35 ? '冲突模式明显，需要学习如何建设性地处理分歧。' : '冲突是当前关系的主要挑战，需要专业支持。',
    conflict_en: score > 75 ? 'Conflict rarely shows up here — and when it does, you both know how to come back.' :
                 score > 55 ? 'You feel the tension, but you can move through it. The key is not letting it calcify into habit.' :
                 score > 35 ? 'Conflict shows up in ways you don\'t always predict. The patterns are learnable — once you\'re ready to look at them honestly.' : 'The friction is constant. This isn\'t a sign to leave — it\'s a sign to get support.',
    rhythm_zh: score > 75 ? '你们在情感节奏上高度同步，几乎不需要互相适应。' :
               score > 55 ? '节奏整体一致，轻微差异可通过沟通调节。' :
               score > 35 ? '节奏差异明显，一方可能感到被催促或被拖慢。' : '节奏错位是关系的持续张力源。',
    rhythm_en: score > 75 ? 'You move at the same pace without having to think about it. That ease is the foundation.' :
               score > 55 ? 'You\'re generally on the same rhythm. The occasional off-beat is navigable — when you both name it.' :
               score > 35 ? 'You feel the pace gap. One of you wants to move faster; the other wants to slow down. Neither is wrong — it\'s about whose pace you\'re actually living in.' : 'The timing gap is a constant. It\'s not a death sentence — it\'s a calibration problem. Someone has to lead.',
    longTerm_zh: score > 75 ? '长期关系基础扎实，稳定性高，成长空间大。' :
                 score > 55 ? '具备长期发展潜力，需要建立共同习惯和期待管理。' :
                 score > 35 ? '长期关系需要主动投资，双方的成长方向需要定期对齐。' : '长期稳定性存在较大挑战，需要双方共同努力。',
    longTerm_en: score > 75 ? 'You have something built to last. The question isn\'t whether — it\'s whether you both keep choosing it.' :
                 score > 55 ? 'This connection has real long-term bones. What it becomes depends on how intentionally you both build it.' :
                 score > 35 ? 'Long-term takes active investment here. The good news: you\'re both capable of it — when you\'re honest about what it requires.' : 'The long-term picture is the work. Not impossible — just not automatic.',
  };
  const key = `${dimension}_${lang}`;
  return summaries[key] ?? summaries[`${dimension}_en`] ?? '';
}

function dimensionStrengths(dimension: string, score: number, lang: 'zh' | 'en' = 'zh'): string[] {
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

function dimensionRisks(dimension: string, score: number, lang: 'zh' | 'en' = 'zh'): string[] {
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

function dimensionAdvice(dimension: string, score: number, lang: 'zh' | 'en' = 'zh'): string[] {
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
  lang: 'zh' | 'en' = 'zh',
): string {
  const patterns: Record<RelationshipType, Array<{ condition: (d: RelationshipDimensions) => boolean; zh: string; en: string; enContrast?: string }>> = {
    romantic: [
      { condition: d => d.attraction.score > 80 && d.rhythm.score < 50,
        zh: '高吸引 + 节奏错位型',
        en: 'High Attraction, Unaligned Rhythm',
        enContrast: 'You feel the pull — but you\'re moving at different speeds' },
      { condition: d => d.attraction.score > 70 && d.communication.score < 55,
        zh: '强吸引 + 沟通挑战型',
        en: 'Intense Chemistry, Unclear Communication',
        enContrast: 'There\'s real chemistry here — but you\'re not sure how to talk about it' },
      { condition: d => d.communication.score > 75 && d.conflict.score > 65,
        zh: '顺畅沟通 + 高张力型',
        en: 'Smooth Communication, High Tension',
        enContrast: 'You understand each other easily — but that clarity sometimes sharpens the conflict' },
      { condition: d => d.longTerm.score > 75,
        zh: '长期潜力优秀型',
        en: 'High Long-Term Potential',
        enContrast: 'You have something built to last — if you both keep choosing it' },
      { condition: d => d.attraction.score > 70 && d.attraction.score < 85,
        zh: '稳定吸引型',
        en: 'Steady Attraction',
        enContrast: 'The attraction is real — not dramatic, just honest' },
      { condition: d => d.conflict.score < 45,
        zh: '高冲突型',
        en: 'High Conflict Pattern',
        enContrast: 'The friction is real — so is the question of whether you can move through it together' },
      { condition: d => d.rhythm.score > 70,
        zh: '节奏同步型',
        en: 'Rhythm-Synchronized',
        enContrast: 'You move at the same pace — without having to think about it' },
    ],
    friendship: [
      { condition: d => d.communication.score > 75,
        zh: '灵魂朋友型',
        en: 'Soulmate Friendship',
        enContrast: 'You get each other without having to explain — that\'s rare' },
      { condition: d => d.rhythm.score > 70,
        zh: '节奏合拍型',
        en: 'Effortless Sync',
        enContrast: 'You can sit in silence and it doesn\'t feel empty' },
      { condition: d => d.attraction.score > 65,
        zh: '相互激励型',
        en: 'Mutual Inspiration',
        enContrast: 'You push each other forward — but at your own pace' },
    ],
    work: [
      { condition: d => d.communication.score > 75,
        zh: '高效协作型',
        en: 'Efficient Collaboration',
        enContrast: 'The trust is there — now it\'s about how you handle the gaps' },
      { condition: d => d.longTerm.score > 70,
        zh: '长期搭档型',
        en: 'Long-Term Partnership',
        enContrast: 'Built for the long haul — if you both stay intentional about it' },
      { condition: d => d.conflict.score > 60,
        zh: '建设性张力型',
        en: 'Constructive Tension',
        enContrast: 'The friction is productive — when you both know how to use it' },
    ],
  };

  const candidates = patterns[relationType] ?? patterns.romantic;
  for (const p of candidates) {
    if (p.condition(dimensions)) {
      // Use enhanced en pattern with contrast
      if (lang === 'en' && p.enContrast) {
        return `${p.en} — ${p.enContrast}`;
      }
      return p[lang] ?? p.en;
    }
  }
  return lang === 'zh' ? '多元互补型' : 'Diversely Complementary — connected, but still figuring out the shape of it';
}

// ─── Summary Generator ─────────────────────────────────────────────────────────

const HERO_DIMENSION_NAMES: Record<keyof RelationshipDimensions, { zh: string; en: string }> = {
  attraction: { zh: '吸引力', en: 'attraction' },
  communication: { zh: '沟通', en: 'communication' },
  conflict: { zh: '冲突修复', en: 'conflict repair' },
  rhythm: { zh: '相处节奏', en: 'relationship rhythm' },
  longTerm: { zh: '长期潜力', en: 'long-term potential' },
};

function getDimensionPriority(dimensions: RelationshipDimensions) {
  const ordered = (Object.entries(dimensions) as Array<[keyof RelationshipDimensions, RelationshipDimensionScore]>)
    .sort(([, left], [, right]) => right.score - left.score);

  return {
    strongestKey: ordered[0][0],
    strongest: ordered[0][1],
    weakestKey: ordered[ordered.length - 1][0],
    weakest: ordered[ordered.length - 1][1],
  };
}

function heroHeadline(
  relationType: RelationshipType,
  pattern: string,
  overallAvg: number,
  lang: 'zh' | 'en',
): string {
  const band = overallAvg > 70 ? 'strong' : overallAvg > 50 ? 'mixed' : 'fragile';

  const copy = {
    zh: {
      romantic: {
        strong: `${pattern}：吸引已经建立，接下来适合把节奏慢慢对齐`,
        mixed: `${pattern}：连接感是真实的，但需要更明确的关系对齐`,
        fragile: `${pattern}：先把期待说清，再决定这段关系要走多深`,
      },
      friendship: {
        strong: `${pattern}：默契基础不错，继续表达会让关系更稳`,
        mixed: `${pattern}：有互补感，但需要更直接地说明彼此需求`,
        fragile: `${pattern}：先建立稳定沟通，再判断这段友情的深度`,
      },
      work: {
        strong: `${pattern}：合作潜力清晰，适合进入更稳定的协作节奏`,
        mixed: `${pattern}：合作可行，但需要先对齐边界与节奏`,
        fragile: `${pattern}：先把责任和预期说清，合作才有机会变顺`,
      },
    },
    en: {
      romantic: {
        strong: `${pattern}: the pull is real, and the next step is steadier alignment`,
        mixed: `${pattern}: the connection is real, but it needs clearer alignment to deepen`,
        fragile: `${pattern}: name expectations early before deciding how deep this bond should go`,
      },
      friendship: {
        strong: `${pattern}: the bond already has ease, and clearer expression can stabilize it further`,
        mixed: `${pattern}: there is promise here, but needs should be named more directly`,
        fragile: `${pattern}: build a steadier communication base before asking this friendship to carry more`,
      },
      work: {
        strong: `${pattern}: the partnership has real upside, and it is ready for steadier collaboration`,
        mixed: `${pattern}: the collaboration can work, but pace and boundaries need clearer alignment`,
        fragile: `${pattern}: define responsibilities and expectations first before asking for smoother execution`,
      },
    },
  } as const;

  return copy[lang][relationType][band];
}

function heroOneLiner(
  dimensions: RelationshipDimensions,
  lang: 'zh' | 'en',
): string {
  const { strongestKey, weakestKey, weakest } = getDimensionPriority(dimensions);
  const strongestName = HERO_DIMENSION_NAMES[strongestKey][lang];
  const weakestName = HERO_DIMENSION_NAMES[weakestKey][lang];
  const nextStep = weakest.advice[0] ?? (lang === 'zh' ? '先把彼此期待说清楚。' : 'Name expectations clearly first.');

  if (lang === 'zh') {
    return `目前最稳的是${strongestName}，最需要照顾的是${weakestName}。下一步建议：${nextStep}`;
  }

  return `Your strongest layer is ${strongestName}, while ${weakestName} needs the most care next. Next move: ${nextStep}`;
}

function generateSummary(
  dimensions: RelationshipDimensions,
  relationType: RelationshipType,
  pattern: string,
  lang: 'zh' | 'en' = 'zh',
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
    headline: heroHeadline(relationType, pattern, overallAvg, lang),
    oneLiner: heroOneLiner(dimensions, lang),
    keywords: [
      scoreLabel('attraction', dimensions.attraction.score, lang),
      scoreLabel('communication', dimensions.communication.score, lang),
      scoreLabel('rhythm', dimensions.rhythm.score, lang),
    ],
  };
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function generateTimeline(
  dimensions: RelationshipDimensions,
  relationType: RelationshipType,
  lang: 'zh' | 'en' = 'zh',
): RelationshipTimeline {
  const phaseZh = dimensions.rhythm.score > 60
    ? '关系稳定发展期'
    : dimensions.conflict.score < 50
      ? '张力磨合期'
      : '初始建立期';
  const phaseEn = dimensions.rhythm.score > 60
    ? 'You\'re in the steady part — the question is what you do with it'
    : dimensions.conflict.score < 50
      ? 'You\'re in the friction — it\'s real, and it\'s telling you something'
      : 'You\'re in the early calibration — pay attention to what\'s working';

  const next30Zh = dimensions.communication.score < 60
    ? '建议进行至少一次深度对话，明确双方期待'
    : '适合共同体验新活动，加深连接';
  const next30En = dimensions.communication.score < 60
    ? 'Have one real conversation this month — not about logistics, about what you actually feel'
    : 'The next 30 days are good for shared experiences. What you do together matters more than what you plan.';

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
  lang: 'zh' | 'en' = 'zh',
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
