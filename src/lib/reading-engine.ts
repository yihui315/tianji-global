// ─── Reading Engine — AI Data Generation ─────────────────────────────────────
// Generates structured reading data from birth inputs using rule-based analysis
// (can be replaced with LLM calls for AI-powered insights)

import type {
  Reading, ReadingSummary, ReadingInsights, ReadingApplications,
  ReadingTimeline, ReadingActions, ElementScores, TimelinePhase,
  ApplicationModule, ReadingType, Language, WesternChartData,
} from '@/types/reading';
import { ZODIAC_DATA, ELEMENTS, ELEM_COLORS_ZH, PLANET_LIST } from './chart-engine';

// ─── Sign Interpretations ─────────────────────────────────────────────────────

const SIGN_KEYWORDS: Record<string, { zh: string[]; en: string[] }> = {
  Aries: { zh: ['开创者', '行动派', '先驱', '勇气型'], en: ['Pioneer', 'Action-Oriented', 'Leader', 'Brave'] },
  Taurus: { zh: ['稳定者', '享受型', '积累者', '务实型'], en: ['Stabilizer', 'Pleasure-Seeker', 'Builder', 'Practical'] },
  Gemini: { zh: ['沟通者', '好奇型', '多变者', '智识型'], en: ['Communicator', 'Curious', 'Versatile', 'Intellectual'] },
  Cancer: { zh: ['守护者', '敏感型', '情感型', '直觉型'], en: ['Nurturer', 'Sensitive', 'Emotional', 'Intuitive'] },
  Leo: { zh: ['表演者', '自信型', '创造者', '慷慨型'], en: ['Performer', 'Confident', 'Creative', 'Generous'] },
  Virgo: { zh: ['分析者', '完美型', '服务者', '务实型'], en: ['Analyst', 'Perfectionist', 'Helper', 'Detail-Oriented'] },
  Libra: { zh: ['平衡者', '和谐型', '外交型', '审美型'], en: ['Balancer', 'Harmonizer', 'Diplomat', 'Aesthetic'] },
  Scorpio: { zh: ['探索者', '深刻型', '变革者', '洞察型'], en: ['Explorer', 'Intense', 'Transformer', 'Perceptive'] },
  Sagittarius: { zh: ['冒险者', '自由型', '探索者', '乐观型'], en: ['Adventurer', 'Freedom-Seeker', 'Explorer', 'Optimistic'] },
  Capricorn: { zh: ['攀登者', '成就型', '自律者', '野心型'], en: ['Climber', 'Achiever', 'Disciplined', 'Ambitious'] },
  Aquarius: { zh: ['创新者', '独特型', '博爱者', '理想型'], en: ['Innovator', 'Unique', 'Humanitarian', 'Visionary'] },
  Pisces: { zh: ['梦想家', '感受型', '超越者', '艺术型'], en: ['Dreamer', 'Feeler', 'Transcender', 'Artistic'] },
};

