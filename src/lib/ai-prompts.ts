/**
 * AI Report Generation Prompt Library
 * TianJi Global | 天机全球
 *
 * Bilingual (English / Chinese) prompts for:
 *  - BaZi (八字) Four Pillars of Destiny
 *  - Zi Wei Dou Shu (紫微斗数) Purple Star Astrology
 *  - Psychology (Big Five + CBT)
 *
 * Each prompt instructs the model to:
 *  1. Interpret the metaphysical chart data
 *  2. Map traits to Big Five personality dimensions
 *  3. Offer CBT-informed guidance
 *  4. Return structured JSON
 *  5. Include a disclaimer
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type Language = 'en' | 'zh';

export interface BaziData {
  year: { heavenlyStem: string; earthlyBranch: string; element: string };
  month: { heavenlyStem: string; earthlyBranch: string; element: string };
  day: { heavenlyStem: string; earthlyBranch: string; element: string };
  hour: { heavenlyStem: string; earthlyBranch: string; element: string };
  dayMasterElement: string;
  gender?: string;
}

export interface ZiweiData {
  yearStem: string;
  lifePalace: { branch: string; name: string };
  bodyPalace: { branch: string; name: string };
  palaces: Array<{
    name: string;
    nameEn: string;
    stars: string[];
    isLifePalace: boolean;
  }>;
  siHua: { lu: string; quan: string; ke: string; ji: string };
  gender: string;
}

export interface PsychologyData {
  baziData?: BaziData;
  ziweiData?: ZiweiData;
  userNotes?: string;
}

// ─── Fortune (人生运势) Types ─────────────────────────────────────────────────

export interface FortuneCycle {
  ageStart: number;
  ageEnd: number;
  phase: string;
  phaseEn: string;
  overall: number;
  career: number;
  wealth: number;
  love: number;
  health: number;
}

export interface FortuneData {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  gender?: string;
  currentAge: number;
  currentPhase: string;
  currentPhaseEn: string;
  fortuneCycles: FortuneCycle[];
  bestPeriods: string[];
  challengingPeriods: string[];
}

// ─── Tarot Types ───────────────────────────────────────────────────────────────

export interface TarotCard {
  name: string;
  nameEn: string;
  suit?: string;
  arcana: 'major' | 'minor';
  uprightMeaning: string;
  reversedMeaning: string;
}

export interface TarotSpread {
  positions: Array<{
    name: string;
    nameEn: string;
    description: string;
  }>;
  cards: TarotCard[];
}

export interface TarotData {
  spread: TarotSpread;
  question?: string;
  gender?: string;
}

// ─── YiJing (I Ching) Types ───────────────────────────────────────────────────

export interface YiJingHexagram {
  number: number;
  name: string;
  nameEn: string;
  above: string; // lower trigram name
  below: string; // upper trigram name
  judgement: string;
  judgementEn: string;
  image: string;
  imageEn: string;
  changingLines: Array<{
    line: number; // 1-6
    isYang: boolean;
    meaning: string;
    meaningEn: string;
  }>;
}

export interface YiJingData {
  hexagram: YiJingHexagram;
  question?: string;
  gender?: string;
}

// ─── Western Astrology Types ───────────────────────────────────────────────────

export interface WesternChart {
  sun: { sign: string; degree: number };
  moon: { sign: string; degree: number };
  rising: { sign: string; degree: number };
  mercury: { sign: string; degree: number };
  venus: { sign: string; degree: number };
  mars: { sign: string; degree: number };
  jupiter: { sign: string; degree: number };
  saturn: { sign: string; degree: number };
  uranus: { sign: string; degree: number };
  neptune: { sign: string; degree: number };
  pluto: { sign: string; degree: number };
  houses: Array<{
    house: number;
    sign: string;
    planets: string[];
  }>;
}

export interface WesternData {
  chart: WesternChart;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string; // conjunction, opposition, etc.
    orb: number;
  }>;
  gender?: string;
}

// ─── Holistic Report Types ────────────────────────────────────────────────────

interface HolisticData {
  baziData?: BaziData;
  ziweiData?: ZiweiData;
  tarotData?: TarotData;
  yijingData?: YiJingData;
  westernData?: WesternData;
  userNotes?: string;
}

// ─── Output schema shared by all prompts ────────────────────────────────────

const OUTPUT_SCHEMA_EN = `
Return ONLY valid JSON matching this schema (no markdown fences):
{
  "summary": "string — 2-3 sentence overview",
  "strengths": ["string", "..."],
  "challenges": ["string", "..."],
  "bigFive": {
    "openness": "high | moderate | low",
    "conscientiousness": "high | moderate | low",
    "extraversion": "high | moderate | low",
    "agreeableness": "high | moderate | low",
    "neuroticism": "high | moderate | low",
    "narrative": "string — 2-3 sentences linking metaphysics to Big Five"
  },
  "cbtSuggestions": ["string — actionable CBT technique", "..."],
  "careerGuidance": "string",
  "relationshipGuidance": "string",
  "healthGuidance": "string",
  "disclaimer": "string"
}`;

const OUTPUT_SCHEMA_ZH = `
仅返回符合以下结构的合法 JSON（不含 markdown 代码块）：
{
  "summary": "字符串 — 2-3句概述",
  "strengths": ["字符串", "..."],
  "challenges": ["字符串", "..."],
  "bigFive": {
    "openness": "high | moderate | low",
    "conscientiousness": "high | moderate | low",
    "extraversion": "high | moderate | low",
    "agreeableness": "high | moderate | low",
    "neuroticism": "high | moderate | low",
    "narrative": "字符串 — 2-3句将命理特征与大五人格关联"
  },
  "cbtSuggestions": ["字符串 — 具体可操作的CBT技巧", "..."],
  "careerGuidance": "字符串",
  "relationshipGuidance": "字符串",
  "healthGuidance": "字符串",
  "disclaimer": "字符串"
}`;

const DISCLAIMER_EN =
  'This reading is for entertainment and self-reflection purposes only. ' +
  'It does not constitute medical, legal, or financial advice. ' +
  'Always consult a qualified professional for important life decisions.';

const DISCLAIMER_ZH =
  '本报告仅供娱乐与自我探索，不构成医疗、法律或财务建议。' +
  '重要人生决策请咨询具备资质的专业人士。';

// ─── BaZi Report Prompt ───────────────────────────────────────────────────────

/**
 * Returns a bilingual prompt for generating a BaZi (八字) AI report.
 *
 * @param data     - Calculated BaZi chart data
 * @param language - Output language: 'en' (default) or 'zh'
 * @returns Prompt string ready to send to an AI model
 */
