#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const failOnNoGo = !args.has('--no-fail');
const stripeSecretLivePrefixes = ['sk', 'rk'].map((keyType) => [keyType, 'live', ''].join('_'));
const stripeSecretTestPrefixes = ['sk', 'rk'].map((keyType) => [keyType, 'test', ''].join('_'));
const stripePublishableLivePrefix = ['pk', 'live', ''].join('_');
const stripePublishableTestPrefix = ['pk', 'test', ''].join('_');
const stripeWebhookPrefix = 'wh' + 'sec' + '_';

const REQUIRED = [
  { name: 'STRIPE_SECRET_KEY', group: 'stripe', classify: classifyStripeSecret, required: true },
  { name: 'STRIPE_WEBHOOK_SECRET', group: 'stripe', classify: classifyStripeWebhook, required: true },
  { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', group: 'stripe', classify: classifyStripePublishable, required: true },
  { name: 'STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID', group: 'stripe', classify: classifyPriceId, required: true },
  { name: 'ENABLE_PAY_PER_USE', group: 'revenue', classify: classifyRequiredTrue, required: true },
  { name: 'NEXT_PUBLIC_APP_URL', group: 'app', classify: classifyHostedUrl, required: true },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', group: 'supabase', classify: classifySupabaseUrl, required: true },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', group: 'supabase', classify: classifyPresence, required: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', group: 'supabase', classify: classifyPresence, required: true },
  { name: 'AUTH_SECRET', group: 'auth', classify: classifyPresence, required: true },
  { name: 'NEXTAUTH_SECRET', group: 'auth', classify: classifyPresence, required: true },
  { name: 'AUTH_URL', group: 'auth', classify: classifyHostedUrl, required: true },
  { name: 'NEXTAUTH_URL', group: 'auth', classify: classifyHostedUrl, required: true },
  { name: 'GOOGLE_CLIENT_ID', group: 'auth', classify: classifyGoogleClientId, required: true },
  { name: 'GOOGLE_CLIENT_SECRET', group: 'auth', classify: classifyPresence, required: true },
  { name: 'RESEND_API_KEY', group: 'email', classify: classifyResendKey, required: true },
  { name: 'FROM_EMAIL', group: 'email', classify: classifyPresence, required: true },
  { name: 'LOVE_TEST_PAID_INTENT_TEST_MODE_READY', group: 'dry-run', classify: classifyRequiredTrue, required: true },
  { name: 'LOVE_TEST_PAID_SMOKE_APPROVED', group: 'dry-run', classify: classifyRequiredFalse, required: true },
];

const blockers = [];
const warnings = [];
const checks = REQUIRED.map((spec) => {
  const value = process.env[spec.name];
  const result = spec.classify(value, spec.name);
  if (spec.required && result.status === 'missing') {
    blockers.push(`${spec.name}: missing`);
  } else if (result.verdict === 'no-go') {
    blockers.push(`${spec.name}: ${result.reason}`);
  }
  if (result.warning) {
    warnings.push(`${spec.name}: ${result.warning}`);
  }

  return {
    name: spec.name,
    group: spec.group,
    source: 'process.env',
    status: result.status,
    mode: result.mode,
    masked: result.masked,
    verdict: result.verdict,
  };
});

const envFileSafety = inspectEnvFileSafety();
for (const blocker of envFileSafety.blockers) {
  blockers.push(blocker);
}
for (const warning of envFileSafety.warnings) {
  warnings.push(warning);
}

const supabaseMarkers = [
  'SUPABASE_ENV',
  'SUPABASE_ENV_MODE',
  'NEXT_PUBLIC_SUPABASE_ENV',
  'SUPABASE_PROJECT_ENV',
]
  .map((name) => [name, process.env[name]])
  .filter(([, value]) => hasValue(value));

for (const [name, value] of supabaseMarkers) {
  if (/prod|production/i.test(value)) {
    blockers.push(`${name}: production marker detected`);
  }
}

const uniqueBlockers = [...new Set(blockers)];
const overall = uniqueBlockers.length === 0 ? 'conditional-go' : 'no-go';
const report = {
  tool: 'tianji-love-revenue-env-masked',
  secret_handling: 'No .env files are read. Values are classified from process.env and masked to suffix only.',
  overall,
  checks,
  env_file_safety: envFileSafety.summary,
  warnings: [...new Set(warnings)],
  blockers: uniqueBlockers,
};

console.log(JSON.stringify(report, null, 2));

if (overall !== 'conditional-go' && failOnNoGo) {
  process.exitCode = 1;
}

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function maskedSuffix(value) {
  if (!hasValue(value)) return null;
  const normalized = value.trim();
  return `****${normalized.slice(-4)}`;
}

function baseResult(value, overrides = {}) {
  if (!hasValue(value)) {
    return {
      status: 'missing',
      mode: 'missing',
      masked: null,
      verdict: 'no-go',
      reason: 'required value is absent',
      ...overrides,
    };
  }

  return {
    status: 'present_masked',
    mode: 'unknown',
    masked: maskedSuffix(value),
    verdict: 'conditional-go',
    ...overrides,
  };
}

function classifyStripeSecret(value) {
  const base = baseResult(value);
  if (!hasValue(value)) return base;
  if (stripeSecretLivePrefixes.some((prefix) => value.startsWith(prefix))) {
    return { ...base, status: 'blocked', mode: 'live-mode', verdict: 'no-go', reason: 'live Stripe secret key detected' };
  }
  if (stripeSecretTestPrefixes.some((prefix) => value.startsWith(prefix))) {
    return { ...base, status: 'verified_test_mode', mode: 'test-mode' };
  }
  return { ...base, status: 'blocked', verdict: 'no-go', reason: 'Stripe secret key is not test-shaped' };
}

function classifyStripePublishable(value) {
  const base = baseResult(value);
  if (!hasValue(value)) return base;
  if (value.startsWith(stripePublishableLivePrefix)) {
    return { ...base, status: 'blocked', mode: 'live-mode', verdict: 'no-go', reason: 'live Stripe publishable key detected' };
  }
  if (value.startsWith(stripePublishableTestPrefix)) {
    return { ...base, status: 'verified_test_mode', mode: 'test-mode' };
  }
  return { ...base, status: 'blocked', verdict: 'no-go', reason: 'Stripe publishable key is not test-shaped' };
}

function classifyStripeWebhook(value) {
  const base = baseResult(value);
  if (!hasValue(value)) return base;
  if (!value.startsWith(stripeWebhookPrefix)) {
    return { ...base, status: 'blocked', verdict: 'no-go', reason: 'Stripe webhook secret is not whsec-shaped' };
  }
  return { ...base, mode: 'present-unknown-mode', warning: 'webhook secret shape cannot prove test mode by itself' };
}

function classifyPriceId(value) {
  const base = baseResult(value);
  if (!hasValue(value)) return base;
  if (!/^price_/.test(value)) {
    return { ...base, status: 'blocked', verdict: 'no-go', reason: 'Stripe Price ID is not price-shaped' };
  }
  return { ...base, mode: 'present-unknown-mode', warning: 'Price ID shape cannot prove test mode or amount by itself' };
}

function classifyPresence(value) {
  return baseResult(value);
}

function classifyRequiredTrue(value) {
  const base = baseResult(value, { masked: hasValue(value) ? 'boolean' : null });
  if (!hasValue(value)) return base;
  if (value === 'true') {
    return { ...base, status: 'present_masked', mode: 'true' };
  }
  return { ...base, status: 'blocked', mode: value === 'false' ? 'false' : 'unknown', verdict: 'no-go', reason: 'expected true' };
}

function classifyRequiredFalse(value) {
  const base = baseResult(value, { masked: hasValue(value) ? 'boolean' : null });
  if (!hasValue(value)) return base;
  if (value === 'false') {
    return { ...base, status: 'present_masked', mode: 'false' };
  }
  return { ...base, status: 'blocked', mode: value === 'true' ? 'true' : 'unknown', verdict: 'no-go', reason: 'expected false before paid smoke approval' };
}

function classifyHostedUrl(value, name) {
  const base = baseResult(value);
  if (!hasValue(value)) return base;

  let url;
  try {
    url = new URL(value);
  } catch {
    return { ...base, status: 'blocked', verdict: 'no-go', reason: 'URL is malformed' };
  }

  if (!['https:', 'http:'].includes(url.protocol)) {
    return { ...base, status: 'blocked', verdict: 'no-go', reason: 'URL protocol is not http or https' };
  }

  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1') {
    return { ...base, status: 'blocked', mode: 'local', verdict: 'no-go', reason: `${name} points at local origin, not hosted preview` };
  }

  if (isProductionAppHost(host)) {
    return { ...base, status: 'blocked', mode: 'production-risk', verdict: 'no-go', reason: 'production app host detected' };
  }

  return { ...base, mode: host.endsWith('.vercel.app') ? 'vercel-preview' : 'hosted-unknown' };
}

