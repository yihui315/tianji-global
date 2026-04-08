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

-- ─── readings ────────────────────────────────────────────────────────────────
create table if not exists readings (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references users (id) on delete cascade,
  birth_date    date        not null,
  birth_time    time        not null,
  birth_place   text,
  gender        text        not null check (gender in ('male', 'female', 'other', 'unspecified')),
  chart_type    text        not null check (chart_type in ('bazi', 'ziwei', 'western', 'yijing')),
  input_data    jsonb       not null default '{}',
  output_report jsonb,
  ai_model      text,
  created_at    timestamptz not null default now()
);

comment on table  readings             is 'Individual fortune reading sessions';
comment on column readings.chart_type is 'Type of chart calculated: bazi, ziwei, western, or yijing';
comment on column readings.input_data is 'Raw input parameters sent to the calculation engine';
comment on column readings.output_report is 'AI-generated report in structured JSON format';

create index if not exists readings_user_id_idx  on readings (user_id);
create index if not exists readings_created_at_idx on readings (created_at desc);

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

-- ─── Row-Level Security (RLS) ─────────────────────────────────────────────────
-- Enable RLS so users can only access their own data via the public API key.

alter table users     enable row level security;
alter table readings  enable row level security;
alter table payments  enable row level security;
alter table feedback  enable row level security;

-- users: each authenticated user can read/update only their own row
create policy "users: own row" on users
  for all using (auth.uid() = id);

-- readings: authenticated user can CRUD their own readings
create policy "readings: own rows" on readings
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
