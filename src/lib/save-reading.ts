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
}) {
  try {
    await fetch('/api/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
  } catch {
    // Non-fatal — reading still shows on screen even if save fails
  }
}
