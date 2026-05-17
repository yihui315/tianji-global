type Status = 'go' | 'no-go' | 'unknown';
type OverallStatus = 'go' | 'conditional-go' | 'no-go';

export type StagingEnvReadinessResult = {
  app: Status;
  supabase: Status;
  stripeTestMode: Status;
  email: Status;
  aiRuntime: Status;
  ollama: Status;
  deepseek: Status;
  minimax: Status;
  overall: OverallStatus;
  missingNamesOnly: string[];
};

type EnvLike = Record<string, string | undefined>;

const REQUIRED_GROUPS: Record<Exclude<keyof StagingEnvReadinessResult, 'overall' | 'missingNamesOnly'>, string[]> = {
  app: ['NEXT_PUBLIC_APP_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'],
  supabase: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
  stripeTestMode: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_PRO_MONTHLY_PRICE_ID',
    'STRIPE_PRO_YEARLY_PRICE_ID',
    'STRIPE_ASK_PRICE_ID',
    'STRIPE_DRAW_PRICE_ID',
  ],
  email: ['RESEND_API_KEY', 'EMAIL_FROM'],
  aiRuntime: [
    'AI_RUNTIME_MODE',
    'AI_FREE_PREVIEW_PROVIDER',
    'AI_FREE_PREVIEW_MODEL',
    'AI_ROUTER_PROVIDER',
    'AI_ROUTER_MODEL',
    'AI_PAID_ASK_PROVIDER',
    'AI_PAID_ASK_MODEL',
    'AI_PAID_ASK_FALLBACK_MODEL',
    'AI_INTERNAL_AGENT_PROVIDER',
    'AI_ENABLE_SAFETY_REWRITE',
    'AI_ENABLE_COST_LOGGING',
    'AI_ENABLE_FALLBACK_LOGGING',
  ],
  ollama: ['OLLAMA_BASE_URL'],
  deepseek: ['DEEPSEEK_API_KEY', 'DEEPSEEK_BASE_URL', 'DEEPSEEK_MODEL_FLASH', 'DEEPSEEK_MODEL_PRO'],
  minimax: ['MINIMAX_API_KEY', 'MINIMAX_BASE_URL', 'MINIMAX_MODEL', 'MINIMAX_TOKEN_PLAN_KEY'],
};

function isPresent(env: EnvLike, name: string) {
  return Boolean(env[name]);
}

function statusForGroup(env: EnvLike, names: string[]) {
  return names.every((name) => isPresent(env, name)) ? 'go' : 'no-go';
}

function missingNames(env: EnvLike) {
  const names = new Set<string>();

  for (const groupNames of Object.values(REQUIRED_GROUPS)) {
    for (const name of groupNames) {
      if (!isPresent(env, name)) {
        names.add(name);
      }
    }
  }

  return Array.from(names).sort();
}

function overallFor(statuses: Status[]): OverallStatus {
  if (statuses.includes('no-go')) return 'no-go';
  if (statuses.includes('unknown')) return 'conditional-go';
  return 'go';
}

export function auditStagingEnvReadiness(env: EnvLike = process.env): StagingEnvReadinessResult {
  const result = {
    app: statusForGroup(env, REQUIRED_GROUPS.app),
    supabase: statusForGroup(env, REQUIRED_GROUPS.supabase),
    stripeTestMode: statusForGroup(env, REQUIRED_GROUPS.stripeTestMode),
    email: statusForGroup(env, REQUIRED_GROUPS.email),
    aiRuntime: statusForGroup(env, REQUIRED_GROUPS.aiRuntime),
    ollama: statusForGroup(env, REQUIRED_GROUPS.ollama),
    deepseek: statusForGroup(env, REQUIRED_GROUPS.deepseek),
    minimax: statusForGroup(env, REQUIRED_GROUPS.minimax),
  };

  return {
    ...result,
    overall: overallFor(Object.values(result)),
    missingNamesOnly: missingNames(env),
  };
}

function main() {
  console.log(JSON.stringify(auditStagingEnvReadiness(), null, 2));
}

if (require.main === module) {
  main();
}
