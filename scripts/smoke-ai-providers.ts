import { generateReport } from '../src/lib/ai-orchestrator';
import { getMiniMaxQuotaGate, getTianjiModelRoute } from '../src/lib/tianji-model-gateway';

type Status = 'go' | 'no-go' | 'unknown';
type OverallStatus = 'go' | 'conditional-go' | 'no-go';
type Mode = 'dry-run' | 'live';

export type AiProviderSmokeResult = {
  mode: Mode;
  ollama: Status;
  deepseekFlash: Status;
  deepseekPro: Status;
  minimaxQuota: Status;
  overall: OverallStatus;
};

type EnvLike = Record<string, string | undefined>;

const SMOKE_PROMPT = 'Return one sentence: staging provider smoke ok.';

function normalizeMode(raw: string | undefined): Mode {
  return raw === 'live' ? 'live' : 'dry-run';
}

function overallFor(statuses: Status[], mode: Mode): OverallStatus {
  if (statuses.includes('no-go')) return 'no-go';
  if (mode === 'dry-run' || statuses.includes('unknown')) return 'conditional-go';
  return 'go';
}

async function smokeModel(preferredModel: string, maxTokens = 24): Promise<Status> {
  const started = Date.now();
  try {
    await generateReport({
      prompt: SMOKE_PROMPT,
      systemPrompt: 'Staging smoke check. Return exactly one harmless sentence.',
      preferredModel,
      taskType: 'fast',
      responseFormat: 'text',
      maxTokens,
      temperature: 0,
    });
    const latencyMs = Date.now() - started;
    void latencyMs;
    return 'go';
  } catch {
    return 'no-go';
  }
}

async function smokeMiniMaxQuota(env: EnvLike): Promise<Status> {
  const gate = getMiniMaxQuotaGate(env);
  if (!gate.tokenPlanKeyPresent) return 'unknown';

  const endpoint = env.MINIMAX_TOKEN_PLAN_REMAINS_URL || gate.endpoint;
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.MINIMAX_TOKEN_PLAN_KEY!}`,
        'Content-Type': 'application/json',
      },
    });
    return response.ok ? 'go' : 'no-go';
  } catch {
    return 'no-go';
  }
}

export async function createAiProviderSmokeResult(env: EnvLike = process.env): Promise<AiProviderSmokeResult> {
  const mode = normalizeMode(env.AI_PROVIDER_SMOKE_MODE);
  const allowLive = env.AI_PROVIDER_SMOKE_ALLOW_LIVE === 'true';
  const tarotRoute = getTianjiModelRoute('tarot_draw');
  const paidAskRoute = getTianjiModelRoute('paid_ask');
  const deepseekProFallbackReady = paidAskRoute.fallbackModels.includes('deepseek/deepseek-v4-pro');

  if (mode === 'live' && !allowLive) {
    return {
      mode,
      ollama: 'unknown',
      deepseekFlash: 'unknown',
      deepseekPro: 'unknown',
      minimaxQuota: 'unknown',
      overall: 'no-go',
    };
  }

  if (mode === 'dry-run') {
    const ollama = tarotRoute.provider === 'ollama' && Boolean(env.OLLAMA_BASE_URL) ? 'go' : 'unknown';
    const deepseekConfigured = Boolean(env.DEEPSEEK_API_KEY && env.DEEPSEEK_BASE_URL);
    const deepseekFlash = paidAskRoute.provider === 'deepseek' && deepseekConfigured ? 'go' : 'unknown';
    const deepseekPro = deepseekProFallbackReady && deepseekConfigured ? 'go' : 'unknown';
    const minimaxQuota = getMiniMaxQuotaGate(env).tokenPlanKeyPresent ? 'go' : 'unknown';
    const statuses = [ollama, deepseekFlash, deepseekPro, minimaxQuota];

    return {
      mode,
      ollama,
      deepseekFlash,
      deepseekPro,
      minimaxQuota,
      overall: overallFor(statuses, mode),
    };
  }

  const ollama = await smokeModel('ollama/gemma4:31b');
  const deepseekFlash = await smokeModel('deepseek/deepseek-v4-flash');
  const deepseekPro = await smokeModel('deepseek/deepseek-v4-pro');
  const minimaxQuota = await smokeMiniMaxQuota(env);
  const statuses = [ollama, deepseekFlash, deepseekPro, minimaxQuota];

  return {
    mode,
    ollama,
    deepseekFlash,
    deepseekPro,
    minimaxQuota,
    overall: overallFor(statuses, mode),
  };
}

async function main() {
  const result = await createAiProviderSmokeResult();
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  void main();
}
