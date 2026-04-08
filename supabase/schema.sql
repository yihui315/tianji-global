-- TianJi Global | 天机全球
-- Supabase Database Schema
-- Run this script in the Supabase SQL Editor to initialise the database.

-- ─── Enable UUID extension ────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── users ───────────────────────────────────────────────────────────────────
create table if not exists users (
  id                uuid        primary key default gen_random_uuid(),
  email             text        not null unique,
  name              text,
  subscription_tier text        not null default 'free'
                                check (subscription_tier in ('free', 'pro')),
  created_at        timestamptz not null default now()
);

comment on table  users                    is 'Platform users (auth managed by Supabase Auth)';
comment on column users.subscription_tier is 'Subscription level: free or pro';

-- ─── reading_sessions ────────────────────────────────────────────────────────
create table if not exists reading_sessions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references users (id) on delete cascade,
  name        text,
  description text,
  created_at  timestamptz not null default now()
);

comment on table reading_sessions is 'Groups related readings together (e.g., a consultation with multiple charts)';

create index if not exists reading_sessions_user_id_idx on reading_sessions (user_id);
create index if not exists reading_sessions_created_at_idx on reading_sessions (created_at desc);

-- ─── readings ────────────────────────────────────────────────────────────────
create table if not exists readings (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references users (id) on delete cascade,
  session_id     uuid        references reading_sessions (id) on delete set null,
  birth_date     date        not null,
  birth_time     time        not null,
  birth_place    text,
  gender         text        not null check (gender in ('male', 'female', 'other', 'unspecified')),
  chart_type     text        not null check (chart_type in ('bazi', 'ziwei', 'western', 'yijing', 'tarot')),
  input_data     jsonb       not null default '{}',
  output_report  jsonb,
  ai_model       text,
  ai_tokens_used integer     not null default 0,
  created_at     timestamptz not null default now()
);

comment on table  readings               is 'Individual fortune reading sessions';
comment on column readings.chart_type    is 'Type of chart calculated: bazi, ziwei, western, yijing, or tarot';
comment on column readings.input_data    is 'Raw input parameters sent to the calculation engine';
comment on column readings.output_report is 'AI-generated report in structured JSON format';
comment on column readings.ai_tokens_used is 'Number of AI tokens consumed for this reading';

create index if not exists readings_user_id_idx     on readings (user_id);
create index if not exists readings_session_id_idx  on readings (session_id);
create index if not exists readings_created_at_idx  on readings (created_at desc);
create index if not exists readings_chart_type_idx  on readings (chart_type);

-- ─── composite_readings ──────────────────────────────────────────────────────
create table if not exists composite_readings (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references users (id) on delete cascade,
  session_id        uuid        references reading_sessions (id) on delete set null,
  reading_ids       uuid[]      not null,
  chart_types       text[]      not null,
  combined_analysis jsonb,
  ai_model          text,
  ai_tokens_used    integer     not null default 0,
  created_at        timestamptz not null default now()
);

comment on table  composite_readings          is 'Multi-chart analysis combining several readings';
comment on column composite_readings.reading_ids is 'Array of reading IDs included in this composite';
comment on column composite_readings.chart_types is 'Array of chart types combined';
comment on column composite_readings.combined_analysis is 'AI-generated cross-analysis of multiple charts';

create index if not exists composite_readings_user_id_idx    on composite_readings (user_id);
create index if not exists composite_readings_session_id_idx  on composite_readings (session_id);
create index if not exists composite_readings_created_at_idx  on composite_readings (created_at desc);

