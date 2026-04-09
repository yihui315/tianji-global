import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi } from '@/lib/bazi';
import { interpretBazi } from '@/lib/ai-interpreter';
import { generateReport } from '@/lib/ai-orchestrator';
import type { BaziData } from '@/lib/ai-prompts';

type Language = 'en' | 'zh';

// ─── Five Elements constants ─────────────────────────────────────────────────

const ELEMENT_NAMES: Record<string, string> = {
  Wood: '木', Fire: '火', Earth: '土', Metal: '金', Water: '水',
};

const ELEMENT_NAMES_EN: Record<string, string> = {
  Wood: 'Wood', Fire: 'Fire', Earth: 'Earth', Metal: 'Metal', Water: 'Water',
};

// 相克 (overcoming) relationships
const CONFLICT_MAP: Record<string, Record<string, number>> = {
  Wood: { Earth: 15, Metal: 20 },
  Fire: { Metal: 15, Water: 15 },
  Earth: { Water: 20, Wood: 15 },
  Metal: { Wood: 20, Fire: 15 },
  Water: { Fire: 15, Earth: 20 },
};

// 相生 (generating) relationships
const GENERATE_MAP: Record<string, Record<string, number>> = {
  Wood: { Fire: 20, Water: 10 },
  Fire: { Earth: 20, Wood: 10 },
  Earth: { Metal: 20, Fire: 10 },
  Metal: { Water: 20, Earth: 10 },
  Water: { Wood: 20, Metal: 10 },
};

// 天干五合 pairs
const TIANGAN_HEPAI: Record<string, string> = {
  '甲': '己', '己': '甲',
  '乙': '庚', '庚': '乙',
  '丙': '辛', '辛': '丙',
  '丁': '壬', '壬': '丁',
  '戊': '癸', '癸': '戊',
};

// 地支六合
const DIZHI_LIUHE: Record<string, string> = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午',
};

// 地支三合
const DIZHI_SANHE: Record<string, string[]> = {
  '申': ['子', '辰'], '子': ['申', '辰'], '辰': ['申', '子'],
  '亥': ['卯', '未'], '卯': ['亥', '未'], '未': ['亥', '卯'],
  '寅': ['午', '戌'], '午': ['寅', '戌'], '戌': ['寅', '午'],
  '巳': ['酉', '丑'], '酉': ['巳', '丑'], '丑': ['巳', '酉'],
};

// 地支六冲
const DIZHI_CHONG: Record<string, string> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface ElementAnalysis {
  score: number;
  conflicts: string[];
  harmonies: string[];
  details: string;
}

interface StemMatchResult {
  score: number;
  pairs: string[];
  details: string;
}

interface BranchMatchResult {
  score: number;
  liuHe: string[];
  sanHe: string[];
  chong: string[];
  details: string;
}

interface CompatibilityResult {
  score: number;
  elementAnalysis: ElementAnalysis;
  stemMatch: StemMatchResult;
  branchMatch: BranchMatchResult;
  advice: string;
}

interface LoveMatchRequest {
  person1: BaziData;
  person2: BaziData;
  enhanceWithAI?: boolean;
  language?: Language;
}

// ─── Compatibility calculation ─────────────────────────────────────────────

function calcElementCompatibility(dm1: string, dm2: string, lang: Language): ElementAnalysis {
  let score = 0;
  const conflicts: string[] = [];
  const harmonies: string[] = [];

  const conflict = CONFLICT_MAP[dm1]?.[dm2];
  if (conflict) {
    score -= conflict;
    conflicts.push(`${ELEMENT_NAMES[dm1]}克${ELEMENT_NAMES[dm2]} (-${conflict})`);
  }

  const generate = GENERATE_MAP[dm1]?.[dm2];
  if (generate) {
    score += generate;
    harmonies.push(`${ELEMENT_NAMES[dm1]}生${ELEMENT_NAMES[dm2]} (+${generate})`);
  } else {
    const reverseGenerate = GENERATE_MAP[dm2]?.[dm1];
    if (reverseGenerate) {
      score += reverseGenerate;
      harmonies.push(`${ELEMENT_NAMES[dm2]}生${ELEMENT_NAMES[dm1]} (+${reverseGenerate})`);
    }
  }

  const details = conflicts.length > 0
    ? `${lang === 'zh' ? '五行相克：' : 'Element conflict: '}${conflicts.join('、')}`
    : harmonies.length > 0
    ? `${lang === 'zh' ? '五行相生：' : 'Element harmony: '}${harmonies.join('、')}`
    : (lang === 'zh' ? '五行关系平和' : 'Elements are in balance');

  return { score, conflicts, harmonies, details };
}

