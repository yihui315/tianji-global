/**
 * Psychology Fusion Module — TianJi Global
 * Combines Chinese metaphysics (八字/紫微斗数) with Western psychology (Big Five + CBT)
 */

export interface PersonalityTrait {
  name: string;
  score: number; // 1-10
  description: string;
  metaphysicsEquivalent: string;
}

export interface PsychologyProfile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  dominantTrait: string;
}

export interface CBTReframe {
  originalNegative: string;
  reframe: string;
  technique: 'reframing' | 'empowerment' | 'anxiety_reduction';
}

export interface PsychologicalReading {
  combinedProfile: PsychologyProfile;
  cbtInsights: CBTReframe[];
  mentalHealthSafeguard: string;
  adaptedInterpretation: string;
  watermark: string;
}

export interface BaziResult {
  ganZhi: string;
  wuXing: string[];
  shenSha: string[];
  mingGong: string;
  tiYong: { tian: string; di: string };
}

export interface ZiweiResult {
  mingJu: string;
  tianFu: string;
  starList: string[];
  palace: string[];
}

// Big Five ↔ Chinese Metaphysics mapping
const BIG_FIVE_MAPPING = {
  openness: {
    metaphysicsEquivalent: '紫微斗数(机梁配合)',
    description: '创造力、想象力、对新事物的接受度',
    highExpression: '创新变革，敢于突破传统格局',
    lowExpression: '保守稳健，遵循既定规则和经验',
  },
  conscientiousness: {
    metaphysicsEquivalent: '八字(官星格局)',
    description: '责任感、自律性、目标导向',
    highExpression: '事业心强，善于规划，讲究秩序',
    lowExpression: '随性自在，灵活变通，不拘小节',
  },
  extraversion: {
    metaphysicsEquivalent: '命宫(太阳/天机)',
    description: '社交能力、活力、对外互动倾向',
    highExpression: '外向开朗，人脉广阔，喜欢表现',
    lowExpression: '内敛深沉，独立思考，注重内心',
  },
  agreeableness: {
    metaphysicsEquivalent: '福德宫(太阴)',
    description: '合作性、同理心、人际关系质量',
    highExpression: '善解人意，人缘和睦，追求和谐',
    lowExpression: '独立判断，立场坚定，不随波逐流',
  },
  neuroticism: {
    metaphysicsEquivalent: '疾厄宫(火星/铃星)',
    description: '情绪稳定性、抗压能力、焦虑倾向',
    highExpression: '敏感细腻，体验深刻，需注意情绪管理',
    lowExpression: '沉稳冷静，抗压耐挫，心态平和',
  },
};

// CBT prompt templates for fortune reframe
const CBT_PROMPTS = {
  reframe: [
    {
      pattern: '凶|煞|破|孤|克|冲',
      reframeTemplate: '此星曜组合虽显挑战，然危机中蕴含转机。古云「置之死地而后生」，困境往往是成长的契机。建议以积极心态应对，将压力转化为前进动力。',
      technique: 'reframing' as const,
    },
    {
      pattern: '官非|诉讼|口舌',
      reframeTemplate: '沟通上需多加留意，谨言慎行可化解纷争。将此视为磨练心性的机会，以柔克刚，以静制动。',
      technique: 'reframing' as const,
    },
    {
      pattern: '破财|损耗',
      reframeTemplate: '财富有得有失，不必过于执著。此刻的散财可能是化解更大灾厄的象意，或为将来积累人脉与经验。',
      technique: 'reframing' as const,
    },
  ],
  empowerment: [
    '您具备度过任何挑战的内在力量，星曜只是参考，主动权永远在您手中。',
    '命理显示潜力，如何运用取决于您的选择和行动。',
    '每一个挑战都是觉醒的机会，您比您想象的更加坚强。',
  ],
  anxietyReduction: [
    '未来并非固定不变，星曜所示乃趋势走向，您的每一个当下选择都在改变未来。',
    '担忧源于对未知的自然反应，但请相信您有应对变化的能力。',
    '无论星盘显示什么，您都有权利和能力创造自己想要的人生。',
  ],
};

/**
 * Derive a Big Five personality profile from BaZi and Ziwei results
 */
