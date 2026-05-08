import { NextRequest, NextResponse } from 'next/server';
import { getPlatformContext } from '@/lib/unified-platform';
import { setPrimaryUserProfile } from '@/lib/user-profile-service';
import { handleUserProfileRouteError } from '@/app/api/user-profiles/route';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, routeContext: RouteContext) {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await routeContext.params;
    const profile = await setPrimaryUserProfile(context, id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return handleUserProfileRouteError(error, 'user-profiles/:id/set-primary');
  }
}
