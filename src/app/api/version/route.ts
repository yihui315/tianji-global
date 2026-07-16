import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    version: process.env.npm_package_version ?? '1.0.0',
    commit: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'unknown',
    buildTime: process.env.BUILD_TIME ?? new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
    service: 'tianji-global',
  });
}
