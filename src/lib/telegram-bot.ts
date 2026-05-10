/**
 * Telegram Bot Service — TianJi Global
 *
 * Low-level wrapper around the Telegram Bot API for sending messages
 * and triggering AI-powered fortune replies.
 */

import { interpretFortune, interpretTarot } from '@/lib/ai-interpreter';
import { calculateBaZi } from '@/lib/bazi';
import { pool } from '@/lib/db';
import type { DailyFortuneReport } from '@/types/daily-fortune';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

function isDailyFortuneFeatureEnabled(): boolean {
  return process.env.DAILY_FORTUNE_ENABLED === 'true';
}

function normalizeTelegramLanguage(value: unknown): 'zh' | 'en' {
  return value === 'en' ? 'en' : 'zh';
}

function todayTelegramIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface TelegramUser {
  user_id?: string | null;
  telegram_chat_id: string;
  birth_date: string | null;
  birth_time: string | null;
  language: string;
  subscribed: boolean;
  gender?: string;
}

// ─── Fortune calculation (seeded deterministic) ────────────────────────────

const LIFE_PHASES = [
  { ageStart: 0, ageEnd: 9, phase: '童年', phaseEn: 'Childhood' },
  { ageStart: 10, ageEnd: 19, phase: '少年', phaseEn: 'Youth' },
  { ageStart: 20, ageEnd: 29, phase: '青年', phaseEn: 'Young Adult' },
  { ageStart: 30, ageEnd: 39, phase: '而立', phaseEn: 'Establishing' },
  { ageStart: 40, ageEnd: 49, phase: '不惑', phaseEn: 'Clarifying' },
  { ageStart: 50, ageEnd: 59, phase: '知命', phaseEn: 'Wisdom' },
  { ageStart: 60, ageEnd: 69, phase: '耳顺', phaseEn: 'Harmony' },
  { ageStart: 70, ageEnd: 79, phase: '花甲', phaseEn: 'Retirement' },
  { ageStart: 80, ageEnd: 89, phase: '古稀', phaseEn: 'Longevity' },
  { ageStart: 90, ageEnd: 99, phase: '耄耋', phaseEn: 'Elder' },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

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

export function buildFortuneCycles(birthYear: number, birthMonth: number, birthDay: number): FortuneCycle[] {
  const rand = seededRandom(birthYear * 10000 + birthMonth * 100 + birthDay);

  return LIFE_PHASES.map(p => {
    const base = 40 + rand() * 30;
    const career = Math.round(Math.min(100, Math.max(0, base + (rand() - 0.5) * 30)));
    const wealth = Math.round(Math.min(100, Math.max(0, base + (rand() - 0.5) * 30)));
    const love = Math.round(Math.min(100, Math.max(0, base + (rand() - 0.5) * 30)));
    const health = Math.round(Math.min(100, Math.max(0, base + 15 + (rand() - 0.5) * 20)));
    const overall = Math.round((career + wealth + love + health) / 4);

    return { ...p, overall, career, wealth, love, health };
  });
}

export function calcAge(birthYear: number, birthMonth: number, birthDay: number): number {
  const now = new Date();
  const birth = new Date(birthYear, birthMonth - 1, birthDay);
  let age = now.getFullYear() - birthYear;
  const monthDiff = now.getMonth() - (birthMonth - 1);
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDay)) age--;
  return Math.max(1, age);
}

export function getCurrentPhase(age: number): { phase: string; phaseEn: string } {
  const cycle = LIFE_PHASES.find(c => age >= c.ageStart && age <= c.ageEnd);
  return cycle ?? { phase: '未知', phaseEn: 'Unknown' };
}

// ─── Core send ───────────────────────────────────────────────────────────────

