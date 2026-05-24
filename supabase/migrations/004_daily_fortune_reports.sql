begin;

create extension if not exists "pgcrypto";

create table if not exists public.daily_fortune_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  profile_id uuid references public.user_profiles(id) on delete set null,
  date date not null,
  timezone text not null default 'Asia/Singapore',
  system_type text not null default 'bazi'
    check (system_type in ('bazi', 'relationship', 'tarot', 'integrated')),
  language text not null default 'zh' check (language in ('en', 'zh')),
  tier text not null default 'free' check (tier in ('free', 'premium', 'pro')),
  overall_score int not null check (overall_score >= 0 and overall_score <= 100),
  scores_json jsonb not null,
  headline text not null,
  summary text not null,
  drivers_json jsonb not null default '[]'::jsonb,
  content_json jsonb not null default '{}'::jsonb,
  disclaimer text not null,
  status text not null default 'generated'
    check (status in ('pending', 'generated', 'failed', 'archived')),
  cache_key text not null unique,
  generated_by text not null default 'rules_v1',
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, date, system_type, language, tier)
);

create index if not exists daily_fortune_reports_user_date_idx
  on public.daily_fortune_reports(user_id, date desc);

create index if not exists daily_fortune_reports_profile_date_idx
  on public.daily_fortune_reports(profile_id, date desc);

create index if not exists daily_fortune_reports_status_idx
  on public.daily_fortune_reports(status);

create index if not exists daily_fortune_reports_cache_key_idx
  on public.daily_fortune_reports(cache_key);

create table if not exists public.fortune_remedy_rules (
  id uuid primary key default gen_random_uuid(),
  dimension text not null check (dimension in ('love', 'career', 'wealth', 'health')),
  risk_tag text not null,
  condition_json jsonb not null,
  priority int not null default 50,
  template_key text not null unique,
  title_template text not null,
  body_template text not null,
  reason_template text not null,
  action_type text not null
    check (action_type in ('action', 'ritual_copy', 'self_observation', 'resource', 'disclaimer_guard')),
  min_tier text not null default 'free' check (min_tier in ('free', 'premium', 'pro')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fortune_remedy_rules_dimension_risk_active_idx
  on public.fortune_remedy_rules(dimension, risk_tag, is_active);

create index if not exists fortune_remedy_rules_active_priority_idx
  on public.fortune_remedy_rules(is_active, priority);

create table if not exists public.fortune_remedy_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.daily_fortune_reports(id) on delete cascade,
  rule_id uuid references public.fortune_remedy_rules(id) on delete set null,
  type text not null
    check (type in ('action', 'ritual_copy', 'self_observation', 'resource', 'disclaimer_guard')),
  title text not null,
  body text not null,
  reason text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  cta_json jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, rule_id)
);

create index if not exists fortune_remedy_actions_report_id_idx
  on public.fortune_remedy_actions(report_id);

create index if not exists fortune_remedy_actions_rule_id_idx
  on public.fortune_remedy_actions(rule_id);