export function getBaziReportPrompt(data: BaziData, language: Language = 'en'): string {
  const pillars = `
Year Pillar  : ${data.year.heavenlyStem}${data.year.earthlyBranch} (${data.year.element})
Month Pillar : ${data.month.heavenlyStem}${data.month.earthlyBranch} (${data.month.element})
Day Pillar   : ${data.day.heavenlyStem}${data.day.earthlyBranch} (${data.day.element}) ← Day Master
Hour Pillar  : ${data.hour.heavenlyStem}${data.hour.earthlyBranch} (${data.hour.element})
Day Master Element: ${data.dayMasterElement}
Gender: ${data.gender || 'unspecified'}`.trim();

  if (language === 'zh') {
    return `你是一位融合传统命理学与现代心理学的专业命理师。

以下是用户的八字四柱：
${pillars}

请根据以上四柱：
1. 解读日主（${data.day.heavenlyStem}，${data.dayMasterElement}）的性格特质与命运走向
2. 分析五行强弱与喜用神
3. 将命理特征映射到大五人格（Big Five）维度
4. 提供基于认知行为疗法（CBT）的实用建议
5. 从事业、感情、健康三个维度给出指引

免责声明请设置为：${DISCLAIMER_ZH}

${OUTPUT_SCHEMA_ZH}`;
  }

  return `You are a professional astrologer specialising in Chinese metaphysics and modern psychology.

The user's BaZi (Four Pillars of Destiny) chart:
${pillars}

Based on the chart above:
1. Interpret the Day Master (${data.day.heavenlyStem}, ${data.dayMasterElement}) personality and destiny themes
2. Analyse the balance of the Five Elements and identify favourable elements
3. Map the metaphysical profile to Big Five personality dimensions
4. Provide actionable Cognitive Behavioural Therapy (CBT) techniques
5. Offer guidance on career, relationships, and health

Set the disclaimer to: ${DISCLAIMER_EN}

${OUTPUT_SCHEMA_EN}`;
}

