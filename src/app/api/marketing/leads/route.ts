import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPool } from '@/lib/db';
import { isSupabaseMutationDisabled } from '@/lib/staging-degraded-mode';

const USER_AGENT_MAX_LENGTH = 512;

// In-memory rate limiting: 5 submissions per IP hash per 60 seconds
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ipHash);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

const leadCaptureSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().max(255).optional(),
  source_page: z.string().min(1).max(100),
  locale: z.string().max(20).optional(),
  consent: z.literal(true),
  variant: z.string().max(80).optional(),
  utm_source: z.string().max(255).optional(),
  utm_medium: z.string().max(255).optional(),
  utm_campaign: z.string().max(255).optional(),
  utm_content: z.string().max(255).optional(),
  utm_term: z.string().max(255).optional(),
});

function hashRequestIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const candidateIp = forwardedFor || request.headers.get('x-real-ip') || 'unknown';

  return createHash('sha256').update(candidateIp).digest('hex');
}

function truncateUserAgent(value: string) {
  return value.slice(0, USER_AGENT_MAX_LENGTH);
}

export async function POST(request: NextRequest) {
  try {
    if (isSupabaseMutationDisabled()) {
      return NextResponse.json(
        { success: false, skipped: true, reason: 'marketing_mutation_disabled' },
        { status: 202 },
      );
    }

    const ipHash = hashRequestIp(request);
    if (!checkRateLimit(ipHash)) {
      return NextResponse.json(
        { success: false, error: 'rate_limited' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const data = leadCaptureSchema.parse(body);
    const userAgent = truncateUserAgent(request.headers.get('user-agent') ?? '');

    const pool = getPool();
    await pool.query(
      `
        INSERT INTO public.marketing_leads (
          email, name, source_page, locale, variant,
          utm_source, utm_medium, utm_campaign, utm_content, utm_term,
          consent_given_at, consent_version, status,
          ip_hash, user_agent, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), '1.0', 'pending_manual_review', $11, $12, NOW(), NOW())
      `,
      [
        data.email,
        data.name ?? null,
        data.source_page,
        data.locale ?? null,
        data.variant ?? null,
        data.utm_source ?? null,
        data.utm_medium ?? null,
        data.utm_campaign ?? null,
        data.utm_content ?? null,
        data.utm_term ?? null,
        ipHash,
        userAgent,
      ],
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'invalid_payload' },
        { status: 400 },
      );
    }

    console.error('[marketing/leads] DB write error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error' },
      { status: 500 },
    );
  }
}
