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

function hostnameFromHost(value: string | undefined): string | undefined {
  const host = value?.trim().toLowerCase();

  if (!host) {
    return undefined;
  }

  if (host.startsWith('[')) {
    const bracketEnd = host.indexOf(']');
    return bracketEnd === -1 ? host : host.slice(1, bracketEnd);
  }

  return host.split(':')[0];
}

function shouldPreferRequestHost(forwardedHost: string | undefined, requestHost: string | undefined): boolean {
  const forwardedHostname = hostnameFromHost(forwardedHost);
  const requestHostname = hostnameFromHost(requestHost);

  return forwardedHostname === 'localhost' && (requestHostname === '127.0.0.1' || requestHostname === '::1');
}

export function getRequestOrigin(req: AuthOriginRequest): string {
  const forwardedHost = firstHeaderValue(req.headers.get('x-forwarded-host'));
  const requestHost = firstHeaderValue(req.headers.get('host'));
  const host = shouldPreferRequestHost(forwardedHost, requestHost)
    ? requestHost
    : forwardedHost ?? requestHost ?? req.nextUrl.host;

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