export async function sendMessage(
  chatId: string,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<void> {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API error ${res.status}: ${body}`);
  }
}

// ─── User data helpers ───────────────────────────────────────────────────────

/**
 * Retrieve a telegram user by chatId.
 */
export async function getTelegramUser(chatId: string): Promise<TelegramUser | null> {
  try {
    const { rows } = await pool.query<TelegramUser>(
      'SELECT user_id, telegram_chat_id, birth_date, birth_time, language, subscribed, gender FROM telegram_users WHERE telegram_chat_id = $1',
      [chatId]
    );
    return rows[0] ?? null;
  } catch {
    const { rows } = await pool.query<TelegramUser>(
      'SELECT telegram_chat_id, birth_date, birth_time, language, subscribed, gender FROM telegram_users WHERE telegram_chat_id = $1',
      [chatId]
    );
    return rows[0] ?? null;
  }
}

// ─── Fortune helpers ─────────────────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDailyFortuneTelegramMessage(report: DailyFortuneReport, lang: 'zh' | 'en'): string {
  const scoreLine = lang === 'en'
    ? `Overall ${report.scores.overall} | Love ${report.scores.love} | Career ${report.scores.career} | Wealth ${report.scores.wealth} | Energy ${report.scores.health}`
    : `总分 ${report.scores.overall} | 情感 ${report.scores.love} | 事业 ${report.scores.career} | 财富 ${report.scores.wealth} | 状态 ${report.scores.health}`;
  const remedyLines = report.remedies.slice(0, 2).map((remedy, index) => {
    const title = escapeHtml(remedy.title);
    const body = escapeHtml(remedy.body);
    return `${index + 1}. <b>${title}</b>\n${body}`;
  });
  const shortDisclaimer = lang === 'en'
    ? 'For entertainment and self-reflection only, not professional advice.'
    : '仅供娱乐与自我观察，不构成专业建议。';

  return [
    lang === 'en' ? '<b>Daily Fortune</b>' : '<b>今日运势</b>',
    escapeHtml(report.date),
    '',
    `<b>${escapeHtml(report.headline)}</b>`,
    escapeHtml(scoreLine),
    escapeHtml(report.summary),
    '',
    ...remedyLines,
    '',
    escapeHtml(shortDisclaimer),
  ].filter(Boolean).join('\n');
}

function formatTelegramBindPrompt(lang: 'zh' | 'en'): string {
  return lang === 'en'
    ? 'Daily Fortune needs a linked TianJi profile first. Please bind your birth profile in TianJi, then use /daily again.'
    : '今日运势需要先绑定 TianJi 个人资料。请先完成出生资料绑定，再使用 /daily。';
}

/**
 * Fetch today's fortune for the user and send it as a Telegram message.
 * When user birth data is available, includes personalized BaZi analysis.
 */
export async function sendDailyFortune(
  chatId: string,
  user?: TelegramUser | null
): Promise<void> {
  const lang = normalizeTelegramLanguage(user?.language);

  if (isDailyFortuneFeatureEnabled()) {
    const telegramUser = user ?? await getTelegramUser(chatId);
    const linkedUserId = telegramUser?.user_id;

    if (!linkedUserId) {
      await sendMessage(chatId, escapeHtml(formatTelegramBindPrompt(lang)), 'HTML');
      return;
    }

    const [{ getSupabaseAdmin }, { getOrCreateDailyFortuneReport }, { recordPushDeliveryLog }] =
      await Promise.all([
        import('@/lib/supabase'),
        import('@/lib/daily-fortune/service'),
        import('@/lib/daily-fortune/repository'),
      ]);
    const supabase = getSupabaseAdmin();
    const reportResult = await getOrCreateDailyFortuneReport({
      supabase,
      userId: linkedUserId,
      date: todayTelegramIsoDate(),
      systemType: 'bazi',
      language: lang,
    });

    if (!reportResult.success) {
      await recordPushDeliveryLog({
        supabase,
        input: {
          userId: linkedUserId,
          channel: 'telegram',
          target: chatId,
          status: 'failed',
          errorMessage: reportResult.error.message,
        },
      });
      await sendMessage(
        chatId,
        lang === 'en'
          ? 'Daily Fortune is temporarily unavailable. Please try again later.'
          : '今日运势暂时不可用，请稍后再试。',
        'HTML'
      );
      return;
    }

    try {
      await sendMessage(chatId, formatDailyFortuneTelegramMessage(reportResult.data, lang), 'HTML');
      await recordPushDeliveryLog({
        supabase,
        input: {
          reportId: reportResult.data.id,
          userId: linkedUserId,
          channel: 'telegram',
          target: chatId,
          status: 'sent',
          sentAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      await recordPushDeliveryLog({
        supabase,
        input: {
          reportId: reportResult.data.id,
          userId: linkedUserId,
          channel: 'telegram',
          target: chatId,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Telegram send failed.',
        },
      });
      throw error;
    }
    return;
  }

  // Personalised path: has birth date
  if (user?.birth_date && user.birth_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [yearStr, monthStr, dayStr] = user.birth_date.split('-');
    const birthYear = parseInt(yearStr, 10);
    const birthMonth = parseInt(monthStr, 10);
    const birthDay = parseInt(dayStr, 10);

    // Parse birth time for BaZi hour pillar
    let birthHour = 12; // default noon
    if (user.birth_time) {
      const timeMatch = user.birth_time.match(/^(\d{1,2}):(\d{2})/);
      if (timeMatch) birthHour = parseInt(timeMatch[1], 10);
    }

    const age = calcAge(birthYear, birthMonth, birthDay);
    const currentPhase = getCurrentPhase(age);
    const fortuneCycles = buildFortuneCycles(birthYear, birthMonth, birthDay);
    const bazi = calculateBaZi({ year: birthYear, month: birthMonth, day: birthDay, hour: birthHour });

    // Determine best / challenging periods based on scores
    const sorted = [...fortuneCycles].sort((a, b) => b.overall - a.overall);
    const bestPeriods = sorted.slice(0, 2).map(
      c => `${c.phaseEn} (${c.ageStart}-${c.ageEnd}): ★${c.overall}`
    );
    const challengingPeriods = sorted.slice(-2).map(
      c => `${c.phaseEn} (${c.ageStart}-${c.ageEnd}): ★${c.overall}`
    );

    const data = {
      birthYear,
      birthMonth,
      birthDay,
      gender: user.gender ?? undefined,
      currentAge: age,
      currentPhase: currentPhase.phase,
      currentPhaseEn: currentPhase.phaseEn,
      fortuneCycles,
      bestPeriods,
      challengingPeriods,
    };

    const { aiInterpretation, disclaimer } = await interpretFortune(data, lang);

    const baziText = [
      '🔮 <b>今日运势</b>',
      `📅 ${new Date().toLocaleDateString('zh-CN')} | ${currentPhase.phase} · ${currentPhase.phaseEn}`,
      '',
      '【八字基础】',
      `年柱: ${bazi.year.heavenlyStem}${bazi.year.earthlyBranch} (${bazi.year.element})`,
      `月柱: ${bazi.month.heavenlyStem}${bazi.month.earthlyBranch} (${bazi.month.element})`,
      `日柱: ${bazi.day.heavenlyStem}${bazi.day.earthlyBranch} (${bazi.day.element})`,
      `时柱: ${bazi.hour.heavenlyStem}${bazi.hour.earthlyBranch} (${bazi.hour.element})`,
      `日主: ${bazi.dayMasterElement}气`,
      '',
      '━━━━━━━━━━━━━━',
      aiInterpretation,
      '',
      '━━━━━━━━━━━━━━',
      disclaimer,
    ].join('\n');

    await sendMessage(chatId, baziText, 'HTML');
    return;
  }

  // Generic path: no birth data
  const { interpretFortune: genericInterpret } = await import('@/lib/ai-interpreter');
  const today = new Date().toISOString().split('T')[0];
  const { aiInterpretation, disclaimer } = await genericInterpret(
    { date: today, type: 'daily' } as never,
    lang
  );

  const text = [
    '🔮 <b>今日运势</b>',
    `📅 ${new Date().toLocaleDateString('zh-CN')}`,
    '',
    aiInterpretation,
    '',
    '━━━━━━━━━━━━━━',
    '⚠️ 尚未登记出生信息，使用 /bazi YYYY-MM-DD HH:MM 绑定后可获得个性化分析。',
    disclaimer,
  ].join('\n');

  await sendMessage(chatId, text, 'HTML');
}

/**
 * Draw a random tarot card and send its AI interpretation.
 */
export async function sendTarotCard(chatId: string): Promise<void> {
  const { majorArcana } = await import('@/lib/tarot');

  // Pick a random major arcana card
  const idx = Math.floor(Math.random() * majorArcana.length);
  const card = majorArcana[idx];
  const isReversed = Math.random() > 0.5;

  const cardData = {
    spread: {
      positions: [
        {
          name: 'Daily Guidance',
          nameEn: 'Daily Guidance',
          description: 'The main energy to focus on today.',
        },
      ],
      cards: [
      {
        name: card.nameChinese || card.name,
        nameEn: card.name,
        nameChinese: card.nameChinese,
        arcana: card.arcana,
        meaning: isReversed ? card.reversedMeaning : card.meaning,
        meaningChinese: isReversed ? card.reversedMeaningChinese : card.meaningChinese,
        uprightMeaning: card.meaning,
        reversedMeaning: card.reversedMeaning,
        isReversed,
      },
      ],
    },
    question: 'What does today want me to notice?',
  };

  const { aiInterpretation, disclaimer } = await interpretTarot(cardData, 'zh');

  const position = isReversed ? '逆位' : '正位';
  const text = [
    `🃏 <b>塔罗牌 — ${card.nameChinese} (${card.name})</b>`,
    `位置: ${position}`,
    '',
    `<b>牌义:</b> ${card.meaningChinese}`,
    '',
    aiInterpretation,
    '',
    '━━━━━━━━━━━━━━',
    disclaimer,
  ].join('\n');

  await sendMessage(chatId, text, 'HTML');
}
