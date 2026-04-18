/**
 * Synastry Narrative Templates — TianJi Global
 *
 * Liz Greene-style relationship narrative templates for BaZi and Ziwei synastry.
 * Generates relationship-specific reports from synastry engine output.
 *
 * Structure follows the same 3-layer narrative model as individual reports:
 * - Hook: Imagery opening about the relationship
 * - Body: Compatibility themes, opportunities, challenges
 * - Closure: Empowering forward-looking guidance
 */

import type { BaZiSynastryResult } from '../bazi-synastry-engine';
import type { ZiweiSynastryResult } from '../ziwei-synastry-engine';

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface SynastryNarrativeTheme {
  id: string;
  title: string;
  titleZh: string;
  hook: string;           // Opening imagery about this aspect of the relationship
  body: string[];         // 2-3 paragraphs of interpretation
  opportunities: string[]; // What this aspect enables
  challenges: string[];   // What需要注意
  actions: string[];      // What to do about it
  keyPhrase: string;      // One memorable phrase
}

export interface SynastryNarrativeReport {
  overview: {
    hook: string;         // Opening imagery about the relationship
    coreCompatibility: string; // 2-3 sentence summary
    energySignature: string;  // The overall relationship energy
    relationshipAge?: string; // "新关系" / "老夫老妻" / etc.
  };
  themes: SynastryNarrativeTheme[]; // 2-4 major relationship themes
  compatibilityBreakdown: {
    dayMaster: string;
    stemCompatibility: string;
    branchCompatibility: string;
    tenGodArchetype: string;
  };
  keywords: string[];      // 3-5 relationship keywords
  closure: {
    summary: string;      // 2 sentence relationship summary
    outlook: string;      // Forward-looking empowering statement
    empoweringPhrase: string; // One sentence to take away
    advice: string;        // Concrete action for the next 3 months
  };
}

export interface SynastryComposerConfig {
  system: 'bazi' | 'ziwei' | 'qizheng' | 'western';
  language: 'zh' | 'en';
  depth: 'basic' | 'premium';  // basic = 2 themes, premium = 4 themes
  includeAIEnhancement: boolean;
}

// ─── BaZi synastry → narrative mapping ───────────────────────────────────────

/**
 * Transform BaZi synastry result into a narrative report.
 * Uses Liz Greene-style literary language with archetype imagery.
 */
