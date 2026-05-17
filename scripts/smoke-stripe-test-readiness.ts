const fs = require('node:fs');
const path = require('node:path');

type Status = 'go' | 'no-go' | 'unknown';
type OverallStatus = 'go' | 'conditional-go' | 'no-go';
type Mode = 'readiness' | 'test-live';

export type StripeTestReadinessResult = {
  mode: Mode;
  stripeKeysLookTestMode: Status;
  askCheckoutReadiness: Status;
  drawCheckoutReadiness: Status;
  subscriptionCheckoutReadiness: Status;
  webhookReadiness: Status;
  entitlementReadiness: Status;
  overall: OverallStatus;
};

type EnvLike = Record<string, string | undefined>;

const root = process.cwd();

function read(filePath: string) {
  const absolute = path.resolve(root, filePath);
  if (!fs.existsSync(absolute)) return '';
  return fs.readFileSync(absolute, 'utf8');
}

function exists(filePath: string) {
  return fs.existsSync(path.resolve(root, filePath));
}

function hasEvery(source: string, snippets: string[]) {
  return snippets.every((snippet) => source.includes(snippet));
}

function normalizeMode(raw: string | undefined): Mode {
  return raw === 'test-live' ? 'test-live' : 'readiness';
}

function classifyStripeKey(env: EnvLike, mode: Mode, allowLive: boolean): Status {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) return 'unknown';
  if (mode === 'test-live' && !allowLive) return 'unknown';
  if (key.startsWith('sk_test_')) return 'go';
  if (key.startsWith('sk_live_')) return 'no-go';
  return 'unknown';
}

function sourceStatus(filePath: string, snippets: string[]): Status {
  if (!exists(filePath)) return 'no-go';
  return hasEvery(read(filePath), snippets) ? 'go' : 'unknown';
}

function overallFor(statuses: Status[], mode: Mode, liveAllowed: boolean): OverallStatus {
  if (mode === 'test-live' && !liveAllowed) return 'no-go';
  if (statuses.includes('no-go')) return 'no-go';
  return 'conditional-go';
}

export async function createStripeTestReadinessResult(env: EnvLike = process.env): Promise<StripeTestReadinessResult> {
  const mode = normalizeMode(env.STRIPE_SMOKE_MODE);
  const liveAllowed = env.STRIPE_SMOKE_ALLOW_LIVE === 'true';
  const stripeKeysLookTestMode = classifyStripeKey(env, mode, liveAllowed);
  const askCheckoutReadiness = sourceStatus('src/app/api/ask/unlock/route.ts', [
    'checkout.sessions.create',
    "flow: 'ask-question'",
    'success_url',
    'cancel_url',
  ]);
  const drawCheckoutReadiness = sourceStatus('src/app/api/draw/unlock/route.ts', [
    'checkout.sessions.create',
    "flow: 'quick-draw'",
    'success_url',
    'cancel_url',
  ]);
  const subscriptionCheckoutReadiness = sourceStatus('src/app/api/stripe/checkout/route.ts', [
    'checkout.sessions.create',
    'success_url',
    'cancel_url',
  ]);
  const webhookReadiness = sourceStatus('src/app/api/stripe/webhook/route.ts', [
    'STRIPE_WEBHOOK_SECRET',
    'webhooks.constructEvent',
    'checkout.session.completed',
  ]);
  const entitlementReadiness = exists('src/app/api/entitlements/route.ts') ||
    read('src/app/api/stripe/webhook/route.ts').includes('user_entitlements')
    ? 'go'
    : 'unknown';
  const statuses = [
    stripeKeysLookTestMode,
    askCheckoutReadiness,
    drawCheckoutReadiness,
    subscriptionCheckoutReadiness,
    webhookReadiness,
    entitlementReadiness,
  ];

  return {
    mode,
    stripeKeysLookTestMode,
    askCheckoutReadiness,
    drawCheckoutReadiness,
    subscriptionCheckoutReadiness,
    webhookReadiness,
    entitlementReadiness,
    overall: overallFor(statuses, mode, liveAllowed),
  };
}

async function main() {
  const result = await createStripeTestReadinessResult();
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  void main();
}