const SIGN_SUMMARIES: Record<string, { zh: string; en: string }> = {
  Aries: { zh: '你是人生的先驱者，喜欢走在前面，不畏惧第一个尝试。你的能量是向前的、爆发式的。', en: 'You are a pioneer who leads from the front, never afraid to try first. Your energy is forward-moving and explosive.' },
  Taurus: { zh: '你是大地的孩子，追求稳定与舒适，相信积累的力量。你的耐心是最大的武器。', en: 'You are a child of the earth, seeking stability and comfort. Your patience is your greatest weapon.' },
  Gemini: { zh: '你是信息的编织者，思维敏捷，总能同时处理多条线索。你的好奇心永不停歇。', en: 'You are an information weaver with sharp intellect, always juggling multiple threads. Your curiosity never stops.' },
  Cancer: { zh: '你是情感的守护者，直觉敏锐，深深理解他人的感受。你的敏感是一种强大的共情力。', en: 'You are an emotional guardian with sharp intuition and deep empathy for others. Your sensitivity is a powerful gift.' },
  Leo: { zh: '你是舞台的主角，自带光芒，相信自己有能力改变世界。你的自信有感染力。', en: 'You are the star of the show, radiating confidence and believing you can change the world. Your self-belief is infectious.' },
  Virgo: { zh: '你是完美的工匠，用分析和细节把世界变得更美好。你的挑剔源于对卓越的追求。', en: 'You are a craftsman of perfection who makes the world better through analysis and detail. Your pickiness stems from pursuit of excellence.' },
  Libra: { zh: '你是关系的艺术家，追求和谐与美感，相信最好的答案是平衡出来的。', en: 'You are an artist of relationships who seeks harmony and beauty, believing the best answers come from balance.' },
  Scorpio: { zh: '你是深海的探索者，看透表象，直击本质。你的深刻让你拥有强大的转化力。', en: 'You are an explorer of the deep who sees through surface to essence. Your depth gives you powerful transformative ability.' },
  Sagittarius: { zh: '你是自由的追寻者，乐观地相信诗和远方一定存在。你的信念是最强大的导航。', en: 'You are a seeker of freedom who optimistically believes in distant horizons. Your faith is your greatest navigator.' },
  Capricorn: { zh: '你是巅峰的攀登者，相信成功靠一步一步积累。你的韧性可以征服任何高山。', en: 'You are a climber of peaks who believes success comes from step-by-step accumulation. Your resilience can conquer any mountain.' },
  Aquarius: { zh: '你是未来的思想家，总在思考下一个可能性。你的独特来自于你不随波逐流。', en: 'You are a thinker of the future always exploring next possibilities. Your uniqueness comes from your refusal to follow the crowd.' },
  Pisces: { zh: '你是灵性的诗人，感受着世界的每一个脉动。你的敏感让你连接到了更深的存在。', en: 'You are a spiritual poet feeling every pulse of the world. Your sensitivity connects you to something deeper.' },
};

const CAREER_TIPS: Record<string, { zh: string[]; en: string[] }> = {
  Fire: { zh: ['开创性工作', '领导岗位', '销售/创业', '体育/竞技'], en: ['Pioneering work', 'Leadership roles', 'Sales/Entrepreneurship', 'Sports/Competition'] },
  Earth: { zh: ['稳定积累型', '财务/投资', '建筑/设计', '农业/自然资源'], en: ['Stable accumulation', 'Finance/Investment', 'Architecture/Design', 'Agriculture/Natural Resources'] },
  Air: { zh: ['沟通协作型', '媒体/教育', '法律/外交', '咨询/技术'], en: ['Communication/Collaboration', 'Media/Education', 'Law/Diplomacy', 'Consulting/Tech'] },
  Water: { zh: ['深度服务型', '医疗/心理', '艺术/创意', '灵性/疗愈'], en: ['Deep service', 'Healthcare/Psychology', 'Art/Creativity', 'Spiritual/Healing'] },
};

const RISK_TIPS: Record<string, { zh: string[]; en: string[] }> = {
  Fire: { zh: ['冲动决策', '过度竞争', '耐心不足'], en: ['Impulsive decisions', 'Excessive competition', 'Lack of patience'] },
  Earth: { zh: ['过度保守', '抗拒变化', '执着物质'], en: ['Overly cautious', 'Resistance to change', 'Material attachment'] },
  Air: { zh: ['想法飘忽', '浅尝辄止', '过度理性'], en: ['Scattered thinking', 'Shallow engagement', 'Over-intellectualizing'] },
  Water: { zh: ['情绪波动', '边界模糊', '逃避现实'], en: ['Emotional volatility', 'Blurred boundaries', 'Escapism'] },
};

const LOVE_TIPS: Record<string, { zh: string[]; en: string[] }> = {
  Fire: { zh: ['主动表达情感', '避免一言堂', '给伴侣空间'], en: ['Express emotions actively', 'Avoid being dominating', 'Give partner space'] },
  Earth: { zh: ['打破情感惯性', '接受小惊喜', '表达感激'], en: ['Break emotional routines', 'Accept small surprises', 'Express gratitude'] },
  Air: { zh: ['深入对话而非表面', '固定见面频率', '减少理性分析'], en: ['Deep conversations over small talk', 'Maintain consistent contact', 'Reduce over-analysis'] },
  Water: { zh: ['设立健康边界', '不过度付出', '保持独立生活'], en: ['Set healthy boundaries', 'Don\'t over-give', 'Maintain independent life'] },
};