// ─── Zi Wei Report Prompt ─────────────────────────────────────────────────────

/**
 * Returns a bilingual prompt for generating a Zi Wei Dou Shu (紫微斗数) AI report.
 *
 * @param data     - Calculated Zi Wei chart data
 * @param language - Output language: 'en' (default) or 'zh'
 * @returns Prompt string ready to send to an AI model
 */
export function getZiweiReportPrompt(data: ZiweiData, language: Language = 'en'): string {
  const lifePalaceStars =
    data.palaces.find(p => p.isLifePalace)?.stars.join(', ') || 'none';
  const siHuaSummary =
    `Lu(禄):${data.siHua.lu} Quan(权):${data.siHua.quan} ` +
    `Ke(科):${data.siHua.ke} Ji(忌):${data.siHua.ji}`;

  const palaceSummary = data.palaces
    .map(p => `  ${p.nameEn}(${p.name}): ${p.stars.join(', ') || '—'}`)
    .join('\n');

  if (language === 'zh') {
    return `你是一位精通紫微斗数的专业命理师，同时具备现代心理学知识。

用户的紫微斗数排盘：
年干：${data.yearStem}
命宫：${data.lifePalace.name}（${data.lifePalace.branch}）主星：${lifePalaceStars}
身宫：${data.bodyPalace.name}（${data.bodyPalace.branch}）
四化：${siHuaSummary}
各宫星曜：
${palaceSummary}

请根据以上排盘：
1. 解读命宫主星对性格与一生命运的影响
2. 分析四化对各宫位的转化效应
3. 将紫微斗数特征映射到大五人格（Big Five）
4. 提供基于CBT的实用建议
5. 从事业、感情、健康三个维度给出指引

免责声明请设置为：${DISCLAIMER_ZH}

${OUTPUT_SCHEMA_ZH}`;
  }

  return `You are a professional Zi Wei Dou Shu (Purple Star Astrology) astrologer with modern psychology expertise.

The user's Zi Wei Dou Shu chart:
Year Stem: ${data.yearStem}
Life Palace: ${data.lifePalace.name} (${data.lifePalace.branch}) — Stars: ${lifePalaceStars}
Body Palace: ${data.bodyPalace.name} (${data.bodyPalace.branch})
Four Transformations: ${siHuaSummary}
Palace Stars:
${palaceSummary}

Based on the chart above:
1. Interpret the Life Palace stars' influence on personality and destiny
2. Analyse the Four Transformation (四化) effects across key palaces
3. Map the Zi Wei profile to Big Five personality dimensions
4. Provide actionable CBT techniques tailored to the chart
5. Offer guidance on career, relationships, and health

Set the disclaimer to: ${DISCLAIMER_EN}

${OUTPUT_SCHEMA_EN}`;
}

// ─── Psychology Integration Prompt ───────────────────────────────────────────

/**
 * Returns a bilingual prompt for a combined metaphysics + psychology report.
 * Integrates Big Five personality theory and CBT frameworks.
 *
 * @param data     - Combined data object (optional BaZi/Ziwei + user notes)
 * @param language - Output language: 'en' (default) or 'zh'
 * @returns Prompt string ready to send to an AI model
 */
