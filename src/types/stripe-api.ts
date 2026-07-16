// Local Stripe type aliases — avoids namespace/class conflict with stripe module declaration
export interface StripeMetadata {
  [key: string]: string | undefined;
  productId?: string;
  legacyProductId?: string;
  loveReportMode?: string;
  userId?: string;
  locale?: string;
  source?: string;
  readingSessionId?: string;
  relationshipReadingId?: string;
}

export interface CheckoutSession {
  id: string;
  object: 'checkout.session';
  mode: 'payment' | 'subscription' | 'setup';
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  amount_total: number | null;
  currency: string | null;
  metadata: StripeMetadata;
  payment_intent: string | null;
  customer_details: CheckoutSessionCustomerDetails | null;
  customer_email: string | null;
  customer: string | null;
  url: string;
  status: string;
}

export interface CheckoutSessionCustomerDetails {
  email: string | null;
  name: string | null;
}

export interface StripeCharge {
  id: string;
  object: 'charge';
  payment_intent: string | null;
  amount: number;
  refunded: boolean;
  refunded_amount: number;
  status: string;
}

export interface StripeRefund {
  id: string;
  object: 'refund';
  payment_intent: string | null;
  amount: number;
  status: string;
}

// Full checkout session returned by stripe.checkout.sessions.create/retrieve
export interface StripeCheckoutSession {
  id: string;
  object: 'checkout.session';
  mode: 'payment' | 'subscription' | 'setup';
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  amount_total: number | null;
  currency: string | null;
  metadata: StripeMetadata;
  payment_intent: string | null;
  customer_details: CheckoutSessionCustomerDetails | null;
  customer_email: string | null;
  customer: string | null;
  url: string;
  status: string;
}

export interface StripePortalSession {
  id: string;
  object: 'billing_portal.session';
  url: string;
  customer: string;
  created: number;
  livemode: boolean;
}

export interface StripeEvent {
  id: string;
  object: 'event';
  type: string;
  data: { object: unknown };
  created: number;
}
