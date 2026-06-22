import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPool } from '@/lib/db';
import { isSupabaseMutationDisabled } from '@/lib/staging-degraded-mode';
import { createHash } from 'crypto';

// Incremented whenever consent text changes — GDPR: each version must be traceable
const CONSENT_VERSION = '1.0';

const leadCaptureSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().max(255).optional(),
  source_page: z.string().min(1).max(100),
  locale: z.string().max(20).optional(),
  consent: z.literal(true),
  // UTM params — all optional
  utm_source: z.string().max(255).optional(),
  utm_medium: z.string().max(255).optional(),
  utm_campaign: z.string().max(255).optional(),
  utm_content: z.string().max(255).optional(),
  utm_term: z.string().max(255).optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (isSupabaseMutationDisabled()) {
      return NextResponse.json(
        { success: false, skipped: true, reason: 'marketing_mutation_disabled' },
        { status: 202 }
      );
    }

    const body = await request.json();
    const data = leadCaptureSchema.parse(body);

    // Hash IP for GDPR compliance (no full IP stored)
    // SHA-256 hex = 64 chars; truncate to 16 chars to limit fingerprinting surface
    const ipHash = createHash('sha256')
      .update(request.headers.get('x-forwarded-for') ?? 'unknown')
      .digest('hex')
      .slice(0, 16);

    const userAgent = (request.headers.get('user-agent') ?? '').slice(0, 255);

    const pool = getPool();
    await pool.query(
      `
        INSERT INTO public.marketing_leads (
          email, name, source_page, locale,
          utm_source, utm_medium, utm_campaign, utm_content, utm_term,
          consent_given_at, consent_version, status,
          ip_hash, user_agent, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, 'pending_manual_review', $11, $12, NOW(), NOW())
      `,
      [
        data.email,
        data.name ?? null,
        data.source_page,
        data.locale ?? null,
        data.utm_source ?? null,
        data.utm_medium ?? null,
        data.utm_campaign ?? null,
        data.utm_content ?? null,
        data.utm_term ?? null,
        CONSENT_VERSION,
        ipHash,
        userAgent,
      ]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'invalid_payload' },
        { status: 400 }
      );
    }
    // Don't leak internal errors
    console.error('[marketing/leads] DB write error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error' },
      { status: 500 }
    );
  }
}
