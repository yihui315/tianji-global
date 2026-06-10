const args = process.argv.slice(2);
const helpRequested = args.includes('--help') || args.includes('-h');

if (helpRequested) {
  printUsage();
  process.exit(0);
}

const acceptedFlags = new Set(['--authenticated']);
const unknownFlags = args.filter(arg => arg.startsWith('-') && !acceptedFlags.has(arg));

if (unknownFlags.length > 0) {
  console.error(`Unknown option(s): ${unknownFlags.join(', ')}`);
  printUsage();
  process.exit(1);
}

const authenticatedFlag = args.includes('--authenticated');
const firstArg = args.find(arg => !arg.startsWith('-'));
const baseUrl = normalizeBaseUrl(
  firstArg ||
    process.env.PRIVATE_SMOKE_BASE_URL ||
    process.env.STAGING_BASE_URL ||
    'http://127.0.0.1:3057',
);

const timeoutMs = parsePositiveInteger(process.env.PRIVATE_SMOKE_TIMEOUT_MS, 15_000);
const authCookie = process.env.PRIVATE_SMOKE_COOKIE || process.env.STAGING_AUTH_COOKIE || '';
const expectAuth = authenticatedFlag || isTruthy(process.env.PRIVATE_SMOKE_EXPECT_AUTH);
const readingId = process.env.PRIVATE_SMOKE_READING_ID || '';
const reportJobId = process.env.PRIVATE_SMOKE_REPORT_JOB_ID || '';

const unauthenticatedRedirectChecks = [
  { name: 'Dashboard unauthenticated redirect', path: '/dashboard' },
  { name: 'Profile unauthenticated redirect', path: '/profile' },
  { name: 'Settings unauthenticated redirect', path: '/settings' },
];

const authenticatedPageChecks = [
  { name: 'Dashboard authenticated page', path: '/dashboard', acceptedStatuses: [200] },
  { name: 'Profile authenticated page', path: '/profile', acceptedStatuses: [200] },
  { name: 'Readings authenticated page', path: '/readings', acceptedStatuses: [200] },
];

const authenticatedApiChecks = [
  { name: 'Profile API authenticated', path: '/api/profile', acceptedStatuses: [200] },
  { name: 'Profiles API authenticated', path: '/api/profiles', acceptedStatuses: [200, 503] },
  { name: 'Readings API authenticated', path: '/api/readings', acceptedStatuses: [200] },
  { name: 'Entitlements API authenticated', path: '/api/entitlements', acceptedStatuses: [200, 503] },
];

const optionalPrivateChecks = [
  readingId
    ? { name: 'Specific private reading page', path: `/reading/${encodeURIComponent(readingId)}`, acceptedStatuses: [200, 404] }
    : null,
  reportJobId
    ? { name: 'Specific report job API', path: `/api/report-jobs/${encodeURIComponent(reportJobId)}`, acceptedStatuses: [200, 404] }
    : null,
].filter(Boolean);

const results = [];

for (const check of unauthenticatedRedirectChecks) {
  results.push(await checkUnauthenticatedRedirect(check));
}

if (!authCookie) {
  results.push({
    name: 'Authenticated private chain',
    path: '(cookie not provided)',
    status: 'skipped',
    passed: !expectAuth,
    note: expectAuth
      ? '--authenticated was requested, but PRIVATE_SMOKE_COOKIE/STAGING_AUTH_COOKIE was not provided.'
      : 'Set PRIVATE_SMOKE_COOKIE from an authenticated staging browser session to run logged-in checks.',
  });
} else {
  for (const check of authenticatedPageChecks) {
    results.push(await checkAuthenticatedStatus(check));
  }

  for (const check of authenticatedApiChecks) {
    results.push(await checkAuthenticatedStatus(check));
  }

  for (const check of optionalPrivateChecks) {
    results.push(await checkAuthenticatedStatus(check));
  }
}

const failed = results.filter(result => !result.passed);
const warnings = results.filter(result => result.warning);

console.log(JSON.stringify({
  baseUrl,
  mode: authCookie ? 'unauthenticated-and-authenticated' : 'unauthenticated-only',
  authenticatedRequested: expectAuth,
  authCookieProvidedLocally: Boolean(authCookie),
  summary: {
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    warnings: warnings.length,
  },
  results,
}, null, 2));

if (failed.length > 0) {
  process.exitCode = 1;
}

function normalizeBaseUrl(value) {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    return `http://127.0.0.1:${trimmed}`;
  }
  return trimmed.replace(/\/+$/, '');
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isTruthy(value) {
  return value === '1' || value === 'true' || value === 'yes';
}

