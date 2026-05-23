import { trackClientEvent, type ClientAnalyticsEvent } from './client';

export const FREE_TO_PAID_FUNNEL_EVENTS = [
  'home_cta_click',
  'relationship_started',
  'relationship_free_completed',
  'ask_preview_started',
  'ask_preview_completed',
  'draw_preview_started',
  'draw_preview_completed',
  'pricing_viewed',
  'unlock_click',
  'login_started',
] as const;

export const LOVE_TEST_CONVERSION_EVENTS = [
  'love_test_start',
  'love_test_result_view',
  'love_test_share_card_click',
  'love_test_copy_result',
  'love_test_ask_next_click',
  'love_test_timing_click',
] as const;

export const LEGACY_REVENUE_FUNNEL_EVENTS = [
  'relationship_start_click',
  'relationship_free_result_view',
  'relationship_upgrade_click',
  'ask_preview_view',
  'ask_unlock_click',
  'draw_preview_view',
  'draw_unlock_click',
  'pricing_view',
  'pricing_plan_click',
  'login_start',
] as const;

export const REVENUE_FUNNEL_EVENT_ALLOWLIST = [
  ...FREE_TO_PAID_FUNNEL_EVENTS,
  ...LOVE_TEST_CONVERSION_EVENTS,
  ...LEGACY_REVENUE_FUNNEL_EVENTS,
] as const;

export type FreeToPaidFunnelEventName = (typeof FREE_TO_PAID_FUNNEL_EVENTS)[number];
export type LoveTestConversionEventName = (typeof LOVE_TEST_CONVERSION_EVENTS)[number];
export type LegacyRevenueFunnelEventName = (typeof LEGACY_REVENUE_FUNNEL_EVENTS)[number];
export type RevenueFunnelEventName =
  | FreeToPaidFunnelEventName
  | LoveTestConversionEventName
  | LegacyRevenueFunnelEventName;

export function isRevenueFunnelEventName(event: string): event is RevenueFunnelEventName {
  return (REVENUE_FUNNEL_EVENT_ALLOWLIST as readonly string[]).includes(event);
}

export function trackRevenueFunnelEvent(
  event: RevenueFunnelEventName,
  payload: ClientAnalyticsEvent['payload'] = {},
) {
  if (!isRevenueFunnelEventName(event)) {
    return Promise.resolve();
  }

  return trackClientEvent({
    event,
    experimentId: 'tianji-love-free-to-paid-funnel-20260520',
    moduleType: 'tianji_love',
    payload,
  });
}
