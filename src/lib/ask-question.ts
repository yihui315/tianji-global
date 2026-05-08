/**
 * Pay-per-Question · AskQuestion encrypted payload helpers
 *
 * Encodes a fully-generated AI answer + the original question into an
 * AES-256-GCM encrypted, base64url-safe token. The token is what gets
 * passed through Stripe checkout metadata and the success-redirect URL,
 * so a stateless serverless deploy can return the SAME answer the user
 * saw in the preview, without requiring a database row.
 *
 * Companion to `src/lib/destiny-scan.ts`. Same encryption pattern
 * (AES-256-GCM with SHA-256-derived key + 12-byte IV + 16-byte auth tag),
 * different shape and namespace.
 *
 * Skill: .claude/skills/tianji-paywall-pay-per-question/SKILL.md
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';

// ─── Schema ────────────────────────────────────────────────────────────

export const askQuestionLanguageSchema = z.enum(['en', 'zh']);
export type AskQuestionLanguage = z.infer<typeof askQuestionLanguageSchema>;

export const askQuestionInputSchema = z.object({
  question: z.string().trim().min(3, 'question is too short').max(500, 'question is too long'),
  language: askQuestionLanguageSchema.default('en'),
});

export type AskQuestionInput = z.infer<typeof askQuestionInputSchema>;

interface EncryptedAskPayload {
  question: string;
  fullAnswer: string;
  language: AskQuestionLanguage;
  model?: string;
  provider?: string;
  createdAt: string;
}

// ─── Key derivation ────────────────────────────────────────────────────

function getSecretKey() {
  const secret =
    process.env.ASK_QUESTION_SECRET ||
    process.env.DESTINY_SCAN_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET;

  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('Missing AUTH_SECRET for ask question token encryption');
  }

  return createHash('sha256').update(secret ?? 'tianji-local-ask-question-preview-key').digest();
}

// ─── Encode / Decode ───────────────────────────────────────────────────

export function encodeAskQuestionId(payload: Omit<EncryptedAskPayload, 'createdAt'>): string {
  const fullPayload: EncryptedAskPayload = {
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

export function decodeAskQuestionId(id: string): EncryptedAskPayload | null {
  try {
    const buffer = Buffer.from(id, 'base64url');
    if (buffer.length < 12 + 16 + 1) return null;

    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', getSecretKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const payload = JSON.parse(decrypted.toString('utf8')) as EncryptedAskPayload;

    if (
      typeof payload.question !== 'string' ||
      typeof payload.fullAnswer !== 'string' ||
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
 * Strip the answer down to a small head + a soft ellipsis, so the user
 * sees enough to feel curious without enough to skip the paywall.
 */
export function buildAskPreview(fullAnswer: string, language: AskQuestionLanguage): string {
  const trimmed = fullAnswer.trim();
  if (!trimmed) return '';

  const limit = language === 'zh' ? PREVIEW_HEAD_LIMIT_ZH : PREVIEW_HEAD_LIMIT_EN;
  if (trimmed.length <= limit) return trimmed;

  const head = trimmed.slice(0, limit);
  // Cut at the last sentence-ending punctuation to avoid mid-word cut.
  const punct = language === 'zh' ? /[。；！？]/g : /[.;!?]\s/g;
  const matches = [...head.matchAll(punct)];
  const lastEnd = matches.length ? matches[matches.length - 1].index! + 1 : limit;

  return `${head.slice(0, lastEnd).trim()} …`;
}

// ─── Pricing ───────────────────────────────────────────────────────────

/** $1.99 (USD, lowest unit). Single source of truth for the paywall. */
export const ASK_QUESTION_UNLOCK_PRICE_USD_CENTS = 199;

/** Display price for UI (no decimals if integer; 2 decimals otherwise). */
export const ASK_QUESTION_UNLOCK_PRICE_DISPLAY = '$1.99';
