/**
 * Telegram Webhook Handler — TianJi Global
 *
 * Receives inbound message updates from Telegram via webhook.
 * Validates the request with a Bearer token, parses commands,
 * and dispatches to the appropriate handler.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendMessage, sendDailyFortune, sendTarotCard } from '@/lib/telegram-bot';
import { pool } from '@/lib/db';

// ─── Auth ────────────────────────────────────────────────────────────────────

function validateSecret(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  return token === process.env.TELEGRAM_BOT_SECRET;
}

// ─── DB helpers ──────────────────────────────────────────────────────────────

async function upsertTelegramUser(chatId: string, language = 'zh'): Promise<void> {
  await pool.query(
    `INSERT INTO telegram_users (telegram_chat_id, language)
     VALUES ($1, $2)
     ON CONFLICT (telegram_chat_id) DO UPDATE SET language = EXCLUDED.language`,
    [chatId, language]
  );
}

async function getTelegramUser(chatId: string) {
  const { rows } = await pool.query(
    'SELECT * FROM telegram_users WHERE telegram_chat_id = $1',
    [chatId]
  );
  return rows[0] ?? null;
}

async function updateBirthData(
  chatId: string,
  birthDate: string,
  birthTime: string
): Promise<void> {
  await pool.query(
    `INSERT INTO telegram_users (telegram_chat_id, birth_date, birth_time)
     VALUES ($1, $2, $3)
     ON CONFLICT (telegram_chat_id)
     DO UPDATE SET birth_date = EXCLUDED.birth_date, birth_time = EXCLUDED.birth_time`,
    [chatId, birthDate, birthTime]
  );
}

async function setSubscription(chatId: string, subscribed: boolean): Promise<void> {
  await pool.query(
    `UPDATE telegram_users SET subscribed = $1 WHERE telegram_chat_id = $2`,
    [subscribed, chatId]
  );
}

// ─── Command handlers ────────────────────────────────────────────────────────

async function cmdStart(chatId: string): Promise<void> {
  await upsertTelegramUser(chatId);
  const text = [
    '🌟 <b>欢迎来到天机全球 (TianJi Global)</b>',
    '',
    '我是您的智能玄学助手，帮助您探索八字、塔罗、每日运势等神秘学奥秘。',
    '',
    '请选择您的语言 / Please select your language:',
    '',
    '1️⃣ 中文',
    '2️⃣ English',
    '',
    '发送 <code>/help</code> 查看所有命令。',
  ].join('\n');
  await sendMessage(chatId, text, 'HTML');
}

async function cmdBazi(chatId: string, date: string, time: string): Promise<void> {
  // Basic validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const timeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;

  if (!dateRegex.test(date) || !timeRegex.test(time)) {
    await sendMessage(
      chatId,
      '❌ 日期格式有误。请使用: <code>/bazi 1990-01-15 14:30</code>',
      'HTML'
    );
    return;
  }

  await updateBirthData(chatId, date, time);

  const text = [
    '✅ <b>八字信息已登记</b>',
    `出生日期: ${date}`,
    `出生时间: ${time}`,
    '',
    '您的命盘已保存！发送 <code>/daily</code> 获取今日运势，或 <code>/tarot</code> 抽取塔罗牌。',
  ].join('\n');
  await sendMessage(chatId, text, 'HTML');
}

async function cmdDaily(chatId: string): Promise<void> {
  await sendMessage(chatId, '🔮 正在生成今日运势，请稍候...', 'HTML');
  try {
    const user = await getTelegramUser(chatId);
    await sendDailyFortune(chatId, user);
  } catch (err) {
    console.error('[telegram] daily fortune error:', err);
    await sendMessage(
      chatId,
      '⚠️ 运势生成失败，请稍后再试。/ Fortune generation failed, please try again.'
    );
  }
}

async function cmdTarot(chatId: string): Promise<void> {
  await sendMessage(chatId, '🃏 正在洗牌，请稍候...', 'HTML');
  try {
    await sendTarotCard(chatId);
  } catch (err) {
    console.error('[telegram] tarot error:', err);
    await sendMessage(
      chatId,
      '⚠️ 塔罗牌生成失败，请稍后再试。/ Tarot reading failed, please try again.'
    );
  }
}

async function cmdLove(chatId: string, dateStr: string): Promise<void> {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    await sendMessage(
      chatId,
      '❌ 日期格式有误。请使用: <code>/love 1990-01-15</code>',
      'HTML'
    );
    return;
  }

  // Quick love compatibility stub — delegates to interpretFortune
  const { interpretFortune } = await import('@/lib/ai-interpreter');
  const { aiInterpretation, disclaimer } = await interpretFortune(
    { date: dateStr, type: 'love' },
    'zh'
  );

  const text = [
    '💕 <b>姻缘速测</b>',
    `日期: ${dateStr}`,
    '',
    aiInterpretation,
    '',
    '━━━━━━━━━━━━━━',
    disclaimer,
  ].join('\n');

  await sendMessage(chatId, text, 'HTML');
}

async function cmdSubscribe(chatId: string): Promise<void> {
  await setSubscription(chatId, true);
  await sendMessage(
    chatId,
    '✅ <b>订阅成功</b>\n您将每天收到运势推送！\n\n发送 /unsubscribe 可取消订阅。',
    'HTML'
  );
}

async function cmdUnsubscribe(chatId: string): Promise<void> {
  await setSubscription(chatId, false);
  await sendMessage(
    chatId,
    '🔕 <b>已取消订阅</b>\n您将不再收到每日推送。\n\n发送 /subscribe 可重新开启。',
    'HTML'
  );
}

async function cmdHelp(chatId: string): Promise<void> {
  const text = [
    '📖 <b>命令列表</b>',
    '',
    '<code>/start</code> — 欢迎 & 语言选择',
    '<code>/bazi YYYY-MM-DD HH:MM</code> — 登记出生信息',
    '<code>/daily</code> / <code>/dailyfortune</code> — 今日运势',
    '<code>/tarot</code> — 抽取塔罗牌',
    '<code>/love YYYY-MM-DD</code> — 姻缘速测',
    '<code>/subscribe</code> — 开启每日推送',
    '<code>/unsubscribe</code> — 取消每日推送',
    '<code>/help</code> — 显示此帮助',
    '',
    '━━━━━━━━━━━━━━',
    'TianJi Global · 玄学平台',
  ].join('\n');
  await sendMessage(chatId, text, 'HTML');
}

// ─── Router ─────────────────────────────────────────────────────────────────

async function handleMessage(msg: {
  chat: { id: number };
  text?: string;
  from?: { id: number };
}): Promise<void> {
  const chatId = String(msg.chat.id);
  const text = (msg.text ?? '').trim();
  if (!text) return;

  const user = await getTelegramUser(chatId);
  const lang = (user?.language as 'zh' | 'en') ?? 'zh';

  // Route commands
  if (text === '/start') {
    await cmdStart(chatId);
  } else if (text.startsWith('/bazi')) {
    const parts = text.split(' ');
    // /bazi YYYY-MM-DD HH:MM
    if (parts.length >= 3) {
      const date = parts[1];
      const time = parts[2];
      await cmdBazi(chatId, date, time);
    } else {
      await sendMessage(
        chatId,
        '❌ 参数不足。使用格式: <code>/bazi 1990-01-15 14:30</code>',
        'HTML'
      );
    }
  } else if (text === '/daily' || text === '/dailyfortune') {
    await cmdDaily(chatId);
  } else if (text === '/tarot') {
    await cmdTarot(chatId);
  } else if (text.startsWith('/love')) {
    const parts = text.split(' ');
    if (parts.length >= 2) {
      await cmdLove(chatId, parts[1]);
    } else {
      await sendMessage(
        chatId,
        '❌ 参数不足。使用格式: <code>/love 1990-01-15</code>',
        'HTML'
      );
    }
  } else if (text === '/subscribe') {
    await cmdSubscribe(chatId);
  } else if (text === '/unsubscribe') {
    await cmdUnsubscribe(chatId);
  } else if (text === '/help') {
    await cmdHelp(chatId);
  } else if (text.startsWith('/')) {
    // Unknown command
    await sendMessage(
      chatId,
      `❓ 未知命令: ${text}\n\n发送 <code>/help</code> 查看所有命令。`,
      'HTML'
    );
  }
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Validate secret
  if (!validateSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse update
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 3. Handle message
  const message = body.message as {
    chat: { id: number };
    text?: string;
    from?: { id: number };
  } | undefined;

  if (message) {
    try {
      await handleMessage(message);
    } catch (err) {
      console.error('[telegram webhook] handler error:', err);
      // Always return 200 to Telegram so it doesn't retry
    }
  }

  return NextResponse.json({ ok: true });
}

// Telegram sends GET for webhook verification (not typically used but safe)
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: true, message: 'TianJi Global Bot is running' });
}
