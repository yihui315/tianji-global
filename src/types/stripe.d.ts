// Stripe v22 type declarations
// Stripe v22 has no bundled TypeScript types.
// All Stripe.* namespace types are replaced by '@/types/stripe-api' imports in source files.
declare module 'stripe' {
  class Stripe {
    constructor(key: string, config?: { apiVersion?: string; typescript?: boolean });
    webhooks: {
      constructEvent(
        rawBody: string,
        signature: string,
        secret: string,
      ): import('@/types/stripe-api').StripeEvent;
    };
    checkout: {
      sessions: {
        create(
          params: unknown,
          options?: { idempotencyKey?: string },
        ): Promise<import('@/types/stripe-api').StripeCheckoutSession>;
        retrieve(
          id: string,
          params?: unknown,
        ): Promise<import('@/types/stripe-api').StripeCheckoutSession>;
      };
    };
    billingPortal: {
      sessions: { create(params: unknown): Promise<import('@/types/stripe-api').StripePortalSession> };
    };
    paymentIntents: {
      retrieve(id: string): Promise<unknown>;
    };
  }

  export = Stripe;
}