export function composeBaZiSynastryNarrative(
  result: BaZiSynastryResult,
  config?: Partial<SynastryComposerConfig>
): SynastryNarrativeReport {
  const lang = config?.language ?? 'zh';
  const depth = config?.depth ?? 'basic';
  const themes: SynastryNarrativeTheme[] = [];

  // Theme 1: Day Master compatibility (日主缘分)
  const dmScore = result.dayMaster.score;
  const dmTitle = lang === 'zh' ? '日主之缘' : 'The Day Master Connection';
  const dmHook = lang === 'zh'
    ? `两人日主，一为${result.dayMaster.element1}，一为${result.dayMaster.element2}，如同天地间两种原始能量的相遇。`
    : `The Day Masters — ${result.dayMaster.element1} and ${result.dayMaster.element2} — meet like two primordial energies of the cosmos.`;

  const dmOpportunities: string[] = lang === 'zh' ? [
    `${result.dayMaster.element1}的理性与${result.dayMaster.element2}的感性可形成互补`,
    `在对方不擅长的领域，双方往往能互相填补`,
    `日常相处中，自然形成稳定的能量互补循环`,
  ] : [
    `${result.dayMaster.element1}'s rationality balances ${result.dayMaster.element2}'s emotional depth`,
    `Mutual support in each other's weaker areas`,
    `A natural complementary energy loop forms in daily life`,
  ];

  const dmChallenges: string[] = lang === 'zh' ? [
    `日主${result.dayMaster.relation === 'ke' ? '相克' : result.dayMaster.relation === 'sheng' ? '相生' : '相同'}关系，权力动态需要平衡`,
    `一方可能无意识地试图主导另一方`,
    `核心价值观差异可能在长期相处中显现`,
  ] : [
    `${result.dayMaster.relation} dynamic requires conscious balance of power`,
    `One may unconsciously try to dominate the other`,
    `Core value differences may surface over time`,
  ];

  themes.push({
    id: 'day-master-compatibility',
    title: dmTitle,
    titleZh: '日主之缘',
    hook: dmHook,
    body: [
      result.dayMaster.descriptionZh,
      result.dayMaster.relation === 'same'
        ? '两人日主五行相同，骨子里是同一类人——你们有相似的直觉和反应模式，容易产生共鸣，但也可能在竞争中成为彼此最强劲的对手。'
        : result.dayMaster.relation === 'sheng'
        ? '一方生日主，能量自然流向被生者。这带来一种自然的依赖与支撑关系，但需注意被生一方不要过度依赖。'
        : result.dayMaster.relation === 'ke'
        ? '日主相克是关系中最大的张力来源。但这并非绝对坏事——适度的张力可以推动双方成长，关键是学会正确表达不同意见。'
        : '日主关系复杂，需要具体分析四柱组合。',
    ],
    opportunities: dmOpportunities,
    challenges: dmChallenges,
    actions: lang === 'zh' ? [
      '了解对方的日主五行属性，尊重其本能反应模式',
      '在分歧时提醒自己：差异不等于对错',
      '利用互补领域，主动给予对方支持',
    ] : [
      'Learn each other\'s Day Master element — respect natural instincts',
      'When disagreeing: difference is not the same as wrong',
      'Proactively support each other in complementary areas',
    ],
    keyPhrase: result.dayMaster.descriptionZh.split('。')[0],
  });

  // Theme 2: Pillar-by-pillar relationship (四柱缘分)
  const pillarTitle = lang === 'zh' ? '四柱之合' : 'The Four Pillars Connection';
  const pillarHook = lang === 'zh'
    ? `从年柱到时柱，四对柱子的缘分各不相同——有的柱子一见如故，有的柱子需要时间磨合。`
    : `Across the four pillars — year, month, day, and hour — each pairing tells a different story of connection.`;

  const pillarPairs = result.pillarPairs;
  const bestPillar = [...pillarPairs].sort((a, b) => b.pillarScore - a.pillarScore)[0];
  const worstPillar = [...pillarPairs].sort((a, b) => a.pillarScore - b.pillarScore)[0];

  const pillarOpportunities: string[] = lang === 'zh' ? [
    `${bestPillar.pillar === 'year' ? '年柱' : bestPillar.pillar === 'month' ? '月柱' : bestPillar.pillar === 'day' ? '日柱' : '时柱'}最合，${bestPillar.stem.heMatch ? '天干相合' : `天干${bestPillar.stem.score > 0 ? '相生' : '相克'}`}，${bestPillar.branch.netScore > 0 ? '地支关系吉利' : '地支关系有挑战'}`,
    `${result.stemHeCount}组天干相合，${result.branchSanheCount}组地支三合，${result.branchChongCount}组地支六冲`,
    '合相多则缘分深厚，冲克多则关系波动大',
  ] : [
    `${bestPillar.pillar} pillar is most harmonious — ${bestPillar.stem.heMatch ? 'stem He match' : `stem score ${bestPillar.stem.score}`}`,
    `${result.stemHeCount} stem He matches, ${result.branchSanheCount} Sanhe groups, ${result.branchChongCount} Liu Chong clashes`,
    'More He = deeper connection; more Chong = more turbulence',
  ];

  const pillarChallenges: string[] = lang === 'zh' ? [
    worstPillar.pillar === 'hour'
      ? '时柱缘分较弱，晚年或对子女议题上需多包容'
      : worstPillar.pillar === 'month'
      ? '月柱关系挑战，青年时期或与原生家庭相关的议题上需磨合'
      : worstPillar.pillar === 'year'
      ? '年柱缘分有挑战，祖辈/早年相关的观念差异需调适'
      : '日柱缘分有张力，夫妻/合作关系核心需用心经营',
    `${result.branchChongCount}组六冲存在，关系中会有周期性动荡`,
    '冲克不一定意味着分开，而是需要更多的理解和调适',
  ] : [
    worstPillar.pillar === 'hour'
      ? 'Hour pillar challenge — requires extra accommodation in later life or regarding children'
      : worstPillar.pillar === 'month'
      ? 'Month pillar challenge — related to youth, family-of-origin patterns'
      : worstPillar.pillar === 'year'
      ? 'Year pillar challenge — generational values may differ'
      : 'Day pillar tension — core partnership requires careful cultivation',
    `${result.branchChongCount} Liu Chong pairs — periodic turbulence in the relationship`,
    'Clashes don\'t necessarily mean separation — they call for understanding and adaptation',
  ];

  themes.push({
    id: 'pillar-compatibility',
    title: pillarTitle,
    titleZh: '四柱之合',
    hook: pillarHook,
    body: [
      `天干${result.stemHeCount}合：${pillarPairs.filter(p => p.stem.heMatch).map(p => `${p.pillar === 'year' ? '年' : p.pillar === 'month' ? '月' : p.pillar === 'day' ? '日' : '时'}柱`).join('、')}相合能量最强。`,
      `地支关系：${result.branchHeCount}组吉利组合，${result.branchChongCount}组冲克需要调适。${result.branchXingCount > 0 ? `${result.branchXingCount}组三刑需特别注意口舌是非。` : ''}${result.branchHaiCount > 0 ? `${result.branchHaiCount}组六害表示缘分有暗损。` : ''}`,
      result.tenGodArchetypes[0]
        ? `十神关系以${result.tenGodArchetypes[0].archetypeZh}为主导：${result.tenGodArchetypes[0].descriptionZh}`
        : '十神关系需综合分析。',
    ],
    opportunities: pillarOpportunities,
    challenges: pillarChallenges,
    actions: lang === 'zh' ? [
      '强化最佳柱子（日/月柱）对应的生活领域合作',
      '对最弱柱子对应的领域降低预期，多给空间',
      '冲克出现时主动沟通，不要让误解累积',
    ] : [
      'Strengthen cooperation in the strongest pillar\'s life domains',
      'Lower expectations in weakest pillar areas — give space',
      'When clashes arise, communicate proactively — don\'t let misunderstandings accumulate',
    ],
    keyPhrase: `天干${result.stemHeCount}合，地支${result.branchHeCount}吉${result.branchChongCount}冲`,
  });

  // Theme 3: Love/relationship archetype (姻缘格局) — only for high scores
  if (result.overallScore >= 60) {
    const loveTitle = lang === 'zh' ? '姻缘格局' : 'Relationship Archetype';
    const loveHook = lang === 'zh'
      ? `从八字合盘来看，这段关系具有某种典型格局——它可能是一段互相成就的缘分，也可能是一段需要磨合成长的伴侣之路。`
      : `From the BaZi perspective, this relationship carries a certain archetypal pattern — it may be a destined mutual growth or a partnership requiring conscious effort.`;

    const loveLevel: Record<string, { zh: string; en: string }> = {
      excellent: { zh: '天作之合，百年修得共枕眠', en: 'Heaven-made match — a rare cosmic alignment' },
      good: { zh: '中上缘分，相处融洽，偶有摩擦', en: 'Above average — harmonious with occasional friction' },
      fair: { zh: '中等缘分，需要用心经营才能长久', en: 'Average — requires conscious cultivation for longevity' },
      challenging: { zh: '挑战较大，非不可破，但需格外用心', en: 'Challenging — not impossible, but requires extra care' },
    };

    themes.push({
      id: 'relationship-archetype',
      title: loveTitle,
      titleZh: '姻缘格局',
      hook: loveHook,
      body: [
        `综合评分${result.overallScore}分（${result.compatibilityLevel === 'excellent' ? '极好' : result.compatibilityLevel === 'good' ? '良好' : result.compatibilityLevel === 'fair' ? '一般' : '有挑战'}）：${loveLevel[result.compatibilityLevel].zh}`,
        result.tenGodArchetypes[0]
          ? `关系中的十神主导为「${result.tenGodArchetypes[0].archetypeZh}」：${result.tenGodArchetypes[0].descriptionZh}`
          : '十神关系需综合分析。',
        `天干${result.stemHeCount}合${result.stemHeCount > 0 ? '，为关系提供稳定的命运纽带' : '较少，关系中变动性较大'}。地支${result.branchSanheCount}组三合${result.branchSanheCount > 0 ? '，共同经历会加深缘分' : '，需注意关系中的节奏同步'}。`,
      ],
      opportunities: lang === 'zh' ? [
        '天干合相多者，适合共同创业或长期合作',
        '地支三合多者，适合共同旅行或经历人生大事',
        '十神为正官正财者，婚姻缘分最稳定',
      ] : [
        'Many stem He matches — excellent for joint ventures or long-term partnerships',
        'Many Sanhe matches — deep bonding through shared experiences and travel',
        'Zheng Guan + Zheng Cai dominant — strongest marriage potential',
      ],
      challenges: lang === 'zh' ? [
        '六冲多者，需注意关系的周期性波动',
        '三刑多者，需防口舌是非影响感情',
        '劫财多者，需注意财务边界和情感边界',
      ] : [
        'Many Liu Chong — watch for periodic relationship turbulence',
        'Many San Xing — guard against gossip damaging the bond',
        'Many Jie Cai — clear boundaries needed in finance and emotions',
      ],
      actions: lang === 'zh' ? [
        '大运吉利时推进关系（婚娶/合作），不利时保守经营',
        '流年冲克时减少重大决策，多沟通',
        '每季度回顾关系状态，及时调整相处模式',
      ] : [
        'Advance major decisions (marriage/partnership) during favorable Da Yun',
        'During unfavorable transits: conserve, communicate, avoid major decisions',
        'Quarterly relationship check-ins to adjust patterns early',
      ],
      keyPhrase: result.summaryZh.split('。')[0] || result.adviceZh.split('。')[0],
    });
  }

  // Trim to depth limit
  if (depth === 'basic' && themes.length > 2) {
    themes.splice(2);
  }

  // Compatibility breakdown
  const breakdown = {
    dayMaster: `${result.dayMaster.descriptionZh}（${result.dayMaster.score > 0 ? '吉利' : '有张力'}）`,
    stemCompatibility: `${result.stemHeCount}组天干相合，${result.tenGodArchetypes[0]?.descriptionZh || '十神关系复杂'}`,
    branchCompatibility: `${result.branchHeCount}组吉利地支关系，${result.branchChongCount}组冲克${result.branchChongCount > 2 ? '（需重点调适）' : ''}`,
    tenGodArchetype: result.tenGodArchetypes[0]
      ? `${result.tenGodArchetypes[0].archetypeZh}：${result.tenGodArchetypes[0].descriptionZh}`
      : '十神关系需综合分析',
  };

  // Keywords
  const keywords = [
    ...(result.tenGodArchetypes[0] ? [result.tenGodArchetypes[0].archetypeZh] : []),
    result.dayMaster.relation,
    result.compatibilityLevel === 'excellent' ? '天作之合' : result.compatibilityLevel === 'good' ? '中上缘分' : result.compatibilityLevel === 'fair' ? '磨合成长' : '挑战与机遇并存',
    result.stemHeCount >= 2 ? '天合' : '独立',
    result.branchChongCount > 0 ? '冲与合并存' : '和合',
  ].filter(Boolean) as string[];

  return {
    overview: {
      hook: generateOverviewHook(result, lang),
      coreCompatibility: result.summaryZh || result.summary,
      energySignature: `${result.compatibilityLevel === 'excellent' ? '圆满和谐' : result.compatibilityLevel === 'good' ? '融洽共生' : result.compatibilityLevel === 'fair' ? '互补但需磨合' : '张力中求平衡'}的缘分能量`,
      relationshipAge: result.overallScore >= 75 ? '天赐良缘' : result.overallScore >= 55 ? '上佳姻缘' : '有缘但需经营',
    },
    themes,
    compatibilityBreakdown: breakdown,
    keywords,
    closure: {
      summary: lang === 'zh'
        ? `八字合盘评分${result.overallScore}分，${result.compatibilityLevel === 'excellent' ? '姻缘极配' : result.compatibilityLevel === 'good' ? '缘分上佳' : result.compatibilityLevel === 'fair' ? '缘分一般' : '挑战较大'}。${result.stemHeCount}组天合，${result.branchSanheCount}组三合，${result.branchChongCount}组冲克。`
        : `BaZi synastry score: ${result.overallScore}/100 — ${result.compatibilityLevel}. ${result.stemHeCount} stem He matches, ${result.branchSanheCount} Sanhe, ${result.branchChongCount} clashes.`,
      outlook: lang === 'zh'
        ? result.compatibilityLevel === 'excellent'
          ? '这是难得的良缘，珍惜彼此，在吉利流年推进关系。'
          : result.compatibilityLevel === 'good'
          ? '缘分不错，日常相处中多沟通理解，在流年吉利时加深关系。'
          : result.compatibilityLevel === 'fair'
          ? '关系需要用心经营。多关注对方的五行需求，在重要决策前多商量。'
          : '挑战不小，但不是不能在一起。关键是在不利流年格外小心，多给彼此空间。'
        : result.compatibilityLevel === 'excellent'
        ? 'This is a rare connection — cherish it and advance during favorable transits.'
        : result.compatibilityLevel === 'good'
        ? 'A solid connection — communicate, understand, deepen during favorable years.'
        : result.compatibilityLevel === 'fair'
        ? 'The relationship needs conscious effort — respect each other\'s needs and consult before major decisions.'
        : 'Significant challenges — but not impossible. Be extra cautious during unfavorable transits.',
      empoweringPhrase: result.adviceZh || result.advice,
      advice: lang === 'zh'
        ? `未来3个月：${result.compatibilityLevel === 'excellent' ? '积极推进关系，可考虑订婚或同居' : result.compatibilityLevel === 'good' ? '稳定相处，多共同活动加深了解' : result.compatibilityLevel === 'fair' ? '多沟通少争执，给彼此独立空间' : '减少摩擦，重大决定延后'}。流年注意${result.branchChongCount > 0 ? '防冲克' : '稳中求进'}。`
        : `Next 3 months: ${result.compatibilityLevel === 'excellent' ? 'Actively advance — consider engagement or cohabitation' : result.compatibilityLevel === 'good' ? 'Stable companionship — shared activities deepen bond' : result.compatibilityLevel === 'fair' ? 'More communication, less conflict, respect independence' : 'Reduce friction, postpone major decisions'}. Watch for ${result.branchChongCount > 0 ? 'clash periods' : 'steady progress'}.`,
    },
  };
}

