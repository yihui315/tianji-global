/**
 * Telegram Bot Service — TianJi Global
 *
 * Low-level wrapper around the Telegram Bot API for sending messages
 * and triggering AI-powered fortune replies.
 */

import { interpretFortune, interpretTarot } from '@/lib/ai-interpreter';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

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

// ─── Fortune helpers ─────────────────────────────────────────────────────────

/**
 * Fetch today's fortune for the user and send it as a Telegram message.
 */
export async function sendDailyFortune(chatId: string): Promise<void> {
  // TODO: pull user's birth data from telegram_users table
  const data = {
    date: new Date().toISOString().split('T')[0],
    type: 'daily' as const,
  };

  const { aiInterpretation, disclaimer } = await interpretFortune(data, 'zh');

  const text = [
    '🔮 <b>今日运势</b>',
    '',
    aiInterpretation,
    '',
    '━━━━━━━━━━━━━━',
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
