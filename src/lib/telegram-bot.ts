/**
 * Telegram Bot Service — TianJi Global
 *
 * Low-level wrapper around the Telegram Bot API for sending messages
 * and triggering AI-powered fortune replies.
 */

import { interpretFortune, interpretTarot } from '@/lib/ai-interpreter';
import { calculateBaZi } from '@/lib/bazi';
import { pool } from '@/lib/db';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// ─── Types ─────────────────────────────────────────────────────────────────

export interface TelegramUser {
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
  const { rows } = await pool.query<TelegramUser>(
    'SELECT telegram_chat_id, birth_date, birth_time, language, subscribed, gender FROM telegram_users WHERE telegram_chat_id = $1',
    [chatId]
  );
  return rows[0] ?? null;
}

// ─── Fortune helpers ─────────────────────────────────────────────────────────

/**
 * Fetch today's fortune for the user and send it as a Telegram message.
 * When user birth data is available, includes personalized BaZi analysis.
 */
export async function sendDailyFortune(
  chatId: string,
  user?: TelegramUser | null
): Promise<void> {
  const lang = (user?.language as 'zh' | 'en') ?? 'zh';

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
    cards: [
      {
        id: card.id,
        name: card.name,
        nameChinese: card.nameChinese,
        arcana: card.arcana,
        meaning: isReversed ? card.reversedMeaning : card.meaning,
        meaningChinese: isReversed ? card.reversedMeaningChinese : card.meaningChinese,
        isReversed,
      },
    ],
    spreadType: 'single',
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
