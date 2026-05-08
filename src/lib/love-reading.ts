import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import {
  attachCheckoutSessionToOrder,
  createPayPerUseOrder,
  getPaidPayPerUseOrder,
} from '@/lib/pay-per-use-orders';

export const LOVE_READING_UNLOCK_PRICE_USD_CENTS = 1299;
export const LOVE_READING_UNLOCK_PRICE_DISPLAY = '$12.99';

export type LoveReadingLanguage = 'en' | 'zh';
export type LoveReadingMode = 'solo' | 'relationship';

export interface LoveReadingBirthInput {
  year: string;
  month: string;
  day: string;
  time: string;
}

export interface LoveReadingSession {
  id: string;
  mode: LoveReadingMode;
  language: LoveReadingLanguage;
  birth: LoveReadingBirthInput;
  email?: string | null;
  teaser: string;
  fullReport: string;
  price: string;
  createdAt: string;
  expiresAt: string;
  emailRecoveryReady: boolean;
}

interface LoveReadingStore {
  sessions: Map<string, LoveReadingSession>;
}

declare global {
  // eslint-disable-next-line no-var
  var __tianjiLoveReadingStore: LoveReadingStore | undefined;
}

const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_SESSIONS = 1000;

export const loveReadingSessionSchema = z.object({
  mode: z.enum(['solo', 'relationship']).default('solo'),
  language: z.enum(['en', 'zh']).default('en'),
  birth: z.object({
    year: z.string().regex(/^\d{4}$/),
    month: z.string().regex(/^(0?[1-9]|1[0-2])$/),
    day: z.string().regex(/^(0?[1-9]|[12]\d|3[01])$/),
    time: z.string().min(2).max(24),
  }),
  email: z.string().email().optional().or(z.literal('')),
});

function getStore(): LoveReadingStore {
  if (!globalThis.__tianjiLoveReadingStore) {
    globalThis.__tianjiLoveReadingStore = {
      sessions: new Map(),
    };
  }

  return globalThis.__tianjiLoveReadingStore;
}

function pruneExpired(now = Date.now()) {
  const store = getStore();
  for (const [id, session] of store.sessions.entries()) {
    if (Date.parse(session.expiresAt) <= now) {
      store.sessions.delete(id);
    }
  }

  while (store.sessions.size > MAX_SESSIONS) {
    const oldest = store.sessions.keys().next().value;
    if (!oldest) break;
    store.sessions.delete(oldest);
  }
}

function createOpaqueId(): string {
  return randomUUID().replaceAll('-', '').slice(0, 24);
}

export function loveReadingRequestRef(id: string): string {
  return createHash('sha256').update(id).digest('hex');
}

export function loveReadingPaywallEnabled(): boolean {
  return process.env.ENABLE_PAY_PER_USE === 'true';
}

function monthName(month: string, language: LoveReadingLanguage): string {
  const monthNumber = Number(month);
  if (language === 'zh') {
    return `${monthNumber}月`;
  }

  return new Date(Date.UTC(2024, monthNumber - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  });
}

function buildLoveReadingTexts(
  birth: LoveReadingBirthInput,
  language: LoveReadingLanguage
): Pick<LoveReadingSession, 'teaser' | 'fullReport'> {
  const season = monthName(birth.month, language);

  if (language === 'zh') {
    const teaser = [
      `你的出生节律落在 ${season} 的关系主题里。`,
      '这份免费预览先看见一个核心信号：你在亲密关系里真正寻找的不是戏剧性确认，而是被稳定理解后的松弛感。',
      '完整报告会继续展开你的吸引模式、沟通盲点、关系节奏和一个可以马上使用的反思练习。',
    ].join('\n\n');

    const fullReport = [
      '完整爱情洞察',
      '',
      `1. 你的关系底色：${season} 带来的是“先感受氛围，再决定靠近”的节律。你更容易被稳定、清晰、愿意持续回应的人吸引。`,
      '',
      '2. 你的吸引模式：当关系开始升温时，你会同时寻找安全感和心动感。真正适合你的连接，通常不是最强烈的那一个，而是能让你慢慢放下防备的那一个。',
      '',
      '3. 容易卡住的地方：你可能会把沉默理解为距离，把不确定理解为拒绝。完整的沟通会比反复猜测更有帮助。',
      '',
      '4. 接下来可以做的事：把“他/她到底怎么想”换成“我需要怎样的回应才会感到安心”。这会让你更清楚地表达边界，也更容易看见对方是否真的匹配。',
      '',
      '本报告用于自我理解与关系沟通，不构成医疗、法律、财务建议，也不承诺确定未来。',
    ].join('\n');

    return { teaser, fullReport };
  }

  const teaser = [
    `Your birth rhythm carries a ${season} relationship signature.`,
    'The free preview shows one core signal: in love, you are not only looking for chemistry. You are looking for the ease that comes from being understood consistently.',
    'The full report continues into attraction patterns, communication blind spots, relationship timing, and one practical reflection exercise.',
  ].join('\n\n');

  const fullReport = [
    'Complete Love Reading',
    '',
    `1. Your relationship baseline: a ${season} rhythm often starts by reading the emotional atmosphere before moving closer. You are drawn to people who are warm, steady, and clear in how they respond.`,
    '',
    '2. Your attraction pattern: when a connection intensifies, you tend to seek both spark and safety. The best match is not always the most dramatic one; it is often the person who helps your body relax over time.',
    '',
    '3. Where the pattern can get stuck: silence may feel like distance, and uncertainty may feel like rejection. Direct communication will usually serve you better than reading between every line.',
    '',
    '4. A useful next step: change the question from “What do they really think?” to “What response would help me feel secure and respected?” That shift makes your needs clearer and makes compatibility easier to see.',
    '',
    'This report is for self-reflection and relationship communication. It is not medical, legal, or financial advice and does not promise a fixed future.',
  ].join('\n');

  return { teaser, fullReport };
}

