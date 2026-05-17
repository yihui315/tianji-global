import fs from 'node:fs';
import {
  degradedModeEnvStatus,
  isAiProviderLiveDisabled,
  isEmailSendDisabled,
  isProductionDeployBlocked,
  isStripeLiveDisabled,
  isSupabaseMutationDisabled,
  type DegradedStatus,
  type EnvLike,
} from '../src/lib/staging-degraded-mode';

type Status = DegradedStatus;
type OverallStatus = 'go' | 'conditional-go' | 'no-go';

export type StagingDegradedModeAuditResult = {
  degradedModeEnv: Status;
  publicPagesCanLoad: Status;
  relationshipFreeCanRun: Status;
  askPreviewCanRun: Status;
  drawPreviewCanRun: Status;
  paidRoutesLockedWhenStripeMissing: Status;
  providerLiveCallsDisabled: Status;
  emailSendDisabled: Status;
  productionDeployBlocked: Status;
  overall: OverallStatus;
};

function read(path: string): string {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

function exists(path: string): boolean {
  return fs.existsSync(path);
}

function hasEvery(source: string, needles: string[]): boolean {
  return needles.every((needle) => source.includes(needle));
}

function statusWhen(value: boolean): Status {
  return value ? 'go' : 'no-go';
}

function guardedOrUnknown(source: string, guardNeedles: string[], unavailableNeedles: string[]): Status {
  if (hasEvery(source, guardNeedles)) return 'go';
  if (unavailableNeedles.some((needle) => source.includes(needle))) return 'unknown';
  return 'no-go';
}

function overallFor(statuses: Status[]): OverallStatus {
  if (statuses.includes('no-go')) return 'no-go';
  if (statuses.includes('unknown')) return 'conditional-go';
  return 'go';
}

export function auditStagingDegradedMode(env: EnvLike = process.env): StagingDegradedModeAuditResult {
  const askUnlock = read('src/app/api/ask/unlock/route.ts');
  const drawUnlock = read('src/app/api/draw/unlock/route.ts');
  const relationship = read('src/app/api/relationship/analyze/route.ts');
  const askPreview = read('src/app/api/ask/preview/route.ts');
  const drawPreview = read('src/app/api/draw/preview/route.ts');
  const gateway = read('src/lib/tianji-model-gateway.ts');
  const email = read('src/lib/love-report-email.ts');

  const publicPagesCanLoad = statusWhen(
    exists('src/app/(main)/page.tsx') &&
      exists('src/app/(main)/ask/page.tsx') &&
      exists('src/app/(main)/draw/page.tsx') &&
      exists('src/app/(main)/pricing/page.tsx') &&
      exists('src/app/login/page.tsx'),
  );
  const relationshipFreeCanRun = statusWhen(
    hasEvery(relationship, ['analyzeRelationship', 'isSupabaseConfigured()']),
  );
  const askPreviewCanRun = statusWhen(
    hasEvery(askPreview, ['buildAskPreview', 'encodeAskQuestionId']) &&
      !askPreview.includes('getStripe'),
  );
  const drawPreviewCanRun = statusWhen(
    hasEvery(drawPreview, ['buildFallbackReading', 'encodeQuickDrawId']) &&
      !drawPreview.includes('getStripe'),
  );
  const askPaidLocked = guardedOrUnknown(
    askUnlock,
    ['isStripePaymentAvailable()', 'buildPaymentUnavailableBody()', 'status: 503'],
    ['getStripe()'],
  );
  const drawPaidLocked = guardedOrUnknown(
    drawUnlock,
    ['isStripePaymentAvailable()', 'buildPaymentUnavailableBody()', 'status: 503'],
    ['getStripe()'],
  );
  const paidRoutesLockedWhenStripeMissing: Status = isStripeLiveDisabled(env) && askPaidLocked === 'go' && drawPaidLocked === 'go'
    ? 'go'
    : askPaidLocked === 'no-go' || drawPaidLocked === 'no-go'
      ? 'no-go'
      : 'unknown';
  const providerLiveCallsDisabled: Status = isAiProviderLiveDisabled(env)
    ? guardedOrUnknown(
        gateway,
        ['isAiProviderLiveDisabled()', 'buildProviderDisabledContent()', 'ai_provider_live_disabled'],
        ['generateReport'],
      )
    : 'no-go';
  const emailSendDisabled: Status = isEmailSendDisabled(env)
    ? guardedOrUnknown(
        email,
        ['isEmailSendDisabled()', 'email_send_disabled'],
        ['new Resend(apiKey)'],
      )
    : 'no-go';
  const productionDeployBlocked = statusWhen(isProductionDeployBlocked(env));

  const result = {
    degradedModeEnv: degradedModeEnvStatus(env),
    publicPagesCanLoad,
    relationshipFreeCanRun: isSupabaseMutationDisabled(env) ? relationshipFreeCanRun : 'unknown' as Status,
    askPreviewCanRun,
    drawPreviewCanRun,
    paidRoutesLockedWhenStripeMissing,
    providerLiveCallsDisabled,
    emailSendDisabled,
    productionDeployBlocked,
  };

  return {
    ...result,
    overall: overallFor(Object.values(result)),
  };
}

function main() {
  console.log(JSON.stringify(auditStagingDegradedMode(), null, 2));
}

if (require.main === module) {
  main();
}
