/**
 * Auth Middleware - TianJi Global
 *
 * Protects routes that require authentication.
 * Keep this file Edge-safe: do not import server auth/db adapters here.
 */

import { buildDashboardRedirectUrl, buildLoginRedirectUrl } from '@/lib/auth-origin';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/profile', '/settings'];
const AUTH_PATHS = ['/login', '/register'];

function firstHeaderValue(value: string | null): string | undefined {
  return value?.split(',')[0]?.trim() || undefined;
}

function isSecureRequest(req: NextRequest): boolean {
  const forwardedProto = firstHeaderValue(req.headers.get('x-forwarded-proto'));
  const requestProtocol = req.nextUrl.protocol.replace(/:$/, '');
  return (forwardedProto ?? requestProtocol) === 'https';
}

async function hasAuthSession(req: NextRequest): Promise<boolean> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret) {
    return false;
  }

  try {
    const token = await getToken({
      req,
      secret,
      secureCookie: isSecureRequest(req),
    });
    return Boolean(token);
  } catch {
    return false;
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthenticated = await hasAuthSession(req);

  // Allow auth pages if already logged in.
  if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
    if (isAuthenticated) {
      const dashboardUrl = buildDashboardRedirectUrl(req);
      return NextResponse.redirect(dashboardUrl.toString());
    }
    return NextResponse.next();
  }

  // Protect dashboard and other authenticated routes.
  if (PROTECTED_PATHS.some(p => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const loginUrl = buildLoginRedirectUrl(req, pathname);
      return NextResponse.redirect(loginUrl.toString());
    }
  }

  return NextResponse.next();
}

export const config = {
  // Skip static files, api routes, _next
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