export function derivePersonalityProfile(bazi: BaziResult, ziwei: ZiweiResult): PsychologyProfile {
  let openness = 5;
  let conscientiousness = 5;
  let extraversion = 5;
  let agreeableness = 5;
  let neuroticism = 5;

  // BaZi influences
  const baziLower = bazi.ganZhi.toLowerCase();

  // 八字中官星强 →责任心强
  if (baziLower.includes('官') || bazi.wuXing.includes('金')) {
    conscientiousness += 1;
    neuroticism += 0.5;
  }

  // 八字中食伤旺 →创造力强
  if (baziLower.includes('食') || baziLower.includes('伤')) {
    openness += 1.5;
    extraversion += 0.5;
  }

  // 财星旺 →务实
  if (baziLower.includes('财')) {
    conscientiousness += 0.5;
    agreeableness -= 0.5;
  }

  // 印星旺 →内敛
  if (baziLower.includes('印')) {
    agreeableness += 0.5;
    extraversion -= 0.5;
  }

  // 紫微斗数 influences
  const starList = ziwei.starList.join('');

  // 机梁同宫 →思考型
  if (starList.includes('机') && starList.includes('梁')) {
    openness += 1;
    extraversion -= 0.5;
  }

  // 太阳星在命宫 →外向
  if (starList.includes('太阳') && ziwei.mingJu.includes('命宫')) {
    extraversion += 1;
    agreeableness += 0.5;
  }

  // 太阴在福德宫 →内省
  if (starList.includes('太阴')) {
    neuroticism += 0.5;
    agreeableness += 0.5;
  }

  // 火星/铃星在疾厄宫 →情绪波动
  if ((starList.includes('火') || starList.includes('铃')) && ziwei.mingJu.includes('疾厄')) {
    neuroticism += 1;
  }

  // Clamp values
  openness = Math.max(1, Math.min(10, openness));
  conscientiousness = Math.max(1, Math.min(10, conscientiousness));
  extraversion = Math.max(1, Math.min(10, extraversion));
  agreeableness = Math.max(1, Math.min(10, agreeableness));
  neuroticism = Math.max(1, Math.min(10, neuroticism));

  const traits = [
    { name: 'openness', score: openness },
    { name: 'conscientiousness', score: conscientiousness },
    { name: 'extraversion', score: extraversion },
    { name: 'agreeableness', score: agreeableness },
    { name: 'neuroticism', score: neuroticism },
  ];

  const dominant = traits.reduce((a, b) => (a.score > b.score ? a : b));

  return {
    openness,
    conscientiousness,
    extraversion,
    agreeableness,
    neuroticism,
    dominantTrait: dominant.name,
  };
}

/**
 * Apply CBT reframing to a negative fortune interpretation
 */
export function applyCBTReframe(interpretation: string): CBTReframe[] {
  const results: CBTReframe[] = [];

  for (const prompt of CBT_PROMPTS.reframe) {
    if (new RegExp(prompt.pattern).test(interpretation)) {
      results.push({
        originalNegative: prompt.pattern,
        reframe: prompt.reframeTemplate,
        technique: prompt.technique,
      });
    }
  }

  return results;
}

/**
 * Get a random empowerment prompt
 */
export function getEmpowermentPrompt(): string {
  return CBT_PROMPTS.empowerment[Math.floor(Math.random() * CBT_PROMPTS.empowerment.length)];
}

/**
 * Get a random anxiety reduction prompt
 */
export function getAnxietyReductionPrompt(): string {
  return CBT_PROMPTS.anxietyReduction[
    Math.floor(Math.random() * CBT_PROMPTS.anxietyReduction.length)
  ];
}

/**
 * Combine BaZi + Ziwei results with psychological profile
 */
export function fuseWithPsychology(
  bazi: BaziResult,
  ziwei: ZiweiResult,
  originalInterpretation: string
): PsychologicalReading {
  const profile = derivePersonalityProfile(bazi, ziwei);
  const cbtInsights = applyCBTReframe(originalInterpretation);
  const empowerment = getEmpowermentPrompt();
  const anxietyReduction = getAnxietyReductionPrompt();

  // Build adapted interpretation
  const dominantMapping = BIG_FIVE_MAPPING[profile.dominantTrait as keyof typeof BIG_FIVE_MAPPING];
  const adaptedInterpretation = `[性格融合解读] 您在${dominantMapping.description}方面特征突出（${dominantMapping.metaphysicsEquivalent}）。${originalInterpretation}`;

  const safeguard = `温馨提示：命理解读仅供参考，非医学或心理学诊断。如感到持续情绪困扰，请咨询专业心理健康服务。`;

  return {
    combinedProfile: profile,
    cbtInsights,
    mentalHealthSafeguard: safeguard,
    adaptedInterpretation,
    watermark: getDisclaimer('psychology'),
  };
}

/**
 * Get Big Five description for a specific trait
 */
export function getTraitDescription(trait: keyof typeof BIG_FIVE_MAPPING): {
  description: string;
  highExpression: string;
  lowExpression: string;
  metaphysicsEquivalent: string;
} {
  return BIG_FIVE_MAPPING[trait];
}

/**
 * Get entertainment disclaimer
 */
export function getDisclaimer(type: 'yijing' | 'tarot' | 'bazi' | 'ziwei' | 'psychology'): string {
  const zh = {
    yijing: '【免责声明】易经解读仅供娱乐参考，非人生决策的唯一依据。请理性看待，自行判断。',
    tarot: '【免责声明】塔罗指引仅供娱乐参考，非专业心理或法律建议。',
    bazi: '【免责声明】八字命理仅供娱乐参考，非宿命论断言。人的命运受选择和努力影响。',
    ziwei: '【免责声明】紫微斗数仅供娱乐参考，命运掌握在自己手中。',
    psychology: '【免责声明】心理学融合解读仅供娱乐参考，非专业心理咨询或治疗。如需专业帮助，请咨询资质心理师。',
  };
  return zh[type];
}

/**
 * Check if text contains watermark
 */
export function isWatermarked(text: string): boolean {
  return text.includes('免责声明') || text.includes('ENTERTAINMENT REFERENCE');
}
