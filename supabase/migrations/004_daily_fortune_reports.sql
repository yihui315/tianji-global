begin;

create extension if not exists "pgcrypto";

create table if not exists public.daily_fortune_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  profile_id uuid references public.user_profiles(id) on delete set null,
  session_id uuid references public.reading_sessions_unified(id) on delete set null,
  report_date date not null,
  timezone text not null default 'UTC',
  language text not null default 'en' check (language in ('en', 'zh')),
  status text not null default 'generated'
    check (status in ('pending', 'generated', 'failed', 'archived')),
  fortune_score numeric(5, 2) check (fortune_score is null or (fortune_score >= 0 and fortune_score <= 100)),
  overall_tone text,
  title text,
  summary text,
  energy_profile jsonb not null default '{}'::jsonb,
  lucky_elements jsonb not null default '{}'::jsonb,
  risk_flags jsonb not null default '[]'::jsonb,
  recommended_rule_keys text[] not null default '{}'::text[],
  source_payload jsonb not null default '{}'::jsonb,
  ai_model text,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists daily_fortune_reports_user_date_unique
  on public.daily_fortune_reports(user_id, report_date)
  where profile_id is null;

create unique index if not exists daily_fortune_reports_user_profile_date_unique
  on public.daily_fortune_reports(user_id, profile_id, report_date)
  where profile_id is not null;

create index if not exists daily_fortune_reports_user_created_idx
  on public.daily_fortune_reports(user_id, created_at desc);

create index if not exists daily_fortune_reports_profile_date_idx
  on public.daily_fortune_reports(profile_id, report_date desc);

create index if not exists daily_fortune_reports_status_idx
  on public.daily_fortune_reports(status);

create table if not exists public.fortune_remedy_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null,
  language text not null default 'en' check (language in ('en', 'zh')),
  category text not null check (
    category in ('mindset', 'routine', 'focus', 'relationship', 'environment', 'wellbeing')
  ),
  trigger_tags text[] not null default '{}'::text[],
  severity text not null default 'low' check (severity in ('low', 'medium')),
  title text not null,
  rationale text not null,
  action_template text not null,
  safety_note text,
  is_active boolean not null default true,
  priority integer not null default 100,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rule_key, language)
);

create index if not exists fortune_remedy_rules_active_priority_idx
  on public.fortune_remedy_rules(is_active, priority, category);

create index if not exists fortune_remedy_rules_trigger_tags_idx
  on public.fortune_remedy_rules using gin(trigger_tags);

create table if not exists public.fortune_remedy_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.daily_fortune_reports(id) on delete cascade,
  rule_id uuid not null references public.fortune_remedy_rules(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'suggested'
    check (status in ('suggested', 'saved', 'dismissed', 'completed')),
  scheduled_for timestamptz,
  completed_at timestamptz,
  feedback_score smallint check (feedback_score is null or (feedback_score >= 1 and feedback_score <= 5)),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, rule_id)
);

create index if not exists fortune_remedy_actions_user_status_idx
  on public.fortune_remedy_actions(user_id, status, created_at desc);

create index if not exists fortune_remedy_actions_report_idx
  on public.fortune_remedy_actions(report_id);

create index if not exists fortune_remedy_actions_rule_idx
  on public.fortune_remedy_actions(rule_id);

create table if not exists public.push_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  report_id uuid references public.daily_fortune_reports(id) on delete set null,
  channel text not null check (channel in ('email', 'web_push', 'sms', 'in_app')),
  provider text,
  target_hash text,
  template_key text not null,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'delivered', 'failed', 'skipped')),
  provider_message_id text,
  error_code text,
  error_message text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists push_delivery_logs_provider_message_unique
  on public.push_delivery_logs(provider_message_id)
  where provider_message_id is not null;

create index if not exists push_delivery_logs_user_created_idx
  on public.push_delivery_logs(user_id, created_at desc);

create index if not exists push_delivery_logs_report_idx
  on public.push_delivery_logs(report_id);

