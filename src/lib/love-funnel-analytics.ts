import { getPool } from '@/lib/db';
import { sanitizeAnalyticsPayload } from '@/lib/trust-copy-guard';

export type LoveFunnelEvent =
  | 'love_home_view'
  | 'love_form_start'
  | 'love_session_created'
  | 'love_result_view'
  | 'love_unlock_click'
  | 'love_checkout_created'
  | 'love_checkout_success'
  | 'love_report_completed'
  | 'love_refund_requested'
  | 'love_support_needed';

export async function trackLoveFunnelEvent(
  event: LoveFunnelEvent,
  payload: Record<string, unknown> = {}
) {
  if (!process.env.DATABASE_URL) return;

  try {
    await getPool().query(
      `
        insert into public.analytics_events (
          event,
          experiment_id,
          variant,
          module_type,
          payload
        )
        values ($1, 'love-v1', null, 'love-reading', $2::jsonb)
      `,
      [event, JSON.stringify(sanitizeAnalyticsPayload(payload))]
    );
  } catch (error) {
    console.warn('[love-funnel-analytics] skipped', error);
  }
}