-- ─── user_preferences ────────────────────────────────────────────────────────
create table if not exists user_preferences (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references users (id) on delete cascade,
  language       text        not null default 'en'
                                check (language in ('en', 'zh', 'ja', 'ko')),
  theme          text        not null default 'light'
                                check (theme in ('light', 'dark', 'auto')),
  default_chart  text        not null default 'bazi'
                                check (default_chart in ('bazi', 'ziwei', 'western', 'yijing', 'tarot')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint user_preferences_user_id_unique unique (user_id)
);

comment on table  user_preferences       is 'User settings and preferences';
comment on column user_preferences.language is 'UI language: en, zh, ja, or ko';
comment on column user_preferences.theme is 'UI theme: light, dark, or auto';
comment on column user_preferences.default_chart is 'Default chart type for new readings';

create index if not exists user_preferences_user_id_idx on user_preferences (user_id);

-- ─── payments ────────────────────────────────────────────────────────────────
create table if not exists payments (
  id                        uuid        primary key default gen_random_uuid(),
  user_id                   uuid        not null references users (id) on delete cascade,
  amount                    integer     not null check (amount >= 0),
  currency                  text        not null default 'usd',
  status                    text        not null
                                        check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  stripe_payment_intent_id  text        unique,
  created_at                timestamptz not null default now()
);

comment on table  payments        is 'Stripe payment records';
comment on column payments.amount is 'Amount in the smallest currency unit (e.g., cents for USD)';

create index if not exists payments_user_id_idx on payments (user_id);

-- ─── feedback ────────────────────────────────────────────────────────────────
create table if not exists feedback (
  id         uuid        primary key default gen_random_uuid(),
  reading_id uuid        not null references readings (id) on delete cascade,
  rating     integer     not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now()
);

comment on table  feedback        is 'User ratings and comments for individual readings';
comment on column feedback.rating is 'Star rating from 1 (poor) to 5 (excellent)';

create index if not exists feedback_reading_id_idx on feedback (reading_id);

-- ─── Generated Columns & Views for Common Queries ─────────────────────────────

-- Add generated column to users: signup_date (date portion of created_at)
alter table users add column if not exists signup_date date
  generated always as (created_at::date) stored;

comment on column users.signup_date is 'Date portion of account creation for easy grouping';

-- Add generated column to readings: age_at_reading (age in years when reading was created)
alter table readings add column if not exists age_at_reading integer
  generated always as (
    extract(year from age(created_at, birth_date))
  ) stored;

comment on column readings.age_at_reading is 'Age in years at the time of the reading';

-- View: User summary with reading counts and total AI tokens
create or replace view user_summary as
  select
    u.id,
    u.email,
    u.name,
    u.subscription_tier,
    u.created_at as signup_at,
    u.signup_date,
    count(r.id) as total_readings,
    coalesce(sum(r.ai_tokens_used), 0) as total_ai_tokens,
    count(distinct r.chart_type) as unique_chart_types,
    count(cr.id) as total_composite_readings,
    coalesce(sum(cr.ai_tokens_used), 0) as composite_ai_tokens
  from users u
  left join readings r on u.id = r.user_id
  left join composite_readings cr on u.id = cr.user_id
  group by u.id, u.email, u.name, u.subscription_tier, u.created_at, u.signup_date;

comment on view user_summary is 'Aggregated user statistics: readings count, AI tokens used, chart types explored';

-- View: Monthly reading statistics
create or replace view monthly_reading_stats as
  select
    date_trunc('month', created_at)::date as month,
    chart_type,
    count(*) as reading_count,
    coalesce(sum(ai_tokens_used), 0) as total_tokens,
    count(distinct user_id) as unique_users
  from readings
  group by date_trunc('month', created_at), chart_type
  order by month desc, chart_type;

comment on view monthly_reading_stats is 'Monthly breakdown of readings by chart type';

-- View: Reading sessions with reading count
create or replace view reading_session_details as
  select
    rs.id,
    rs.user_id,
    rs.name,
    rs.description,
    rs.created_at,
    count(r.id) as readings_in_session,
    array_agg(r.chart_type) as chart_types_used,
    coalesce(sum(r.ai_tokens_used), 0) as session_total_tokens
  from reading_sessions rs
  left join readings r on rs.id = r.session_id
  group by rs.id, rs.user_id, rs.name, rs.description, rs.created_at;

comment on view reading_session_details is 'Reading sessions with aggregated reading information';

-- Function: Update updated_at timestamp for user_preferences
create or replace function update_user_preferences_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger: Auto-update updated_at on user_preferences
drop trigger if exists user_preferences_updated_at on user_preferences;
create trigger user_preferences_updated_at
  before update on user_preferences
  for each row execute function update_user_preferences_timestamp();

comment on function update_user_preferences_timestamp is 'Automatically updates the updated_at column on user_preferences';

-- ─── Row-Level Security (RLS) ─────────────────────────────────────────────────
-- Enable RLS so users can only access their own data via the public API key.

alter table users               enable row level security;
alter table reading_sessions     enable row level security;
alter table readings             enable row level security;
alter table composite_readings   enable row level security;
alter table user_preferences     enable row level security;
alter table payments             enable row level security;
alter table feedback             enable row level security;

-- users: each authenticated user can read/update only their own row
create policy "users: own row" on users
  for all using (auth.uid() = id);

-- reading_sessions: authenticated user can CRUD their own sessions
create policy "reading_sessions: own rows" on reading_sessions
  for all using (auth.uid() = user_id);

-- readings: authenticated user can CRUD their own readings
create policy "readings: own rows" on readings
  for all using (auth.uid() = user_id);

-- composite_readings: authenticated user can CRUD their own composite readings
create policy "composite_readings: own rows" on composite_readings
  for all using (auth.uid() = user_id);

-- user_preferences: one row per user, authenticated user can read/update their own
create policy "user_preferences: own row" on user_preferences
  for all using (auth.uid() = user_id);

-- payments: authenticated user can read their own payments
create policy "payments: own rows" on payments
  for select using (auth.uid() = user_id);

-- feedback: authenticated user can insert/read feedback for their own readings
create policy "feedback: via own reading" on feedback
  for all using (
    exists (
      select 1 from readings r
      where r.id = feedback.reading_id
        and r.user_id = auth.uid()
    )
  );