create index if not exists push_delivery_logs_status_scheduled_idx
  on public.push_delivery_logs(status, scheduled_at);

create table if not exists public.fortune_feedback (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.daily_fortune_reports(id) on delete cascade,
  action_id uuid references public.fortune_remedy_actions(id) on delete set null,
  user_id uuid not null references public.users(id) on delete cascade,
  feedback_type text not null default 'report'
    check (feedback_type in ('report', 'remedy_action', 'push')),
  rating smallint check (rating is null or (rating >= 1 and rating <= 5)),
  helpful boolean,
  comment text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists fortune_feedback_report_user_unique
  on public.fortune_feedback(report_id, user_id)
  where action_id is null;

create unique index if not exists fortune_feedback_action_user_unique
  on public.fortune_feedback(action_id, user_id)
  where action_id is not null;

create index if not exists fortune_feedback_user_created_idx
  on public.fortune_feedback(user_id, created_at desc);

create index if not exists fortune_feedback_report_idx
  on public.fortune_feedback(report_id);

create or replace function public.handle_daily_fortune_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_daily_fortune_reports_updated_at on public.daily_fortune_reports;
create trigger set_daily_fortune_reports_updated_at
  before update on public.daily_fortune_reports
  for each row execute function public.handle_daily_fortune_updated_at();

drop trigger if exists set_fortune_remedy_rules_updated_at on public.fortune_remedy_rules;
create trigger set_fortune_remedy_rules_updated_at
  before update on public.fortune_remedy_rules
  for each row execute function public.handle_daily_fortune_updated_at();

drop trigger if exists set_fortune_remedy_actions_updated_at on public.fortune_remedy_actions;
create trigger set_fortune_remedy_actions_updated_at
  before update on public.fortune_remedy_actions
  for each row execute function public.handle_daily_fortune_updated_at();

drop trigger if exists set_push_delivery_logs_updated_at on public.push_delivery_logs;
create trigger set_push_delivery_logs_updated_at
  before update on public.push_delivery_logs
  for each row execute function public.handle_daily_fortune_updated_at();

drop trigger if exists set_fortune_feedback_updated_at on public.fortune_feedback;
create trigger set_fortune_feedback_updated_at
  before update on public.fortune_feedback
  for each row execute function public.handle_daily_fortune_updated_at();

alter table public.daily_fortune_reports enable row level security;
alter table public.fortune_remedy_rules enable row level security;
alter table public.fortune_remedy_actions enable row level security;
alter table public.push_delivery_logs enable row level security;
alter table public.fortune_feedback enable row level security;

drop policy if exists "Users can manage own daily fortune reports" on public.daily_fortune_reports;
create policy "Users can manage own daily fortune reports"
  on public.daily_fortune_reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Anyone can read active fortune remedy rules" on public.fortune_remedy_rules;
create policy "Anyone can read active fortune remedy rules"
  on public.fortune_remedy_rules for select
  using (is_active = true);

drop policy if exists "Users can manage own fortune remedy actions" on public.fortune_remedy_actions;
create policy "Users can manage own fortune remedy actions"
  on public.fortune_remedy_actions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own push delivery logs" on public.push_delivery_logs;
create policy "Users can read own push delivery logs"
  on public.push_delivery_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can manage own fortune feedback" on public.fortune_feedback;
create policy "Users can manage own fortune feedback"
  on public.fortune_feedback for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table public.daily_fortune_reports is
  'Daily Fortune report snapshots for a user and optional profile, without changing the legacy readings table.';

comment on table public.fortune_remedy_rules is
  'Low-risk rule library for Daily Fortune remedy suggestions.';

comment on table public.fortune_remedy_actions is
  'Per-report remedy action instances derived from fortune_remedy_rules.';

comment on table public.push_delivery_logs is
  'Delivery audit log for Daily Fortune notifications using hashed targets, not raw addresses.';

comment on table public.fortune_feedback is
  'User feedback on Daily Fortune reports and remedy actions.';

commit;
