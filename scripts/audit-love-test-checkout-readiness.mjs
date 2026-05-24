import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

const checks = [];

function check(name, passed, evidence) {
  checks.push({ name, passed, evidence });
}

function indexBefore(source, before, after) {
  const beforeIndex = source.indexOf(before);
  const afterIndex = source.indexOf(after);
  return beforeIndex >= 0 && afterIndex >= 0 && beforeIndex < afterIndex;
}

const requiredFiles = [
  'src/lib/love-test.ts',
  'src/app/(main)/ask/page.tsx',
  'src/app/api/ask/preview/route.ts',
  'src/app/api/ask/unlock/route.ts',
  'src/app/api/stripe/webhook/route.ts',
  'src/lib/analytics/funnel-events.ts',
  'src/__tests__/api/ask-paid-gateway.test.ts',
  'src/__tests__/revenue-funnel-polish-contract.test.ts',
  'src/__tests__/love-test-mvp-contract.test.ts',
];

for (const file of requiredFiles) {
  check(`file exists: ${file}`, exists(file), file);
}

const loveTest = read('src/lib/love-test.ts');
const askPage = read('src/app/(main)/ask/page.tsx');
const previewRoute = read('src/app/api/ask/preview/route.ts');
const unlockRoute = read('src/app/api/ask/unlock/route.ts');
const webhookRoute = read('src/app/api/stripe/webhook/route.ts');
const events = read('src/lib/analytics/funnel-events.ts');
const askPaidTest = read('src/__tests__/api/ask-paid-gateway.test.ts');
const revenueTest = read('src/__tests__/revenue-funnel-polish-contract.test.ts');

check(
  'paid intent allowlist includes exactly the three Love-Test intents',
  loveTest.includes("LOVE_TEST_PAID_INTENTS = ['what_are_they_thinking', 'timing', 'next_step']"),
  'LOVE_TEST_PAID_INTENTS',
);
check(
  'Ask page preserves source and intent attribution',
  askPage.includes("searchParams.get('source') === 'love_test'") &&
    askPage.includes('isLoveTestAskIntent') &&
    askPage.includes('intent: attributionIntent'),
  'source=love_test + whitelisted intent',
);
check(
  'Ask page blocks Love-Test paid-intent unlock on the client',
  askPage.includes('setError(LOVE_TEST_CHECKOUT_READINESS_LABEL)') &&
    indexBefore(askPage, 'if (paidIntentMeta)', "fetch('/api/ask/unlock'"),
  'client gate before unlock fetch',
);
check(
  'Love-Test preview is deterministic and does not call provider live AI',
  previewRoute.includes('buildLoveTestPaidIntentFallback') &&
    !previewRoute.includes('generateTianjiModelResponse') &&
    !previewRoute.includes('generateReport'),
  'preview fallback only',
);
check(
  'unlock route contains staging-degraded payment block before checkout',
  unlockRoute.includes('isStagingDegradedMode()') &&
    unlockRoute.includes('buildPaymentUnavailableBody()') &&
    indexBefore(unlockRoute, 'isStagingDegradedMode()', 'stripe.checkout.sessions.create'),
  'payment_unavailable before Stripe create',
);
check(
  'unlock route requires Love-Test test-mode readiness before checkout',
  unlockRoute.includes('LOVE_TEST_PAID_INTENT_TEST_MODE_READY') &&
    unlockRoute.includes('LOVE_TEST_PAID_SMOKE_APPROVED') &&
    unlockRoute.includes('love_test_checkout_readiness_required') &&
    unlockRoute.includes('love_test_paid_smoke_approval_required') &&
    indexBefore(unlockRoute, 'getLoveTestPaidIntentCheckoutGate', 'stripe.checkout.sessions.create'),
  'approval gate before Stripe create',
);
check(
  'unlock verification blocks Love-Test paid intent before Stripe retrieve',
  indexBefore(unlockRoute, 'getLoveTestPaidIntentCheckoutGate', 'stripe.checkout.sessions.retrieve'),
  'approval gate before Stripe retrieve',
);
check(
  'webhook has staging-degraded guard before Stripe verification or mutation',
  webhookRoute.includes('isStagingDegradedMode()') &&
    webhookRoute.includes('STAGING_DEGRADED_PAYMENT_UNAVAILABLE_CODE') &&
    indexBefore(webhookRoute, 'isStagingDegradedMode()', 'recordStripeEvent(event)'),
  'webhook skip before mutation',
);
check(
  'Love-Test paid-intent analytics events are allowlisted',
  events.includes('love_test_paid_intent_view') &&
    events.includes('love_test_paid_preview_submit') &&
    events.includes('love_test_paid_unlock_click') &&
    events.includes('love_test_checkout_readiness_blocked'),
  'LOVE_TEST_CONVERSION_EVENTS',
);
check(
  'runtime tests assert blocked unlocks do not call Stripe or provider code',
  askPaidTest.includes('love_test_checkout_readiness_required') &&
    askPaidTest.includes('love_test_paid_smoke_approval_required') &&
    askPaidTest.includes('not.toHaveBeenCalled()') &&
    askPaidTest.includes('json.url).toBeUndefined()'),
  'ask-paid-gateway Love-Test readiness tests',
);
check(
  'static revenue contract keeps checkout gate before Stripe create',
  revenueTest.includes('getLoveTestPaidIntentCheckoutGate') &&
    revenueTest.includes('stripe.checkout.sessions.create') &&
    revenueTest.includes('toBeLessThan'),
  'revenue-funnel-polish contract',
);

const failed = checks.filter((item) => !item.passed);

for (const item of checks) {
  console.log(`${item.passed ? 'go' : 'no-go'} | ${item.name} | ${item.evidence}`);
}

console.log(`overall=${failed.length === 0 ? 'go' : 'no-go'}`);

if (failed.length) {
  process.exitCode = 1;
}
