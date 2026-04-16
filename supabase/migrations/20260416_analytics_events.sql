-- ============================================================
-- Migration: analytics_events table for Relationship A/B tests
-- Run this in Supabase SQL Editor or via supabase db push
-- ============================================================

create table if not exists analytics_events (
  id           uuid primary key default gen_random_uuid(),
  event        text not null,
  experiment_id text not null,
  variant      text,
  relation_type text,
  share_mode   text,
  dimension    text,
  is_premium   boolean,
  payload      jsonb default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- Indexes for common query patterns
create index if not exists analytics_events_experiment_id_idx
  on analytics_events (experiment_id);

create index if not exists analytics_events_event_idx
  on analytics_events (event);

create index if not exists analytics_events_variant_idx
  on analytics_events (variant);

create index if not exists analytics_events_created_at_idx
  on analytics_events (created_at desc);

-- Row-level security: analytics service writes, everyone reads aggregates only
alter table analytics_events enable row level security;

-- Service role can do anything (API routes use service role key)
create policy "Service role full access"
  on analytics_events
  for all
  to service_role
  using (true);

-- Anon can only insert (client-side tracking calls)
create policy "Anon can insert events"
  on analytics_events
  for insert
  to anon
  with check (true);

-- No updates or deletes from client
create policy "No client updates"
  on analytics_events
  for update
  to anon
  using (false);

create policy "No client deletes"
  on analytics_events
  for delete
  to anon
  using (false);

comment on table analytics_events is
  'Stores Relationship module analytics events for A/B experiment validation. ' ||
  'Primary key: id. Time-series, append-only. Queries should aggregate with group by.';