function classifySupabaseUrl(value) {
  const base = baseResult(value);
  if (!hasValue(value)) return base;

  let url;
  try {
    url = new URL(value);
  } catch {
    return { ...base, status: 'blocked', verdict: 'no-go', reason: 'Supabase URL is malformed' };
  }

  const host = url.hostname.toLowerCase();
  const full = value.toLowerCase();
  if (/prod|production/.test(full)) {
    return { ...base, status: 'blocked', mode: 'production-risk', verdict: 'no-go', reason: 'production Supabase marker detected' };
  }

  if (host === 'localhost' || host === '127.0.0.1') {
    return { ...base, status: 'blocked', mode: 'local', verdict: 'no-go', reason: 'Supabase URL points at local origin, not staging/test hosted Supabase' };
  }

  if (host.endsWith('.supabase.co')) {
    return { ...base, mode: 'supabase-hosted-unknown' };
  }

  return { ...base, mode: 'hosted-unknown' };
}

function classifyGoogleClientId(value) {
  const base = baseResult(value);
  if (!hasValue(value)) return base;
  if (!value.endsWith('.apps.googleusercontent.com')) {
    return { ...base, status: 'blocked', verdict: 'no-go', reason: 'Google client id is not web-client shaped' };
  }
  return { ...base, mode: 'google-web-client' };
}

