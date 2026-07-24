#!/usr/bin/env tsx
/**
 * Static AdSense readiness gate with optional public-site verification.
 *
 * Static mode runs in release:check. Set ADSENSE_AUDIT_BASE_URL and
 * ADSENSE_EXPECTED_COMMIT together to verify a deployed build, public routes,
 * and /api/version without embedding environment details in source control.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const REPO_ROOT = join(__dirname, '..');
const SRC_DIR = join(REPO_ROOT, 'src');
const errors: string[] = [];
const warnings: string[] = [];

function log(message: string) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${message}`);
}

function warn(message: string) {
  warnings.push(message);
  console.warn(`  WARN: ${message}`);
}

function fail(message: string) {
  errors.push(message);
  console.error(`  FAIL: ${message}`);
}

function normalizePath(file: string) {
  return relative(REPO_ROOT, file).replaceAll('\\', '/');
}

function read(relativePath: string) {
  return readFileSync(join(REPO_ROOT, relativePath), 'utf8');
}

function getSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      if (!entry.startsWith('.') && entry !== 'node_modules') files.push(...getSourceFiles(fullPath));
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function requireTokens(relativePath: string, tokens: string[]) {
  const source = read(relativePath);
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${relativePath} is missing required token: ${token}`);
  }
}

const sourceFiles = getSourceFiles(SRC_DIR);

log('Checking duplicate ad slot IDs...');
const slotPattern = /(?:data-ad-slot|id)="([^"]+)"/g;
const slotCounts = new Map<string, string[]>();
for (const file of sourceFiles) {
  const rel = normalizePath(file);
  if (rel.includes('/__tests__/')) continue;
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(slotPattern)) {
    const slot = match[1];
    if (/^(adsense|ad-|slot-)/.test(slot)) slotCounts.set(slot, [...(slotCounts.get(slot) ?? []), rel]);
  }
}
for (const [slot, files] of slotCounts) {
  if (files.length > 1) fail(`Duplicate ad slot ID "${slot}" in: ${files.join(', ')}`);
}

log('Checking public homepage for fabricated testimonials and strong claims...');
const homepageSources = [
  'src/components/home/TianjiLoveHome.tsx',
  'src/components/tianji-love/TianjiLovePrimitives.tsx',
].map(read).join('\n');
const prohibitedHomepagePatterns = [
  /\b(?:Sophie|Olivia)\b/i,
  /(?:林小姐|苏小姐|陈小姐)/,
  /判断很准|准确说出问题|guaranteed accuracy|guaranteed result/i,
];
for (const pattern of prohibitedHomepagePatterns) {
  if (pattern.test(homepageSources)) fail(`Public homepage contains prohibited claim/persona pattern: ${pattern}`);
}

log('Checking consent defaults, choices, withdrawal, and policy link...');
requireTokens('src/components/CookieConsent.tsx', [
  'Reject non-essential',
  'Manage options',
  'Accept analytics',
  'Privacy settings',
  '/legal/privacy',
  'Google-certified consent provider',
  "window.gtag('consent', 'update'",
]);
requireTokens('src/lib/consent.ts', [
  'analytics: false',
  'tianji:consent-changed',
]);
requireTokens('src/app/layout.tsx', [
  'consent-mode-defaults',
  "analytics_storage:'denied'",
  "ad_storage:'denied'",
  '<CookieConsent />',
]);
const firstPartyConsent = read('src/components/CookieConsent.tsx');
for (const advertisingSignal of ['ad_storage:', 'ad_user_data:', 'ad_personalization:']) {
  if (firstPartyConsent.includes(advertisingSignal)) {
    fail(`First-party consent UI must not independently update ${advertisingSignal.slice(0, -1)}.`);
  }
}
warn('Google-certified CMP/TCF status remains an external AdSense Privacy & messaging verification gate.');

log('Checking sitemap CTA and canonical route integrity...');
const loveReading = read('src/app/[locale]/love-reading/page.tsx');
if (loveReading.includes("getLocalizedPath(locale, '/relationship')")) {
  fail('Localized love-reading still links to the missing /relationship route.');
}
if (!loveReading.includes("`/relationship/new?lang=${locale === 'zh-CN' ? 'zh' : 'en'}`")) {
  fail('Localized love-reading does not link to the real /relationship/new route with a language hint.');
}

const i18n = read('src/lib/i18n.ts');
for (const route of ["'/pricing'", "'/legal/privacy'", "'/legal/terms'"]) {
  if (!i18n.includes(route)) fail(`Canonical public route missing from sitemap config: ${route}`);
}
if (i18n.includes("{ path: '/privacy-center'")) fail('/privacy-center must not be emitted in sitemap.');

requireTokens('src/app/[locale]/pricing/page.tsx', ['permanentRedirect', '/pricing?lang=']);
requireTokens('src/app/[locale]/privacy/page.tsx', ['permanentRedirect', '/legal/privacy?lang=']);
requireTokens('src/app/[locale]/terms/page.tsx', ['permanentRedirect', '/legal/terms?lang=']);

log('Checking the shared product catalog across UI, checkout, and JSON-LD...');
requireTokens('src/app/(main)/pricing/page.tsx', ['PRODUCT_CATALOG.ASK_UNLOCK', 'PRODUCT_CATALOG.DRAW_UNLOCK', 'PRODUCT_CATALOG.LOVE_PREMIUM_REPORT']);
requireTokens('src/app/(main)/pricing/layout.tsx', ['PUBLICLY_AVAILABLE_PRODUCTS', 'minorAmountToMajor']);
for (const file of ['src/lib/ask-question.ts', 'src/lib/quick-draw.ts', 'src/lib/stripe.ts', 'src/lib/love-reading/revenue-contract.ts']) {
  if (!read(file).includes("@/config/products")) fail(`${file} does not import the shared product catalog.`);
}

log('Checking canonical brand and legacy-route indexing controls...');
const packageJson = read('package.json');
if (packageJson.includes('tianji.global') || packageJson.includes('TianJi Global')) {
  fail('package.json still exposes the legacy brand or domain.');
}
requireTokens('src/lib/i18n-metadata.ts', ["siteName: 'Tianji Love'"]);
requireTokens('src/app/api/health/route.ts', ["service: 'tianji-love'"]);
const nextConfig = read('next.config.js');
for (const route of ['/bazi', '/ziwei', '/tarot', '/yijing', '/western', '/astrology']) {
  if (!nextConfig.includes(`'${route}'`)) fail(`Legacy route is missing an indexing policy: ${route}`);
}
if (!nextConfig.includes("key: 'X-Robots-Tag'") || !nextConfig.includes("value: 'noindex, nofollow'")) {
  fail('Legacy public routes are not protected by X-Robots-Tag noindex, nofollow.');
}

for (const file of sourceFiles) {
  const rel = normalizePath(file);
  if (rel.includes('/__tests__/')) continue;
  const source = readFileSync(file, 'utf8');
  if (/tianji\.global/i.test(source)) fail(`Legacy tianji.global domain in ${rel}.`);
}

log('Checking TypeScript suppression and empty ad containers...');
for (const file of sourceFiles) {
  const rel = normalizePath(file);
  if (rel.includes('/__tests__/')) continue;
  const source = readFileSync(file, 'utf8');
  const suppressions = source.match(/@ts-ignore|@ts-nocheck/g);
  if (suppressions && !rel.startsWith('src/data/') && !rel.startsWith('src/lib/bazi') && !rel.startsWith('src/lib/yijing') && !rel.startsWith('src/types/')) {
    fail(`TypeScript suppression in ${rel} (${suppressions.length}x).`);
  }

  const emptyAdPattern = /<(?:div|section|aside)[^>]*(?:data-ad-slot|id)="([^"]*)"[^>]*>\s*<\/(?:div|section|aside)>/gi;
  for (const match of source.matchAll(emptyAdPattern)) {
    if (/^(adsense|ad-|slot-)/.test(match[1])) warn(`Empty ad container "${match[1]}" in ${rel}.`);
  }
}

log('Checking ads.txt source-side presence, format, and App Router fallback...');
const adsTxtPath = 'public/ads.txt';
let adsTxtBody = '';
try {
  adsTxtBody = readFileSync(join(REPO_ROOT, adsTxtPath), 'utf8');
} catch (err) {
  fail(`${adsTxtPath} is missing; AdSense requires ads.txt at the site root.`);
}
if (adsTxtBody) {
  const lines = adsTxtBody
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  if (lines.length === 0) {
    fail(`${adsTxtPath} has no non-comment records; AdSense crawler will report "no entries".`);
  }
  // ads.txt 1.0.2 spec: each record line is comma-separated fields. The first
  // record MUST contain a domain, a publisher account id, and a relationship
  // (DIRECT or RESELLER).
  const firstRecord = lines[0] ?? '';
  const firstFields = firstRecord.split(',').map((field) => field.trim());
  if (firstFields.length < 3) {
    fail(`${adsTxtPath} first record has ${firstFields.length} field(s); AdSense spec requires at least 3 (domain, publisher, relationship).`);
  }
  if (!/^[a-z0-9.-]+$/i.test(firstFields[0] ?? '')) {
    fail(`${adsTxtPath} first record domain is invalid: "${firstFields[0] ?? ''}".`);
  }
  const publisherId = firstFields[1] ?? '';
  if (!/^pub-\d+$/i.test(publisherId)) {
    fail(`${adsTxtPath} first record publisher id is invalid: "${publisherId}" (expected pub-<digits>).`);
  }
  if (!/^(DIRECT|RESELLER)$/i.test(firstFields[2] ?? '')) {
    fail(`${adsTxtPath} first record relationship is invalid: "${firstFields[2] ?? ''}" (expected DIRECT or RESELLER).`);
  }
}
requireTokens('src/app/ads.txt/route.ts', [
  'GET',
  'Content-Type',
  'text/plain',
]);

log('Checking release workflow wiring...');
requireTokens('package.json', ['npm run audit:adsense']);
const ciWorkflow = read('.github/workflows/ci.yml');
if (/vercel/i.test(ciWorkflow)) fail('CI workflow still contains a Vercel deployment job.');
requireTokens('.github/workflows/deploy-us-server.yml', [
  'commit_sha:',
  'test "$REMOTE_MAIN_COMMIT" = "$DEPLOY_COMMIT"',
  'SERVICE_VERSION_COMMIT=',
  'SERVICE_VERSION_BUILT_AT=',
  'npm run release:check',
  'npm run smoke:production',
  'ADSENSE_AUDIT_BASE_URL=',
  'ADSENSE_EXPECTED_COMMIT=',
]);

async function runLiveAudit() {
  const baseUrlValue = process.env.ADSENSE_AUDIT_BASE_URL?.trim();
  const expectedCommit = process.env.ADSENSE_EXPECTED_COMMIT?.trim();

  if (!baseUrlValue && !expectedCommit) {
    warn('Live route/SHA audit skipped; set ADSENSE_AUDIT_BASE_URL and ADSENSE_EXPECTED_COMMIT together after deployment.');
    return;
  }
  if (!baseUrlValue || !expectedCommit) {
    fail('Live audit requires both ADSENSE_AUDIT_BASE_URL and ADSENSE_EXPECTED_COMMIT.');
    return;
  }

  const baseUrl = new URL(baseUrlValue);
  const fetchText = async (path: string) => {
    const response = await fetch(new URL(path, baseUrl), { redirect: 'follow' });
    if (!response.ok) fail(`Live route ${path} returned ${response.status}.`);
    return response.text();
  };

  log(`Running live AdSense audit against ${baseUrl.origin}...`);
  const versionResponse = await fetch(new URL('/api/version', baseUrl));
  if (!versionResponse.ok) {
    fail(`/api/version returned ${versionResponse.status}.`);
  } else {
    const version = (await versionResponse.json()) as { commit?: string };
    if (version.commit !== expectedCommit) fail(`/api/version commit ${version.commit ?? 'missing'} does not match ${expectedCommit}.`);
  }

  const home = await fetchText('/');
  for (const pattern of [/tianji\.global/i, /(?:Sophie|Olivia|林小姐|苏小姐|陈小姐)/i, /©\s*2024/i]) {
    if (pattern.test(home)) fail(`Live homepage contains prohibited legacy content: ${pattern}`);
  }

  for (const path of ['/en/love-reading', '/zh-CN/love-reading', '/relationship/new?lang=en', '/relationship/new?lang=zh', '/pricing', '/legal/privacy', '/legal/terms']) {
    await fetchText(path);
  }

  const sitemap = await fetchText('/sitemap.xml');
  if (sitemap.includes('/privacy-center')) fail('Live sitemap still contains /privacy-center.');
  for (const path of ['/legal/privacy', '/legal/terms', '/pricing']) {
    if (!sitemap.includes(path)) fail(`Live sitemap is missing ${path}.`);
  }
}

function finish() {
  log('');
  if (errors.length > 0) {
    console.error(`\n=== RESULT: FAIL — ${errors.length} error(s) ===`);
    errors.forEach((message) => console.error(`  ${message}`));
    process.exitCode = 1;
    return;
  }

  console.log('\n=== RESULT: PASS (SOURCE GATE) ===');
  if (warnings.length > 0) {
    console.log(`${warnings.length} external or non-blocking warning(s) were reported above.`);
  }
}

runLiveAudit()
  .catch((error: unknown) => fail(`Live audit failed: ${error instanceof Error ? error.message : String(error)}`))
  .finally(finish);
