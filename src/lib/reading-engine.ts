// ─── Reading Engine — AI Data Generation ─────────────────────────────────────
// Generates structured reading data from birth inputs using rule-based analysis
// (can be replaced with LLM calls for AI-powered insights)

import type {
  Reading, ReadingSummary, ReadingInsights, ReadingApplications,
  ReadingTimeline, ReadingActions, ElementScores, TimelinePhase,
  ApplicationModule, ReadingType, Language, WesternChartData,
} from '@/types/reading';
import { ZODIAC_DATA, ELEMENTS, ELEM_COLORS_ZH, PLANET_LIST } from './chart-engine';
import { checkCoherence, type SystemType, type CoherenceResult } from '@/lib/cultural-coherence';

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
// Three-layer narrative structure per insight module.
// Mirrors Codebase Onboarding Engineer output discipline:
//   1. Resonance hook  — one sentence, emotional connection
//   2. Deep dive      — evidence, analysis, nuance
//   3. Action closure  — specific, grounded guidance

export function generateInsights(
  bigThree: { sun: { sign: string; signZh: string }; moon: { sign: string; signZh: string }; rising: { sign: string; signZh: string } },
  elements: ElementScores,
  lang: Language
): ReadingInsights {
  const sunEl = getElement(bigThree.sun.sign);
  const moonEl = getElement(bigThree.moon.sign);
  const risingEl = getElement(bigThree.rising.sign);

  // ── Structure ────────────────────────────────────────────────────────────────
  const structureHook = lang === 'zh'
    ? `你是由星辰锻造的独特个体——太阳${bigThree.sun.signZh}座是你生命的燃料，月亮${bigThree.moon.signZh}座是你情感的河流，上升${bigThree.rising.signZh}座是你面对世界的方式。`
    : `You are forged from starlight — your Sun in ${bigThree.sun.sign} fuels your will, your Moon in ${bigThree.moon.sign} shapes your emotional world, and your Ascendant in ${bigThree.rising.sign} is how you meet the world.`;

  const structureBody = lang === 'zh'
    ? `太阳星座揭示了你核心意志的表达方式：${SIGN_KEYWORDS[bigThree.sun.sign].zh[0]}是你最自然的生存姿态。月亮星座映射你的内在需求和安全感的来源——${SIGN_KEYWORDS[bigThree.moon.sign].zh[0]}的需求往往在童年就已成型，成年后你会不自觉地寻求满足它的方式。上升星座则是你给别人留下的第一印象，它是你在世界中行动的盔甲。三个星座的互动，构成了你独特的人格拼图。`
    : `Your Sun sign reveals your core will: ${SIGN_KEYWORDS[bigThree.sun.sign].en[0]} is your default mode of self-expression. Your Moon sign maps your inner needs and sense of safety — ${SIGN_KEYWORDS[bigThree.moon.sign].en[0]} often forms in childhood and drives your adult behavior unconsciously. Your Ascendant is the mask you wear in the world, the first impression others receive. These three signs together form your unique personality constellation.`;

  const structureClosure = lang === 'zh'
    ? `了解这三个维度的交互，是理解自己为何在某些情境下如此行事的钥匙。`
    : `Understanding how these three dimensions interact is the key to knowing why you behave the way you do in certain situations.`;

  // ── Relationship ───────────────────────────────────────────────────────────
  const relationshipHook = lang === 'zh'
    ? `在亲密关系中，你不只是你在"的样子——你是三个星座共同导演的一出戏。`
    : `In intimate relationships, you are not just who you think you are — you are a play directed by three different星座 simultaneously.`;

  const relationshipBody = lang === 'zh'
    ? `你的上升${bigThree.rising.signZh}座决定了你被什么样的能量吸引——你倾向于被${SIGN_KEYWORDS[bigThree.rising.sign].zh[1] || SIGN_KEYWORDS[bigThree.rising.sign].zh[0]}的伴侣吸引，因为他们的能量能补充你内在的某种空缺。月亮的特质则决定了你情感需求的模式：${moonEl === 'Water' ? '你需要深度的情感连接才能感到安全，浅层次的关系会让你感到空虚。' : moonEl === 'Fire' ? '你需要被看见、被欣赏、被热烈地回应，情感中的冷漠会让你迅速失去兴趣。' : moonEl === 'Earth' ? '你需要一个稳定的情感基础，频繁的情感波动会让你不安。' : '你需要心智层面的交流和空间，过于粘腻的关系会让你想逃。'}理解这些模式，帮助你识别什么样的关系是你真正需要的，什么样的只是你在重复某种童年模式。`
    : `Your Ascendant in ${bigThree.rising.sign} determines what kind of energy attracts you — you gravitate toward partners who are ${SIGN_KEYWORDS[bigThree.rising.sign].en[1]?.toLowerCase() || SIGN_KEYWORDS[bigThree.rising.sign].en[0].toLowerCase()}. Your Moon sign governs your emotional needs: ${moonEl === 'Water' ? 'You need deep emotional intimacy to feel safe. Shallow connections leave you feeling empty.' : moonEl === 'Fire' ? 'You need to be seen, appreciated, and responded to passionately. Emotional coldness makes you lose interest quickly.' : moonEl === 'Earth' ? 'You need an emotionally stable foundation. Frequent ups and downs make you anxious.' : 'You need intellectual exchange and space. Relationships that are too clingy make you want to escape.'} Understanding these patterns helps you distinguish what you truly need versus what childhood patterns you might be reenacting.`;

  const relationshipClosure = lang === 'zh'
    ? `${LOVE_TIPS[moonEl].zh.slice(0, 2).join('，')}将是你建立更健康关系模式的关键行动。`
    : `${LOVE_TIPS[moonEl].en.slice(0, 2).join('. ')} will be key actions for building healthier relationship patterns.`;

  // ── Career ──────────────────────────────────────────────────────────────────
  const careerHook = lang === 'zh'
    ? `事业不是你谋生的地方——它是你使命的具体化。理解你的星盘，就是在找到你的天命舞台。`
    : `Career is not where you earn a living — it is where your mission takes physical form. Understanding your chart is finding your destiny stage.`;

  const careerBody = lang === 'zh'
    ? `最适合你的事业方向围绕${sunEl}能量的表达：${CAREER_TIPS[sunEl].zh.slice(0, 3).join('、')}。你的太阳星座定义了你最有热情的领域，而月亮星座则揭示了你最深层的舒适区——当事业同时满足这两者时，你往往能进入心流状态。上升星座赋予你在公共领域的独特气质：${SIGN_KEYWORDS[bigThree.rising.sign].zh[0]}是你名片上的第一印象。${moonEl === 'Water' ? '适合深度研究型工作，在需要洞察和耐心的领域最能发挥。' : moonEl === 'Fire' ? '适合需要热情和行动力的岗位，在竞争性能量中茁壮成长。' : moonEl === 'Earth' ? '适合需要扎实积累的领域，耐心是你最大的竞争壁垒。' : moonEl === 'Air' ? '适合需要多元思维和社交的工作，人脉是最有价值的资产。' : '适合需要灵活应变的领域，你的适应力是最大优势。'}善用这些天生的配置，可以加速你的职业发展。`
    : `Your ideal career path revolves around ${sunEl} energy: ${CAREER_TIPS[sunEl].en.slice(0, 3).join(', ')}. Your Sun defines the area you are most passionate about; your Moon reveals your deepest comfort zone — when both are satisfied simultaneously, you tend to enter flow states. Your Ascendant gives you a unique public presence: ${SIGN_KEYWORDS[bigThree.rising.sign].en[0]} is your first impression. ${moonEl === 'Water' ? 'Deep research-oriented work suits you best, where insight and patience are valued.' : moonEl === 'Fire' ? 'Roles requiring passion and action suit you. You thrive in competitive environments.' : moonEl === 'Earth' ? 'Areas requiring steady accumulation suit you. Patience is your greatest competitive edge.' : moonEl === 'Air' ? 'Work requiring diverse thinking and social skills suits you. Your network is your most valuable asset.' : 'Areas requiring flexibility suit you. Your adaptability is your greatest strength.'} Using these natural configurations can accelerate your career growth.`;

  const careerClosure = lang === 'zh'
    ? `${CAREER_TIPS[sunEl].zh[0]}是你最具天赋的起跑点，选择它会让你事半功倍。`
    : `${CAREER_TIPS[sunEl].en[0]} is your strongest starting point — choosing it will multiply your efforts.`;

  // ── Risk ───────────────────────────────────────────────────────────────────
  const riskHook = lang === 'zh'
    ? `了解自己的阴影，不是自我设限——而是在暗处点亮一盏灯。`
    : `Understanding your shadow is not self-limiting — it is lighting a lamp in the dark.`;

  const riskBody = lang === 'zh'
    ? `每个星座的能量都有其阴暗面。太阳在${bigThree.sun.signZh}座时，${sunEl === 'Fire' ? '过度的热情会让你冲动决策、过度竞争；火焰能照亮道路，也能烧毁桥梁。' : sunEl === 'Earth' ? '过度的稳定需求会让你抗拒变化、执着于物质；大地能承载万物，也能让你深陷泥沼。' : sunEl === 'Air' ? '过度的思维活跃会让你想而不做、浅尝辄止；风能传播思想，也能吹散专注。' : '过度的情感流动会让你边界模糊、逃避现实；水能滋养万物，也能淹没界限。'}月亮在${bigThree.moon.signZh}座的内在模式也会在压力下显现：${RISK_TIPS[moonEl].zh.slice(0, 2).join('或')}往往是你在情感不安全时的下意识反应。`
    : `Every zodiac sign has a shadow side. When the Sun is in ${bigThree.sun.sign}, ${sunEl === 'Fire' ? 'excessive passion leads to impulsive decisions and over-competition; fire illuminates but also burns bridges.' : sunEl === 'Earth' ? 'excessive need for stability makes you resistant to change and attached to material things; earth sustains but can trap you in mud.' : sunEl === 'Air' ? 'excessive mental activity leads to thinking without action and shallow engagement; wind spreads ideas but scatters focus.' : 'excessive emotional flow blurs boundaries and causes escapism; water nourishes but can also drown.'} The Moon in ${bigThree.moon.sign} pattern also emerges under pressure: ${RISK_TIPS[moonEl].en.slice(0, 2).join(' or ')} are often unconscious reactions when emotionally unsafe.`;

  const riskClosure = lang === 'zh'
    ? `在重要决策前给自己留出冷静思考的空间，${moonEl === 'Water' ? '特别是在情绪激动时避免做重大决定。' : '特别是避免被外部压力推着走。'}这是你最重要的风险管理动作。`
    : `Give yourself space for calm reflection before major decisions, ${moonEl === 'Water' ? 'especially when emotionally heightened.' : 'especially when pushed by external pressure.'} This is your most important risk management action.`;

  return {
    structure: { hook: structureHook, body: structureBody, closure: structureClosure },
    relationship: { hook: relationshipHook, body: relationshipBody, closure: relationshipClosure },
    career: { hook: careerHook, body: careerBody, closure: careerClosure },
    risk: { hook: riskHook, body: riskBody, closure: riskClosure },
  };
}

