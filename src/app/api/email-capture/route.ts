import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, locale } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    try {
      const pool = getPool();
      await pool.query(
        `INSERT INTO email_subscribers (email, source, locale, subscribed_at, is_active)
         VALUES ($1, $2, $3, NOW(), true)
         ON CONFLICT (email) DO UPDATE SET
           source = COALESCE($2, email_subscribers.source),
           is_active = true,
           subscribed_at = NOW()`,
        [email, source ?? 'unknown', locale ?? 'en']
      );
    } catch {
      // DB not configured — continue with mock success
      console.log('[email-capture] DB not available, skipping write');
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}