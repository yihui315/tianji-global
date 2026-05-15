begin;

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  reading_session_id uuid,
  stripe_checkout_session_id text not null,
  stripe_payment_intent_id text,
  customer_email text,
  product_id text not null check (
    product_id in ('solo_love_report', 'compatibility_report')
  ),
  amount_total integer not null,
  currency text not null default 'usd',
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'failed', 'refunded')
  ),
  entitlement text not null,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  report_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stripe_checkout_session_id)
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_reading_session_id_idx on public.orders(reading_session_id);
create index if not exists orders_customer_email_idx on public.orders(customer_email);

create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (stripe_event_id)
);

create index if not exists stripe_events_event_type_idx
  on public.stripe_events(event_type);

alter table public.orders enable row level security;
alter table public.stripe_events enable row level security;

create policy "Service role can manage orders"
  on public.orders
  for all
  to service_role
  using (true)
  with check (true);

create policy "Service role can manage stripe events"
  on public.stripe_events
  for all
  to service_role
  using (true)
  with check (true);

commit;
