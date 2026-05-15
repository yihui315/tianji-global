/**
 * Pay-per-Draw · QuickDraw encrypted payload helpers
 *
 * Phase 1.2 of `tianji-upgrade-execution-plan.md`. Mirrors the shape of
 * `src/lib/ask-question.ts` exactly — same AES-256-GCM crypto, same
 * `Buffer.concat([iv, tag, ciphertext]).toString('base64url')` token shape.
 *
 * What's encrypted: the three drawn cards (with reversal flags and
 * positions), the per-card mini-readings, the AI-written full reading,
 * and the original question. Putting all of that inside the token means
 * the success-redirect can show the SAME cards and the SAME reading the
 * user previewed — without a database row.
 *
 * Skill: .claude/skills/tianji-paywall-pay-per-question/SKILL.md
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import {
  allCards,
  type TarotCard,
} from '@/lib/tarot';

// ─── Schema ────────────────────────────────────────────────────────────

export const quickDrawLanguageSchema = z.enum(['en', 'zh']);
export type QuickDrawLanguage = z.infer<typeof quickDrawLanguageSchema>;

export const quickDrawInputSchema = z.object({
  question: z
    .string()
    .trim()
    .min(0)
    .max(500, 'question is too long')
    .optional()
    .default(''),
  language: quickDrawLanguageSchema.default('en'),
});

export type QuickDrawInput = z.infer<typeof quickDrawInputSchema>;

/** A single card drawn into one of the three time slots. */
export interface DrawnSlot {
  /** 'yesterday' | 'today' | 'tomorrow' */
  slot: QuickDrawSlot;
  card: {
    id: number;
    name: string;
    nameChinese: string;
    arcana: 'major' | 'minor';
    suit?: string;
  };
  isReversed: boolean;
  /** A short 1-line meaning for the position (the preview teaser). */
  miniReading: string;
}

export type QuickDrawSlot = 'yesterday' | 'today' | 'tomorrow';

interface EncryptedDrawPayload {
  question: string;
  language: QuickDrawLanguage;
  draw: DrawnSlot[];
  fullReading: string;
  model?: string;
  provider?: string;
  createdAt: string;
}

// ─── Slot definitions (positions that replace past/present/future framing) ─

export const QUICK_DRAW_SLOTS: ReadonlyArray<{
  slot: QuickDrawSlot;
  labelEn: string;
  labelZh: string;
  promptEn: string;
  promptZh: string;
}> = [
  {
    slot: 'yesterday',
    labelEn: 'Yesterday',
    labelZh: '昨天',
    promptEn: 'What is still echoing — the energy you are leaving behind.',
    promptZh: '还在回响的事 —— 你正要离开的那股能量',
  },
  {
    slot: 'today',
    labelEn: 'Today',
    labelZh: '今天',
    promptEn: 'What this exact day is asking of you.',
    promptZh: '今天这天在向你提出的请求',
  },
  {
    slot: 'tomorrow',
    labelEn: 'Tomorrow',
    labelZh: '明天',
    promptEn: 'The shape forming — what is most likely to surface next.',
    promptZh: '正在成形的形状 —— 接下来最可能浮现的事',
  },
];

// ─── Card draw (server-side, deterministic per-token) ──────────────────

/**
 * Draw 3 unique cards from the 78-card deck, with random reversal.
 * No more than one card per slot. Crypto-grade randomness.
 */
export function drawThreeCards(): DrawnSlot[] {
  const indices = new Set<number>();
  while (indices.size < 3) {
    const buf = randomBytes(2);
    indices.add(buf.readUInt16BE(0) % allCards.length);
  }
  const ids = Array.from(indices);
  return ids.map((idx, i) => {
    const card = allCards[idx];
    const isReversed = randomBytes(1)[0] >= 128;
    return {
      slot: QUICK_DRAW_SLOTS[i].slot,
      card: {
        id: card.id,
        name: card.name,
        nameChinese: card.nameChinese,
        arcana: card.arcana,
        suit: card.suit,
      },
      isReversed,
      miniReading: '',
    };
  });
}

/** Map a drawn card back to its full TarotCard row (for AI prompt). */
export function expandDrawnCard(slot: DrawnSlot): TarotCard | undefined {
  return allCards.find((c) => c.id === slot.card.id);
}

// ─── Key derivation ────────────────────────────────────────────────────

function getSecretKey() {
  const secret =
    process.env.QUICK_DRAW_SECRET ||
    process.env.ASK_QUESTION_SECRET ||
    process.env.DESTINY_SCAN_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'tianji-quick-draw-fallback-secret';

  return createHash('sha256').update(secret).digest();
}

// ─── Encode / Decode ───────────────────────────────────────────────────

export function encodeQuickDrawId(payload: Omit<EncryptedDrawPayload, 'createdAt'>): string {
  const fullPayload: EncryptedDrawPayload = {
    ...payload,
    createdAt: new Date().toISOString(),
  };

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getSecretKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(fullPayload), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function decodeQuickDrawId(id: string): EncryptedDrawPayload | null {
  try {
    const buffer = Buffer.from(id, 'base64url');
    if (buffer.length < 12 + 16 + 1) return null;

    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', getSecretKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const payload = JSON.parse(decrypted.toString('utf8')) as EncryptedDrawPayload;

    if (
      typeof payload.fullReading !== 'string' ||
      !Array.isArray(payload.draw) ||
      payload.draw.length !== 3 ||
      (payload.language !== 'en' && payload.language !== 'zh')
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ─── Preview helper ────────────────────────────────────────────────────

const PREVIEW_HEAD_LIMIT_EN = 90;
const PREVIEW_HEAD_LIMIT_ZH = 35;

/**
 * Strip the reading down to a small head + a soft ellipsis. Same logic
 * as ask-question.buildAskPreview so the paywall feels consistent across
 * features.
 */
export function buildDrawPreview(fullReading: string, language: QuickDrawLanguage): string {
  const trimmed = fullReading.trim();
  if (!trimmed) return '';

  const limit = language === 'zh' ? PREVIEW_HEAD_LIMIT_ZH : PREVIEW_HEAD_LIMIT_EN;
  if (trimmed.length <= limit) return trimmed;

  const head = trimmed.slice(0, limit);
  const punct = language === 'zh' ? /[。；！？]/g : /[.;!?]\s/g;
  const matches = [...head.matchAll(punct)];
  const lastEnd = matches.length ? matches[matches.length - 1].index! + 1 : limit;

  return `${head.slice(0, lastEnd).trim()} …`;
}

// ─── Pricing ───────────────────────────────────────────────────────────

/** $2.99 (USD, lowest unit). Single source of truth for the paywall. */
export const QUICK_DRAW_UNLOCK_PRICE_USD_CENTS = 299;

/** Display price for UI. */
export const QUICK_DRAW_UNLOCK_PRICE_DISPLAY = '$2.99';
