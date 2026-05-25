import { generateReport } from '@/lib/ai-orchestrator';
import {
  STAGING_DEGRADED_PROVIDER_DISABLED_CODE,
  buildProviderDisabledContent,
  isAiProviderLiveDisabled,
} from '@/lib/staging-degraded-mode';
import type { ModelProvider, ReportRequest, ReportResponse, TaskType } from '@/types/ai';

export type TianjiModelIntent =
  | 'love-preview'
  | 'relationship-report'
  | 'ask-unlock'
  | 'paid_ask'
  | 'ask_preview'
  | 'tarot-draw'
  | 'tarot_draw'
  | 'support-faq'
  | 'safety-rewrite'
  | 'safety_rewrite'
  | 'internal-research'
  | 'visual-first-pass'
  | 'judge-replay';

export interface TianjiQuotaGate {
  provider: Extract<ModelProvider, 'minimax'>;
  envKey: 'MINIMAX_TOKEN_PLAN_KEY';
  minimumRemainingRatio: number;
}

export interface TianjiModelRoute {
  intent: TianjiModelIntent;
  provider: ModelProvider;
  model: string;
  preferredModel: string;
  taskType: TaskType;
  publicUserFacing: boolean;
  safetyRewriteRequired: boolean;
  quotaGate?: TianjiQuotaGate;
  fallbackModels: string[];
}

export interface TianjiModelAuditEvent {
  intent: TianjiModelIntent;
  provider: ModelProvider;
  model: string;
  fallback: boolean;
  publicUserFacing: boolean;
  safetyRewriteApplied: boolean;
  tokensUsed?: { input: number; output: number };
  costUSD?: number;
  latencyMs?: number;
  error?: string;
}

export interface MiniMaxQuotaGateStatus {
  enabled: boolean;
  reason?: 'missing-token-plan-key';
  endpoint: 'https://www.minimax.io/v1/token_plan/remains';
  tokenPlanKeyPresent: boolean;
}

export interface TianjiModelGatewayRequest extends Omit<ReportRequest, 'preferredModel' | 'preferredProvider' | 'taskType'> {
  intent: TianjiModelIntent;
}

export interface TianjiModelGatewayResponse extends ReportResponse {
  route: TianjiModelRoute;
  audit: TianjiModelAuditEvent;
}

type GenerateReportFn = (request: ReportRequest) => Promise<ReportResponse>;

function getProviderFromModelId(modelId: string): ModelProvider {
  const [provider] = modelId.split('/') as [ModelProvider];
  return provider;
}

