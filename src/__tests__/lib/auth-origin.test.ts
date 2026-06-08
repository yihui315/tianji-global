import { describe, expect, it } from 'vitest';
import { buildDashboardRedirectUrl, buildLoginRedirectUrl } from '@/lib/auth-origin';

function requestLike(url: string, headers: Record<string, string>) {
  return {
    headers: new Headers(headers),
    nextUrl: new URL(url),
  };
}

describe('auth redirect origin helpers', () => {
  it('uses the active request host when nextUrl was normalized to localhost', () => {
    const request = requestLike('http://localhost:3000/dashboard', {
      host: '127.0.0.1:3057',
      'x-forwarded-proto': 'http',
    });

    const loginUrl = buildLoginRedirectUrl(request, '/dashboard');
    const dashboardUrl = buildDashboardRedirectUrl(request);

    expect(loginUrl.toString()).toBe('http://127.0.0.1:3057/login?callbackUrl=%2Fdashboard');
    expect(dashboardUrl.toString()).toBe('http://127.0.0.1:3057/dashboard');
  });

  it('prefers forwarded host and proto from deployment proxies', () => {
    const request = requestLike('http://localhost:3000/profile', {
      host: 'internal:3000',
      'x-forwarded-host': 'preview.tianji.love',
      'x-forwarded-proto': 'https',
    });

    const loginUrl = buildLoginRedirectUrl(request, '/profile');

    expect(loginUrl.toString()).toBe('https://preview.tianji.love/login?callbackUrl=%2Fprofile');
  });

  it('keeps the loopback request host when local Next proxy headers say localhost', () => {
    const request = requestLike('http://localhost:3057/dashboard', {
      host: '127.0.0.1:3057',
      'x-forwarded-host': 'localhost:3057',
      'x-forwarded-proto': 'http',
    });

    const loginUrl = buildLoginRedirectUrl(request, '/dashboard');

    expect(loginUrl.toString()).toBe('http://127.0.0.1:3057/login?callbackUrl=%2Fdashboard');
  });
});
