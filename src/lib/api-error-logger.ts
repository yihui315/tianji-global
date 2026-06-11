/**
 * api-error-logger.ts
 * Structured error logging for API routes.
 * Usage: logApiError('relationship/analyze', error, { readingId: id, lang });
 */

export interface ApiErrorContext {
  route?: string;
  readingId?: string;
  lang?: string;
  userId?: string;
  productId?: string;
  [key: string]: string | undefined;
}

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  service: string;
  route: string;
  message: string;
  context?: ApiErrorContext;
  stack?: string;
}

export function logApiError(
  route: string,
  error: unknown,
  context: ApiErrorContext = {}
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    service: 'tianji-global',
    route,
    message: error instanceof Error ? error.message : String(error),
    context,
    stack: error instanceof Error ? error.stack : undefined,
  };

  // Console output for now (can be extended to external logging)
  if (process.env.NODE_ENV === 'production') {
    console.error(JSON.stringify(entry, null, 2));
  } else {
    console.error(`[API ERROR] ${route}:`, error instanceof Error ? error.message : error, context);
  }

  return entry;
}

export function logApiWarn(route: string, message: string, context: ApiErrorContext = {}) {
  console.warn(`[API WARN] ${route}: ${message}`, context);
}

export function logApiInfo(route: string, message: string, context: ApiErrorContext = {}) {
  console.info(`[API INFO] ${route}: ${message}`, context);
}