#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const strict = args.has('--strict') || process.env.STRICT === 'true';

const FILES = {
  askPage: 'src/app/(main)/ask/page.tsx',
  askUnlock: 'src/app/api/ask/unlock/route.ts',
  drawPage: 'src/app/(main)/draw/page.tsx',
  drawUnlock: 'src/app/api/draw/unlock/route.ts',
  relationshipNewPage: 'src/app/relationship/new/page.tsx',
  relationshipNewClient: 'src/app/relationship/new/client.tsx',
  relationshipResult: 'src/components/relationship/RelationshipResult.tsx',
  checkoutRoute: 'src/app/api/checkout/route.ts',
  stripeWebhook: 'src/app/api/stripe/webhook/route.ts',
  relationshipStore: 'src/lib/relationship-reading-store.ts',
  readingId: 'src/lib/reading-id.ts',
  stripeCheckoutMetadata: 'src/lib/stripe-checkout-metadata.ts',
  billing: 'src/lib/billing.ts',
  payPerUse: 'src/lib/pay-per-use.ts',
  analyticsClient: 'src/lib/analytics/client.ts',
  funnelEvents: 'src/lib/analytics/funnel-events.ts',
  divinationEvents: 'src/lib/analytics/divination-events.ts',
  relationshipEvents: 'src/lib/analytics/relationship-events.ts',
  trustGuard: 'src/lib/trust-copy-guard.ts',
  evidence: 'src/lib/divination/evidence.ts',
};

function abs(relPath) {
  return path.join(repoRoot, relPath);
}

function exists(relPath) {
  return fs.existsSync(abs(relPath));
}

function read(relPath) {
  const fullPath = abs(relPath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : '';
}

const source = Object.fromEntries(
  Object.entries(FILES).map(([key, relPath]) => [key, read(relPath)])
);

function classifyStripeSecret(value) {
  if (!value) return 'missing';
  if (/^(sk|rk)_test_/.test(value)) return 'test-shaped';
  if (/^(sk|rk)_live_/.test(value)) return 'live-shaped';
  return 'unknown';
}

function classifyPublishableKey(value) {
  if (!value) return 'missing';
  if (/^pk_test_/.test(value)) return 'test-shaped';
  if (/^pk_live_/.test(value)) return 'live-shaped';
  return 'unknown';
}

function classifyWebhookSecret(value) {
  if (!value) return 'missing';
  return /^whsec_/.test(value) ? 'unknown' : 'unknown';
}

function classifyPriceId(value) {
  if (!value) return 'missing';
  if (/^price_/.test(value)) return 'unknown';
  return 'unknown';
}

function classifyBoolean(value) {
  if (value === 'true') return 'present-true';
  if (value === 'false') return 'present-false';
  return value ? 'unknown' : 'missing';
}

function classifyUrl(value) {
  if (!value) return 'missing';
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? 'present' : 'unknown';
  } catch {
    return 'unknown';
  }
}

function classifyPresence(value) {
  return value ? 'present' : 'missing';
}

function yesNo(value) {
  return value ? 'Go' : 'No-Go';
}

function hasAll(text, needles) {
  return needles.every((needle) => text.includes(needle));
}

