import { trackClientEvent, type ClientAnalyticsEvent } from './client';

export type RevenueFunnelEventName =
  | 'relationship_start_click'
  | 'relationship_free_result_view'
  | 'relationship_upgrade_click'
  | 'ask_preview_view'
  | 'ask_unlock_click'
  | 'draw_preview_view'
  | 'draw_unlock_click'
  | 'pricing_view'
  | 'pricing_plan_click'
  | 'login_start';

export function trackRevenueFunnelEvent(
  event: RevenueFunnelEventName,
  payload: ClientAnalyticsEvent['payload'] = {},
) {
  return trackClientEvent({
    event,
    experimentId: 'tianji-love-revenue-funnel-20260516',
    moduleType: 'tianji_love',
    payload,
  });
}
