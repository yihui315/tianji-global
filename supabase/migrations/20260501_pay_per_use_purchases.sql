-- Pay-per-use purchase ledger for /ask and /draw Stripe Checkout sessions.
create table if not exists public.pay_per_use_purchases (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  flow text not null check (flow in ('ask-question', 'quick-draw')),
  product_type text not null default 'pay-per-use',
  amount integer not null check (amount >= 0),
  currency text not null default 'usd',
  language text not null default 'en',
  paid_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists pay_per_use_purchases_flow_idx
  on public.pay_per_use_purchases (flow);

create index if not exists pay_per_use_purchases_paid_at_idx
  on public.pay_per_use_purchases (paid_at desc);

comment on table public.pay_per_use_purchases is
  'Idempotent Stripe Checkout ledger for TianJi pay-per-question and pay-per-draw purchases.';
