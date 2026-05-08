import { NextRequest, NextResponse } from 'next/server';
import { getPlatformContext } from '@/lib/unified-platform';
import {
  deleteUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserProfileSchema,
} from '@/lib/user-profile-service';
import { handleUserProfileRouteError } from '@/app/api/user-profiles/route';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, routeContext: RouteContext) {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await routeContext.params;
    const profile = await getUserProfile(context, id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return handleUserProfileRouteError(error, 'user-profiles/:id');
  }
}

export async function PATCH(request: NextRequest, routeContext: RouteContext) {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await routeContext.params;
    const body = updateUserProfileSchema.parse(await request.json());
    const profile = await updateUserProfile(context, id, body);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return handleUserProfileRouteError(error, 'user-profiles/:id');
  }
}

export async function DELETE(_request: NextRequest, routeContext: RouteContext) {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await routeContext.params;
    const result = await deleteUserProfile(context, id);
    if (result === 'not-found') {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    if (result === 'primary') {
      return NextResponse.json({ error: 'Primary profile cannot be deleted' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleUserProfileRouteError(error, 'user-profiles/:id');
  }
}
