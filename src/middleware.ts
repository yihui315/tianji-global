import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard'];
const AUTH_PATHS = ['/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // For now, auth is handled client-side via next-auth/react
  // This middleware only handles static redirects
  if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
    // Allow access to login page
    return NextResponse.next();
  }

  if (PROTECTED_PATHS.some(p => pathname.startsWith(p))) {
    // Auth check happens in the page component
    // Next.js will render the page and redirect if not authenticated
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