const ROUTES: Record<TianjiModelIntent, TianjiModelRoute> = {
  'love-preview': {
    intent: 'love-preview',
    provider: 'ollama',
    model: 'gemma4:31b',
    preferredModel: 'ollama/gemma4:31b',
    taskType: 'analysis',
    publicUserFacing: true,
    safetyRewriteRequired: true,
    fallbackModels: ['ollama/gpt-oss:20b', 'deepseek/deepseek-v4-flash'],
  },
  'relationship-report': {
    intent: 'relationship-report',
    provider: 'ollama',
    model: 'gemma4:31b',
    preferredModel: 'ollama/gemma4:31b',
    taskType: 'analysis',
    publicUserFacing: true,
    safetyRewriteRequired: true,
    fallbackModels: ['deepseek/deepseek-v4-flash'],
  },
  'ask-unlock': {
    intent: 'ask-unlock',
    provider: 'deepseek',
    model: 'deepseek-v4-flash',
    preferredModel: 'deepseek/deepseek-v4-flash',
    taskType: 'analysis',
    publicUserFacing: true,
    safetyRewriteRequired: true,
    fallbackModels: ['deepseek/deepseek-v4-pro', 'ollama/gemma4:31b'],
  },
  paid_ask: {
    intent: 'paid_ask',
    provider: 'deepseek',
    model: 'deepseek-v4-flash',
    preferredModel: 'deepseek/deepseek-v4-flash',
    taskType: 'analysis',
    publicUserFacing: true,
    safetyRewriteRequired: true,
    fallbackModels: ['deepseek/deepseek-v4-pro', 'ollama/gemma4:31b'],
  },
  ask_preview: {
    intent: 'ask_preview',
    provider: 'ollama',
    model: 'gemma4:31b',
    preferredModel: 'ollama/gemma4:31b',
    taskType: 'fast',
    publicUserFacing: true,
    safetyRewriteRequired: true,
    fallbackModels: ['ollama/gpt-oss:20b'],
  },
  'tarot-draw': {
    intent: 'tarot-draw',
    provider: 'ollama',
    model: 'gemma4:31b',
    preferredModel: 'ollama/gemma4:31b',
    taskType: 'analysis',
    publicUserFacing: true,
    safetyRewriteRequired: true,
    fallbackModels: ['ollama/gpt-oss:20b', 'deepseek/deepseek-v4-flash'],
  },
  tarot_draw: {
    intent: 'tarot_draw',
    provider: 'ollama',
    model: 'gemma4:31b',
    preferredModel: 'ollama/gemma4:31b',
    taskType: 'analysis',
    publicUserFacing: true,
    safetyRewriteRequired: true,
    fallbackModels: ['deepseek/deepseek-v4-flash'],
  },
  'support-faq': {
    intent: 'support-faq',
    provider: 'ollama',
    model: 'gpt-oss:20b',
    preferredModel: 'ollama/gpt-oss:20b',
    taskType: 'fast',
    publicUserFacing: true,
    safetyRewriteRequired: true,
    fallbackModels: ['deepseek/deepseek-v4-flash'],
  },
  'safety-rewrite': {
    intent: 'safety-rewrite',
    provider: 'ollama',
    model: 'gpt-oss:20b',
    preferredModel: 'ollama/gpt-oss:20b',
    taskType: 'privacy',
    publicUserFacing: true,
    safetyRewriteRequired: true,
    fallbackModels: ['deepseek/deepseek-v4-flash'],
  },
  safety_rewrite: {
    intent: 'safety_rewrite',
    provider: 'ollama',
    model: 'gpt-oss:20b',
    preferredModel: 'ollama/gpt-oss:20b',
    taskType: 'privacy',
    publicUserFacing: true,
    safetyRewriteRequired: true,
    fallbackModels: ['deepseek/deepseek-v4-flash'],
  },
  'internal-research': {
    intent: 'internal-research',
    provider: 'minimax',
    model: 'MiniMax-M2.7',
    preferredModel: 'minimax/MiniMax-M2.7',
    taskType: 'analysis',
    publicUserFacing: false,
    safetyRewriteRequired: false,
    quotaGate: {
      provider: 'minimax',
      envKey: 'MINIMAX_TOKEN_PLAN_KEY',
      minimumRemainingRatio: 0.2,
    },
    fallbackModels: ['deepseek/deepseek-v4-flash', 'ollama/gemma4:31b'],
  },
  'visual-first-pass': {
    intent: 'visual-first-pass',
    provider: 'ollama',
    model: 'llava:7b',
    preferredModel: 'ollama/llava:7b',
    taskType: 'privacy',
    publicUserFacing: false,
    safetyRewriteRequired: false,
    fallbackModels: ['minimax/MiniMax-M2.7'],
  },
  'judge-replay': {
    intent: 'judge-replay',
    provider: 'ollama',
    model: 'deepseek-r1:32b',
    preferredModel: 'ollama/deepseek-r1:32b',
    taskType: 'analysis',
    publicUserFacing: false,
    safetyRewriteRequired: false,
    fallbackModels: ['deepseek/deepseek-v4-pro'],
  },
};

const deterministicRewrites: Array<[RegExp, string]> = [
  [/\b100%\s+will\s+come\s+back\b/gi, 'may reconnect if the observable pattern supports it'],
  [/\b100%\s+your\s+ex\s+will\s+return\b/gi, 'reconnection would depend on observable behavior from both people'],
  [/\bthis\s+will\s+definitely\s+happen\b/gi, 'this may happen only if the pattern continues'],
  [/\bwill definitely\b/gi, 'may'],
  [/\bdefinitely\s+marry\b/gi, 'may need to evaluate commitment through real behavior'],
  [/\bguaranteed\b/gi, 'not promised'],
  [/\bthe cards guarantee\b/gi, 'This points to a possible pattern'],
  [/\bdestined to happen\b/gi, 'may unfold in different ways'],
  [/\bdestined to break up\b/gi, 'may be under strain unless both people change the pattern'],
  [/\bdestined to\b/gi, 'may feel drawn toward'],
  [/\bexactly when\b/gi, 'a reflective window for when'],
  [/\bmust happen\b/gi, 'may happen if the pattern continues'],
  [/\bpay now or disaster will happen\b/gi, 'pause and look for observable signals before making any decision'],
  [/\bsoulmate is certain\b/gi, 'connection deserves careful reflection'],
  [/\bbirthDate\b/gi, 'private profile detail'],
  [/\bbirthTime\b/gi, 'private profile detail'],
  [/\bbirthLocation\b/gi, 'private profile detail'],
  [/\btimezone\b/gi, 'private profile detail'],
];

