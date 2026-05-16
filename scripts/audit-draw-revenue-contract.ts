const fs = require('node:fs');
const path = require('node:path');

type Status = 'go' | 'no-go' | 'unknown';
type OverallStatus = 'go' | 'conditional-go' | 'no-go';

type AuditResult = {
  drawEntryRoute: Status;
  drawApiRoute: Status;
  drawGatewayRoute: Status;
  drawFreeBoundary: Status;
  drawPaidBoundary: Status;
  drawSafetyRewrite: Status;
  drawAiMetaPrivacy: Status;
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

function statusWhen(filePath: string, ready: boolean): Status {
  if (!exists(filePath)) return 'no-go';
  return ready ? 'go' : 'unknown';
}

const drawPagePath = 'src/app/(main)/draw/page.tsx';
const previewRoutePath = 'src/app/api/draw/preview/route.ts';
const unlockRoutePath = 'src/app/api/draw/unlock/route.ts';
const tarotRoutePath = 'src/app/api/tarot/route.ts';
const gatewayPath = 'src/lib/tianji-model-gateway.ts';
const quickDrawPath = 'src/lib/quick-draw.ts';

const drawPage = read(drawPagePath);
const previewRoute = read(previewRoutePath);
const unlockRoute = read(unlockRoutePath);
const tarotRoute = read(tarotRoutePath);
const gateway = read(gatewayPath);
const quickDraw = read(quickDrawPath);

const drawEntryRoute = statusWhen(drawPagePath, hasEvery(drawPage, [
  "fetch('/api/draw/preview'",
  "fetch('/api/draw/unlock'",
]));

const drawApiRoute: Status = exists(previewRoutePath) && exists(unlockRoutePath)
  ? hasEvery(previewRoute, ['export async function POST', 'quickDrawInputSchema']) &&
    hasEvery(unlockRoute, ['export async function POST', 'export async function GET'])
    ? 'go'
    : 'unknown'
  : 'no-go';

const drawGatewayRoute: Status = exists(gatewayPath) &&
  hasEvery(gateway, ['tarot_draw', "preferredModel: 'ollama/gemma4:31b'", "fallbackModels: ['deepseek/deepseek-v4-flash']"]) &&
  hasEvery(previewRoute, ['generateTianjiModelResponse', "intent: 'tarot_draw'"]) &&
  hasEvery(unlockRoute, ['generateTianjiModelResponse', "intent: 'tarot_draw'"]) &&
  hasEvery(tarotRoute, ['generateTianjiModelResponse', "intent: 'tarot_draw'"])
  ? 'go'
  : exists(gatewayPath)
    ? 'unknown'
    : 'no-go';

const drawFreeBoundary = statusWhen(previewRoutePath, hasEvery(previewRoute, [
  'locked: true',
  'fullReading:',
  "fullReading: ''",
  'toDrawGatewayCards',
  'buildFallbackReading',
]) && !previewRoute.includes('fullReading,'));

const drawPaidBoundary = statusWhen(unlockRoutePath, hasEvery(unlockRoute, [
  'checkout.sessions.retrieve',
  "session.metadata?.flow !== 'quick-draw'",
  "session.payment_status === 'paid'",
  'decodeQuickDrawId',
  'buildPaidDrawPrompt',
  'locked: false',
  'fullReading: reading',
]));

const drawSafetyRewrite: Status = gateway.includes('tarot_draw') &&
  gateway.includes('safetyRewriteRequired: true') &&
  gateway.includes('rewriteDeterministicPrediction') &&
  gateway.includes('the cards guarantee') &&
  gateway.includes('pay now or disaster will happen')
  ? 'go'
  : exists(gatewayPath)
    ? 'unknown'
    : 'no-go';

const aiMetaMatch = `${previewRoute}\n${unlockRoute}\n${tarotRoute}`.match(/function to(?:Draw|Tarot)AiMeta[\s\S]*?\n}/g);
const aiMetaSource = aiMetaMatch?.join('\n') ?? '';
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
  'providerRequestBody',
];

const drawAiMetaPrivacy: Status = aiMetaSource &&
  hasEvery(aiMetaSource, ['provider', 'model', 'fallbackUsed', 'safetyRewritten', 'latencyMs', "route: 'tarot_draw'"]) &&
  aiMetaForbidden.every((snippet) => !aiMetaSource.includes(snippet)) &&
  quickDraw.includes('interface DrawAiMeta')
  ? 'go'
  : exists(previewRoutePath) && exists(unlockRoutePath)
    ? 'unknown'
    : 'no-go';

const statuses: Status[] = [
  drawEntryRoute,
  drawApiRoute,
  drawGatewayRoute,
  drawFreeBoundary,
  drawPaidBoundary,
  drawSafetyRewrite,
  drawAiMetaPrivacy,
];

const overall: OverallStatus = statuses.includes('no-go')
  ? 'no-go'
  : statuses.includes('unknown')
    ? 'conditional-go'
    : 'conditional-go';

const result: AuditResult = {
  drawEntryRoute,
  drawApiRoute,
  drawGatewayRoute,
  drawFreeBoundary,
  drawPaidBoundary,
  drawSafetyRewrite,
  drawAiMetaPrivacy,
  overall,
};

console.log(JSON.stringify(result, null, 2));

if (overall === 'no-go') {
  process.exit(1);
}

export {};
