/**
 * Auth Middleware — TianJi Global
 *
 * Protects routes that require authentication.
 * Uses NextAuth v5's `auth()` wrapper for route protection.
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/profile', '/settings'];
const AUTH_PATHS = ['/login', '/register'];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = Boolean(req.auth);

  // Allow auth pages if already logged in → redirect to dashboard
  if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard and other authenticated routes
  if (PROTECTED_PATHS.some(p => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  // Skip static files, api routes, _next
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
