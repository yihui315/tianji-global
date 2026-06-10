/**
 * useAnalytics.ts
 *
 * React hook for firing analytics events from client components.
 *
 * Usage:
 *   const { trackPageView, trackSeoPageView } = useAnalytics();
 *   useEffect(() => { trackPageView({ page: '/', locale: 'en' }); }, []);
 */

'use client';

import { useCallback } from 'react';
import {
  trackPageView,
  trackSeoPageView,
  trackSeoPageCtaClick,
  trackHomepageView,
  trackHomepageCtaClick,
  trackPricingPageView,
  trackPricingPlanClick,
  trackAskPageView,
  trackAskFormStart,
  trackRelationshipFormView,
  trackRelationshipFormStart,
  trackRelationshipFormSubmit,
  trackRelationshipResultView,
  trackRevenueFunnelEvent,
  trackRelationshipEvent,
  type PageViewPayload,
  type SeoPageName,
  type SeoPageViewPayload,
  type HomepageViewPayload,
  type HomepageCtaClickPayload,
  type PricingPageViewPayload,
  type PricingPlanClickPayload,
  type AskPageViewPayload,
  type AskFormStartPayload,
  type RelationshipFormViewPayload,
  type RelationshipFormStartPayload,
  type RelationshipFormSubmitPayload,
  type RelationshipResultViewPayload,
  type RevenueFunnelEventName,
  type RelationshipAnalyticsEvent,
} from '@/lib/analytics';

export function useAnalytics() {
  // ─── Page Views ───────────────────────────────────────────────────────────────

  const firePageView = useCallback((payload: PageViewPayload) => {
    return trackPageView(payload);
  }, []);

  // ─── SEO Pages ────────────────────────────────────────────────────────────────

  const fireSeoPageView = useCallback((payload: SeoPageViewPayload & { page: SeoPageName }) => {
    return trackSeoPageView(payload);
  }, []);

  const fireSeoPageCtaClick = useCallback(
    (payload: SeoPageViewPayload & { page: SeoPageName; cta: string }) => {
      return trackSeoPageCtaClick(payload);
    },
    [],
  );

  // ─── Homepage ────────────────────────────────────────────────────────────────

  const fireHomepageView = useCallback((payload: HomepageViewPayload) => {
    return trackHomepageView(payload);
  }, []);

  const fireHomepageCtaClick = useCallback((payload: HomepageCtaClickPayload) => {
    return trackHomepageCtaClick(payload);
  }, []);

  // ─── Pricing Page ────────────────────────────────────────────────────────────

  const firePricingPageView = useCallback((payload: PricingPageViewPayload) => {
    return trackPricingPageView(payload);
  }, []);

  const firePricingPlanClick = useCallback((payload: PricingPlanClickPayload) => {
    return trackPricingPlanClick(payload);
  }, []);

  // ─── Ask Page ────────────────────────────────────────────────────────────────

  const fireAskPageView = useCallback((payload: AskPageViewPayload) => {
    return trackAskPageView(payload);
  }, []);

  const fireAskFormStart = useCallback((payload: AskFormStartPayload) => {
    return trackAskFormStart(payload);
  }, []);

  // ─── Relationship Form ───────────────────────────────────────────────────────

  const fireRelationshipFormView = useCallback((payload: RelationshipFormViewPayload) => {
    return trackRelationshipFormView(payload);
  }, []);

  const fireRelationshipFormStart = useCallback((payload: RelationshipFormStartPayload) => {
    return trackRelationshipFormStart(payload);
  }, []);

  const fireRelationshipFormSubmit = useCallback((payload: RelationshipFormSubmitPayload) => {
    return trackRelationshipFormSubmit(payload);
  }, []);

  const fireRelationshipResultView = useCallback((payload: RelationshipResultViewPayload) => {
    return trackRelationshipResultView(payload);
  }, []);

  // ─── Low-level wrappers (for direct funnel/relationship event access) ──────────

  const fireRevenueFunnel = useCallback(
    (event: RevenueFunnelEventName, payload: Record<string, string | number | boolean | null | undefined | string[]> = {}) => {
      return trackRevenueFunnelEvent(event, payload);
    },
    [],
  );

  const fireRelationship = useCallback((input: RelationshipAnalyticsEvent) => {
    return trackRelationshipEvent(input);
  }, []);

  return {
    // High-level page-specific helpers
    trackPageView: firePageView,
    trackSeoPageView: fireSeoPageView,
    trackSeoPageCtaClick: fireSeoPageCtaClick,
    trackHomepageView: fireHomepageView,
    trackHomepageCtaClick: fireHomepageCtaClick,
    trackPricingPageView: firePricingPageView,
    trackPricingPlanClick: firePricingPlanClick,
    trackAskPageView: fireAskPageView,
    trackAskFormStart: fireAskFormStart,
    trackRelationshipFormView: fireRelationshipFormView,
    trackRelationshipFormStart: fireRelationshipFormStart,
    trackRelationshipFormSubmit: fireRelationshipFormSubmit,
    trackRelationshipResultView: fireRelationshipResultView,
    // Low-level direct access
    trackRevenueFunnelEvent: fireRevenueFunnel,
    trackRelationshipEvent: fireRelationship,
  };
}