const envChecks = [
  {
    name: 'STRIPE_SECRET_KEY',
    status: classifyStripeSecret(process.env.STRIPE_SECRET_KEY),
    requiredInStrict: true,
    strictOk: (status) => status === 'test-shaped',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    status: classifyWebhookSecret(process.env.STRIPE_WEBHOOK_SECRET),
    requiredInStrict: true,
    strictOk: (status) => status !== 'missing',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    status: classifyPublishableKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    requiredInStrict: true,
    strictOk: (status) => status === 'test-shaped',
  },
  {
    name: 'STRIPE_PRO_MONTHLY_PRICE_ID',
    status: classifyPriceId(process.env.STRIPE_PRO_MONTHLY_PRICE_ID),
    requiredInStrict: false,
    strictOk: () => true,
  },
  {
    name: 'STRIPE_PRO_YEARLY_PRICE_ID',
    status: classifyPriceId(process.env.STRIPE_PRO_YEARLY_PRICE_ID),
    requiredInStrict: false,
    strictOk: () => true,
  },
  {
    name: 'ENABLE_PAY_PER_USE',
    status: classifyBoolean(process.env.ENABLE_PAY_PER_USE),
    requiredInStrict: true,
    strictOk: (status) => status === 'present-true',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    status: classifyUrl(process.env.NEXT_PUBLIC_APP_URL),
    requiredInStrict: true,
    strictOk: (status) => status === 'present',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    status: classifyUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    requiredInStrict: true,
    strictOk: (status) => status === 'present',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    status: classifyPresence(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    requiredInStrict: true,
    strictOk: (status) => status === 'present',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    status: classifyPresence(process.env.SUPABASE_SERVICE_ROLE_KEY),
    requiredInStrict: true,
    strictOk: (status) => status === 'present',
  },
  {
    name: 'LOVE_TEST_PAID_INTENT_TEST_MODE_READY',
    status: classifyBoolean(process.env.LOVE_TEST_PAID_INTENT_TEST_MODE_READY),
    requiredInStrict: false,
    strictOk: () => true,
  },
  {
    name: 'LOVE_TEST_PAID_SMOKE_APPROVED',
    status: classifyBoolean(process.env.LOVE_TEST_PAID_SMOKE_APPROVED),
    requiredInStrict: false,
    strictOk: () => true,
  },
];

function askFunnel() {
  return {
    name: 'Ask',
    routeExists: exists(FILES.askPage),
    evidenceView: source.askPage.includes('DivinationEvidenceCard'),
    unlockCta: hasAll(source.askPage, ['onUnlock', 'unlockCta']),
    checkoutStart: hasAll(source.askUnlock, ['checkout.sessions.create', "mode: 'payment'"]),
    stripeGuard: source.askUnlock.includes('isStagingDegradedMode') &&
      source.askUnlock.includes('isStripePaymentAvailable'),
    entitlementPath: hasAll(source.askUnlock, ['checkout.sessions.retrieve', "payment_status === 'paid'"]),
    analyticsSafe: source.askPage.includes('trackRevenueFunnelEvent') &&
      source.divinationEvents.includes('buildDivinationEvidenceAnalyticsPayload') &&
      source.analyticsClient.includes('sanitizeClientAnalyticsPayload'),
    paidCompletion: 'Blocked until test-mode Stripe env is present; completion verifies checkout session directly.',
  };
}

function drawFunnel() {
  return {
    name: 'Draw',
    routeExists: exists(FILES.drawPage),
    evidenceView: source.drawPage.includes('DivinationEvidenceCard'),
    unlockCta: hasAll(source.drawPage, ['onUnlock', 'unlockCta']),
    checkoutStart: hasAll(source.drawUnlock, ['checkout.sessions.create', "mode: 'payment'"]),
    stripeGuard: source.drawUnlock.includes('isStagingDegradedMode') &&
      source.drawUnlock.includes('isStripePaymentAvailable'),
    entitlementPath: hasAll(source.drawUnlock, ['checkout.sessions.retrieve', "payment_status === 'paid'"]),
    analyticsSafe: source.drawPage.includes('trackRevenueFunnelEvent') &&
      source.divinationEvents.includes('buildDivinationEvidenceAnalyticsPayload') &&
      source.analyticsClient.includes('sanitizeClientAnalyticsPayload'),
    paidCompletion: 'Blocked until test-mode Stripe env is present; completion verifies checkout session directly.',
  };
}

function relationshipFunnel() {
  return {
    name: 'Relationship',
    routeExists: exists(FILES.relationshipNewPage) && exists(FILES.relationshipNewClient),
    evidenceView: source.relationshipResult.includes('DivinationEvidenceCard'),
    unlockCta: hasAll(source.relationshipResult, ['handleUnlock', 'Unlock the Full Relationship Pattern']),
    checkoutStart: hasAll(source.relationshipResult, ["fetch('/api/checkout'", "productId: 'compatibility_report'"]) &&
      hasAll(source.checkoutRoute, ['checkout.sessions.create', "checkoutSource === 'relationship'"]),
    stripeGuard: source.checkoutRoute.includes('requirePayPerUseEnabled') &&
      source.payPerUse.includes("process.env.ENABLE_PAY_PER_USE === 'true'"),
    entitlementPath: source.stripeWebhook.includes('markRelationshipReadingPremium') &&
      source.relationshipStore.includes('markRelationshipReadingPremium'),
    analyticsSafe: source.relationshipResult.includes('trackRelationshipEvent') &&
      !source.relationshipResult.includes('birthDate') &&
      !source.relationshipResult.includes('birthTime') &&
      !source.relationshipResult.includes('birthLocation'),
    paidCompletion: 'Blocked until test-mode Stripe, webhook, Supabase, and persisted relationship UUID are proven.',
  };
}

const funnels = [askFunnel(), drawFunnel(), relationshipFunnel()];

const appStaticChecks = [
  {
    name: 'checkout_start_from_free_preview event',
    ok: source.funnelEvents.includes('checkout_start_from_free_preview') &&
      source.funnelEvents.includes('buildCheckoutStartFromFreePreviewPayload') &&
      source.askPage.includes('trackCheckoutStartFromFreePreview') &&
      source.drawPage.includes('trackCheckoutStartFromFreePreview') &&
      source.relationshipResult.includes('trackCheckoutStartFromFreePreview'),
  },
  {
    name: 'Relationship UUID guard',
    ok: source.readingId.includes('export function isUuidReadingId') &&
      source.relationshipResult.includes('isUuidReadingId(reading.id)') &&
      source.checkoutRoute.includes('isUuidReadingId(checkoutReferenceId)'),
  },
  {
    name: 'Relationship rel_* fallback block',
    ok: source.relationshipResult.includes('relationship_checkout_blocked_missing_persisted_reading') &&
      source.relationshipResult.includes('missing_uuid_reading_id') &&
      source.relationshipResult.includes('We need to save this reading before checkout. Please try again in a moment.'),
  },
  {
    name: 'Webhook metadata validation',
    ok: source.stripeCheckoutMetadata.includes('validateCheckoutSessionMetadata') &&
      source.stripeWebhook.includes('validateCheckoutSessionMetadata') &&
      source.stripeWebhook.includes('ignored checkout.session.completed with unsafe metadata'),
  },
  {
    name: 'Entitlement route detection',
    ok: source.stripeCheckoutMetadata.includes("source: CheckoutMetadataSource") &&
      source.stripeCheckoutMetadata.includes("productId: BillingProductId") &&
      source.stripeWebhook.includes('readingModeFromProduct') &&
      source.stripeWebhook.includes('markRelationshipReadingPremium') &&
      source.stripeWebhook.includes('ensureReportJobForSession'),
  },
];

const routeFailures = funnels.flatMap((funnel) => {
  const failures = [];
  for (const key of ['routeExists', 'evidenceView', 'unlockCta', 'checkoutStart', 'stripeGuard', 'entitlementPath', 'analyticsSafe']) {
    if (!funnel[key]) failures.push(`${funnel.name}: ${key}`);
  }
  return failures;
});

const appStaticFailures = appStaticChecks
  .filter((check) => !check.ok)
  .map((check) => `${check.name}: missing`);

const liveKeyFindings = envChecks
  .filter((check) => check.status === 'live-shaped')
  .map((check) => `${check.name}: live-shaped`);

const readinessEnvFailures = envChecks
  .filter((check) => check.requiredInStrict && !check.strictOk(check.status))
  .map((check) => `${check.name}: ${check.status}`);

const blockers = [
  ...liveKeyFindings,
  ...readinessEnvFailures,
  ...routeFailures,
  ...appStaticFailures,
];

console.log('# TianJi Love Stripe Test-Mode Paid Funnel Readiness');
console.log('');
console.log(`Mode: ${strict ? 'strict' : 'non-strict'}`);
console.log('Secret handling: values redacted; no raw env values printed.');
console.log('');
console.log('## Env readiness, masked');
for (const check of envChecks) {
  console.log(`- ${check.name}: ${check.status}; value: redacted`);
}
console.log('- ASK/DRAW/RELATIONSHIP_PRICE_CONFIG: inline price_data; test/live mode depends on STRIPE_SECRET_KEY account mode.');
console.log('- SUPABASE_STAGING_UUID_PERSISTENCE: requires Supabase test/staging env plus relationship_readings writes; values redacted.');
console.log('');
console.log('## App-side readiness checks');
for (const check of appStaticChecks) {
  console.log(`- ${check.name}: ${check.ok ? 'present' : 'missing'}`);
}
console.log('');
console.log('## Funnel readiness');
console.log('| Funnel | Route | Evidence View | Unlock CTA | Checkout Start | Stripe Guard | Entitlement/Callback | Analytics Safe | Paid Completion |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const funnel of funnels) {
  console.log(
    `| ${funnel.name} | ${yesNo(funnel.routeExists)} | ${yesNo(funnel.evidenceView)} | ${yesNo(funnel.unlockCta)} | ${yesNo(funnel.checkoutStart)} | ${yesNo(funnel.stripeGuard)} | ${yesNo(funnel.entitlementPath)} | ${yesNo(funnel.analyticsSafe)} | ${funnel.paidCompletion} |`
  );
}
console.log('');
console.log('## Static findings');
console.log('- Ask checkout start: /api/ask/unlock POST creates a Stripe payment Checkout Session with inline price_data.');
console.log('- Ask paid completion: /api/ask/unlock GET retrieves the Checkout Session and requires paid/complete status.');
console.log('- Draw checkout start: /api/draw/unlock POST creates a Stripe payment Checkout Session with inline price_data.');
console.log('- Draw paid completion: /api/draw/unlock GET retrieves the Checkout Session and requires paid/complete status.');
console.log('- Relationship checkout start: RelationshipResult posts compatibility_report to /api/checkout; /api/checkout is gated by ENABLE_PAY_PER_USE.');
console.log('- Relationship UUID guard: client and server require persisted UUID-shaped relationship reading ids before checkout.');
console.log('- Webhook metadata validation: checkout.session.completed is ignored unless product, source, and UUID reading metadata are safe.');
console.log('- Relationship paid completion: /api/stripe/webhook handles validated checkout.session.completed and marks relationship_readings.is_premium.');
console.log('- Test/live mode is not enforced by code; it must be proven by masked env classification before any paid smoke.');
console.log('');

if (blockers.length) {
  console.log('## Result');
  console.log(`Stripe test-mode paid smoke: Blocked - ${blockers.join('; ')}`);
} else {
  console.log('## Result');
  console.log('Stripe test-mode paid smoke: Readiness checks passed for this mode.');
}

if (blockers.length && strict) {
  process.exitCode = 1;
}
