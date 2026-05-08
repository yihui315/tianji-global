import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPlatformContext } from '@/lib/unified-platform';
import {
  createUserProfile,
  createUserProfileSchema,
  listUserProfiles,
} from '@/lib/user-profile-service';

export const dynamic = 'force-dynamic';

export function handleUserProfileRouteError(error: unknown, route = 'user-profiles') {
  if (error instanceof Error && error.message === 'Supabase is not configured.') {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.flatten() }, { status: 400 });
  }

  console.error(`[api/${route}] error:`, error instanceof Error ? error.message : 'Unknown error');
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export async function GET() {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: await listUserProfiles(context),
    });
  } catch (error) {
    return handleUserProfileRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = createUserProfileSchema.parse(await request.json());

    return NextResponse.json({
      success: true,
      data: await createUserProfile(context, body),
    });
  } catch (error) {
    return handleUserProfileRouteError(error);
  }
}