const WEALTH_TIPS: Record<string, { zh: string[]; en: string[] }> = {
  Fire: { zh: ['冒险前设止损', '多元化投资', '关注长期'], en: ['Set stop-loss before risks', 'Diversify investments', 'Focus on long-term'] },
  Earth: { zh: ['强制储蓄计划', '稳健理财', '耐心等待'], en: ['Automated savings plan', 'Stable investments', 'Patience pays'] },
  Air: { zh: ['不要只看收益率', '分散配置', '定期复盘'], en: ['Don\'t chase returns only', 'Diversify portfolio', 'Regular review'] },
  Water: { zh: ['建立应急基金', '避免情绪化投资', '控制消费'], en: ['Build emergency fund', 'Avoid emotional investing', 'Control spending'] },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getElement(sign: string): string {
  const signData = ZODIAC_DATA.find(s => s.name === sign);
  return signData?.element ?? 'Fire';
}

export function computeElementsFromPlanets(planets: { name: string; sign: string }[]): ElementScores {
  const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
  const counts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const elemMap: Record<string, keyof ElementScores> = { Fire: 'fire', Earth: 'earth', Air: 'metal', Water: 'water' };

  planets.filter(p => personalPlanets.includes(p.name)).forEach(p => {
    const el = getElement(p.sign);
    const key = elemMap[el];
    if (key) counts[key]++;
  });

  // Add wood from remaining calculation
  const total = Object.values(counts).reduce((a, b) => a + b, 1);
  // Normalize to 100
  const raw = { wood: 15, fire: counts.fire, earth: counts.earth, metal: counts.metal, water: counts.water };
  const rawTotal = Object.values(raw).reduce((a, b) => a + b, 0);
  return {
    wood: Math.round(raw.wood / rawTotal * 100),
    fire: Math.round(raw.fire / rawTotal * 100),
    earth: Math.round(raw.earth / rawTotal * 100),
    metal: Math.round(raw.metal / rawTotal * 100),
    water: Math.round(raw.water / rawTotal * 100),
  };
}

export function computeKeywords(bigThree: { sun: { sign: string }; moon: { sign: string }; rising: { sign: string } }, lang: Language): string[] {
  const sunK = SIGN_KEYWORDS[bigThree.sun.sign]?.[lang] ?? [];
  const moonK = SIGN_KEYWORDS[bigThree.moon.sign]?.[lang] ?? [];
  const risingK = SIGN_KEYWORDS[bigThree.rising.sign]?.[lang] ?? [];
  const combined = [...sunK, ...moonK.slice(0, 2), ...risingK.slice(0, 1)];
  return [...new Set(combined)].slice(0, 5);
}

export function computeLifeCurve(birthYear: number) {
  const now = new Date().getFullYear();
  const age = now - birthYear;
  const phases = [
    { start: 18, end: 25, base: 45, label: age < 25 ? '当前' : '', labelZh: '探索期', labelEn: 'Exploration' },
    { start: 25, end: 32, base: 58, label: age >= 25 && age < 32 ? '当前' : '', labelZh: '定位期', labelEn: 'Positioning' },
    { start: 32, end: 40, base: 72, label: age >= 32 && age < 40 ? '当前' : '', labelZh: '上升期', labelEn: 'Growth' },
    { start: 40, end: 48, base: 80, label: age >= 40 && age < 48 ? '当前' : '', labelZh: '稳定期', labelEn: 'Stabilization' },
    { start: 48, end: 55, base: 75, label: age >= 48 && age < 55 ? '当前' : '', labelZh: '深化期', labelEn: 'Deepening' },
    { start: 55, end: 65, base: 82, label: age >= 55 && age < 65 ? '当前' : '', labelZh: '收获期', labelEn: 'Harvest' },
    { start: 65, end: 75, base: 78, label: age >= 65 ? '当前' : '', labelZh: '传承期', labelEn: 'Legacy' },
  ];
  return phases.map(p => ({
    ageRange: `${p.start}-${p.end}`,
    labelZh: p.labelZh,
    label: p.labelZh,
    labelEn: p.labelEn,
    isCurrent: p.label === '当前',
    overall: Math.min(95, Math.max(25, p.base + Math.floor((age % 10) * 1.5 - 7))),
    career: Math.min(95, Math.max(25, p.base - 5 + Math.floor((age % 10) * 1.2 - 5))),
    love: Math.min(95, Math.max(25, p.base + Math.floor((age % 10) * 1.5 - 5))),
    wealth: Math.min(95, Math.max(25, p.base + Math.floor((age % 10) * 1 - 3))),
    health: Math.min(95, Math.max(30, 82 + Math.floor((age % 10) * 0.8 - 4))),
  }));
}

// ─── Summary Generation ───────────────────────────────────────────────────────

export function generateSummary(
  bigThree: { sun: { sign: string; signZh: string } },
  keywords: string[],
  lang: Language
): ReadingSummary {
  const headline = lang === 'zh'
    ? SIGN_SUMMARIES[bigThree.sun.sign]?.zh ?? '你拥有独特的人生结构'
    : SIGN_SUMMARIES[bigThree.sun.sign]?.en ?? 'You have a unique life structure';

  return {
    keywords,
    headline,
    tagline: lang === 'zh'
      ? `太阳${bigThree.sun.signZh}座 · 独特生命格局`
      : `Sun in ${bigThree.sun.sign} · Unique Life Pattern`,
  };
}

// ─── Insights Generation ───────────────────────────────────────────────────────

export function generateInsights(
  bigThree: { sun: { sign: string; signZh: string }; moon: { sign: string; signZh: string }; rising: { sign: string; signZh: string } },
  elements: ElementScores,
  lang: Language
): ReadingInsights {
  const sunEl = getElement(bigThree.sun.sign);
  const moonEl = getElement(bigThree.moon.sign);
  const risingEl = getElement(bigThree.rising.sign);

  const structure = lang === 'zh'
    ? `你的太阳落在${bigThree.sun.signZh}座（${sunEl}元素），月亮落在${bigThree.moon.signZh}座（${moonEl}元素），上升${bigThree.rising.signZh}座（${risingEl}元素）。这种组合意味着你在外部世界中表现出${SIGN_KEYWORDS[bigThree.sun.sign].zh[0]}的特质，情感层面则倾向于${SIGN_KEYWORDS[bigThree.moon.sign].zh[0]}的内在模式。`
    : `Your Sun in ${bigThree.sun.sign} (${sunEl}) gives you a ${SIGN_KEYWORDS[bigThree.sun.sign].en[0].toLowerCase()} outer expression. Your Moon in ${bigThree.moon.sign} (${moonEl}) shapes your emotional inner world as ${SIGN_KEYWORDS[bigThree.moon.sign].en[0].toLowerCase()}.`;

  const relationship = lang === 'zh'
    ? `你的上升${bigThree.rising.signZh}座赋予你在关系中的独特表达方式。你倾向于被${SIGN_KEYWORDS[bigThree.rising.sign].zh[1] || SIGN_KEYWORDS[bigThree.rising.sign].zh[0]}的伴侣吸引，在亲密关系中需要保持一定程度的独立空间。${LOVE_TIPS[moonEl].zh.slice(0, 2).join('，')}将有助于你建立更健康的关系模式。`
    : `Your Ascendant in ${bigThree.rising.sign} shapes how you appear in relationships. You gravitate toward partners who are ${SIGN_KEYWORDS[bigThree.rising.sign].en[1]?.toLowerCase() || SIGN_KEYWORDS[bigThree.rising.sign].en[0].toLowerCase()}. ${LOVE_TIPS[moonEl].en.slice(0, 2).join('. ')} will help you build healthier relationship patterns.`;

  const career = lang === 'zh'
    ? `最适合你的事业方向围绕${sunEl}能量的表达：${CAREER_TIPS[sunEl].zh.slice(0, 3).join('、')}。你的上升座暗示你在公共形象和外在表达上有独特天赋。${moonEl === 'Water' ? '适合深度研究型工作' : moonEl === 'Fire' ? '适合需要热情和行动力的岗位' : '适合需要耐心积累的方向'}，善用这一优势可以加速职业发展。`
    : `Your ideal career path revolves around expressing ${sunEl} energy: ${CAREER_TIPS[sunEl].en.slice(0, 3).join(', ')}. Your Ascendant suggests a unique talent for public expression. ${moonEl === 'Water' ? 'Deep research-oriented work suits you' : moonEl === 'Fire' ? 'Roles requiring passion and action suit you' : 'Patience-building careers work well for you'}.`;

  const risk = lang === 'zh'
    ? `需要注意的是：${sunEl}能量若过度发挥，可能导致${RISK_TIPS[sunEl].zh.slice(0, 2).join('或')}。建议在重要决策前给自己留出冷静思考的空间，${moonEl === 'Water' ? '特别是在情绪激动时避免做重大决定' : '特别是避免被外部压力推着走'}。`
    : `Watch out for: ${RISK_TIPS[sunEl].en.slice(0, 2).join(' or ')} if your ${sunEl} energy is over-expressed. Give yourself space for calm reflection before major decisions, ${moonEl === 'Water' ? 'especially when emotionally heightened' : 'especially when pushed by external pressure'}.`;

  return { structure, relationship, career, risk };
}

// ─── Applications Generation ──────────────────────────────────────────────────

export function generateApplications(
  bigThree: { sun: { sign: string }; moon: { sign: string } },
  elements: ElementScores,
  birthYear: number,
  lang: Language
): ReadingApplications {
  const sunEl = getElement(bigThree.sun.sign);
  const now = new Date().getFullYear();
  const age = now - birthYear;
  const lifePhase = age < 30 ? 'early' : age < 45 ? 'mid' : 'late';

  const loveCurrent = lang === 'zh'
    ? `你目前在感情中表现出${SIGN_KEYWORDS[bigThree.moon.sign].zh[0]}的特质，${lifePhase === 'early' ? '还在探索适合自己的关系模式' : lifePhase === 'mid' ? '感情观逐渐成熟，开始重视深层连接' : '感情趋于稳定，关注陪伴质量'}。`
    : `You currently show ${SIGN_KEYWORDS[bigThree.moon.sign].en[0].toLowerCase()} qualities in relationships, ${lifePhase === 'early' ? 'still exploring what works for you' : lifePhase === 'mid' ? 'your view of relationships is maturing, beginning to value deep connection' : 'relationships are stabilizing, focusing on quality of companionship'}.`;

  const loveTrend = lang === 'zh'
    ? `未来两年感情能量${lifePhase === 'early' ? '上升，有遇到志趣相投者的机遇' : lifePhase === 'mid' ? '进入深化期，面临承诺关键节点' : '稳定期，适合巩固现有关系'}。木星过境将带来拓展视野的机会。`
    : `Romantic energy ${lifePhase === 'early' ? 'rises over the next two years, with opportunities to meet like-minded people' : lifePhase === 'mid' ? 'enters a deepening phase with a key commitment point' : 'stabilizes, good for consolidating existing relationships'}. Jupiter transit brings opportunities to broaden perspectives.`;

  const careerCurrent = lang === 'zh'
    ? `职业能量正在${lifePhase === 'early' ? '启动期，适合多尝试不同方向' : lifePhase === 'mid' ? '上升期，专业能力被认可' : '收获期，积累开始转化为成果'}。`
    : `Career energy is ${lifePhase === 'early' ? 'in a startup phase, good for exploring different directions' : lifePhase === 'mid' ? 'in an upswing, professional abilities being recognized' : 'in a harvest phase, accumulation converting to results'}.`;

  const careerTrend = lang === 'zh'
    ? `${lifePhase === 'early' ? '30岁左右有事业方向的关键定位点' : lifePhase === 'mid' ? '40岁左右有晋升或转型机遇' : '55岁前后是传承与回顾的时期'}，建议提前规划。`
    : `${lifePhase === 'early' ? 'Around 30 there is a key positioning point for career direction' : lifePhase === 'mid' ? 'Around 40 there are promotion or transition opportunities' : 'Around 55 is a time for legacy and reflection'}. Plan ahead.`;

  const wealthCurrent = lang === 'zh'
    ? `财务状况${lifePhase === 'early' ? '建立期，重点是养成储蓄习惯' : lifePhase === 'mid' ? '积累期，收入有望稳步增长' : '巩固期，资产配置优化关键'}。`
    : `Financial situation ${lifePhase === 'early' ? 'is in a building phase, focus on developing savings habits' : lifePhase === 'mid' ? 'is in an accumulation phase, income expected to grow steadily' : 'is in a consolidation phase, asset allocation optimization key'}.`;

  const wealthTrend = lang === 'zh'
    ? `${sunEl === 'Fire' ? '你的火元素特质意味着有机会通过主动行动获得较大收益，但也需要注意风险控制' : sunEl === 'Earth' ? '稳健的土元素能量带来持续积累，耐心是你最大的财富优势' : sunEl === 'Air' ? '风元素能量带来财务上的灵活性，但也需要避免分散投资' : '水元素能量适合长期投资规划，直觉有时能帮你抓住机会'}` : `Your ${sunEl} energy ${sunEl === 'Fire' ? 'means opportunities for significant gains through proactive action, but risk control is needed' : sunEl === 'Earth' ? 'brings steady accumulation, patience is your greatest wealth advantage' : sunEl === 'Air' ? 'brings financial flexibility but also the need to avoid scattered investments' : 'suits long-term investment planning, intuition sometimes helps you seize opportunities'}.`;

  return {
    love: {
      current: loveCurrent,
      trend: loveTrend,
      advice: lang === 'zh' ? LOVE_TIPS[sunEl].zh : LOVE_TIPS[sunEl].en,
    },
    career: {
      current: careerCurrent,
      trend: careerTrend,
      advice: lang === 'zh' ? CAREER_TIPS[sunEl].zh.slice(0, 3) : CAREER_TIPS[sunEl].en.slice(0, 3),
    },
    wealth: {
      current: wealthCurrent,
      trend: wealthTrend,
      advice: lang === 'zh' ? WEALTH_TIPS[sunEl].zh : WEALTH_TIPS[sunEl].en,
    },
  };
}

// ─── Timeline Generation ──────────────────────────────────────────────────────

export function generateTimeline(birthYear: number, bigThree: { sun: { sign: string } }, lang: Language): ReadingTimeline {
  const sunEl = getElement(bigThree.sun.sign);
  const phases = computeLifeCurve(birthYear);

  const phaseDescriptions: Record<string, { zh: string; en: string }> = {
    '18-25': {
      zh: `${sunEl === 'Fire' ? '这是你能量最为充沛的时期，适合大胆尝试、快速迭代。' : sunEl === 'Earth' ? '这是你积累基础的关键期，稳健的小步快跑比冒险更重要。' : sunEl === 'Air' ? '这是拓展视野、建立多元人脉的黄金期，多接触不同领域。' : '这是深化内在认知的时期，适当的独处和反思会带来更大突破。'}感情上可能出现重要经历，财务上建议开始建立储蓄习惯。`,
      en: `${sunEl === 'Fire' ? 'This is your most energetic period, good for bold experiments and rapid iteration.' : sunEl === 'Earth' ? 'This is a key period for building foundations. Steady progress matters more than big risks.' : sunEl === 'Air' ? 'This is the golden period for broadening horizons and building diverse connections.' : 'This is a period for deepening inner awareness. Some solitude and reflection will bring breakthroughs.'} Important romantic experiences may occur. Financially, start building savings habits.`,
    },
    '25-32': {
      zh: `事业方向逐渐清晰，你开始找到自己的核心竞争优势。感情上从探索走向深化，可能面临承诺的课题。财务上收入有望提升，建议开始学习投资。`,
      en: `Career direction gradually becomes clear as you find your core competitive advantage. In love, you move from exploration to deepening, possibly facing commitment questions. Income may rise financially. Start learning about investing.`,
    },
    '32-40': {
      zh: `这是人生最关键的上升期之一。你前期的积累开始发挥作用，社会认可度显著提升。需要注意工作与生活的平衡，以及感情关系中的深度沟通。`,
      en: `This is one of the most critical growth periods. Your earlier accumulation begins to pay off with significantly increased social recognition. Pay attention to work-life balance and deep communication in relationships.`,
    },
    '40-48': {
      zh: `人生进入稳定成熟期。你对自己和世界的认知更加深刻，开始追求更有意义的目标。财务上可能出现较大跃升，但也需要注意风险管理。`,
      en: `Life enters a stable, mature phase. Your understanding of yourself and the world deepens, beginning to pursue more meaningful goals. A significant financial leap may occur, but also be mindful of risk management.`,
    },
    '48-55': {
      zh: `这是深化和整合的时期。你开始回顾和整合前半生的经历与智慧，可能出现事业转型或个人觉醒。感情关系进入更成熟的陪伴阶段。`,
      en: `This is a period of deepening and integration. You begin to review and integrate experiences and wisdom from the first half of life. Career transition or personal awakening may occur. Romantic relationships enter a more mature companionship phase.`,
    },
    '55-65': {
      zh: `收获与传承成为主旋律。你的经验和智慧开始传递给下一代或更广泛的社区。财务上相对稳定，可以考虑更具战略性的财富规划。`,
      en: `Harvest and legacy become the main themes. Your experience and wisdom begin passing to the next generation or broader community. Financially relatively stable, consider more strategic wealth planning.`,
    },
    '65-75': {
      zh: `这是人生智慧充分释放的时期。你可以选择继续贡献价值，也可以转向内在的平和与满足。保持身心健康是这一阶段最重要的事。`,
      en: `This is a period when life wisdom is fully released. You can choose to continue contributing value or turn toward inner peace and satisfaction. Maintaining physical and mental health is the most important thing at this stage.`,
    },
  };

  return {
    phases: phases.map(p => ({
      ageRange: p.ageRange,
      label: p.labelZh,
      labelEn: p.labelEn,
      isCurrent: p.isCurrent,
      summary: lang === 'zh'
        ? `${p.labelZh}，综合运势${p.overall}/100`
        : `${p.labelEn}, Overall fortune ${p.overall}/100`,
      description: phaseDescriptions[p.ageRange]?.[lang] ?? (lang === 'zh' ? '这是人生的重要阶段。' : 'This is an important life phase.'),
      overall: p.overall,
      career: p.career,
      love: p.love,
      wealth: p.wealth,
      health: p.health,
    })),
    currentPhase: phases.findIndex(p => p.isCurrent),
  };
}

// ─── Actions Generation ───────────────────────────────────────────────────────

export function generateActions(bigThree: { sun: { sign: string }; moon: { sign: string } }, lang: Language): ReadingActions {
  const sunEl = getElement(bigThree.sun.sign);
  const moonEl = getElement(bigThree.moon.sign);

  const doActions: Record<string, { zh: string[]; en: string[] }> = {
    Fire: { zh: ['主动行动，敢于尝试', '设定有挑战性的目标', '用热情感染周围的人', '定期进行高强度运动'], en: ['Take initiative, dare to try', 'Set challenging goals', 'Inspire those around you with passion', 'Regular high-intensity exercise'] },
    Earth: { zh: ['制定长期计划并坚持执行', '建立稳定的日常作息', '积累专业技能和人脉', '定期储蓄，稳健投资'], en: ['Make long-term plans and stick to them', 'Establish stable daily routines', 'Accumulate professional skills and connections', 'Save regularly, invest conservatively'] },
    Air: { zh: ['广泛阅读，保持好奇心', '建立多元化的社交网络', '学习新技能新知识', '定期与人深度交流'], en: ['Read widely, stay curious', 'Build diverse social networks', 'Learn new skills and knowledge', 'Have regular deep conversations'] },
    Water: { zh: ['留出独处和反思的时间', '关注身心健康和内在感受', '培养艺术或灵性方面的兴趣', '建立深度而非广泛的关系'], en: ['Make time for solitude and reflection', 'Pay attention to physical and mental health', 'Cultivate artistic or spiritual interests', 'Build deep rather than broad relationships'] },
  };

  const avoidActions: Record<string, { zh: string[]; en: string[] }> = {
    Fire: { zh: ['冲动决策和情绪化反应', '过度竞争和攀比', '忽视身体健康', '过度自我中心'], en: ['Impulsive decisions and emotional reactions', 'Excessive competition and comparison', 'Neglecting physical health', 'Being overly self-centered'] },
    Earth: { zh: ['过度保守拒绝改变', '沉迷于物质享受', '过度批评自己和他人', '拖延逃避问题'], en: ['Being overly conservative and resistant to change', 'Over-indulging in material pleasures', 'Overly critical of yourself and others', 'Procrastinating and avoiding problems'] },
    Air: { zh: ['过度思考而不行动', '浅尝辄止不深入', '忽视情感和直觉', '社交过多忽略独处'], en: ['Over-thinking without acting', 'Shallow engagement without depth', 'Neglecting emotions and intuition', 'Too much socializing, not enough solitude'] },
    Water: { zh: ['过度情绪化决策', '边界模糊过度付出', '逃避现实和困难', '沉迷幻想而非行动'], en: ['Over-emotional decision making', 'Blurred boundaries, over-giving', 'Escaping reality and difficulties', 'Indulging in fantasy rather than action'] },
  };

  return {
    do: doActions[moonEl]?.[lang] ?? doActions['Water'][lang],
    avoid: avoidActions[sunEl]?.[lang] ?? avoidActions['Fire'][lang],
  };
}

// ─── Master Generator ────────────────────────────────────────────────────────

export function generateReading(
  type: ReadingType,
  user: { birthDate: string; birthTime?: string; location?: string; lat?: number; lng?: number; name?: string },
  chartData: WesternChartData | null,
  lang: Language = 'zh'
): Reading {
  const id = generateId();
  const birthYear = parseInt(user.birthDate.split('-')[0]);

  if (type === 'western' && chartData) {
    const elements = computeElementsFromPlanets(chartData.planets);
    const keywords = computeKeywords(chartData.bigThree, lang);
    const summary = generateSummary(chartData.bigThree, keywords, lang);
    const insights = generateInsights(chartData.bigThree, elements, lang);
    const applications = generateApplications(chartData.bigThree, elements, birthYear, lang);
    const timeline = generateTimeline(birthYear, chartData.bigThree, lang);
    const actions = generateActions(chartData.bigThree, lang);

    return {
      id,
      user: { birthDate: user.birthDate, birthTime: user.birthTime, location: user.location, lat: user.lat, lng: user.lng, name: user.name },
      type,
      language: lang,
      summary,
      chart: { western: chartData, elements },
      insights,
      applications,
      timeline,
      actions,
      isPremium: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Fallback for non-western types or missing data
  const fallback: Reading = {
    id,
    user: { birthDate: user.birthDate, birthTime: user.birthTime, location: user.location, name: user.name },
    type,
    language: lang,
    summary: { keywords: ['分析中'], headline: lang === 'zh' ? '正在生成你的命运报告...' : 'Generating your fortune report...', tagline: '' },
    chart: { elements: { wood: 20, fire: 25, earth: 20, metal: 15, water: 20 } },
    insights: { structure: '', relationship: '', career: '', risk: '' },
    applications: { love: { current: '', trend: '', advice: [] }, career: { current: '', trend: '', advice: [] }, wealth: { current: '', trend: '', advice: [] } },
    timeline: { phases: [], currentPhase: 0 },
    actions: { do: [], avoid: [] },
    isPremium: false,
    createdAt: new Date().toISOString(),
  };
  return fallback;
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
