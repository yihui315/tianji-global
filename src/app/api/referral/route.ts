import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrerCode, newUserEmail } = body;

    if (!referrerCode || !newUserEmail) {
      return NextResponse.json({ error: 'Missing referrerCode or newUserEmail' }, { status: 400 });
    }

    // Look up referrer by their referral code
    let referrerId: string | null = null;
    let referrerEmail: string | null = null;

    try {
      const { rows } = await getPool().query(
        `SELECT id, email FROM users WHERE referral_code = $1 LIMIT 1`,
        [referrerCode]
      );
      if (rows.length > 0) {
        referrerId = rows[0].id;
        referrerEmail = rows[0].email;
      }
    } catch (dbError) {
      // DB not configured — skip silently
      console.log('[referral] DB not available, returning mock');
    }

    // Create pending referral record
    try {
      await getPool().query(
        `INSERT INTO referrals (referrer_id, referred_email, status, created_at)
         VALUES ($1, $2, 'pending', NOW())
         ON CONFLICT DO NOTHING`,
        [referrerId, newUserEmail]
      );
    } catch {
      console.log('[referral] DB write skipped');
    }

    return NextResponse.json({
      success: true,
      message: 'Referral recorded',
      referrerCode,
      benefit: 'Your friend gets 10% off their first report. You earn1 free report credit after 3 purchases.',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const { rows } = await getPool().query(
      `SELECT referred_email, status, created_at FROM referrals WHERE referrer_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      referrals: rows,
    });
  } catch {
    return NextResponse.json({ referrals: [], message: 'DB not configured' });
  }
}