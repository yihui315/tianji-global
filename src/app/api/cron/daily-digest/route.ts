/**
 * Daily Digest Cron Job — TianJi Global
 *
 * GET /api/cron/daily-digest
 * Runs daily at 08:00 UTC (configured in vercel.json).
 * Queries all users with enabled email subscriptions and sends
 * a personalised daily fortune digest via Resend.
 */

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { interpretBazi, interpretYiJing, interpretTarot } from '@/lib/ai-interpreter';
import type { BaziData, YiJingData, TarotData } from '@/lib/ai-prompts';
import { Resend } from 'resend';
import { DailyDigestEmail } from '@/components/emails/DailyDigestEmail';
import { shuffleDeck, drawCards } from '@/lib/tarot';

// ─── Constants ─────────────────────────────────────────────────────────────────

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'TianJi Global <noreply@tianji.global>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tianji.global';

const LUCKY_ELEMENTS_ZH = ['木', '火', '土', '金', '水'];
const LUCKY_ELEMENTS_EN = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const LUCKY_COLORS_ZH = ['绿色', '红色', '黄色', '白色', '黑色'];
const LUCKY_COLORS_EN = ['Green', 'Red', 'Yellow', 'White', 'Black'];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FortuneResult {
  summary: string;
  luckyElement?: string;
  luckyNumber?: string;
  luckyColor?: string;
  overallScore?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getDailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 1000 + d.getMonth() * 100 + d.getDate();
}

function generateFallbackFortune(
  service: string,
  language: 'en' | 'zh'
): FortuneResult {
  const seed = getDailySeed();
  const fallbacks: Record<string, Record<'zh' | 'en', string>> = {
    bazi: {
      zh: '今日八字运势平稳，注意调节情绪与作息。',
      en: 'Your BaZi fortune today is steady. Pay attention to emotional balance.',
    },
    yijing: {
      zh: '今日易经指引：静心观察，顺势而为。',
      en: 'YiJing guidance for today: observe calmly and follow the flow.',
    },
    tarot: {
      zh: '今日塔罗指引：静心聆听内心的声音。',
      en: "Today's Tarot guidance: listen to your inner voice.",
    },
    fortune: {
      zh: '今日整体运势良好，适合新计划的开展。',
      en: 'Overall fortune today is favorable for new endeavors.',
    },
  };

  return {
    summary: fallbacks[service]?.[language] || fallbacks[service]?.zh || '',
    luckyNumber: String(((seed + dayOfYear()) % 9) + 1),
    overallScore: ((seed + dayOfYear()) % 40) + 60,
  };
}

// ─── Fortune Generators ────────────────────────────────────────────────────────