// ─── Ziwei synastry → narrative mapping ─────────────────────────────────────

/**
 * Transform Ziwei synastry result into a narrative report.
 */
export function composeZiweiSynastryNarrative(
  result: ZiweiSynastryResult,
  config?: Partial<SynastryComposerConfig>
): SynastryNarrativeReport {
  const lang = config?.language ?? 'zh';
  const depth = config?.depth ?? 'basic';
  const themes: SynastryNarrativeTheme[] = [];

  // Theme 1: Palace overlay (命宫共振)
  const lpTitle = lang === 'zh' ? '命宫共振' : 'Life Palace Resonance';
  const lpHook = lang === 'zh'
    ? `命宫是紫微斗数的核心所在——两人命宫的对照，是这段关系最重要的能量纽带。`
    : `The Life Palace is the heart of Ziwei Dou Shu — the overlay of two Life Palaces forms the primary energetic bond.`;

  const harmoniousPalaces = result.palaceOverlays.filter(p => p.compatibility === 'harmonious');
  const challengingPalaces = result.palaceOverlays.filter(p => p.compatibility === 'challenging');

  themes.push({
    id: 'life-palace-resonance',
    title: lpTitle,
    titleZh: '命宫共振',
    hook: lpHook,
    body: [
      result.lifePalaceMatch
        ? `两人命宫${result.person1.lifePalaceName === result.person2.lifePalaceName ? `皆为${result.person1.lifePalaceName}，命宫相同，命运轨迹高度共振` : `为${result.person1.lifePalaceName}与${result.person2.lifePalaceName}，各有侧重`}。`
        : `命宫各有不同：${result.person1.lifePalaceName}与${result.person2.lifePalaceName}。`,
      harmoniousPalaces.length > 0
        ? `吉利宫位对照${harmoniousPalaces.length}组：${harmoniousPalaces.map(p => `${p.palace1}配${p.palace2}`).join('、')}，${harmoniousPalaces[0].descriptionZh}`
        : '命宫对照中无明显吉利组合。',
      challengingPalaces.length > 0
        ? `需要注意的宫位对照${challengingPalaces.length}组：${challengingPalaces.map(p => `${p.palace1}配${p.palace2}`).join('、')}，${challengingPalaces[0].descriptionZh}`
        : '无明显凶配宫位对照。',
    ],
    opportunities: lang === 'zh' ? [
      `命宫${result.lifePalaceMatch ? '相同，' : ''}双方人生方向有共鸣`,
      harmoniousPalaces.length >= 2 ? `${harmoniousPalaces.length}组吉利宫配，缘分深厚` : '珍惜已有的吉利宫配',
      '星曜互动良好的领域可以成为关系亮点',
    ] : [
      `${result.lifePalaceMatch ? 'Matching Life Palaces — ' : ''}Shared life direction`,
      harmoniousPalaces.length >= 2 ? `${harmoniousPalaces.length} harmonious palace pairs — deep bond` : 'Cherish existing harmonious connections',
      'Areas of positive star interaction become relationship highlights',
    ],
    challenges: lang === 'zh' ? [
      challengingPalaces.length > 0 ? `${challengingPalaces[0].descriptionZh}` : '命宫关系需持续调适',
      result.person1.bodyPalaceName !== result.person2.bodyPalaceName ? `身宫不同：${result.person1.bodyPalaceName}与${result.person2.bodyPalaceName}，内心追求有差异` : '身宫相同，内心和谐',
      '星曜凶配领域需主动沟通化解',
    ] : [
      challengingPalaces.length > 0 ? `${challengingPalaces[0].descriptionZh}` : 'Life Palace dynamics require ongoing adaptation',
      'Different Body Palaces — distinct inner motivations',
      'Actively communicate through areas of challenging star interactions',
    ],
    actions: lang === 'zh' ? [
      '在吉利宫配领域加深合作（如财帛宫配财帛宫=财务上互相支持）',
      '在凶配宫配领域多加理解（如疾厄宫对冲=健康观念可能冲突）',
      '命宫星曜变化时关注关系走势',
    ] : [
      'Deepen cooperation in harmonious palace domains',
      'Show extra understanding in challenging palace areas',
      'Monitor relationship trends when Life Palace stars transform',
    ],
    keyPhrase: `命宫${result.lifePalaceMatch ? '相同共振' : '各有侧重'}`,
  });

  // Theme 2: Star interactions (星曜对话)
  const starTitle = lang === 'zh' ? '星曜对话' : 'Star Dialogue';
  const positiveStars = result.starCompatibilities.filter(s => s.score >= 6);
  const negativeStars = result.starCompatibilities.filter(s => s.score <= -4);

  themes.push({
    id: 'star-interactions',
    title: starTitle,
    titleZh: '星曜对话',
    hook: lang === 'zh'
      ? `紫微斗数的魅力在于星曜的互动——每一对星曜相遇，都会产生独特的化学反应。`
      : `The magic of Ziwei lies in star interactions — each pairing creates a unique chemistry.`,
    body: [
      positiveStars.length > 0
        ? `吉利星曜互动${positiveStars.length}组：${positiveStars.slice(0, 3).map(s => `${s.star1}与${s.star2}：${s.descriptionZh}`).join('；')}`
        : '星曜互动整体偏中性。',
      negativeStars.length > 0
        ? `需要注意的星曜互动${negativeStars.length}组：${negativeStars.slice(0, 2).map(s => `${s.star1}与${s.star2}：${s.descriptionZh}`).join('；')}`
        : '无明显凶配星曜组合。',
      `四化效应${result.siHuaEffects.length}个，${result.siHuaEffects.filter(e => e.score > 0).length}吉${result.siHuaEffects.filter(e => e.score < 0).length}凶。${result.siHuaEffects[0] ? result.siHuaEffects[0].effectZh : '四化星曜需综合分析。'}`,
    ],
    opportunities: lang === 'zh' ? [
      ...(positiveStars.length > 0 ? [`${positiveStars[0].star1}与${positiveStars[0].star2}的组合：${positiveStars[0].descriptionZh}`] : ['星曜组合整体中性偏吉']),
      result.siHuaEffects.some(e => e.score > 0) ? '四化有吉利效应：财/权/科方面互相增益' : '四化效应需注意方向',
    ] : [
      ...(positiveStars.length > 0 ? [`${positiveStars[0].star1} + ${positiveStars[0].star2}: ${positiveStars[0].descriptionZh}`] : ['Overall neutral-positive star chemistry']),
    ],
    challenges: lang === 'zh' ? [
      ...(negativeStars.length > 0 ? [`${negativeStars[0].star1}与${negativeStars[0].star2}：${negativeStars[0].descriptionZh}`] : ['无明显星曜凶配']),
      result.siHuaEffects.some(e => e.score < 0) ? `四化有不利效应：${result.siHuaEffects.filter(e => e.score < 0)[0].effectZh}` : '四化方向需注意',
    ] : [
      ...(negativeStars.length > 0 ? [`${negativeStars[0].star1} + ${negativeStars[0].star2}: ${negativeStars[0].descriptionZh}`] : ['No significant negative star pairs']),
    ],
    actions: lang === 'zh' ? [
      '发挥吉利星曜组合对应的生活领域',
      '化解星曜凶配：保持开放沟通，不让误会累积',
      '四化星曜流年变化时及时调整相处策略',
    ] : [
      'Leverage favorable star combinations in daily life',
      'Counter negative star dynamics: proactive, open communication',
      'Adjust relationship strategy when SiHua transits change',
    ],
    keyPhrase: `${positiveStars.length}吉${negativeStars.length}星曜配`,
  });

  // Theme 3: Relationship type (姻缘类型) — for premium depth
  if (depth === 'premium' && result.overallScore >= 60) {
    const relTypeTitle = lang === 'zh' ? '姻缘类型' : 'Relationship Type';

    themes.push({
      id: 'relationship-type',
      title: relTypeTitle,
      titleZh: '姻缘类型',
      hook: lang === 'zh'
        ? `从星盘组合来看，这段关系属于某种典型模式——它可能是互相成就的伙伴，也可能是一段充满挑战的成长之路。`
        : `From the star chart combination, this relationship follows a certain archetypal pattern.`,
      body: [
        `综合评分${result.overallScore}分（${result.compatibilityLevel === 'excellent' ? '极好' : result.compatibilityLevel === 'good' ? '良好' : result.compatibilityLevel === 'fair' ? '一般' : '有挑战'}）：${result.summaryZh}`,
        `命宫${result.person1.lifePalaceName}配${result.person2.lifePalaceName}，星曜互动${result.starCompatibilities.filter(s => s.score > 0).length}吉${result.starCompatibilities.filter(s => s.score < 0).length}凶，四化效应${result.siHuaEffects.length}个。`,
        result.adviceZh,
      ],
      opportunities: lang === 'zh' ? [
        '吉利星曜组合对应的生活领域可重点发展',
        '四化有吉利效应时适合共同做重大决策',
        '命宫共振强烈时，适合共同创业或长期合作',
      ] : [
        'Develop life domains aligned with favorable star combinations',
        'Major decisions during positive SiHua transits',
        'Strong Life Palace resonance — excellent for joint ventures',
      ],
      challenges: lang === 'zh' ? [
        '凶配星曜领域需保持沟通',
        '双忌或禄忌冲时防财务和感情双重危机',
        '星曜变动流年需特别注意关系走向',
      ] : [
        'Maintain communication in areas of challenging star interactions',
        'Watch for dual-Ji or Lu-Ji clash periods — financial and emotional risks',
        'Monitor relationship carefully during star transformation transits',
      ],
      actions: lang === 'zh' ? [
        '每半年根据星曜流年调整关系策略',
        '在吉利四化流年推进婚娶/合作',
        '不利流年减少摩擦，多给彼此独立空间',
      ] : [
        'Adjust relationship strategy every 6 months based on star transits',
        'Advance marriage/partnership during favorable SiHua years',
        'During unfavorable transits: reduce friction, give more space',
      ],
      keyPhrase: result.summaryZh.split('。')[0] || result.adviceZh.split('。')[0],
    });
  }

  // Keywords
  const keywords = [
    result.person1.lifePalaceName,
    result.lifePalaceMatch ? '命宫共振' : '命宫互补',
    `${result.starCompatibilities.filter(s => s.score > 0).length}吉星`,
    `${result.starCompatibilities.filter(s => s.score < 0).length}凶星`,
    result.siHuaEffects.length > 0 ? `${result.siHuaEffects[0].effectZh}` : '星曜组合',
  ].filter(Boolean) as string[];

  return {
    overview: {
      hook: generateZiweiOverviewHook(result, lang),
      coreCompatibility: result.summaryZh || result.summary,
      energySignature: `${result.compatibilityLevel === 'excellent' ? '星曜和谐共振' : result.compatibilityLevel === 'good' ? '星曜互动良好' : result.compatibilityLevel === 'fair' ? '星曜关系复杂' : '星曜冲突需化解'}的缘分能量`,
      relationshipAge: result.overallScore >= 75 ? '天赐星缘' : result.overallScore >= 55 ? '上佳星配' : '星曜需调适',
    },
    themes,
    compatibilityBreakdown: {
      dayMaster: `命宫${result.person1.lifePalaceName}配${result.person2.lifePalaceName}${result.lifePalaceMatch ? '（相同）' : ''}`,
      stemCompatibility: `${result.starCompatibilities.filter(s => s.score > 0).length}组吉利星曜互动`,
      branchCompatibility: `${result.palaceOverlays.filter(p => p.compatibility === 'harmonious').length}组吉利宫配，${result.palaceOverlays.filter(p => p.compatibility === 'challenging').length}组凶配`,
      tenGodArchetype: `四化效应${result.siHuaEffects.length}个，${result.siHuaEffects.filter(e => e.score > 0).length}吉${result.siHuaEffects.filter(e => e.score < 0).length}凶`,
    },
    keywords,
    closure: {
      summary: lang === 'zh'
        ? `紫微合盘评分${result.overallScore}分，${result.compatibilityLevel === 'excellent' ? '星曜和谐' : result.compatibilityLevel === 'good' ? '星曜互动良好' : result.compatibilityLevel === 'fair' ? '星曜关系复杂' : '星曜冲突需化解'}。${result.lifePalaceMatch ? '命宫相同' : '命宫不同'}，${harmoniousPalaces.length}组吉配，${challengingPalaces.length}组凶配。`
        : `Ziwei synastry: ${result.overallScore}/100 — ${result.compatibilityLevel}.`,
      outlook: result.adviceZh || result.advice,
      empoweringPhrase: result.adviceZh || result.advice,
      advice: lang === 'zh'
        ? `未来3个月：${result.compatibilityLevel === 'excellent' ? '积极推进关系发展' : result.compatibilityLevel === 'good' ? '稳定相处，巩固现有关系' : result.compatibilityLevel === 'fair' ? '多沟通，理解对方的星曜性格' : '减少摩擦，注意星曜流年变化'}` +
          `。注意${challengingPalaces.length > 0 ? challengingPalaces[0].palace1 + '宫配关系' : '整体稳定'}。`
        : `Next 3 months: ${result.compatibilityLevel === 'excellent' ? 'Actively develop the relationship' : result.compatibilityLevel === 'good' ? 'Stabilize and consolidate' : result.compatibilityLevel === 'fair' ? 'Communicate more, understand star-based personalities' : 'Reduce friction, watch star transits'}.`,
    },
  };
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function generateOverviewHook(result: BaZiSynastryResult, lang: 'zh' | 'en'): string {
  if (lang === 'zh') {
    const hooks: Record<string, string> = {
      excellent: `如同两颗星辰在宇宙中找到了彼此的轨道——${result.dayMaster.element1}与${result.dayMaster.element2}的相遇，是五行世界里罕见的和谐共振。`,
      good: `${result.dayMaster.element1}与${result.dayMaster.element2}的相遇，如同两条河流在某个渡口汇合——有共同的流向，也各有支线的风景。`,
      fair: `${result.dayMaster.element1}与${result.dayMaster.element2}在一起，像是水与火的世界——需要容器来盛放，才能相安无事。`,
      challenging: `${result.dayMaster.element1}与${result.dayMaster.element2}的关系，是一场持续的对话与谈判——不是所有差异都能化解，但正是这些张力塑造了独特的伴侣关系。`,
    };
    return hooks[result.compatibilityLevel] ?? hooks.fair;
  }

  const hooks: Record<string, string> = {
    excellent: `Like two stars finding each other's orbit — the meeting of ${result.dayMaster.element1} and ${result.dayMaster.element2} is a rare cosmic resonance in the world of Five Elements.`,
    good: `The encounter of ${result.dayMaster.element1} and ${result.dayMaster.element2} is like two rivers meeting at a ford — common direction with scenic tributaries along the way.`,
    fair: `The pairing of ${result.dayMaster.element1} and ${result.dayMaster.element2} is like fire and water — they need the right vessel to coexist peacefully.`,
    challenging: `The relationship between ${result.dayMaster.element1} and ${result.dayMaster.element2} is a continuous dialogue and negotiation — not all differences can be resolved, but it's precisely these tensions that shape a unique partnership.`,
  };
  return hooks[result.compatibilityLevel] ?? hooks.fair;
}

function generateZiweiOverviewHook(result: ZiweiSynastryResult, lang: 'zh' | 'en'): string {
  const lifePalace = result.person1.lifePalaceName;
  if (lang === 'zh') {
    const hooks: Record<string, string> = {
      excellent: `两命${lifePalace}的相遇，如同宇宙中两颗同频共振的星辰——这是紫微斗数中最难得的天作之合。`,
      good: `${result.person1.lifePalaceName}与${result.person2.lifePalaceName}的命宫组合，如同日月交辉——各有光芒，互相照耀。`,
      fair: `${result.person1.lifePalaceName}与${result.person2.lifePalaceName}命宫关系复杂，如同星海中的两艘船——有交集也有各自的航向。`,
      challenging: `两人的命宫如同两颗距离遥远的星辰——各自闪耀，要走到一起需要跨越重重星海。`,
    };
    return hooks[result.compatibilityLevel] ?? hooks.fair;
  }

  const hooks: Record<string, string> = {
    excellent: `Two souls both in ${lifePalace} meeting — like two stars in perfect cosmic resonance. This is the rarest of Ziwei combinations.`,
    good: `${result.person1.lifePalaceName} meets ${result.person2.lifePalaceName} — like sun and moon in mutual illumination, each shining its own light.`,
    fair: `${result.person1.lifePalaceName} and ${result.person2.lifePalaceName} — like two ships in the star-sea, crossing paths with their own separate courses.`,
    challenging: `Two Life Palaces far apart — each shining in its own domain, crossing the cosmic sea to be together requires extra effort.`,
  };
  return hooks[result.compatibilityLevel] ?? hooks.fair;
}

// ─── Unified entry point ──────────────────────────────────────────────────────

export type SynastryResult = BaZiSynastryResult | ZiweiSynastryResult;

export function composeSynastryNarrative(
  result: SynastryResult,
  config?: Partial<SynastryComposerConfig>
): SynastryNarrativeReport {
  if ('dayMaster' in result) {
    return composeBaZiSynastryNarrative(result, config);
  } else if ('palaceOverlays' in result) {
    return composeZiweiSynastryNarrative(result, config);
  } else {
    throw new Error(`Unknown synastry result type: ${JSON.stringify(result)}`);
  }
}