export function createLoveReadingSession(input: z.infer<typeof loveReadingSessionSchema>): LoveReadingSession {
  pruneExpired();

  const now = new Date();
  const id = createOpaqueId();
  const { teaser, fullReport } = buildLoveReadingTexts(input.birth, input.language);
  const email = input.email && input.email.trim() ? input.email.trim() : null;
  const session: LoveReadingSession = {
    id,
    mode: input.mode,
    language: input.language,
    birth: input.birth,
    email,
    teaser,
    fullReport,
    price: LOVE_READING_UNLOCK_PRICE_DISPLAY,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
    emailRecoveryReady: Boolean(email && (process.env.RESEND_API_KEY || process.env.EMAIL_SERVER_HOST)),
  };

  getStore().sessions.set(id, session);
  return session;
}

export function getLoveReadingSession(id: string): LoveReadingSession | null {
  pruneExpired();
  return getStore().sessions.get(id) ?? null;
}

export async function createLoveReadingCheckout(input: {
  id: string;
  language?: LoveReadingLanguage;
  origin: string;
}) {
  if (!loveReadingPaywallEnabled()) {
    return { error: 'Paid unlock is temporarily unavailable during launch.', status: 503 as const };
  }

  const session = getLoveReadingSession(input.id);
  if (!session) {
    return { error: 'Invalid or expired love reading session', status: 404 as const };
  }

  const language = input.language ?? session.language;
  const requestRef = loveReadingRequestRef(session.id);
  const order = await createPayPerUseOrder({
    kind: 'love-reading',
    requestId: session.id,
    requestRef,
    amountCents: LOVE_READING_UNLOCK_PRICE_USD_CENTS,
    currency: 'usd',
    metadata: {
      source: 'love-reading-unlock',
      emailRecoveryReady: session.emailRecoveryReady,
    },
  });

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: language === 'zh' ? '天机 Love - 完整爱情报告' : 'Tianji Love - Complete love reading',
            description:
              language === 'zh'
                ? '解锁本次爱情洞察的完整报告。一次性付款，无订阅。'
                : 'Unlock the complete report for this one love reading. One-time payment. No subscription.',
          },
          unit_amount: LOVE_READING_UNLOCK_PRICE_USD_CENTS,
        },
        quantity: 1,
      },
    ],
    metadata: {
      flow: 'pay-per-use',
      productType: 'pay-per-use',
      kind: 'love-reading',
      orderId: order.id,
      requestId: session.id,
      requestRef,
      amount: String(LOVE_READING_UNLOCK_PRICE_USD_CENTS),
      currency: 'usd',
      language,
    },
    success_url: `${input.origin}/love-reading/result/${encodeURIComponent(session.id)}?lang=${language}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/love-reading/result/${encodeURIComponent(session.id)}?lang=${language}&cancelled=1`,
  });

  if (!checkout.url) {
    return { error: 'Unable to create checkout session', status: 500 as const };
  }

  await attachCheckoutSessionToOrder(order.id, checkout.id);
  return { url: checkout.url, orderId: order.id };
}

export async function verifyLoveReadingUnlock(input: {
  id: string;
  sessionId: string;
}): Promise<boolean> {
  if (!loveReadingPaywallEnabled()) {
    return false;
  }

  const session = getLoveReadingSession(input.id);
  if (!session) {
    return false;
  }

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.retrieve(input.sessionId);
  const requestRef = loveReadingRequestRef(input.id);
  const paid = checkout.payment_status === 'paid' || checkout.status === 'complete';
  const metadataMatches =
    checkout.metadata?.flow === 'pay-per-use' &&
    checkout.metadata?.kind === 'love-reading' &&
    checkout.metadata?.requestRef === requestRef;

  if (!paid || !metadataMatches) {
    return false;
  }

  const paidOrder = await getPaidPayPerUseOrder({
    kind: 'love-reading',
    requestRef,
    checkoutSessionId: input.sessionId,
  });

  return Boolean(paidOrder);
}

export function clearLoveReadingSessionsForTests() {
  getStore().sessions.clear();
}