export function getTianjiModelRoute(intent: TianjiModelIntent): TianjiModelRoute {
  return ROUTES[intent];
}

export function rewriteDeterministicPrediction(content: string): string {
  let rewritten = content;

  for (const [pattern, replacement] of deterministicRewrites) {
    rewritten = rewritten.replace(pattern, replacement);
  }

  if (rewritten === content) {
    return content;
  }

  return [
    rewritten.trim(),
    'A healthier way to read this is to look for observable signals such as consistent actions, clear communication, and emotional steadiness. This should be treated as self-reflection, not certainty.',
  ].join(' ');
}

export function buildTianjiModelAuditEvent(
  route: TianjiModelRoute,
  response: Pick<ReportResponse, 'provider' | 'model' | 'tokensUsed' | 'costUSD' | 'latencyMs'>,
  options: { safetyRewriteApplied?: boolean; error?: string } = {}
): TianjiModelAuditEvent {
  return {
    intent: route.intent,
    provider: response.provider,
    model: response.model,
    fallback: response.provider !== route.provider || response.model !== route.preferredModel,
    publicUserFacing: route.publicUserFacing,
    safetyRewriteApplied: options.safetyRewriteApplied ?? false,
    tokensUsed: response.tokensUsed,
    costUSD: response.costUSD,
    latencyMs: response.latencyMs,
    error: options.error,
  };
}

export function getMiniMaxQuotaGate(env: Record<string, string | undefined> = process.env): MiniMaxQuotaGateStatus {
  const tokenPlanKeyPresent = Boolean(env.MINIMAX_TOKEN_PLAN_KEY);

  return {
    enabled: tokenPlanKeyPresent,
    reason: tokenPlanKeyPresent ? undefined : 'missing-token-plan-key',
    endpoint: 'https://www.minimax.io/v1/token_plan/remains',
    tokenPlanKeyPresent,
  };
}

export async function generateTianjiModelResponse(
  request: TianjiModelGatewayRequest,
  generate: GenerateReportFn = generateReport
): Promise<TianjiModelGatewayResponse> {
  const route = getTianjiModelRoute(request.intent);
  if (isAiProviderLiveDisabled()) {
    const response: ReportResponse = {
      content: buildProviderDisabledContent(),
      provider: route.provider,
      model: route.preferredModel,
      tokensUsed: { input: 0, output: 0 },
      costUSD: 0,
      latencyMs: 0,
      warnings: [STAGING_DEGRADED_PROVIDER_DISABLED_CODE],
    };

    return {
      ...response,
      route,
      audit: buildTianjiModelAuditEvent(route, response, {
        safetyRewriteApplied: false,
        error: STAGING_DEGRADED_PROVIDER_DISABLED_CODE,
      }),
    };
  }

  const { intent: _intent, ...reportRequest } = request;
  const modelAttempts = [route.preferredModel, ...route.fallbackModels];
  let lastError: unknown;

  for (const preferredModel of modelAttempts) {
    try {
      const response = await generate({
        ...reportRequest,
        taskType: route.taskType,
        preferredProvider: getProviderFromModelId(preferredModel),
        preferredModel,
      });

      const content = route.safetyRewriteRequired
        ? rewriteDeterministicPrediction(response.content)
        : response.content;
      const safetyRewriteApplied = content !== response.content;

      return {
        ...response,
        content,
        route,
        audit: buildTianjiModelAuditEvent(route, response, { safetyRewriteApplied }),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`No model response available for ${route.intent}`);
}
