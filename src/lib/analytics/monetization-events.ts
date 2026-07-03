/**
 * monetization-events.ts
 *
 * Event types for AdSense, affiliate, and Stripe revenue tracking.
 * Uses the existing trackClientEvent() — no new API routes needed.
 */

import { trackClientEvent } from './client';

export const AD_MONETIZATION_EVENTS = [
  'ad_impression',
  'ad_click',
  'ad_slot_excluded',     // dev-mode / no fill
  'affiliate_click',
  'affiliate_conversion', // commission earned
  'stripe_checkout_start',
  'stripe_checkout_success',
  'stripe_checkout_cancel',
  'stripe_subscription_active',
] as const;

export const AD_MONETIZATION_ALLOWLIST = [
  ...AD_MONETIZATION_EVENTS,
] as const;

export type AdMonetizationEventName = (typeof AD_MONETIZATION_EVENTS)[number];

/** Pages where ads are currently active */
export type AdMonetizedPage =
  | 'relationship-patterns-guide'
  | 'love-timing-insights'
  | 'how-to-get-clarity-in-relationship'
  | 'guide'
  | 'tarot-love-reading-online'
  | 'free-ai-love-reading'
  | 'bazi-relationship-analysis-free'
  | 'he-loves-you-signs'
  | 'tarot-spread-meanings'
  | 'love-compatibility-zodiac-2024'
  | 'love-calculator'
  | 'how-to-read-tarot-cards-for-beginners';

/** Ad format shown */
export type AdFormat = 'display' | 'in-article' | 'in-feed' | 'multiflex';

/** Affiliate network source */
export type AffiliateNetwork = 'amazon' | 'astrology' | 'course' | 'crystal' | 'book';

export interface AdImpressionPayload {
  ad_slot_id: string;
  ad_format: AdFormat;
  page: AdMonetizedPage;
  filled: boolean;       // true = real ad shown, false = PSA / no fill
  cpc_revenue_usd?: number; // estimated if available
}

export interface AdClickPayload {
  ad_slot_id: string;
  ad_format: AdFormat;
  page: AdMonetizedPage;
  redirect_url?: string;
}

export interface AffiliateClickPayload {
  network: AffiliateNetwork;
  product_name: string;
  page: AdMonetizedPage | 'homepage' | 'blog';
  link_url: string;
}

export interface AffiliateConversionPayload {
  network: AffiliateNetwork;
  product_name: string;
  commission_usd: number;
  order_value_usd?: number;
}

export interface StripeCheckoutPayload {
  product_type: 'solo_report' | 'compatibility' | 'deep_report' | 'monthly_pass' | 'yearly_pass' | 'gift_report';
  amount_usd: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

/**
 * Track an ad impression (when an ad slot renders, regardless of fill).
 * Call this from AdSenseSlot's onMount callback.
 */
export function trackAdImpression(input: AdImpressionPayload) {
  return trackClientEvent({
    event: 'ad_impression',
    moduleType: 'adsense',
    payload: input as unknown as Record<string, string | number | boolean | null>,
  });
}

/**
 * Track when a user clicks an ad.
 * AdSense handles this natively, but we track it for revenue correlation analysis.
 */
export function trackAdClick(input: AdClickPayload) {
  return trackClientEvent({
    event: 'ad_click',
    moduleType: 'adsense',
    payload: input as unknown as Record<string, string | number | boolean | null>,
  });
}

/**
 * Track when a dev-mode or no-fill slot renders (helps estimate missed revenue).
 */
export function trackAdSlotExcluded(input: Omit<AdImpressionPayload, 'filled'>) {
  return trackClientEvent({
    event: 'ad_slot_excluded',
    moduleType: 'adsense',
    payload: { ...input, filled: false } as unknown as Record<string, string | number | boolean | null>,
  });
}

/**
 * Track when a user clicks an affiliate link.
 */
export function trackAffiliateClick(input: AffiliateClickPayload) {
  return trackClientEvent({
    event: 'affiliate_click',
    moduleType: 'affiliate',
    payload: input as unknown as Record<string, string | number | boolean | null>,
  });
}

/**
 * Track an affiliate conversion (commission earned).
 * Call this when you receive a webhook / pixel fire from the affiliate network.
 */
export function trackAffiliateConversion(input: AffiliateConversionPayload) {
  return trackClientEvent({
    event: 'affiliate_conversion',
    moduleType: 'affiliate',
    payload: input as unknown as Record<string, string | number | boolean | null>,
  });
}

/**
 * Track Stripe checkout start (user clicks unlock).
 */
export function trackStripeCheckoutStart(input: StripeCheckoutPayload) {
  return trackClientEvent({
    event: 'stripe_checkout_start',
    moduleType: 'stripe',
    payload: input as unknown as Record<string, string | number | boolean | null>,
  });
}

/**
 * Track Stripe checkout success (payment confirmed).
 */
export function trackStripeCheckoutSuccess(input: StripeCheckoutPayload) {
  return trackClientEvent({
    event: 'stripe_checkout_success',
    moduleType: 'stripe',
    payload: input as unknown as Record<string, string | number | boolean | null>,
  });
}
