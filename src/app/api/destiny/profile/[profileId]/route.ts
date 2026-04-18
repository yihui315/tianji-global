import { NextResponse } from 'next/server';
import {
  getPlatformContext,
  getVisibleSections,
  mapDestinyProfileRow,
  mapEntitlementRow,
} from '@/lib/unified-platform';

export async function GET(
  _request: Request,
  context: { params: Promise<{ profileId: string }> }
) {
  try {
    const platform = await getPlatformContext();
    if (!platform) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileId } = await context.params;
    const [{ data: destiny }, { data: entitlementRow }] = await Promise.all([
      platform.supabase
        .from('destiny_profiles')
        .select('*')
        .eq('profile_id', profileId)
        .eq('user_id', platform.user.id)
        .single(),
      platform.supabase
        .from('entitlements')
        .select('*')
        .eq('user_id', platform.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (!destiny) {
      return NextResponse.json({ error: 'Destiny profile not found' }, { status: 404 });
    }

    const entitlement = mapEntitlementRow(entitlementRow, platform.user.subscription_tier, platform.user.id);
    const visibility = getVisibleSections(entitlement.plan);
    const profile = mapDestinyProfileRow(destiny);

    const data: Record<string, unknown> = {
      sourceModules: profile.sourceModules,
      confidenceScore: profile.confidenceScore,
    };

    if (visibility.visibleSections.includes('identity')) {
      data.identitySummary = profile.identitySummary;
    }
    if (visibility.visibleSections.includes('relationship')) {
      data.relationshipProfile = profile.relationshipProfile;
    }
    if (visibility.visibleSections.includes('career')) {
      data.careerProfile = profile.careerProfile;
    }
    if (visibility.visibleSections.includes('wealth')) {
      data.wealthProfile = profile.wealthProfile;
    }
    if (visibility.visibleSections.includes('timing')) {
      data.timingProfile = profile.timingProfile;
    }
    if (visibility.visibleSections.includes('actions')) {
      data.actionProfile = profile.actionProfile;
    }
    if (visibility.visibleSections.includes('risk')) {
      data.riskProfile = profile.riskProfile;
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        plan: entitlement.plan,
        visibleSections: visibility.visibleSections,
        lockedSections: visibility.lockedSections,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Supabase is not configured.') {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    }

    console.error('[api/destiny/profile/:profileId] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
