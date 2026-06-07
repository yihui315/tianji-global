#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fileArgIndex = args.indexOf('--file');
const evidenceFile = fileArgIndex >= 0 ? args[fileArgIndex + 1] : '.ai/TIANJI_LOVE_REVENUE_EVIDENCE_TODO_20260605.md';
const stripeKeyPrefixes = [
  ['sk', 'live', ''].join('_'),
  ['sk', 'test', ''].join('_'),
  ['pk', 'live', ''].join('_'),
  ['pk', 'test', ''].join('_'),
  ['rk', 'live', ''].join('_'),
  ['rk', 'test', ''].join('_'),
];
const stripeWebhookPrefix = 'wh' + 'sec' + '_';
const jwtPrefix = 'ey' + 'J';

if (!evidenceFile) {
  fail('Missing --file value.');
}

const normalizedFile = path.normalize(evidenceFile);
const basename = path.basename(normalizedFile).toLowerCase();
if (basename.startsWith('.env') || /\.env($|[.\-_])/.test(normalizedFile)) {
  fail('Refusing to read env files.');
}

const fullPath = path.resolve(repoRoot, normalizedFile);
if (!fullPath.startsWith(repoRoot + path.sep)) {
  fail('Refusing to read evidence outside the repository.');
}

if (!fs.existsSync(fullPath)) {
  fail(`Evidence file missing: ${normalizedFile}`);
}

const content = fs.readFileSync(fullPath, 'utf8');
const secretLeakFindings = findSecretLikeContent(content);
const rows = parseRows(content);
const results = [];
const blockers = [];

const required = [
  { id: 'hosted_staging_url', mode: anyOf('preview', 'staging', 'test'), present: true },
  { id: 'supabase_staging_url', mode: anyOf('staging', 'test'), present: true },
  { id: 'supabase_anon_key', mode: anyOf('staging', 'test'), present: true },
  { id: 'supabase_service_role_key', mode: anyOf('staging', 'test'), present: true },
  { id: 'stripe_publishable_key', mode: exact('test'), present: true, status: 'verified_test_mode' },
  { id: 'stripe_secret_key', mode: exact('test'), present: true, status: 'verified_test_mode' },
  { id: 'stripe_webhook_secret', mode: exact('test'), present: true },
  { id: 'stripe_love_premium_report_price_id', mode: exact('test'), present: true },
  {
    id: 'love_premium_price_contract',
    present: true,
    custom: (evidence) => {
      const productOk = lower(evidence.product) === 'love_premium_report';
      const currencyOk = lower(evidence.currency) === 'cny';
      const unitAmountOk = evidence.unit_amount === '1990' || evidence.amount_minor === '1990';
      return productOk && currencyOk && unitAmountOk
        ? null
        : 'requires product=love_premium_report currency=cny unit_amount=1990';
    },
  },
  { id: 'resend_api_key', mode: anyOf('sandbox', 'safe', 'staging', 'test'), present: true },
  { id: 'from_email', mode: anyOf('sandbox', 'safe', 'staging', 'test'), present: true },
  {
    id: 'test_mode_checkout_webhook_dry_run_approval',
    mode: exact('test'),
    present: true,
    custom: (evidence) => lower(evidence.approved) === 'yes' ? null : 'requires approved=yes for dry-run only',
  },
];

for (const spec of required) {
  const row = rows.get(spec.id);
  if (!row) {
    blockers.push(`${spec.id}: row missing`);
    results.push({ id: spec.id, verdict: 'no-go', reason: 'row missing' });
    continue;
  }

  const evidence = row.evidence;
  const presentOk = lower(evidence.present) === 'yes' || row.status === 'present_masked' || row.status === 'verified_test_mode';
  const statusOk = !spec.status || row.status === spec.status;
  const modeOk = spec.mode ? spec.mode(lower(evidence.mode)) : true;
  const customBlocker = spec.custom ? spec.custom(evidence) : null;

  if (!presentOk) {
    blockers.push(`${spec.id}: present evidence missing`);
  }
  if (!statusOk) {
    blockers.push(`${spec.id}: status must be ${spec.status}`);
  }
  if (!modeOk) {
    blockers.push(`${spec.id}: mode is not allowed`);
  }
  if (customBlocker) {
    blockers.push(`${spec.id}: ${customBlocker}`);
  }

  results.push({
    id: spec.id,
    status: row.status,
    mode: evidence.mode || 'missing',
    present: evidence.present || 'unknown',
    verdict: presentOk && statusOk && modeOk && !customBlocker ? 'go' : 'no-go',
  });
}

if (secretLeakFindings.length > 0) {
  for (const finding of secretLeakFindings) {
    blockers.push(`secret-like plaintext detected: ${finding}`);
  }
}

const uniqueBlockers = [...new Set(blockers)];
const overall = uniqueBlockers.length === 0 ? 'go' : 'no-go';

console.log(JSON.stringify({
  tool: 'tianji-love-masked-evidence-validator',
  file: normalizedFile,
  secret_handling: 'Evidence file scanned for raw Stripe keys, webhook secrets, raw Price IDs, and JWT-shaped values.',
  overall,
  results,
  blockers: uniqueBlockers,
}, null, 2));

if (overall !== 'go') {
  process.exitCode = 1;
}

function fail(message) {
  console.error(JSON.stringify({ tool: 'tianji-love-masked-evidence-validator', overall: 'no-go', blockers: [message] }, null, 2));
  process.exit(1);
}

function lower(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function exact(expected) {
  return (actual) => actual === expected;
}

function anyOf(...allowed) {
  return (actual) => allowed.includes(actual);
}

function parseRows(markdown) {
  const rows = new Map();
  for (const line of markdown.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue;
    if (/^\|\s*-+/.test(trimmed)) continue;

    const cells = trimmed.slice(1, -1).split('|').map((cell) => cell.trim());
    if (cells.length < 3) continue;
    const [field, status, evidenceCell] = cells;
    if (!field || lower(field) === 'field') continue;
    rows.set(field, { status, evidence: parseEvidence(evidenceCell) });
  }
  return rows;
}

function parseEvidence(cell) {
  const evidence = {};
  for (const match of cell.matchAll(/([a-zA-Z0-9_]+)=("[^"]*"|[^,\s]+)/g)) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    evidence[key] = value;
  }
  return evidence;
}

function findSecretLikeContent(text) {
  const stripeKeyPattern = new RegExp(`\\b(?:${stripeKeyPrefixes.map(escapeRegExp).join('|')})[A-Za-z0-9]{12,}\\b`, 'g');
  const stripeWebhookPattern = new RegExp(`\\b${escapeRegExp(stripeWebhookPrefix)}[A-Za-z0-9]{12,}\\b`, 'g');
  const jwtPattern = new RegExp(`\\b${escapeRegExp(jwtPrefix)}[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{10,}\\b`, 'g');
  const patterns = [
    ['stripe_key', stripeKeyPattern],
    ['stripe_webhook_secret', stripeWebhookPattern],
    ['stripe_price_id', /\bprice_[A-Za-z0-9]{8,}\b/g],
    ['jwt_like_value', jwtPattern],
  ];

  const findings = [];
  for (const [name, pattern] of patterns) {
    if (pattern.test(text)) {
      findings.push(name);
    }
  }
  return findings;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
