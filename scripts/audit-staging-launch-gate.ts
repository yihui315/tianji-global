import { spawnSync } from 'node:child_process';
import { auditStagingEnvReadiness } from './audit-staging-env-readiness';
import { createAiProviderSmokeResult } from './smoke-ai-providers';
import { createStripeTestReadinessResult } from './smoke-stripe-test-readiness';
import { runStagingNonPaidSmoke } from './smoke-staging-nonpaid';

type OverallStatus = 'go' | 'conditional-go' | 'no-go';
type MaybeRunStatus = OverallStatus | 'not-run';

export type StagingLaunchGateResult = {
  envReadiness: OverallStatus;
  askRevenueContract: OverallStatus;
  drawRevenueContract: OverallStatus;
  nonPaidStagingSmoke: MaybeRunStatus;
  aiProviderSmoke: OverallStatus;
  stripeTestReadiness: OverallStatus;
  overall: OverallStatus;
};

type GateInput = Omit<StagingLaunchGateResult, 'overall'>;

function normalizeOverall(value: unknown): OverallStatus {
  return value === 'go' || value === 'conditional-go' || value === 'no-go'
    ? value
    : 'no-go';
}

function extractJson(stdout: string) {
  const start = stdout.indexOf('{');
  const end = stdout.lastIndexOf('}');
  if (start < 0 || end < start) {
    return {};
  }
  return JSON.parse(stdout.slice(start, end + 1)) as { overall?: unknown };
}

function tsxBin() {
  return process.platform === 'win32'
    ? 'node_modules\\.bin\\tsx.cmd'
    : 'node_modules/.bin/tsx';
}

function runAuditScript(scriptPath: string): OverallStatus {
  const command = process.platform === 'win32' ? 'cmd.exe' : tsxBin();
  const args = process.platform === 'win32'
    ? ['/c', tsxBin(), scriptPath]
    : [scriptPath];
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    windowsHide: true,
  });

  if (!result.stdout) {
    return 'no-go';
  }

  try {
    return normalizeOverall(extractJson(result.stdout).overall);
  } catch {
    return 'no-go';
  }
}

export function buildStagingLaunchGateResult(input: GateInput): StagingLaunchGateResult {
  const hardNoGo =
    input.envReadiness === 'no-go' ||
    input.askRevenueContract === 'no-go' ||
    input.drawRevenueContract === 'no-go' ||
    input.stripeTestReadiness === 'no-go';

  if (hardNoGo) {
    return { ...input, overall: 'no-go' };
  }

  const conditional =
    input.envReadiness === 'conditional-go' ||
    input.askRevenueContract === 'conditional-go' ||
    input.drawRevenueContract === 'conditional-go' ||
    input.nonPaidStagingSmoke !== 'go' ||
    input.aiProviderSmoke !== 'go' ||
    input.stripeTestReadiness !== 'go';

  return {
    ...input,
    overall: conditional ? 'conditional-go' : 'go',
  };
}

export async function createStagingLaunchGateResult(env: Record<string, string | undefined> = process.env) {
  const envReadiness = auditStagingEnvReadiness(env).overall;
  const askRevenueContract = runAuditScript('scripts/audit-ask-revenue-contract.ts');
  const drawRevenueContract = runAuditScript('scripts/audit-draw-revenue-contract.ts');
  const aiProviderSmoke = (await createAiProviderSmokeResult({
    ...env,
    AI_PROVIDER_SMOKE_MODE: env.AI_PROVIDER_SMOKE_MODE || 'dry-run',
    AI_PROVIDER_SMOKE_ALLOW_LIVE: env.AI_PROVIDER_SMOKE_ALLOW_LIVE || 'false',
  })).overall;
  const stripeTestReadiness = (await createStripeTestReadinessResult({
    ...env,
    STRIPE_SMOKE_MODE: env.STRIPE_SMOKE_MODE || 'readiness',
    STRIPE_SMOKE_ALLOW_LIVE: env.STRIPE_SMOKE_ALLOW_LIVE || 'false',
  })).overall;
  const nonPaidStagingSmoke =
    env.STAGING_BASE_URL && env.STAGING_NONPAID_SMOKE_ALLOW_LIVE === 'true'
      ? (await runStagingNonPaidSmoke(env)).overall
      : 'not-run';

  return buildStagingLaunchGateResult({
    envReadiness,
    askRevenueContract,
    drawRevenueContract,
    nonPaidStagingSmoke,
    aiProviderSmoke,
    stripeTestReadiness,
  });
}

async function main() {
  const result = await createStagingLaunchGateResult();
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  void main();
}