export function getPsychologyPrompt(data: PsychologyData, language: Language = 'en'): string {
  const contextLines: string[] = [];

  if (data.baziData) {
    contextLines.push(
      `BaZi Day Master: ${data.baziData.day.heavenlyStem} (${data.baziData.dayMasterElement})`
    );
  }
  if (data.ziweiData) {
    const lifePalaceStars =
      data.ziweiData.palaces.find(p => p.isLifePalace)?.stars.join(', ') || 'none';
    contextLines.push(`Zi Wei Life Palace Stars: ${lifePalaceStars}`);
  }
  if (data.userNotes) {
    contextLines.push(`User Notes: ${data.userNotes}`);
  }

  const context = contextLines.length > 0
    ? contextLines.join('\n')
    : 'No chart data provided — perform a general psychological self-reflection assessment.';

  if (language === 'zh') {
    return `你是融合东方命理智慧与西方心理学的跨学科顾问。

用户信息：
${context}

请完成以下任务：
1. 综合命理数据，从大五人格（开放性、尽责性、外倾性、宜人性、神经质）角度做深度分析
2. 识别用户可能的认知扭曲模式（如灾难化、全或无思维等）
3. 提供至少3条个性化的CBT行为实验建议
4. 从正念、自我慈悲的角度给出成长建议
5. 指出潜在优势资源

免责声明请设置为：${DISCLAIMER_ZH}

${OUTPUT_SCHEMA_ZH}`;
  }

  return `You are an interdisciplinary consultant bridging Eastern metaphysics and Western psychology.

User context:
${context}

Your task:
1. Synthesise the metaphysical data with a deep Big Five personality analysis
   (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
2. Identify likely cognitive distortion patterns (e.g., catastrophising, all-or-nothing thinking)
3. Provide at least 3 personalised CBT behavioural experiment suggestions
4. Offer growth suggestions from a mindfulness and self-compassion perspective
5. Highlight potential strengths and resources

Set the disclaimer to: ${DISCLAIMER_EN}

${OUTPUT_SCHEMA_EN}`;
}

// ─── Fortune Report Prompt ──────────────────────────────────────────────────────

/**
 * Returns a bilingual prompt for generating a Fortune (人生运势) AI report.
 */
export function getFortuneReportPrompt(data: FortuneData, language: Language = 'en'): string {
  const currentCycle = data.fortuneCycles.find(
    c => data.currentAge >= c.ageStart && data.currentAge <= c.ageEnd
  );

  const cycleSummary = data.fortuneCycles
    .map(c => {
      const bar = '★'.repeat(Math.round(c.overall / 10)) + '☆'.repeat(10 - Math.round(c.overall / 10));
      return `  ${c.phaseEn} (${c.ageStart}-${c.ageEnd}): ${bar} ${c.overall}/100 | Career:${c.career} Wealth:${c.wealth} Love:${c.love} Health:${c.health}`;
    })
    .join('\n');

  if (language === 'zh') {
    return `你是精通东方传统命理学的专业命理师，结合现代心理学提供人生运势指引。

用户信息：
出生：${data.birthYear}年${data.birthMonth}月${data.birthDay}日
性别：${data.gender || '未指定'}
当前年龄：${data.currentAge}岁
当前人生阶段：${data.currentPhase}

人生运势周期分析：
${cycleSummary}

当前运势评估：
${currentCycle ? `  总体：${currentCycle.overall}/100 | 事业：${currentCycle.career} | 财富：${currentCycle.wealth} | 感情：${currentCycle.love} | 健康：${currentCycle.health}` : '暂无'}

最佳时期：${data.bestPeriods.join('；')}
挑战时期：${data.challengingPeriods.join('；')}

请根据以上运势数据：
1. 解读当前人生阶段的挑战与机遇
2. 分析事业、感情、财富、健康的五行生克关系
3. 提供实用的行动建议（结合Big Five人格）
4. 给予心理建设性指引
5. 指出下一个转运期的关键行动

免责声明请设置为：${DISCLAIMER_ZH}

${OUTPUT_SCHEMA_ZH}`;
  }

  return `You are a professional Eastern metaphysics consultant specialising in life fortune cycles.

User information:
Birth: ${data.birthYear}-${data.birthMonth}-${data.birthDay}
Gender: ${data.gender || 'Not specified'}
Current age: ${data.currentAge}
Current life phase: ${data.currentPhaseEn}

Life fortune cycle analysis:
${cycleSummary}

Current cycle assessment:
${currentCycle ? `  Overall: ${currentCycle.overall}/100 | Career: ${currentCycle.career} | Wealth: ${currentCycle.wealth} | Love: ${currentCycle.love} | Health: ${currentCycle.health}` : 'N/A'}

Best periods: ${data.bestPeriods.join('; ')}
Challenging periods: ${data.challengingPeriods.join('; ')}

Please based on the fortune data above:
1. Analyse the challenges and opportunities in the current life phase
2. Assess career, love, wealth, and health trajectories
3. Provide actionable guidance aligned with Big Five personality traits
4. Offer psychological resilience strategies
5. Identify key actions to capitalise on the next favourable period

Set the disclaimer to: ${DISCLAIMER_EN}

${OUTPUT_SCHEMA_EN}`;
}

