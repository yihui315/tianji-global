begin;

create extension if not exists "pgcrypto";

create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.pay_per_use_orders (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('ask', 'draw', 'love-reading')),
  request_id text not null,
  request_ref text not null,
  user_id uuid references public.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'canceled', 'expired', 'refunded')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, request_ref, stripe_checkout_session_id)
);

create index if not exists pay_per_use_orders_request_ref_idx
  on public.pay_per_use_orders(kind, request_ref);

create index if not exists pay_per_use_orders_user_id_idx
  on public.pay_per_use_orders(user_id);

alter table public.pay_per_use_orders enable row level security;
alter table public.stripe_webhook_events enable row level security;

drop policy if exists "pay_per_use_orders_select_own" on public.pay_per_use_orders;
create policy "pay_per_use_orders_select_own"
  on public.pay_per_use_orders
  for select
  using (auth.uid() = user_id);

drop policy if exists "pay_per_use_orders_insert_own" on public.pay_per_use_orders;
create policy "pay_per_use_orders_insert_own"
  on public.pay_per_use_orders
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "pay_per_use_orders_update_own" on public.pay_per_use_orders;
create policy "pay_per_use_orders_update_own"
  on public.pay_per_use_orders
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_pay_per_use_orders_updated_at on public.pay_per_use_orders;
create trigger set_pay_per_use_orders_updated_at
  before update on public.pay_per_use_orders
  for each row execute function public.handle_unified_updated_at();

commit;
