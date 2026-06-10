export const DEFAULT_AI_PREVIEW_TIMEOUT_MS = 12_000;

export type PreviewTimeoutResult<T> =
  | { status: 'resolved'; value: T; timeoutMs: number }
  | { status: 'timed-out'; timeoutMs: number };

export function getAiPreviewTimeoutMs(): number {
  const raw = process.env.AI_PREVIEW_TIMEOUT_MS;
  if (!raw) {
    return DEFAULT_AI_PREVIEW_TIMEOUT_MS;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_AI_PREVIEW_TIMEOUT_MS;
  }

  return parsed;
}

export async function resolvePreviewWithin<T>(
  promise: Promise<T>,
  timeoutMs = getAiPreviewTimeoutMs(),
): Promise<PreviewTimeoutResult<T>> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const guarded = promise.then(
    (value) => ({ status: 'resolved' as const, value, timeoutMs }),
    (error) => ({ status: 'rejected' as const, error }),
  );

  const timeout = new Promise<{ status: 'timed-out'; timeoutMs: number }>((resolve) => {
    timer = setTimeout(() => resolve({ status: 'timed-out', timeoutMs }), timeoutMs);
  });

  try {
    const result = await Promise.race([guarded, timeout]);
    if (result.status === 'rejected') {
      throw result.error;
    }
    return result;
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