// ─── Tarot Report Prompt ───────────────────────────────────────────────────────

/**
 * Returns a bilingual prompt for generating a Tarot AI report.
 *
 * @param data     - Tarot spread data with cards and positions
 * @param language - Output language: 'en' (default) or 'zh'
 * @returns Prompt string ready to send to an AI model
 */
export function getTarotReportPrompt(data: TarotData, language: Language = 'en'): string {
  const spreadSummary = data.spread.positions
    .map((pos, i) => {
      const card = data.spread.cards[i];
      const cardInfo = card
        ? `${card.nameEn} (${card.name})${card.arcana === 'major' ? ' — Major Arcana' : ` — ${card.suit}`}`
        : 'No card';
      return `  ${pos.nameEn} (${pos.name}): ${pos.description}\n    → ${cardInfo}`;
    })
    .join('\n');

  if (language === 'zh') {
    return `你是一位专业的塔罗解读师，兼具心理学背景。

用户的塔罗牌阵：
${spreadSummary}
${data.question ? `问题：${data.question}` : ''}

请根据以上牌阵：
1. 解读每张牌在牌阵位置上的含义（正位/逆位）
2. 分析牌面之间的关联与整体叙事
3. 将塔罗象征映射到大五人格（Big Five）维度
4. 提供基于CBT的实用建议，帮助用户应对当前情境
5. 从事业、感情、健康三个维度给出指引

免责声明请设置为：${DISCLAIMER_ZH}

${OUTPUT_SCHEMA_ZH}`;
  }

  return `You are a professional Tarot reader with a background in psychology.

The user's Tarot spread:
${spreadSummary}
${data.question ? `Question: ${data.question}` : ''}

Based on the spread above:
1. Interpret each card's meaning in its position (upright or reversed)
2. Analyse the connections between cards and the overall narrative
3. Map the Tarot symbolism to Big Five personality dimensions
4. Provide actionable CBT techniques to help the querent navigate the current situation
5. Offer guidance on career, relationships, and health

Set the disclaimer to: ${DISCLAIMER_EN}

${OUTPUT_SCHEMA_EN}`;
}

// ─── YiJing (I Ching) Report Prompt ───────────────────────────────────────────

/**
 * Returns a bilingual prompt for generating a Yi Jing (I Ching / 易经) AI report.
 *
 * @param data     - Calculated I Ching hexagram data
 * @param language - Output language: 'en' (default) or 'zh'
 * @returns Prompt string ready to send to an AI model
 */
