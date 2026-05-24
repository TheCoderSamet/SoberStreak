-- Sober Streak — Supabase schema
-- Run in Supabase SQL Editor after creating a project.
-- Then run rls.sql to enable Row Level Security policies.
-- Safe to re-run: uses IF NOT EXISTS and DROP TRIGGER IF EXISTS.

-- Extensions (gen_random_uuid is in pgcrypto on Supabase; usually already enabled)
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email text,
  avatar_url text,
  is_premium boolean not null default false,
  has_completed_onboarding boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing projects: add column if profiles was created before is_premium existed
alter table public.profiles
  add column if not exists is_premium boolean not null default false;

alter table public.profiles
  add column if not exists has_completed_onboarding boolean not null default false;

create index if not exists profiles_email_idx on public.profiles (email);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Users cannot grant themselves premium via the mobile app (admin/SQL Editor only)
create or replace function public.profiles_guard_premium_columns()
returns trigger
language plpgsql
as $$
begin
  -- Dashboard SQL Editor and postgres bypass (not authenticated app users)
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_premium := false;
    return new;
  end if;

  if new.is_premium is distinct from old.is_premium then
    raise exception 'premium status can only be changed by an administrator';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_premium on public.profiles;
create trigger profiles_guard_premium
  before insert or update on public.profiles
  for each row
  execute function public.profiles_guard_premium_columns();

-- Auto-create profile on signup (optional convenience)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- habits
-- ---------------------------------------------------------------------------
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  name text not null,
  reason text,
  quit_date timestamptz not null,
  daily_cost numeric not null default 0,
  unit text,
  is_primary boolean not null default false,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint habits_type_check check (
    type in ('alcohol', 'smoking', 'vaping', 'sugar', 'social_media', 'custom')
  ),
  constraint habits_daily_cost_non_negative check (daily_cost >= 0)
);

create index if not exists habits_user_id_idx on public.habits (user_id);
create index if not exists habits_user_id_active_idx on public.habits (user_id, is_active)
  where deleted_at is null;
create index if not exists habits_user_id_primary_idx on public.habits (user_id, is_primary)
  where deleted_at is null;
create index if not exists habits_created_at_idx on public.habits (created_at desc);

drop trigger if exists habits_set_updated_at on public.habits;
create trigger habits_set_updated_at
  before update on public.habits
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- journal_entries
-- ---------------------------------------------------------------------------
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  mood text not null,
  note text,
  triggers text[] not null default '{}',
  entry_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint journal_entries_mood_check check (
    mood in ('great', 'good', 'okay', 'hard')
  )
);

create index if not exists journal_entries_user_id_idx on public.journal_entries (user_id);
create index if not exists journal_entries_habit_id_idx on public.journal_entries (habit_id);
create index if not exists journal_entries_entry_date_idx on public.journal_entries (entry_date desc);
create index if not exists journal_entries_user_entry_date_idx
  on public.journal_entries (user_id, entry_date desc)
  where deleted_at is null;

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- progress_history
-- ---------------------------------------------------------------------------
create table if not exists public.progress_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid references public.habits (id) on delete set null,
  habit_name text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_days integer not null default 0,
  estimated_savings numeric not null default 0,
  reflection text,
  triggers text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint progress_history_duration_non_negative check (duration_days >= 0),
  constraint progress_history_savings_non_negative check (estimated_savings >= 0)
);

create index if not exists progress_history_user_id_idx on public.progress_history (user_id);
create index if not exists progress_history_habit_id_idx on public.progress_history (habit_id);
create index if not exists progress_history_created_at_idx on public.progress_history (created_at desc);
create index if not exists progress_history_user_created_at_idx
  on public.progress_history (user_id, created_at desc)
  where deleted_at is null;

drop trigger if exists progress_history_set_updated_at on public.progress_history;
create trigger progress_history_set_updated_at
  before update on public.progress_history
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- community_posts
-- ---------------------------------------------------------------------------
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  message text not null,
  is_anonymous boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create index if not exists community_posts_user_id_idx on public.community_posts (user_id);
create index if not exists community_posts_created_at_idx
  on public.community_posts (created_at desc)
  where deleted_at is null;

drop trigger if exists community_posts_set_updated_at on public.community_posts;
create trigger community_posts_set_updated_at
  before update on public.community_posts
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- community_supports
-- ---------------------------------------------------------------------------
create table if not exists public.community_supports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  post_id uuid not null references public.community_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint community_supports_user_post_unique unique (user_id, post_id)
);

create index if not exists community_supports_post_id_idx on public.community_supports (post_id);
create index if not exists community_supports_user_id_idx on public.community_supports (user_id);

-- community_supports has no updated_at column per spec