async function generateBaziFortune(
  userId: string,
  language: 'en' | 'zh' = 'zh'
): Promise<FortuneResult> {
  try {
    const result = await pool.query(
      `SELECT birth_data FROM readings
       WHERE user_id = $1 AND service_type = 'bazi'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    let baziData: BaziData | null = null;

    if (result.rows.length > 0) {
      const birthData = result.rows[0].birth_data as Record<string, unknown>;
      if (birthData?.year && birthData?.month && birthData?.day) {
        baziData = {
          year: { heavenlyStem: String(birthData.yearStem || '甲'), earthlyBranch: String(birthData.yearBranch || '子'), element: String(birthData.yearElement || 'Wood') },
          month: { heavenlyStem: String(birthData.monthStem || '甲'), earthlyBranch: String(birthData.monthBranch || '子'), element: String(birthData.monthElement || 'Wood') },
          day: { heavenlyStem: String(birthData.dayStem || '甲'), earthlyBranch: String(birthData.dayBranch || '子'), element: String(birthData.dayElement || 'Wood') },
          hour: { heavenlyStem: String(birthData.hourStem || '甲'), earthlyBranch: String(birthData.hourBranch || '子'), element: String(birthData.hourElement || 'Wood') },
          dayMasterElement: String(birthData.dayMasterElement || 'Wood'),
          gender: String(birthData.gender || 'unspecified'),
        };
      }
    }

    if (!baziData) {
      return generateFallbackFortune('bazi', language);
    }

    const { aiInterpretation } = await interpretBazi(baziData, language);
    const seed = getDailySeed();

    const summary = aiInterpretation?.slice(0, 200) + (aiInterpretation && aiInterpretation.length > 200 ? '…' : '');

    return {
      summary: summary || (language === 'zh' ? '今日八字运势平稳，注意调节情绪。' : 'Your BaZi fortune today is steady. Pay attention to emotional balance.'),
      luckyElement: language === 'zh' ? randomItem(LUCKY_ELEMENTS_ZH) : randomItem(LUCKY_ELEMENTS_EN),
      luckyNumber: String(((seed + dayOfYear()) % 9) + 1),
      luckyColor: language === 'zh' ? randomItem(LUCKY_COLORS_ZH) : randomItem(LUCKY_COLORS_EN),
      overallScore: ((seed + dayOfYear()) % 40) + 60,
    };
  } catch (err) {
    console.error('[digest] BaZi fortune error:', err);
    return generateFallbackFortune('bazi', language);
  }
}

async function generateYijingFortune(
  _userId: string,
  language: 'en' | 'zh' = 'zh'
): Promise<FortuneResult> {
  try {
    const seed = getDailySeed();
    const hexagramNumber = ((seed + dayOfYear()) % 64) + 1;

    const yijingData: YiJingData = {
      hexagramNumber,
      question: language === 'zh' ? '今日运势如何？' : 'What is my fortune today?',
    };

    const { aiInterpretation } = await interpretYiJing(yijingData, language);
    const summary = aiInterpretation?.slice(0, 200) + (aiInterpretation && aiInterpretation.length > 200 ? '…' : '');

    return {
      summary: summary || (language === 'zh' ? `今日易经运势：第${hexagramNumber}卦，静心观察，顺势而为。` : `YiJing reading: Hexagram ${hexagramNumber}. Observe calmly and follow the flow.`),
      luckyNumber: String(((seed + dayOfYear()) % 9) + 1),
      overallScore: ((seed + dayOfYear()) % 40) + 60,
    };
  } catch (err) {
    console.error('[digest] YiJing fortune error:', err);
    return generateFallbackFortune('yijing', language);
  }
}

async function generateTarotFortune(
  _userId: string,
  language: 'en' | 'zh' = 'zh'
): Promise<FortuneResult> {
  try {
    const seed = getDailySeed();
    const deck = shuffleDeck();
    const drawn = drawCards(deck, 1);

    const tarotData: TarotData = {
      cards: drawn.map((c) => ({
        ...c.card,
        isReversed: c.isReversed,
        position: c.position,
      })),
      spreadType: 'single',
      question: language === 'zh' ? '今日运势如何？' : 'What is my fortune today?',
    };

    const { aiInterpretation } = await interpretTarot(tarotData, language);
    const cardName = drawn[0]?.card?.nameChinese || drawn[0]?.card?.name || '';
    const summary = aiInterpretation?.slice(0, 200) + (aiInterpretation && aiInterpretation.length > 200 ? '…' : '');

    return {
      summary: summary || (language === 'zh' ? `今日塔罗指引：${cardName}，静心聆听内心的声音。` : `Today's Tarot: ${cardName || 'the cards'} — listen to your inner voice.`),
      luckyNumber: String(((seed + dayOfYear()) % 9) + 1),
      overallScore: ((seed + dayOfYear()) % 40) + 60,
    };
  } catch (err) {
    console.error('[digest] Tarot fortune error:', err);
    return generateFallbackFortune('tarot', language);
  }
}

