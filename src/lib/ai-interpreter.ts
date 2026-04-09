/**
 * AI Interpreter — TianJi Global
 *
 * High-level helper that wraps generateReport() with the prompt library
 * (ai-prompts.ts) to produce enriched AI interpretations for each
 * fortune system. All AI outputs include a disclaimer.
 *
 * Usage:
 *   const result = await interpretBazi(baziChart, 'zh');
 *   const result = await interpretTarot(tarotData, 'en');
 */

import { generateReport } from '@/lib/ai-orchestrator';
import type { ReportResponse } from '@/types/ai';
export type { ReportResponse };
import {
  getBaziReportPrompt,
  getZiweiReportPrompt,
  getTarotReportPrompt,
  getYiJingReportPrompt,
  getFortuneReportPrompt,
  getPsychologyPrompt,
  type BaziData,
  type ZiweiData,
  type TarotData,
  type YiJingData,
  type FortuneData,
  type PsychologyData,
} from '@/lib/ai-prompts';

// ─── Shared disclaimer text ───────────────────────────────────────────────────

const DISCLAIMER_EN =
  'This reading is for entertainment and self-reflection purposes only. ' +
  'It does not constitute medical, legal, or financial advice. ' +
  'Always consult a qualified professional for important life decisions.';

const DISCLAIMER_ZH =
  '本报告仅供娱乐与自我探索，不构成医疗、法律或财务建议。' +
  '重要人生决策请咨询具备资质的专业人士。';

// ─── Generic interpreter ─────────────────────────────────────────────────────

async function callAI(
  prompt: string,
  language: 'en' | 'zh',
  taskType: 'analysis' = 'analysis'
): Promise<{ content: string; report: ReportResponse }> {
  const systemPrompt =
    language === 'zh'
      ? '你是一位融合传统命理学与现代心理学的专业命理师。请用JSON格式回复。'
      : 'You are a professional astrologer specializing in Chinese metaphysics and modern psychology. Please respond in JSON format.';

  const report = await generateReport({
    prompt,
    systemPrompt,
    taskType,
    responseFormat: 'text',
    maxTokens: 2048,
  });

  return { content: report.content, report };
}

// ─── Per-system interpreters ──────────────────────────────────────────────────

/**
 * Generate an AI-enriched BaZi (八字) report.
 */
export async function interpretBazi(
  data: BaziData,
  language: 'en' | 'zh' = 'en'
): Promise<{ aiInterpretation: string; report: ReportResponse; disclaimer: string }> {
  const prompt = getBaziReportPrompt(data, language);
  const { content, report } = await callAI(prompt, language);
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;
  return { aiInterpretation: content, report, disclaimer };
}

/**
 * Generate an AI-enriched Zi Wei Dou Shu (紫微斗数) report.
 */
export async function interpretZiwei(
  data: ZiweiData,
  language: 'en' | 'zh' = 'en'
): Promise<{ aiInterpretation: string; report: ReportResponse; disclaimer: string }> {
  const prompt = getZiweiReportPrompt(data, language);
  const { content, report } = await callAI(prompt, language);
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;
  return { aiInterpretation: content, report, disclaimer };
}

/**
 * Generate an AI-enriched Tarot reading report.
 */
export async function interpretTarot(
  data: TarotData,
  language: 'en' | 'zh' = 'en'
): Promise<{ aiInterpretation: string; report: ReportResponse; disclaimer: string }> {
  const prompt = getTarotReportPrompt(data, language);
  const { content, report } = await callAI(prompt, language);
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;
  return { aiInterpretation: content, report, disclaimer };
}

/**
 * Generate an AI-enriched Yi Jing (易经) hexagram report.
 */
export async function interpretYiJing(
  data: YiJingData,
  language: 'en' | 'zh' = 'en'
): Promise<{ aiInterpretation: string; report: ReportResponse; disclaimer: string }> {
  const prompt = getYiJingReportPrompt(data, language);
  const { content, report } = await callAI(prompt, language);
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;
  return { aiInterpretation: content, report, disclaimer };
}

/**
 * Generate an AI-enriched Fortune (人生运势) report.
 */
export async function interpretFortune(
  data: FortuneData,
  language: 'en' | 'zh' = 'en'
): Promise<{ aiInterpretation: string; report: ReportResponse; disclaimer: string }> {
  const prompt = getFortuneReportPrompt(data, language);
  const { content, report } = await callAI(prompt, language);
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;
  return { aiInterpretation: content, report, disclaimer };
}

/**
 * Generate a general psychology / self-reflection report via the /ask endpoint.
 */
export async function interpretPsychology(
  data: PsychologyData,
  language: 'en' | 'zh' = 'en'
): Promise<{ aiInterpretation: string; report: ReportResponse; disclaimer: string }> {
  const prompt = getPsychologyPrompt(data, language);
  const { content, report } = await callAI(prompt, language);
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;
  return { aiInterpretation: content, report, disclaimer };
}