function isLoopbackHostname(hostname) {
  const value = hostname.toLowerCase();
  return value === 'localhost' || value === '127.0.0.1' || value === '::1' || value === '[::1]';
}

function originsMatch(actualOrigin, expectedOrigin) {
  if (actualOrigin === expectedOrigin) {
    return true;
  }

  const actual = new URL(actualOrigin);
  const expected = new URL(expectedOrigin);

  return (
    actual.protocol === expected.protocol &&
    actual.port === expected.port &&
    isLoopbackHostname(actual.hostname) &&
    isLoopbackHostname(expected.hostname)
  );
}

async function request(path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(`${baseUrl}${path}`, {
      redirect: 'manual',
      ...init,
      headers: {
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function responseText(response) {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

function hasEdgeRuntimeSignature(text) {
  return /edge runtime|node\.js ['"]crypto['"]|pg-adapter|postgresadapter|node-only|does not support node/i.test(text);
}

async function checkUnauthenticatedRedirect(check) {
  try {
    const response = await request(check.path);
    const location = response.headers.get('location') || '';
    const redirectUrl = location ? new URL(location, baseUrl) : null;
    const body = response.status >= 500 ? await responseText(response) : '';
    const edgeRuntimeError = hasEdgeRuntimeSignature(body);
    const passed =
      response.status >= 300 &&
      response.status < 400 &&
      redirectUrl?.pathname === '/login' &&
      originsMatch(redirectUrl.origin, baseUrl) &&
      !edgeRuntimeError;

    return {
      name: check.name,
      path: check.path,
      status: response.status,
      location,
      passed,
      expected: '302/303/307/308 redirect to same-origin /login',
      warning: false,
      note: edgeRuntimeError ? 'Response body contained an Edge runtime / Node dependency signature.' : undefined,
    };
  } catch (error) {
    return failedRequest(check, error);
  }
}

async function checkAuthenticatedStatus(check) {
  try {
    const response = await request(check.path, {
      headers: {
        cookie: authCookie,
      },
    });
    const body = response.status >= 500 ? await responseText(response) : '';
    const edgeRuntimeError = hasEdgeRuntimeSignature(body);
    const accepted = check.acceptedStatuses.includes(response.status);
    const warning = response.status === 503;
    const passed = accepted && response.status < 500 && !edgeRuntimeError;

    return {
      name: check.name,
      path: check.path,
      status: response.status,
      passed,
      expected: check.acceptedStatuses.join(' or '),
      warning,
      note: warning
        ? '503 is accepted as an explicit environment/data-layer unavailable state, not as full private-chain Go.'
        : edgeRuntimeError
          ? 'Response body contained an Edge runtime / Node dependency signature.'
          : undefined,
    };
  } catch (error) {
    return failedRequest(check, error);
  }
}

function failedRequest(check, error) {
  return {
    name: check.name,
    path: check.path,
    status: 'request-error',
    passed: false,
    expected: check.acceptedStatuses?.join(' or ') || 'redirect',
    warning: false,
    note: error instanceof Error ? error.message : String(error),
  };
}

function printUsage() {
  console.log(`Usage:
  node scripts/smoke-private-routes.mjs <base-url>

Examples:
  node scripts/smoke-private-routes.mjs http://127.0.0.1:3057
  STAGING_BASE_URL=http://staging.tianji.love node scripts/smoke-private-routes.mjs
  PRIVATE_SMOKE_COOKIE="<cookie header from authenticated staging browser>" node scripts/smoke-private-routes.mjs http://staging.tianji.love
  PRIVATE_SMOKE_COOKIE="<cookie header from authenticated staging browser>" node scripts/smoke-private-routes.mjs http://staging.tianji.love --authenticated

Environment:
  PRIVATE_SMOKE_BASE_URL      Base URL override.
  STAGING_BASE_URL            Staging base URL fallback.
  PRIVATE_SMOKE_TIMEOUT_MS    Per-request timeout. Default: 15000.
  PRIVATE_SMOKE_COOKIE        Raw Cookie header for logged-in checks. Never commit or print it.
  STAGING_AUTH_COOKIE         Alternate cookie env name.
  PRIVATE_SMOKE_EXPECT_AUTH   Set true/1/yes to fail if no auth cookie is provided.
  PRIVATE_SMOKE_READING_ID    Optional reading id for a specific private reading page check.
  PRIVATE_SMOKE_REPORT_JOB_ID Optional report job id for a specific private report API check.
`);
}
