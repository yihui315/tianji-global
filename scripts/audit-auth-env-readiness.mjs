const EXPECTED_STAGING_ORIGIN =
  process.env.AUTH_ENV_EXPECTED_ORIGIN ||
  process.env.STAGING_BASE_URL ||
  'http://staging.tianji.love';

const checks = [];

const env = process.env;
const authSecretReady = hasValue(env.AUTH_SECRET) || hasValue(env.NEXTAUTH_SECRET);
const authUrlReady = hasValue(env.AUTH_URL) || hasValue(env.NEXTAUTH_URL);
const googleClientIdReady = hasValue(env.GOOGLE_CLIENT_ID);
const googleClientSecretReady = hasValue(env.GOOGLE_CLIENT_SECRET);
const appUrlReady = hasValue(env.NEXT_PUBLIC_APP_URL);

checks.push(statusLine('AUTH_SECRET', env.AUTH_SECRET, maskPresence));
checks.push(statusLine('NEXTAUTH_SECRET', env.NEXTAUTH_SECRET, maskPresence));
checks.push(statusLine('AUTH_URL', env.AUTH_URL, maskUrl));
checks.push(statusLine('NEXTAUTH_URL', env.NEXTAUTH_URL, maskUrl));
checks.push(statusLine('GOOGLE_CLIENT_ID', env.GOOGLE_CLIENT_ID, maskGoogleClientId));
checks.push(statusLine('GOOGLE_CLIENT_SECRET', env.GOOGLE_CLIENT_SECRET, maskPresence));
checks.push(statusLine('NEXT_PUBLIC_APP_URL', env.NEXT_PUBLIC_APP_URL, maskUrl));

const failures = [];
const warnings = [];

if (!authSecretReady) {
  failures.push('AUTH_SECRET or NEXTAUTH_SECRET must be set.');
}

if (!authUrlReady) {
  failures.push('AUTH_URL or NEXTAUTH_URL must be set for hosted staging.');
}

if (!googleClientIdReady) {
  failures.push('GOOGLE_CLIENT_ID must be set.');
} else if (!looksLikeGoogleClientId(env.GOOGLE_CLIENT_ID)) {
  failures.push('GOOGLE_CLIENT_ID does not look like a Google OAuth Web Client ID.');
}

if (!googleClientSecretReady) {
  failures.push('GOOGLE_CLIENT_SECRET must be set.');
}

if (!appUrlReady) {
  failures.push('NEXT_PUBLIC_APP_URL must be set for hosted staging.');
}

for (const [key, value] of [
  ['AUTH_URL', env.AUTH_URL],
  ['NEXTAUTH_URL', env.NEXTAUTH_URL],
  ['NEXT_PUBLIC_APP_URL', env.NEXT_PUBLIC_APP_URL],
]) {
  const origin = safeOrigin(value);
  if (!origin) {
    if (hasValue(value)) {
      failures.push(`${key} must be a valid URL.`);
    }
    continue;
  }

  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    warnings.push(`${key} points at a local origin, not hosted staging.`);
  }

  if (EXPECTED_STAGING_ORIGIN && origin !== safeOrigin(EXPECTED_STAGING_ORIGIN)) {
    warnings.push(`${key} origin is ${origin}, expected ${safeOrigin(EXPECTED_STAGING_ORIGIN)} for this audit.`);
  }
}

const ready = failures.length === 0;

console.log('TianJi Love auth env readiness');
console.log(`Expected origin: ${maskUrl(EXPECTED_STAGING_ORIGIN)}`);
for (const line of checks) {
  console.log(line);
}

for (const warning of warnings) {
  console.log(`WARN: ${warning}`);
}

for (const failure of failures) {
  console.log(`FAIL: ${failure}`);
}

console.log(`Google OAuth readiness: ${ready ? 'Go' : 'No-Go'}`);

if (!ready) {
  process.exitCode = 1;
}

function hasValue(value) {
  return Boolean(value?.trim());
}

function statusLine(key, value, mask) {
  if (!hasValue(value)) {
    return `${key}: MISSING`;
  }
  return `${key}: SET masked=${mask(value)}`;
}

function maskPresence() {
  return 'present';
}

function maskUrl(value) {
  const origin = safeOrigin(value);
  return origin || 'invalid-url';
}

function maskGoogleClientId(value) {
  if (!hasValue(value)) {
    return 'missing';
  }

  const suffix = '.apps.googleusercontent.com';
  if (value.endsWith(suffix)) {
    return `****${suffix}`;
  }

  return `****${value.slice(-8)}`;
}

function safeOrigin(value) {
  if (!hasValue(value)) {
    return undefined;
  }

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

function looksLikeGoogleClientId(value) {
  return hasValue(value) && value.endsWith('.apps.googleusercontent.com');
}
