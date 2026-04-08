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

interface BaziData {
  year: { heavenlyStem: string; earthlyBranch: string; element: string };
  month: { heavenlyStem: string; earthlyBranch: string; element: string };
  day: { heavenlyStem: string; earthlyBranch: string; element: string };
  hour: { heavenlyStem: string; earthlyBranch: string; element: string };
  dayMasterElement: string;
  gender?: string;
}

interface ZiweiData {
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

interface PsychologyData {
  baziData?: BaziData;
  ziweiData?: ZiweiData;
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
