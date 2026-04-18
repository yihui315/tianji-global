import { NextResponse } from 'next/server';
import { getPlatformContext, mapEntitlementRow } from '@/lib/unified-platform';

export async function GET() {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data } = await context.supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', context.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: mapEntitlementRow(data, context.user.subscription_tier, context.user.id),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Supabase is not configured.') {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    }

    console.error('[api/entitlements] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