// ─── Main GET handler ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Optional cron secret auth
  if (process.env.CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (!RESEND_API_KEY) {
    console.error('[digest] RESEND_API_KEY not set');
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    // 1. Fetch all users with enabled daily subscriptions
    const usersResult = await pool.query(
      `SELECT DISTINCT u.id, u.email, u.name, u.image
       FROM users u
       INNER JOIN user_subscriptions us ON us.user_id = u.id
       WHERE us.enabled = true AND us.frequency = 'daily'`,
    );

    if (usersResult.rows.length === 0) {
      return NextResponse.json({ message: 'No subscribers found', sent: 0 });
    }

    const serviceLabels: Record<string, Record<'zh' | 'en', string>> = {
      bazi: { zh: '八字 · BaZi', en: 'BaZi · Eight Characters' },
      yijing: { zh: '易经 · YiJing', en: 'YiJing · I Ching' },
      tarot: { zh: '塔罗 · Tarot', en: 'Tarot' },
      fortune: { zh: '人生运势 · Fortune', en: 'Fortune Reading' },
    };

    let successCount = 0;
    let errorCount = 0;

    const BATCH_SIZE = 10;
    for (let i = 0; i < usersResult.rows.length; i += BATCH_SIZE) {
      const batch = usersResult.rows.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (user) => {
          try {
            // 2. Get user's subscribed services
            const subsResult = await pool.query(
              `SELECT service_type FROM user_subscriptions
               WHERE user_id = $1 AND enabled = true`,
              [user.id],
            );

            // Detect user language from their most recent reading
            const langResult = await pool.query(
              `SELECT language FROM readings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
              [user.id],
            );
            const language: 'zh' | 'en' = (langResult.rows[0]?.language as 'zh' | 'en') || 'zh';

            const sections: FortuneResult[] = [];

            for (const sub of subsResult.rows) {
              const { service_type: serviceType } = sub;

              let fortune: FortuneResult | null = null;

              switch (serviceType) {
                case 'bazi':
                  fortune = await generateBaziFortune(user.id, language);
                  break;
                case 'yijing':
                  fortune = await generateYijingFortune(user.id, language);
                  break;
                case 'tarot':
                  fortune = await generateTarotFortune(user.id, language);
                  break;
                case 'fortune':
                  fortune = generateFallbackFortune('fortune', language);
                  break;
              }

              if (fortune) {
                sections.push({
                  ...fortune,
                  serviceType,
                  serviceLabel: serviceLabels[serviceType]?.[language] || serviceType,
                } as FortuneResult & { serviceType: string; serviceLabel: string });
              }
            }

            if (sections.length === 0) return;

            const unsubscribeUrl = `${APP_URL}/api/unsubscribe?token=${user.id}`;
            const digestUrl = `${APP_URL}/dashboard`;

            const emailHtml = await DailyDigestEmail({
              userName: user.name || user.email?.split('@')[0] || (language === 'zh' ? '您' : 'you'),
              digestUrl,
              unsubscribeUrl,
              sections: sections as FortuneResult[],
              language,
            });

            const today = new Date();
            const dateStr = today.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric' });
            const subject = language === 'zh'
              ? `✨ ${dateStr} 每日运势已更新`
              : `✨ Your ${dateStr} Daily Fortune Is Ready`;

            const { error } = await resend.emails.send({
              from: FROM_EMAIL,
              to: user.email,
              subject,
              html: emailHtml.toString(),
            });

            if (error) {
              console.error(`[digest] Failed to send to ${user.email}:`, error);
              errorCount++;
              return;
            }

            // Log each digest
            await Promise.allSettled(
              sections.map((s: FortuneResult & { serviceType?: string }) =>
                pool.query(
                  `INSERT INTO email_digests (user_id, service_type, email_type) VALUES ($1, $2, 'daily_digest')`,
                  [user.id, (s as { serviceType: string }).serviceType || 'unknown'],
                ),
              ),
            );

            successCount++;
            console.log(`[digest] Sent daily digest to ${user.email}`);
          } catch (err) {
            console.error(`[digest] Error for user ${user.id}:`, err);
            errorCount++;
          }
        }),
      );
    }

    return NextResponse.json({
      message: 'Daily digest job completed',
      sent: successCount,
      errors: errorCount,
    });
  } catch (err) {
    console.error('[digest] Cron job failed:', err);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