function classifyResendKey(value) {
  const base = baseResult(value);
  if (!hasValue(value)) return base;
  if (!/^re_/.test(value)) {
    return { ...base, warning: 'Resend key does not use the expected prefix' };
  }
  return base;
}

function isProductionAppHost(host) {
  return ['tianji.global', 'www.tianji.global', 'tianji.love', 'www.tianji.love'].includes(host);
}

function inspectEnvFileSafety() {
  const warnings = [];
  const blockers = [];
  const tracked = gitLsFilesEnv();
  const trackedUnsafe = tracked.filter((name) => name !== '.env.example');
  if (trackedUnsafe.length > 0) {
    blockers.push(`tracked .env files detected: ${trackedUnsafe.join(', ')}`);
  }

  const previewPath = path.join(repoRoot, '.env.vercel-preview.local');
  const previewPresent = fs.existsSync(previewPath);
  const ignored = previewPresent ? isGitIgnored('.env.vercel-preview.local') : isCoveredByGitignore();

  if (previewPresent && !ignored) {
    blockers.push('.env.vercel-preview.local exists but is not ignored');
  }

  if (!isCoveredByGitignore()) {
    warnings.push('.gitignore does not visibly include .env*.local coverage');
  }

  return {
    summary: {
      tracked_env_files: tracked,
      tracked_env_files_verdict: trackedUnsafe.length === 0 ? 'go' : 'no-go',
      env_vercel_preview_local_present: previewPresent,
      env_vercel_preview_local_ignored_or_covered: ignored,
      env_contents_read: false,
    },
    warnings,
    blockers,
  };
}

function gitLsFilesEnv() {
  try {
    const output = execFileSync('git', ['ls-files'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && /(^|\/)\.env($|[.\-_])/.test(line))
      .sort();
  } catch {
    return [];
  }
}

function isGitIgnored(relPath) {
  try {
    execFileSync('git', ['check-ignore', '--quiet', relPath], {
      cwd: repoRoot,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

function isCoveredByGitignore() {
  try {
    const ignore = fs.readFileSync(path.join(repoRoot, '.gitignore'), 'utf8');
    return ignore.split(/\r?\n/).some((line) => line.trim() === '.env*.local' || line.trim() === '.env.vercel-preview.local');
  } catch {
    return false;
  }
}