function calcStemCompatibility(chart1: BaziData, chart2: BaziData, lang: Language): StemMatchResult {
  let score = 0;
  const pairs: string[] = [];
  const stems1 = [chart1.day.heavenlyStem];
  const stems2 = [chart2.day.heavenlyStem];

  for (const s1 of stems1) {
    for (const s2 of stems2) {
      if (TIANGAN_HEPAI[s1] === s2) {
        score += 15;
        pairs.push(`${s1}-${s2} (+15)`);
      }
    }
  }

  const details = pairs.length > 0
    ? `${lang === 'zh' ? '天干五合：' : 'Stem combos: '}${pairs.join('、')}`
    : (lang === 'zh' ? '天干无合化关系' : 'No stem combinations');
  return { score, pairs, details };
}

function calcBranchCompatibility(chart1: BaziData, chart2: BaziData, lang: Language): BranchMatchResult {
  let score = 0;
  const liuHe: string[] = [];
  const sanHe: string[] = [];
  const chong: string[] = [];
  const branches1 = [
    chart1.year.earthlyBranch, chart1.month.earthlyBranch,
    chart1.day.earthlyBranch, chart1.hour.earthlyBranch,
  ];
  const branches2 = [
    chart2.year.earthlyBranch, chart2.month.earthlyBranch,
    chart2.day.earthlyBranch, chart2.hour.earthlyBranch,
  ];

  for (const b1 of branches1) {
    for (const b2 of branches2) {
      if (DIZHI_LIUHE[b1] === b2) { score += 10; liuHe.push(`${b1}-${b2}`); }
      if (DIZHI_CHONG[b1] === b2) { score -= 10; chong.push(`${b1}-${b2}`); }
      const sanheGroup = DIZHI_SANHE[b1];
      if (sanheGroup?.includes(b2)) { score += 15; sanHe.push(`${b1}-${b2}`); }
    }
  }

  const parts: string[] = [];
  if (liuHe.length > 0) parts.push(`${lang === 'zh' ? '六合' : '6-Harmony'} ${liuHe.length}组 (+${liuHe.length * 10})`);
  if (sanHe.length > 0) parts.push(`${lang === 'zh' ? '三合' : '3-Comb'} ${sanHe.length}组 (+${sanHe.length * 15})`);
  if (chong.length > 0) parts.push(`${lang === 'zh' ? '六冲' : '6-Opposition'} ${chong.length}组 (-${chong.length * 10})`);
  const details = parts.length > 0 ? parts.join('、') : (lang === 'zh' ? '地支关系平和' : 'Balanced branch relations');

  return { score, liuHe, sanHe, chong, details };
}