// ─── Applications Generation ──────────────────────────────────────────────────
// Three-layer narrative structure per application module:
//   hook  → current state (resonance opener)
//   body  → trend logic (deep dive)
//   advice → 3 specific actionable items (closure)

export function generateApplications(
  bigThree: { sun: { sign: string; signZh: string }; moon: { sign: string; signZh: string } },
  elements: ElementScores,
  birthYear: number,
  lang: Language
): ReadingApplications {
  const sunEl = getElement(bigThree.sun.sign);
  const moonEl = getElement(bigThree.moon.sign);
  const now = new Date().getFullYear();
  const age = now - birthYear;
  const lifePhase = age < 30 ? 'early' : age < 45 ? 'mid' : 'late';

  // ── Love ─────────────────────────────────────────────────────────────────────
  const loveHook = lang === 'zh'
    ? `感情不是寻找"对的人"——而是发现自己内在的关系模式，然后在其中成长。`
    : `Relationships are not about finding the "right person" — they are about discovering your inner relationship patterns and growing through them.`;

  const loveBody = lang === 'zh'
    ? `你目前在感情中表现出${SIGN_KEYWORDS[bigThree.moon.sign].zh[0]}的特质，${lifePhase === 'early' ? '还在探索适合自己的关系模式，这是正常的——允许自己多尝试、多体验。' : lifePhase === 'mid' ? '感情观逐渐成熟，你开始重视深层连接而非表面和谐。这是一个关键的成长节点。' : '感情趋于稳定，你更加关注陪伴质量和共同成长的可能。'}月亮星座的内在需求是你感情航行的北极星：${moonEl === 'Water' ? '你需要深度的情感共鸣才能感到满足，浅层次的关系让你感到空虚；允许自己等待那个真正能与你深度连接的人。' : moonEl === 'Fire' ? '你需要被热烈地回应和欣赏，情感中的冷漠会让你怀疑自己的价值；找到一个能让你感到被看见的伴侣非常重要。' : moonEl === 'Earth' ? '你需要一个稳定的情感基础；频繁的争吵和波动让你内心不安；寻找一个能给你安全感的伴侣。' : '你需要心智层面的交流和一定个人空间；过于粘腻或情绪化的关系会让你想逃离。'}未来两年，木星过境将带来拓展视野的机会，无论你是否处于一段关系中，都是深入了解自己感情模式的好时机。`
    : `You currently show ${SIGN_KEYWORDS[bigThree.moon.sign].en[0].toLowerCase()} qualities in relationships, ${lifePhase === 'early' ? 'still exploring what works for you — allow yourself to experiment and experience. This is normal.' : lifePhase === 'mid' ? 'your relationship perspective is maturing, you are beginning to value deep connection over surface harmony. This is a key growth point.' : 'relationships are stabilizing, you focus more on quality of companionship and shared growth.'} Your Moon sign needs are the north star of your emotional navigation: ${moonEl === 'Water' ? 'You need deep emotional resonance to feel fulfilled. Shallow connections leave you feeling empty. Allow yourself to wait for someone who can truly connect with you deeply.' : moonEl === 'Fire' ? 'You need to be passionately seen and appreciated. Emotional coldness makes you doubt your worth. Finding a partner who makes you feel witnessed is crucial.' : moonEl === 'Earth' ? 'You need an emotionally stable foundation. Frequent conflicts make you anxious. Seek a partner who gives you security.' : 'You need intellectual exchange and personal space. Too clingy or emotional relationships make you want to escape.'} In the next two years, Jupiter transit will bring opportunities to broaden your horizons — whether in a relationship or not, this is a good time to understand your emotional patterns more deeply.`;

  const loveAdvice = lang === 'zh'
    ? LOVE_TIPS[moonEl].zh
    : LOVE_TIPS[moonEl].en;

  // ── Career ───────────────────────────────────────────────────────────────────
  const careerHook = lang === 'zh'
    ? `最好的职业不是你最擅长的那个——而是让你在全力以赴时感到活着的那件事。`
    : `The best career is not what you are best at — it is what makes you feel alive when you give it your all.`;

  const careerBody = lang === 'zh'
    ? `职业能量正在${lifePhase === 'early' ? '启动期，适合多尝试不同方向——不要急于确定"终身职业"，探索本身就是你这阶段最重要的功课。' : lifePhase === 'mid' ? '上升期，你的专业能力正在被更多人认可；这是建立个人品牌和扩大影响力的好时机。' : '收获期，你前期的积累开始转化为可见的成果；这是验证你长期坚持是否有价值的时刻。'}太阳星座代表你最自然的职业能量：${SIGN_KEYWORDS[bigThree.sun.sign].zh[0]}的特质在你工作中自然流露，${sunEl === 'Fire' ? '你适合需要热情、行动力和冒险精神的工作——被动等待会让你枯萎。' : sunEl === 'Earth' ? '你适合需要扎实积累和耐心的领域——快速成功往往伴随着快速崩塌。' : sunEl === 'Air' ? '你适合需要多元思维和社交的工作——被困在单一角色里会让你无聊。' : '你适合需要洞察力和适应力的工作——流水线式的工作模式会消耗你的热情。'}${lifePhase === 'early' ? '30岁左右有事业方向的关键定位点。' : lifePhase === 'mid' ? '40岁左右有晋升或转型机遇，这是中年转型的好时机。' : '这是传承与回顾的时期，你可以开始考虑如何将经验传递下去。'}建议提前规划，而不是被环境推着走。`
    : `Career energy is ${lifePhase === 'early' ? 'in a startup phase, good for exploring different directions — do not rush to define your "lifelong career." Exploring itself is your most important work at this stage.' : lifePhase === 'mid' ? 'in an upswing — your professional abilities are being recognized by more people. This is a good time to build your personal brand and expand your influence.' : 'in a harvest phase — your earlier accumulation is converting into visible results. This is the moment to validate whether your long-term persistence has paid off.'} Your Sun sign represents your most natural career energy: ${SIGN_KEYWORDS[bigThree.sun.sign].en[0]} qualities flow naturally in your work. ${sunEl === 'Fire' ? 'You are suited for work requiring passion, action, and risk — waiting passively makes you wither.' : sunEl === 'Earth' ? 'You are suited for areas requiring steady accumulation and patience — quick success often comes with quick collapse.' : sunEl === 'Air' ? 'You are suited for work requiring diverse thinking and socializing — being stuck in a single role bores you.' : 'You are suited for work requiring insight and adaptability — assembly-line work patterns drain your enthusiasm.'} ${lifePhase === 'early' ? 'Around 30 there is a key positioning point for your career direction.' : lifePhase === 'mid' ? 'Around 40 there are promotion or transition opportunities — a midlife career pivot is possible.' : 'This is a time for legacy and reflection. You can begin thinking about how to pass on your experience.'} Plan ahead rather than being pushed by circumstances.`;

  const careerAdvice = lang === 'zh'
    ? CAREER_TIPS[sunEl].zh.slice(0, 3)
    : CAREER_TIPS[sunEl].en.slice(0, 3);

  // ── Wealth ───────────────────────────────────────────────────────────────────
  const wealthHook = lang === 'zh'
    ? `财富是实现自由的工具——理解你对钱的态度，就是理解你与自由的关系。`
    : `Wealth is a tool for achieving freedom — understanding your attitude toward money is understanding your relationship with freedom.`;

  const wealthBody = lang === 'zh'
    ? `财务状况${lifePhase === 'early' ? '处于建立期，养成储蓄习惯比追求高收益更重要——你现在的任务是挖好蓄水池，而不是急着注水。' : lifePhase === 'mid' ? '处于积累期，收入有望稳步增长；随着专业能力被认可，你的赚钱能力正在进入上升通道。' : '处于巩固期，资产配置优化比单一投资选择更重要；你已经有足够的积累，关键是如何保护和使用它们。'}你的太阳元素能量直接影响你对财富的态度和机遇：${sunEl === 'Fire' ? '你有通过主动行动创造大额收益的潜力，但也容易在冲动决策中失去已有积累。设置硬性的止损规则是你最重要的财务功课。' : sunEl === 'Earth' ? '你擅长稳健积累，耐心是你最大的财富优势；时间是你的朋友，复利是你最好的盟友。不要羡慕别人的快速致富，那不适合你的能量模式。' : sunEl === 'Air' ? '你有财务上的灵活性和多元化思维，但也容易分散投资、浅尝辄止。找到1-2个真正理解的赛道深耕，比同时追逐10个机会更有效。' : '你有长期投资规划的直觉优势，你的洞察力有时能帮你抓住别人看不到的机会。但要注意情绪化决策——在市场波动时保持冷静是你的必修课。'}建立应急基金、控制消费、分散配置——这三件事在任何人生阶段都适用。`
    : `Financial situation ${lifePhase === 'early' ? 'is in a building phase — developing savings habits matters more than pursuing high returns. Your task now is to dig a reservoir, not to rush to fill it.' : lifePhase === 'mid' ? 'is in an accumulation phase. As your professional abilities are recognized, your earning power is entering an upward channel.' : 'is in a consolidation phase. Asset allocation optimization matters more than picking a single investment. You have enough accumulation — the question is how to protect and use it.'} Your Sun element energy directly affects your attitude toward wealth: ${sunEl === 'Fire' ? 'You have the potential to create large gains through proactive action, but you also tend to lose what you have through impulsive decisions. Setting hard stop-loss rules is your most important financial lesson.' : sunEl === 'Earth' ? 'You excel at steady accumulation. Patience is your greatest wealth advantage. Time is your friend and compound interest is your best ally. Do not envy others quick riches — that energy pattern is not for you.' : sunEl === 'Air' ? 'You have financial flexibility and diverse thinking, but also tend to spread investments thin and jump between shallow opportunities. Finding 1-2 tracks you truly understand and diving deep is more effective than chasing 10 opportunities simultaneously.' : 'You have the advantage of long-term investment planning intuition. Your insight sometimes helps you seize opportunities others cannot see. But watch for emotional decision-making — staying calm during market volatility is your required lesson.'} Building an emergency fund, controlling spending, and diversifying — these three things apply at every life stage.`;

  const wealthAdvice = lang === 'zh'
    ? WEALTH_TIPS[sunEl].zh
    : WEALTH_TIPS[sunEl].en;

  return {
    love: { hook: loveHook, body: loveBody, advice: loveAdvice },
    career: { hook: careerHook, body: careerBody, advice: careerAdvice },
    wealth: { hook: wealthHook, body: wealthBody, advice: wealthAdvice },
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

// ─── Cultural Coherence Check Integration ─────────────────────────────────────

export interface ReadingWithCoherence {
  reading: Reading;
  coherenceResult: CoherenceResult | null;
  canDeliver: boolean;
  coherenceWarnings: string[];
  coherenceErrors: string[];
}

export interface CoherenceCheckConfig {
  enableCoherenceCheck: boolean;
  failOnError: boolean;
  warnOnColorMismatch: boolean;
}

// Maps ReadingType to SystemType for coherence checking
function toSystemType(type: ReadingType): SystemType {
  const map: Record<ReadingType, SystemType> = {
    western: 'western',
    bazi: 'bazi',
    ziwei: 'ziwei',
  };
  return map[type];
}

// Extracts text content from a Reading for coherence checking
function extractReadingContent(reading: Reading): string {
  const parts: string[] = [];
  
  // Summary
  parts.push(reading.summary.headline, reading.summary.tagline || '', ...reading.summary.keywords);
  
  // Insights
  if (reading.insights.structure) {
    const s = reading.insights.structure;
    parts.push(s.hook || '', s.body || '', s.closure || '');
  }
  if (reading.insights.relationship) {
    const r = reading.insights.relationship;
    parts.push(typeof r === 'object' ? r.hook || '' : r);
  }
  if (reading.insights.career) {
    const c = reading.insights.career;
    parts.push(typeof c === 'object' ? c.hook || '' : c);
  }
  if (reading.insights.risk) {
    const r = reading.insights.risk;
    parts.push(typeof r === 'object' ? r.hook || '' : r);
  }
  
  // Applications
  const apps = reading.applications;
  parts.push(apps.love?.hook || '', apps.love?.body || '', ...(apps.love?.advice || []));
  parts.push(apps.career?.hook || '', apps.career?.body || '', ...(apps.career?.advice || []));
  parts.push(apps.wealth?.hook || '', apps.wealth?.body || '', ...(apps.wealth?.advice || []));
  
  // Timeline phases
  for (const phase of reading.timeline.phases) {
    parts.push(phase.label, phase.labelEn, phase.description, phase.summary);
  }
  
  // Actions
  parts.push(...reading.actions.do, ...reading.actions.avoid);
  
  return parts.filter(Boolean).join(' ');
}

/**
 * Wraps generateReading with Cultural Coherence checking.
 * After the reading is generated, it runs through checkCoherence.
 * If errors and failOnError=true, returns a fallback reading with coherence metadata.
 * If warnings, attaches them to the response metadata.
 */
export function generateReadingWithCoherenceCheck(
  type: ReadingType,
  user: { birthDate: string; birthTime?: string; location?: string; lat?: number; lng?: number; name?: string },
  chartData: WesternChartData | null,
  lang: Language = 'zh',
  config: Partial<CoherenceCheckConfig> = {}
): ReadingWithCoherence {
  const fullConfig: CoherenceCheckConfig = {
    enableCoherenceCheck: config.enableCoherenceCheck ?? true,
    failOnError: config.failOnError ?? true,
    warnOnColorMismatch: config.warnOnColorMismatch ?? true,
  };

  // Generate the reading
  const reading = generateReading(type, user, chartData, lang);

  // If coherence check is disabled, return without checking
  if (!fullConfig.enableCoherenceCheck) {
    return {
      reading,
      coherenceResult: null,
      canDeliver: true,
      coherenceWarnings: [],
      coherenceErrors: [],
    };
  }

  // Extract content and check coherence
  const content = extractReadingContent(reading);
  const system = toSystemType(type);
  const coherenceResult = checkCoherence(content, system);

  const errors = coherenceResult.violations
    .filter(v => v.severity === 'error')
    .map(v => v.message);
  const warnings = coherenceResult.violations
    .filter(v => v.severity === 'warning')
    .map(v => v.message);

  const hasErrors = errors.length > 0;
  const canDeliver = !hasErrors || !fullConfig.failOnError;

  // If blocked due to errors, log and return empty content reading
  if (hasErrors && fullConfig.failOnError) {
    // Fire-and-forget analytics tracking
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Cultural Coherence] Violation detected in reading:', {
        system,
        violationCount: coherenceResult.violations.length,
        errors: errors.length,
        warnings: warnings.length
      });
    }
  }

  return {
    reading: canDeliver ? reading : {
      ...reading,
      summary: {
        ...reading.summary,
        headline: lang === 'zh' ? '报告生成中...' : 'Generating report...',
      },
    },
    coherenceResult,
    canDeliver,
    coherenceWarnings: warnings,
    coherenceErrors: errors,
  };
}