create table if not exists public.push_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.daily_fortune_reports(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  channel text not null check (channel in ('email', 'telegram', 'web_push', 'in_app')),
  target text,
  status text not null check (status in ('pending', 'sent', 'delivered', 'failed', 'skipped')),
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_delivery_logs_user_created_idx
  on public.push_delivery_logs(user_id, created_at desc);

create index if not exists push_delivery_logs_report_id_idx
  on public.push_delivery_logs(report_id);

create index if not exists push_delivery_logs_status_channel_idx
  on public.push_delivery_logs(status, channel);

create index if not exists push_delivery_logs_provider_message_idx
  on public.push_delivery_logs(provider_message_id)
  where provider_message_id is not null;

create table if not exists public.fortune_feedback (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.daily_fortune_reports(id) on delete cascade,
  action_id uuid references public.fortune_remedy_actions(id) on delete set null,
  user_id uuid not null references public.users(id) on delete cascade,
  helpful boolean,
  executed boolean,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fortune_feedback_report_id_idx
  on public.fortune_feedback(report_id);

create index if not exists fortune_feedback_action_id_idx
  on public.fortune_feedback(action_id);

create index if not exists fortune_feedback_user_created_idx
  on public.fortune_feedback(user_id, created_at desc);

drop trigger if exists set_daily_fortune_reports_updated_at on public.daily_fortune_reports;
create trigger set_daily_fortune_reports_updated_at
  before update on public.daily_fortune_reports
  for each row execute function public.handle_unified_updated_at();

drop trigger if exists set_fortune_remedy_rules_updated_at on public.fortune_remedy_rules;
create trigger set_fortune_remedy_rules_updated_at
  before update on public.fortune_remedy_rules
  for each row execute function public.handle_unified_updated_at();

drop trigger if exists set_fortune_remedy_actions_updated_at on public.fortune_remedy_actions;
create trigger set_fortune_remedy_actions_updated_at
  before update on public.fortune_remedy_actions
  for each row execute function public.handle_unified_updated_at();

drop trigger if exists set_push_delivery_logs_updated_at on public.push_delivery_logs;
create trigger set_push_delivery_logs_updated_at
  before update on public.push_delivery_logs
  for each row execute function public.handle_unified_updated_at();

drop trigger if exists set_fortune_feedback_updated_at on public.fortune_feedback;
create trigger set_fortune_feedback_updated_at
  before update on public.fortune_feedback
  for each row execute function public.handle_unified_updated_at();

alter table public.daily_fortune_reports enable row level security;
alter table public.fortune_remedy_rules enable row level security;
alter table public.fortune_remedy_actions enable row level security;
alter table public.push_delivery_logs enable row level security;
alter table public.fortune_feedback enable row level security;

drop policy if exists "Users can read own daily fortune reports" on public.daily_fortune_reports;
create policy "Users can read own daily fortune reports"
  on public.daily_fortune_reports
  for select
  using (auth.uid() = user_id);

drop policy if exists "Service role can manage daily fortune reports" on public.daily_fortune_reports;
create policy "Service role can manage daily fortune reports"
  on public.daily_fortune_reports
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Anyone can read active fortune remedy rules" on public.fortune_remedy_rules;
create policy "Anyone can read active fortune remedy rules"
  on public.fortune_remedy_rules
  for select
  using (is_active = true);

drop policy if exists "Service role can manage fortune remedy rules" on public.fortune_remedy_rules;
create policy "Service role can manage fortune remedy rules"
  on public.fortune_remedy_rules
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Users can read own fortune remedy actions" on public.fortune_remedy_actions;
create policy "Users can read own fortune remedy actions"
  on public.fortune_remedy_actions
  for select
  using (
    exists (
      select 1
      from public.daily_fortune_reports r
      where r.id = public.fortune_remedy_actions.report_id
        and r.user_id = auth.uid()
    )
  );

drop policy if exists "Service role can manage fortune remedy actions" on public.fortune_remedy_actions;
create policy "Service role can manage fortune remedy actions"
  on public.fortune_remedy_actions
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Users can read own push delivery logs" on public.push_delivery_logs;
create policy "Users can read own push delivery logs"
  on public.push_delivery_logs
  for select
  using (auth.uid() = user_id);

drop policy if exists "Service role can manage push delivery logs" on public.push_delivery_logs;
create policy "Service role can manage push delivery logs"
  on public.push_delivery_logs
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Users can manage own fortune feedback" on public.fortune_feedback;
create policy "Users can manage own fortune feedback"
  on public.fortune_feedback
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.daily_fortune_reports r
      where r.id = public.fortune_feedback.report_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.daily_fortune_reports r
      where r.id = public.fortune_feedback.report_id
        and r.user_id = auth.uid()
    )
    and (
      public.fortune_feedback.action_id is null
      or exists (
        select 1
        from public.fortune_remedy_actions a
        where a.id = public.fortune_feedback.action_id
          and a.report_id = public.fortune_feedback.report_id
      )
    )
  );

drop policy if exists "Service role can manage fortune feedback" on public.fortune_feedback;
create policy "Service role can manage fortune feedback"
  on public.fortune_feedback
  for all
  to service_role
  using (true)
  with check (true);

comment on table public.daily_fortune_reports is
  'Canonical Daily Fortune reports generated from rule-based signals and cached by cache_key.';

comment on column public.daily_fortune_reports.cache_key is
  'daily_fortune:{user_id}:{profile_id_or_none}:{date}:{system_type}:{language}:{tier}';

comment on table public.fortune_remedy_rules is
  'Active remedy rule library. Rules are deterministic inputs for rendered remedy actions.';

comment on table public.fortune_remedy_actions is
  'Rendered remedy actions attached to a Daily Fortune report.';

comment on table public.push_delivery_logs is
  'Delivery audit log for Daily Fortune email, Telegram, web push, and in-app dispatch.';

comment on table public.fortune_feedback is
  'User feedback for Daily Fortune reports and remedy actions.';

commit;