function buildCompatibilityAdvice(result: CompatibilityResult, chart1: BaziData, chart2: BaziData, language: Language): string {
  const dm1 = chart1.dayMasterElement;
  const dm2 = chart2.dayMasterElement;
  const dm1Name = language === 'zh' ? ELEMENT_NAMES[dm1] : ELEMENT_NAMES_EN[dm1];
  const dm2Name = language === 'zh' ? ELEMENT_NAMES[dm2] : ELEMENT_NAMES_EN[dm2];
  const p1Label = language === 'zh' ? '甲方' : 'Person 1';
  const p2Label = language === 'zh' ? '乙方' : 'Person 2';

  const scoreLabel = result.score >= 40
    ? (language === 'zh' ? '缘分深厚，宜结连理' : 'Strong compatibility — excellent match')
    : result.score >= 20
    ? (language === 'zh' ? '缘分中等，需多包容理解' : 'Moderate compatibility — requires understanding')
    : (language === 'zh' ? '挑战较大，建议深入了解后再做决定' : 'Lower compatibility — proceed with caution');

  return language === 'zh'
    ? `八字合盘：${p1Label}日主${dm1Name}行，${p2Label}日主${dm2Name}行。五行${result.elementAnalysis.details}。${result.stemMatch.details}。${result.branchMatch.details}。综合评分${result.score}分，${scoreLabel}。`
    : `BaZi compatibility: ${p1Label} Day Master ${dm1Name}, ${p2Label} Day Master ${dm2Name}. ${result.elementAnalysis.details}. ${result.stemMatch.details}. ${result.branchMatch.details}. Score: ${result.score}/100 — ${scoreLabel}`;
}

function calculateCompatibility(chart1: BaziData, chart2: BaziData, language: Language): CompatibilityResult {
  let score = 50;

  const elementAnalysis = calcElementCompatibility(chart1.dayMasterElement, chart2.dayMasterElement, language);
  score += elementAnalysis.score;

  const stemMatch = calcStemCompatibility(chart1, chart2, language);
  score += stemMatch.score;

  const branchMatch = calcBranchCompatibility(chart1, chart2, language);
  score += branchMatch.score;

  score = Math.max(0, Math.min(100, score));

  const advice = buildCompatibilityAdvice({ score, elementAnalysis, stemMatch, branchMatch, advice: '' }, chart1, chart2, language);

  return { score, elementAnalysis, stemMatch, branchMatch, advice };
}

// ─── AI prompt builder ────────────────────────────────────────────────────────

