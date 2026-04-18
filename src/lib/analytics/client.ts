export interface ClientAnalyticsEvent {
  event: string;
  experimentId?: string;
  variant?: string;
  moduleType?: string;
  trafficSource?: string;
  strategy?: string;
  payload?: Record<string, string | number | boolean | null | undefined>;
}

export async function trackClientEvent(input: ClientAnalyticsEvent) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      keepalive: true,
    });
  } catch (error) {
    console.warn('[analytics/client] tracking failed', error);
  }
}