export function getYiJingReportPrompt(data: YiJingData, language: Language = 'en'): string {
  const changingLinesSummary = data.hexagram.changingLines.length > 0
    ? data.hexagram.changingLines
        .map(line => `  Line ${line.line}: ${line.isYang ? 'Yang' : 'Yin'} — ${language === 'zh' ? line.meaning : line.meaningEn}`)
        .join('\n')
    : '  None — stable hexagram';

  if (language === 'zh') {
    return `你是一位精通《易经》的专业命理师，同时具备现代心理学知识。

用户的易经卦象：
卦名：${data.hexagram.name}（第${data.hexagram.number}卦）
卦象：上卦${data.hexagram.above} / 下卦${data.hexagram.below}
卦辞：${data.hexagram.judgement}
象曰：${data.hexagram.image}
变爻：
${changingLinesSummary}
${data.question ? `求卦问题：${data.question}` : ''}

请根据以上卦象：
1. 解读本卦与变卦（如果有变爻）的核心哲理
2. 结合卦辞与象辞，分析当前情境的智慧启示
3. 将易经智慧映射到大五人格（Big Five）维度
4. 提供基于CBT的实用建议
5. 从事业、感情、健康三个维度给出指引

免责声明请设置为：${DISCLAIMER_ZH}

${OUTPUT_SCHEMA_ZH}`;
  }

  return `You are a professional Yi Jing (I Ching / Book of Changes) consultant with modern psychology expertise.

The user's I Ching hexagram:
Name: ${data.hexagram.nameEn} (Hexagram #${data.hexagram.number})
Structure: Upper trigram ${data.hexagram.above} / Lower trigram ${data.hexagram.below}
Judgement: ${data.hexagram.judgementEn}
Image: ${data.hexagram.imageEn}
Changing Lines:
${changingLinesSummary}
${data.question ? `Question asked: ${data.question}` : ''}

Based on the hexagram above:
1. Interpret the core philosophy of the primary hexagram and its transformed state (if changing lines exist)
2. Combine the judgement and image to extract wisdom for the current situation
3. Map the Yi Jing wisdom to Big Five personality dimensions
4. Provide actionable CBT techniques
5. Offer guidance on career, relationships, and health

Set the disclaimer to: ${DISCLAIMER_EN}

${OUTPUT_SCHEMA_EN}`;
}

// ─── Western Astrology Report Prompt ───────────────────────────────────────────

/**
 * Returns a bilingual prompt for generating a Western Astrology AI report.
 *
 * @param data     - Calculated Western astrology chart data
 * @param language - Output language: 'en' (default) or 'zh'
 * @returns Prompt string ready to send to an AI model
 */
export function getWesternReportPrompt(data: WesternData, language: Language = 'en'): string {
  const planets = `
Sun: ${data.chart.sun.sign} ${data.chart.sun.degree}°
Moon: ${data.chart.moon.sign} ${data.chart.moon.degree}°
Rising: ${data.chart.rising.sign} ${data.chart.rising.degree}°
Mercury: ${data.chart.mercury.sign} ${data.chart.mercury.degree}°
Venus: ${data.chart.venus.sign} ${data.chart.venus.degree}°
Mars: ${data.chart.mars.sign} ${data.chart.mars.degree}°
Jupiter: ${data.chart.jupiter.sign} ${data.chart.jupiter.degree}°
Saturn: ${data.chart.saturn.sign} ${data.chart.saturn.degree}°
Uranus: ${data.chart.uranus.sign} ${data.chart.uranus.degree}°
Neptune: ${data.chart.neptune.sign} ${data.chart.neptune.degree}°
Pluto: ${data.chart.pluto.sign} ${data.chart.pluto.degree}°`.trim();

  const housesSummary = data.chart.houses
    .map(h => `  House ${h.house}: ${h.sign}${h.planets.length > 0 ? ` — Planets: ${h.planets.join(', ')}` : ''}`)
    .join('\n');

  const aspectsSummary = data.aspects
    .map(a => `  ${a.planet1} ${a.aspect} ${a.planet2} (orb: ${a.orb}°)`)
    .join('\n');

  if (language === 'zh') {
    return `你是一位专业的西方占星师，同时具备现代心理学背景。

用户的星盘：
行星位置：
${planets}
十二宫位：
${housesSummary}
主要相位：
${aspectsSummary}

请根据以上星盘：
1. 解读太阳、月亮、上升星座对性格的综合影响
2. 分析行星相位与宫位分布，识别核心人生主题
3. 将占星象征映射到大五人格（Big Five）维度
4. 提供基于CBT的实用建议
5. 从事业、感情、健康三个维度给出指引

免责声明请设置为：${DISCLAIMER_ZH}

${OUTPUT_SCHEMA_ZH}`;
  }

  return `You are a professional Western astrologer with modern psychology expertise.

The user's natal chart:
Planetary Positions:
${planets}
Houses:
${housesSummary}
Major Aspects:
${aspectsSummary}

Based on the chart above:
1. Interpret the combined influence of Sun, Moon, and Ascendant on personality
2. Analyse planetary aspects and house distributions to identify core life themes
3. Map the astrological symbolism to Big Five personality dimensions
4. Provide actionable CBT techniques
5. Offer guidance on career, relationships, and health

Set the disclaimer to: ${DISCLAIMER_EN}

${OUTPUT_SCHEMA_EN}`;
}