function buildAILoveMatchPrompt(chart1: BaziData, chart2: BaziData, result: CompatibilityResult, language: Language): string {
  const dm1 = chart1.dayMasterElement;
  const dm2 = chart2.dayMasterElement;

  const el1 = language === 'zh' ? ELEMENT_NAMES[dm1] : ELEMENT_NAMES_EN[dm1];
  const el2 = language === 'zh' ? ELEMENT_NAMES[dm2] : ELEMENT_NAMES_EN[dm2];

  if (language === 'zh') {
    return `作为专业命理师，请深度分析以下八字合婚配对：

【甲方】
年柱：${chart1.year.heavenlyStem}${chart1.year.earthlyBranch}（${chart1.year.element}）
月柱：${chart1.month.heavenlyStem}${chart1.month.earthlyBranch}（${chart1.month.element}）
日柱：${chart1.day.heavenlyStem}${chart1.day.earthlyBranch}（${chart1.day.element}）
时柱：${chart1.hour.heavenlyStem}${chart1.hour.earthlyBranch}（${chart1.hour.element}）
日主：${el1}行

【乙方】
年柱：${chart2.year.heavenlyStem}${chart2.year.earthlyBranch}（${chart2.year.element}）
月柱：${chart2.month.heavenlyStem}${chart2.month.earthlyBranch}（${chart2.month.element}）
日柱：${chart2.day.heavenlyStem}${chart2.day.earthlyBranch}（${chart2.day.element}）
时柱：${chart2.hour.heavenlyStem}${chart2.hour.earthlyBranch}（${chart2.hour.element}）
日主：${el2}行

【合盘结果】
综合评分：${result.score}/100
五行分析：${result.elementAnalysis.details}（${result.elementAnalysis.score > 0 ? '+' : ''}${result.elementAnalysis.score}）
天干合化：${result.stemMatch.details}（+${result.stemMatch.score}）
地支关系：${result.branchMatch.details}（${result.branchMatch.score > 0 ? '+' : ''}${result.branchMatch.score}）

请提供300-500字的深度解读，涵盖：
1. 双方五行性格差异与互补
2. 婚姻生活中的潜在挑战与化解建议
3. 夫妻宫/婚元星角度分析
4. 最佳相处模式与建议

请用温暖、专业、富有洞察力的语言回复，并包含免责声明。`;
  } else {
    return `As a professional astrologer, please deeply analyze this BaZi marriage compatibility:

【Person 1】
Year: ${chart1.year.heavenlyStem}${chart1.year.earthlyBranch} (${chart1.year.element})
Month: ${chart1.month.heavenlyStem}${chart1.month.earthlyBranch} (${chart1.month.element})
Day: ${chart1.day.heavenlyStem}${chart1.day.earthlyBranch} (${chart1.day.element})
Hour: ${chart1.hour.heavenlyStem}${chart1.hour.earthlyBranch} (${chart1.hour.element})
Day Master: ${el1} element

【Person 2】
Year: ${chart2.year.heavenlyStem}${chart2.year.earthlyBranch} (${chart2.year.element})
Month: ${chart2.month.heavenlyStem}${chart2.month.earthlyBranch} (${chart2.month.element})
Day: ${chart2.day.heavenlyStem}${chart2.day.earthlyBranch} (${chart2.day.element})
Hour: ${chart2.hour.heavenlyStem}${chart2.hour.earthlyBranch} (${chart2.hour.element})
Day Master: ${el2} element

【Compatibility Result】
Overall Score: ${result.score}/100
Element Analysis: ${result.elementAnalysis.details} (${result.elementAnalysis.score > 0 ? '+' : ''}${result.elementAnalysis.score})
Stem Combinations: ${result.stemMatch.details} (+${result.stemMatch.score})
Branch Relations: ${result.branchMatch.details} (${result.branchMatch.score > 0 ? '+' : ''}${result.branchMatch.score})

Please provide a 300-500 word deep interpretation covering:
1. Elemental personality differences and complementary aspects
2. Potential challenges in married life and remedies
3. Marriage palace / relationship analysis
4. Optimal relationship dynamics and advice

Use warm, professional, and insightful language. Include a disclaimer.`;
  }
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: LoveMatchRequest = await request.json();
    const { person1, person2, enhanceWithAI = false, language = 'zh' } = body;

    if (!person1 || !person2) {
      return NextResponse.json({ error: 'person1 and person2 (BaZiData) are required.' }, { status: 400 });
    }

    const result = calculateCompatibility(person1, person2, language);

    const response: Record<string, unknown> = {
      person1,
      person2,
      compatibility: result,
      meta: { platform: 'TianJi Global | 天机全球', version: '1.0.0' },
    };

    if (enhanceWithAI) {
      try {
        const aiPrompt = buildAILoveMatchPrompt(person1, person2, result, language);
        const systemPrompt = language === 'zh'
          ? '你是一位融合传统命理学与现代心理学的专业命理师。请用JSON格式回复。'
          : 'You are a professional astrologer specializing in Chinese metaphysics and modern psychology. Please respond in JSON format.';

        const aiResult = await generateReport({
          prompt: aiPrompt,
          systemPrompt,
          taskType: 'analysis',
          responseFormat: 'text',
          maxTokens: 2048,
        });

        response.aiInterpretation = aiResult.content;
        response.disclaimer = language === 'zh'
          ? '本报告仅供娱乐与自我探索，不构成医疗、法律或财务建议。重要人生决策请咨询具备资质的专业人士。'
          : 'This reading is for entertainment and self-reflection purposes only. It does not constitute medical, legal, or financial advice. Always consult a qualified professional for important life decisions.';
        response.aiMeta = {
          provider: aiResult.provider,
          model: aiResult.model,
          latencyMs: aiResult.latencyMs,
          costUSD: aiResult.costUSD,
        };
      } catch (aiErr) {
        response.aiError = aiErr instanceof Error ? aiErr.message : 'AI interpretation failed';
      }
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
