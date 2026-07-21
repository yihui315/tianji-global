begin;

alter table public.orders
  add column if not exists resource_ref text;

alter table public.orders
  drop constraint if exists orders_product_id_check;

alter table public.orders
  add constraint orders_product_id_check check (
    product_id in (
      'love_premium_report',
      'solo_love_report',
      'compatibility_report',
      'ask_unlock',
      'draw_unlock'
    )
  );

create index if not exists orders_resource_ref_idx
  on public.orders(resource_ref);

alter table public.stripe_events
  add column if not exists processing_started_at timestamptz;

commit;
