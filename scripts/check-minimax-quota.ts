const DEFAULT_ENDPOINT = 'https://www.minimax.io/v1/token_plan/remains';

type QuotaStatus = {
  provider: 'minimax';
  endpoint: string;
  status: 'ok' | 'blocked' | 'error';
  tokenPlanKeyPresent: boolean;
  httpStatus?: number;
  reason?: string;
  quota?: Record<string, unknown>;
};

function redactQuotaPayload(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { received: Boolean(value) };
  }

  const safe: Record<string, unknown> = {};
  const allowlist = new Set([
    'remaining',
    'remain',
    'remains',
    'total',
    'used',
    'reset_at',
    'resetAt',
    'window',
    'windowRemaining',
    'weeklyRemaining',
    'requestRemaining',
  ]);

  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (allowlist.has(key) && (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')) {
      safe[key] = item;
    }
  }

  return Object.keys(safe).length ? safe : { received: true };
}

async function main() {
  const endpoint = process.env.MINIMAX_TOKEN_PLAN_REMAINS_URL || DEFAULT_ENDPOINT;
  const tokenPlanKey = process.env.MINIMAX_TOKEN_PLAN_KEY;

  if (!tokenPlanKey) {
    const status: QuotaStatus = {
      provider: 'minimax',
      endpoint,
      status: 'blocked',
      tokenPlanKeyPresent: false,
      reason: 'missing-token-plan-key',
    };
    console.log(JSON.stringify(status, null, 2));
    process.exitCode = 1;
    return;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenPlanKey}`,
        'Content-Type': 'application/json',
      },
    });
    const payload = await response.json().catch(() => undefined);
    const status: QuotaStatus = {
      provider: 'minimax',
      endpoint,
      status: response.ok ? 'ok' : 'error',
      tokenPlanKeyPresent: true,
      httpStatus: response.status,
      quota: redactQuotaPayload(payload),
    };

    console.log(JSON.stringify(status, null, 2));
    if (!response.ok) {
      process.exitCode = 1;
    }
  } catch (error) {
    const status: QuotaStatus = {
      provider: 'minimax',
      endpoint,
      status: 'error',
      tokenPlanKeyPresent: true,
      reason: error instanceof Error ? error.message : 'quota-check-failed',
    };
    console.log(JSON.stringify(status, null, 2));
    process.exitCode = 1;
  }
}

void main();
