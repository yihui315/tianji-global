type AuthOriginRequest = {
  headers: Headers;
  nextUrl: {
    host: string;
    origin: string;
    protocol: string;
  };
};

function firstHeaderValue(value: string | null): string | undefined {
  return value?.split(',')[0]?.trim() || undefined;
}

function normalizeProtocol(value: string | undefined): string | undefined {
  return value?.replace(/:$/, '') || undefined;
}

export function getRequestOrigin(req: AuthOriginRequest): string {
  const host =
    firstHeaderValue(req.headers.get('x-forwarded-host')) ??
    firstHeaderValue(req.headers.get('host')) ??
    req.nextUrl.host;

  if (!host) {
    return req.nextUrl.origin;
  }

  const protocol =
    normalizeProtocol(firstHeaderValue(req.headers.get('x-forwarded-proto'))) ??
    normalizeProtocol(req.nextUrl.protocol) ??
    'https';

  return `${protocol}://${host}`;
}

export function buildLoginRedirectUrl(req: AuthOriginRequest, callbackPath: string): URL {
  const loginUrl = new URL('/login', getRequestOrigin(req));
  loginUrl.searchParams.set('callbackUrl', callbackPath);
  return loginUrl;
}

export function buildDashboardRedirectUrl(req: AuthOriginRequest): URL {
  return new URL('/dashboard', getRequestOrigin(req));
}
