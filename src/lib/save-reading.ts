/**
 * saveReading — persist a completed reading to Supabase.
 * Called by each reading page after a successful AI/API result.
 * Non-blocking (fire-and-forget), failures are silently ignored.
 */

export async function saveReading(opts: {
  reading_type: string;
  title: string;
  summary?: string;
  reading_data?: Record<string, unknown>;
  sessionId?: string;
  moduleType?: string;
  rawPayload?: Record<string, unknown>;
  normalizedPayload?: Record<string, unknown>;
  confidenceScore?: number;
  isPremium?: boolean;
}) {
  try {
    const useUnifiedRoute = Boolean(opts.sessionId && opts.moduleType);
    await fetch(useUnifiedRoute ? '/api/readings/result' : '/api/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        useUnifiedRoute
          ? {
              sessionId: opts.sessionId,
              moduleType: opts.moduleType,
              title: opts.title,
              summary: opts.summary,
              rawPayload: opts.rawPayload ?? opts.reading_data ?? {},
              normalizedPayload: opts.normalizedPayload,
              confidenceScore: opts.confidenceScore,
              isPremium: opts.isPremium,
            }
          : opts
      ),
    });
  } catch {
    // Non-fatal — reading still shows on screen even if save fails
  }
}
