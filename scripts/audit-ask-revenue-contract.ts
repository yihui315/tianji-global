const fs = require('node:fs');
const path = require('node:path');

type Status = 'go' | 'no-go' | 'unknown';
type OverallStatus = 'go' | 'conditional-go' | 'no-go';

type AuditResult = {
  askCheckoutRoute: Status;
  askWebhookRoute: Status;
  askEntitlementCheck: Status;
  askPaidGatewayRoute: Status;
  askSafetyRewrite: Status;
  askAiMetaPrivacy: Status;
  overall: OverallStatus;
};

const root = process.cwd();

function resolveProjectPath(filePath: string) {
  return path.resolve(root, filePath);
}

function exists(filePath: string) {
  return fs.existsSync(resolveProjectPath(filePath));
}

function read(filePath: string) {
  const absolute = resolveProjectPath(filePath);
  if (!fs.existsSync(absolute)) return '';
  return fs.readFileSync(absolute, 'utf8');
}

function hasEvery(source: string, snippets: string[]) {
  return snippets.every((snippet) => source.includes(snippet));
}

function routeStatus(filePath: string, source: string, snippets: string[]): Status {
  if (!exists(filePath)) return 'no-go';
  return hasEvery(source, snippets) ? 'go' : 'unknown';
}

const unlockRoutePath = 'src/app/api/ask/unlock/route.ts';
const previewRoutePath = 'src/app/api/ask/preview/route.ts';
const webhookRoutePath = 'src/app/api/stripe/webhook/route.ts';
const gatewayPath = 'src/lib/tianji-model-gateway.ts';

const unlockRoute = read(unlockRoutePath);
const previewRoute = read(previewRoutePath);
const webhookRoute = read(webhookRoutePath);
const gateway = read(gatewayPath);
const envExample = read('.env.example');

const requiredEnvNames = [
  'ASK_QUESTION_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'DEEPSEEK_API_KEY',
  'DEEPSEEK_BASE_URL',
  'OLLAMA_BASE_URL',
  'MINIMAX_TOKEN_PLAN_KEY',
];

const envContractReady = hasEvery(envExample, requiredEnvNames);
const previewGatingReady = exists(previewRoutePath) &&
  hasEvery(previewRoute, ['answer: null', 'locked: true', "fallbackReason: 'local-preview'"]) &&
  !previewRoute.includes('generateReport');

const aiMetaMatch = unlockRoute.match(/function toAskAiMeta[\s\S]*?\n}/);
const aiMetaSource = aiMetaMatch?.[0] ?? '';
const aiMetaForbidden = [
  'API_KEY',
  'apiKey',
  'rawPrompt',
  'prompt',
  'question',
  'birthDate',
  'birthTime',
  'birthLocation',
  'timezone',
  'requestBody',
];

const askCheckoutRoute = routeStatus(unlockRoutePath, unlockRoute, [
  'checkout.sessions.create',
  "flow: 'ask-question'",
  'ASK_QUESTION_UNLOCK_PRICE_USD_CENTS',
  'success_url',
  'cancel_url',
]);

const askWebhookRoute = routeStatus(webhookRoutePath, webhookRoute, [
  'STRIPE_WEBHOOK_SECRET',
  'webhooks.constructEvent',
  'checkout.session.completed',
]);

const askEntitlementCheck = routeStatus(unlockRoutePath, unlockRoute, [
  'checkout.sessions.retrieve',
  "session.metadata?.flow !== 'ask-question'",
  "session.payment_status === 'paid'",
  'decodeAskQuestionId',
]);

const askPaidGatewayRoute = routeStatus(unlockRoutePath, unlockRoute, [
  'generateTianjiModelResponse',
  "intent: 'paid_ask'",
  'buildPaidAskPrompt',
  'buildPaidAskSystemPrompt',
]);

const askSafetyRewrite = gateway.includes('paid_ask') &&
  gateway.includes('safetyRewriteRequired: true') &&
  gateway.includes('rewriteDeterministicPrediction') &&
  gateway.includes('pay now or disaster will happen')
  ? 'go'
  : exists(gatewayPath)
    ? 'unknown'
    : 'no-go';

const askAiMetaPrivacy = aiMetaSource &&
  hasEvery(aiMetaSource, ['provider', 'model', 'fallbackUsed', 'safetyRewritten', 'latencyMs', "route: 'paid_ask'"]) &&
  aiMetaForbidden.every((snippet) => !aiMetaSource.includes(snippet))
  ? 'go'
  : exists(unlockRoutePath)
    ? 'unknown'
    : 'no-go';

const statuses: Status[] = [
  askCheckoutRoute,
  askWebhookRoute,
  askEntitlementCheck,
  askPaidGatewayRoute,
  askSafetyRewrite,
  askAiMetaPrivacy,
];

const overall: OverallStatus = statuses.includes('no-go')
  ? 'no-go'
  : statuses.includes('unknown') || !envContractReady || !previewGatingReady
    ? 'conditional-go'
    : 'conditional-go';

const result: AuditResult = {
  askCheckoutRoute,
  askWebhookRoute,
  askEntitlementCheck,
  askPaidGatewayRoute,
  askSafetyRewrite,
  askAiMetaPrivacy,
  overall,
};

console.log(JSON.stringify(result, null, 2));

if (overall === 'no-go') {
  process.exit(1);
}

export {};
