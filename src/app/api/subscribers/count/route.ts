import { NextResponse } from 'next/server';
import { countLegacySubscribers } from '@/lib/legacy-subscriber-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await countLegacySubscribers();
    return NextResponse.json(
      { count },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[subscribers/count] legacy store error:', error);
    return NextResponse.json(
      { error: 'subscriber_store_unavailable' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