// ─── Holistic Report Prompt ────────────────────────────────────────────────────

/**
 * Returns a bilingual prompt for a holistic combined report integrating
 * multiple metaphysical systems (BaZi, ZiWei, Tarot, YiJing, Western).
 *
 * @param data     - Combined holistic data from multiple systems
 * @param language - Output language: 'en' (default) or 'zh'
 * @returns Prompt string ready to send to an AI model
 */
export function getHolisticReportPrompt(data: HolisticData, language: Language = 'en'): string {
  const contextLines: string[] = [];

  if (data.baziData) {
    contextLines.push(
      `BaZi: Day Master ${data.baziData.day.heavenlyStem} (${data.baziData.dayMasterElement})`
    );
  }
  if (data.ziweiData) {
    const lifePalaceStars =
      data.ziweiData.palaces.find(p => p.isLifePalace)?.stars.join(', ') || 'none';
    contextLines.push(`Zi Wei: Life Palace Stars — ${lifePalaceStars}`);
  }
  if (data.tarotData) {
    const cardNames = data.tarotData.spread.cards.map(c => c.nameEn).join(', ');
    contextLines.push(`Tarot: ${cardNames || 'No cards'}`);
  }
  if (data.yijingData) {
    contextLines.push(
      `Yi Jing: ${data.yijingData.hexagram.nameEn} (#${data.yijingData.hexagram.number})`
    );
  }
  if (data.westernData) {
    contextLines.push(
      `Western: Sun ${data.westernData.chart.sun.sign}, Moon ${data.westernData.chart.moon.sign}, ` +
      `Rising ${data.westernData.chart.rising.sign}`
    );
  }
  if (data.userNotes) {
    contextLines.push(`User Notes: ${data.userNotes}`);
  }

  const context = contextLines.length > 0
    ? contextLines.join('\n')
    : 'No chart data provided — perform a general holistic self-reflection assessment.';

  if (language === 'zh') {
    return `你是一位融贯东西方的跨学科命理与心理学顾问，精通八字、紫微斗数、塔罗、易经、西方占星。

用户综合信息：
${context}

请完成以下任务：
1. 综合多套命理体系，从大五人格（开放性、尽责性、外倾性、宜人性、神经质）角度做深度分析
2. 找出各体系解读的共通主题与独特洞见
3. 识别用户可能的认知扭曲模式，提供基于CBT的实用建议
4. 从正念、自我慈悲的角度给出成长建议
5. 指出潜在优势资源与人生方向

免责声明请设置为：${DISCLAIMER_ZH}

${OUTPUT_SCHEMA_ZH}`;
  }

  return `You are an interdisciplinary metaphysical and psychology consultant fluent in both Eastern and Western traditions: BaZi, Zi Wei Dou Shu, Tarot, Yi Jing, and Western Astrology.

User holistic context:
${context}

Your task:
1. Synthesise multiple metaphysical systems with a deep Big Five personality analysis
   (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
2. Identify converging themes and unique insights across all systems
3. Recognise likely cognitive distortion patterns and provide actionable CBT techniques
4. Offer growth suggestions from mindfulness and self-compassion perspectives
5. Highlight strengths, resources, and life direction

Set the disclaimer to: ${DISCLAIMER_EN}

${OUTPUT_SCHEMA_EN}`;
}
