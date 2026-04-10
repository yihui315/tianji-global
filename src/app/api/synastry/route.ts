import { NextRequest, NextResponse } from 'next/server';
import { computeSynastry, computeCompositeChart, computeDavisonChart, SynastryType } from '@/lib/synastry-engine';
import { generateReport } from '@/lib/ai-orchestrator';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PersonData {
  birthDate: string;
  birthTime: string;
  lat: number;
  lng: number;
}

interface SynastryRequest {
  person1: PersonData;
  person2: PersonData;
  enhanceWithAI?: boolean;
  language?: 'en' | 'zh';
  type?: SynastryType; // 'overlay' (default) | 'composite' | 'davison'
}

// ─── AI Prompt Builder ────────────────────────────────────────────────────────

function buildSynastryPrompt(
  p1Planets: ReturnType<typeof computeSynastry>['person1Chart'],
  p2Planets: ReturnType<typeof computeSynastry>['person2Chart'],
  aspects: ReturnType<typeof computeSynastry>['aspects'],
  overallScore: number,
  language: 'en' | 'zh'
): string {
  const planets1 = p1Planets.planets.map(p => `${p.name} ${p.signSymbol} ${p.signName} ${p.degree.toFixed(1)}°`).join(', ');
  const planets2 = p2Planets.planets.map(p => `${p.name} ${p.signSymbol} ${p.signName} ${p.degree.toFixed(1)}°`).join(', ');

  const majorAspects = aspects.slice(0, 10).map(a =>
    `${a.planet1} ${a.type} ${a.planet2} (orb ${a.orb}°, strength ${a.strength}%)`
  ).join('\n');

  const scoreLabel = overallScore >= 70 ? (language === 'zh' ? '高度和谐' : 'Highly Harmonious')
    : overallScore >= 50 ? (language === 'zh' ? '中等和谐' : 'Moderately Harmonious')
    : (language === 'zh' ? '需要努力' : 'Requires Effort');

  if (language === 'zh') {
    return `作为专业西方占星师，请深度分析以下星盘合盘（Synastry）：

【人物A 行星位置】
${planets1}

【人物B 行星位置】
${planets2}

【合盘主要相位】
${majorAspects || '无主要相位'}

【综合评分】${overallScore}/100 — ${scoreLabel}

请提供400-500字深度解读，涵盖：
1. 两人行星相位中的核心互动模式（太阳-太阳、月亮-月亮、金星-火星等）
2. 情感吸引力与沟通模式的相位分析
3. 关系中的优势与挑战
4. 相处建议与成长方向

请用温暖、专业、富有洞察力的语言回复，并包含免责声明。`;
  } else {
    return `As a professional Western Astrologer, please deeply analyze this Synastry chart comparison:

【Person A Planetary Positions】
${planets1}

【Person B Planetary Positions】
${planets2}

【Major Synastry Aspects】
${majorAspects || 'No major aspects found'}

【Overall Score】${overallScore}/100 — ${scoreLabel}

Please provide a 400-500 word deep interpretation covering:
1. Core interaction patterns from planetary aspects (Sun-Sun, Moon-Moon, Venus-Mars, etc.)
2. Emotional attraction and communication aspect analysis
3. Relationship strengths and challenges
4. Relationship advice and growth direction

Use warm, professional, and insightful language. Include a disclaimer.`;
  }
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: SynastryRequest = await request.json();
    const { person1, person2, enhanceWithAI = false, language = 'zh', type = 'overlay' } = body;

    if (!person1?.birthDate || !person1?.birthTime || !person2?.birthDate || !person2?.birthTime) {
      return NextResponse.json(
        { error: 'Both person1 and person2 must include birthDate and birthTime.' },
        { status: 400 }
      );
    }

    const response: Record<string, unknown> = {
      meta: { platform: 'TianJi Global | 天机全球', version: '1.0.0', type },
    };

    // Compute based on type
    if (type === 'composite') {
      const composite = computeCompositeChart(person1, person2);
      response.compositeChart = composite;
      response.person1Chart = composite; // Return composite as person1Chart for compatibility
      response.person2Chart = composite;
    } else if (type === 'davison') {
      const davison = computeDavisonChart(person1, person2);
      response.davisonChart = davison;
      response.person1Chart = davison;
      response.person2Chart = davison;
    } else {
      // Default: overlay synastry
      const synResult = computeSynastry(person1, person2);
      response.person1Chart = synResult.person1Chart;
      response.person2Chart = synResult.person2Chart;
      response.aspects = synResult.aspects;
      response.overallScore = synResult.overallScore;

      // AI enhancement (only for overlay synastry)
      if (enhanceWithAI) {
        try {
          const aiPrompt = buildSynastryPrompt(
            synResult.person1Chart,
            synResult.person2Chart,
            synResult.aspects,
            synResult.overallScore,
            language
          );

          const systemPrompt = language === 'zh'
            ? '你是一位融合传统占星学与现代心理学的专业西方占星师。请用JSON格式回复。'
            : 'You are a professional Western Astrologer specializing in psychological astrology and modern psychology. Please respond in JSON format.';

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
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error('Synastry API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
