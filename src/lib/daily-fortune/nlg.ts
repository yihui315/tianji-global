import type { DailyFortuneReport } from '@/types/daily-fortune';
import { hasUnsafeFortuneCopy, sanitizeFortuneCopy } from '@/lib/daily-fortune/safety';

function isNlgAllowed(report: DailyFortuneReport): boolean {
  return (
    process.env.DAILY_FORTUNE_NLG_ENABLED === 'true' &&
    Boolean(process.env.OPENAI_API_KEY) &&
    (report.tier === 'premium' || report.tier === 'pro')
  );
}

function safeString(value: unknown, fallback: string, language: DailyFortuneReport['language']): string {
  if (typeof value !== 'string' || value.trim().length < 4) return fallback;
  const text = value.trim().slice(0, 1000);
  if (hasUnsafeFortuneCopy(text)) return fallback;
  return sanitizeFortuneCopy(text, language);
}

export async function maybeEnhanceDailyFortuneNarrative(
  report: DailyFortuneReport
): Promise<DailyFortuneReport> {
  if (!isNlgAllowed(report)) return report;

  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: process.env.DAILY_FORTUNE_NLG_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Rewrite only the supplied structured Daily Fortune fields. Do not add new claims, professional advice, medical/legal/financial instructions, fear language, or deterministic relationship outcomes. Return JSON only.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            language: report.language,
            scores: report.scores,
            headline: report.headline,
            summary: report.summary,
            drivers: report.drivers,
            riskTags: report.riskTags,
            remedies: report.remedies,
            disclaimer: report.disclaimer,
            output: {
              headline: 'string',
              summary: 'string',
            },
          }),
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return report;

    const parsed = JSON.parse(raw) as { headline?: unknown; summary?: unknown };
    const headline = safeString(parsed.headline, report.headline, report.language);
    const summary = safeString(parsed.summary, report.summary, report.language);

    return {
      ...report,
      headline,
      summary,
      generatedBy: `${report.generatedBy}+nlg_v1`,
    };
  } catch {
    return report;
  }
}
