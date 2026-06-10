/**
 * analytics.ts
 *
 * Unified client-side analytics service.
 * Wraps the existing analytics infrastructure (trackClientEvent, funnel events, relationship events)
 * into a single, ergonomic API for use across all pages.
 *
 * Privacy: sensitive fields are stripped by the underlying client.ts sanitization.
 */

import { trackClientEvent, type ClientAnalyticsEvent } from '@/lib/analytics/client';
import { trackRevenueFunnelEvent, type RevenueFunnelEventName } from '@/lib/analytics/funnel-events';
import { trackRelationshipEvent } from '@/lib/analytics/track';
import type { RelationshipAnalyticsEvent } from '@/lib/analytics/relationship-events';

// ─── Page View Events ──────────────────────────────────────────────────────────

export type PageViewSource = 'organic' | 'paid' | 'referral' | 'direct' | 'social';

export interface PageViewPayload {
  page: string;
  title?: string;
  source?: PageViewSource;
  referrer?: string;
  locale?: string;
}

/**
 * Track a generic page view.
 * Uses the generic trackClientEvent endpoint.
 */
export function trackPageView(payload: PageViewPayload) {
  return trackClientEvent({
    event: 'page_view',
    moduleType: 'tianji_love',
    payload: {
      page: payload.page,
      title: payload.title,
      source: payload.source,
      referrer: payload.referrer,
      locale: payload.locale,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

// ─── SEO Page Events ───────────────────────────────────────────────────────────

export type SeoPageName =
  | 'does_he_miss_me'
  | 'does_she_miss_me'
  | 'does_my_ex_still_love_me'
  | 'is_my_ex_playing_me'
  | 'is_my_ex_thinking_about_me'
  | 'how_to_get_over_my_ex'
  | 'how_to_make_my_ex_miss_me'
  | 'should_i_move_on'
  | 'should_i_text_my_ex'
  | 'will_my_ex_come_back';

export interface SeoPageViewPayload {
  page: SeoPageName;
  locale?: string;
  cta_clicked?: string;
}

/**
 * Track SEO page view.
 */
export function trackSeoPageView(payload: SeoPageViewPayload) {
  return trackClientEvent({
    event: 'seo_page_view',
    moduleType: 'tianji_love',
    experimentId: 'tianji-seo-pages-20260610',
    payload: {
      seo_page: payload.page,
      locale: payload.locale,
      cta_clicked: payload.cta_clicked,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

/**
 * Track SEO page CTA click (Ask button, Pricing button, etc.)
 */
export function trackSeoPageCtaClick(payload: SeoPageViewPayload & { cta: string }) {
  return trackClientEvent({
    event: 'seo_page_cta_click',
    moduleType: 'tianji_love',
    experimentId: 'tianji-seo-pages-20260610',
    payload: {
      seo_page: payload.page,
      locale: payload.locale,
      cta: payload.cta,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

// ─── Homepage Events ──────────────────────────────────────────────────────────

export type HomepageCtaName = 'start_free_reading' | 'view_pricing';

export interface HomepageViewPayload {
  locale?: string;
}

export interface HomepageCtaClickPayload {
  locale?: string;
  cta: HomepageCtaName;
}

/**
 * Track homepage view.
 */
export function trackHomepageView(payload: HomepageViewPayload) {
  return trackClientEvent({
    event: 'home_page_view',
    moduleType: 'tianji_love',
    experimentId: 'tianji-love-homepage-20260610',
    payload: {
      locale: payload.locale,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

/**
 * Track homepage CTA click.
 */
export function trackHomepageCtaClick(payload: HomepageCtaClickPayload) {
  return trackClientEvent({
    event: 'home_cta_click',
    moduleType: 'tianji_love',
    experimentId: 'tianji-love-homepage-20260610',
    payload: {
      locale: payload.locale,
      cta: payload.cta,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

// ─── Pricing Page Events ───────────────────────────────────────────────────────

export type PricingPlanName = 'solo_love_report' | 'compatibility_report' | 'gift_report';

export interface PricingPageViewPayload {
  locale?: string;
}

export interface PricingPlanClickPayload {
  locale?: string;
  plan: PricingPlanName;
}

/**
 * Track pricing page view.
 */
export function trackPricingPageView(payload: PricingPageViewPayload) {
  return trackClientEvent({
    event: 'pricing_page_view',
    moduleType: 'tianji_love',
    experimentId: 'tianji-pricing-20260610',
    payload: {
      locale: payload.locale,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

/**
 * Track pricing plan click.
 */
export function trackPricingPlanClick(payload: PricingPlanClickPayload) {
  return trackClientEvent({
    event: 'pricing_plan_click',
    moduleType: 'tianji_love',
    experimentId: 'tianji-pricing-20260610',
    payload: {
      locale: payload.locale,
      plan: payload.plan,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

// ─── Ask Page Events ────────────────────────────────────────────────────────────

export type AskPageEventName =
  | 'ask_page_view'
  | 'ask_form_start'
  | 'ask_preview_started'
  | 'ask_preview_completed'
  | 'ask_unlock_click'
  | 'ask_checkout_start';

export interface AskPageViewPayload {
  locale?: string;
}

export interface AskFormStartPayload {
  locale?: string;
}

export interface AskPreviewCompletedPayload {
  previewId: string;
  locale?: string;
}

export interface AskUnlockClickPayload {
  previewId: string;
  source?: 'result_unlock' | 'evidence_card' | 'pricing_cta';
  locale?: string;
}

/**
 * Track ask page view.
 */
export function trackAskPageView(payload: AskPageViewPayload) {
  return trackClientEvent({
    event: 'ask_page_view',
    moduleType: 'tianji_love',
    payload: {
      locale: payload.locale,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

/**
 * Track ask form start.
 */
export function trackAskFormStart(payload: AskFormStartPayload) {
  return trackClientEvent({
    event: 'ask_form_start',
    moduleType: 'tianji_love',
    payload: {
      locale: payload.locale,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

// ─── Relationship Form Events ──────────────────────────────────────────────────

export type RelationshipFormEventName =
  | 'relationship_form_view'
  | 'relationship_form_start'
  | 'relationship_form_submit'
  | 'relationship_result_view';

export interface RelationshipFormViewPayload {
  locale?: string;
}

export interface RelationshipFormStartPayload {
  locale?: string;
}

export interface RelationshipFormSubmitPayload {
  relationType: 'romantic' | 'friendship' | 'work';
  locale?: string;
}

export interface RelationshipResultViewPayload {
  readingId: string;
  relationType: 'romantic' | 'friendship' | 'work';
  locale?: string;
}

/**
 * Track relationship form view.
 */
export function trackRelationshipFormView(payload: RelationshipFormViewPayload) {
  return trackClientEvent({
    event: 'relationship_form_view',
    moduleType: 'tianji_love',
    payload: {
      locale: payload.locale,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

/**
 * Track relationship form start.
 */
export function trackRelationshipFormStart(payload: RelationshipFormStartPayload) {
  return trackClientEvent({
    event: 'relationship_form_start',
    moduleType: 'tianji_love',
    payload: {
      locale: payload.locale,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

/**
 * Track relationship form submit.
 */
export function trackRelationshipFormSubmit(payload: RelationshipFormSubmitPayload) {
  return trackClientEvent({
    event: 'relationship_form_submit',
    moduleType: 'tianji_love',
    payload: {
      relation_type: payload.relationType,
      locale: payload.locale,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

/**
 * Track relationship result view.
 */
export function trackRelationshipResultView(payload: RelationshipResultViewPayload) {
  return trackClientEvent({
    event: 'relationship_result_view',
    moduleType: 'tianji_love',
    payload: {
      reading_id: payload.readingId,
      relation_type: payload.relationType,
      locale: payload.locale,
    } satisfies ClientAnalyticsEvent['payload'],
  });
}

// ─── Re-export safe tracking helpers ──────────────────────────────────────────

export { trackRevenueFunnelEvent };
export type { RevenueFunnelEventName };

export { trackRelationshipEvent };
export type { RelationshipAnalyticsEvent };