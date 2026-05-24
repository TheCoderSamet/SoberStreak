-- Run in Supabase SQL Editor if profiles already exists without this column.
alter table public.profiles
  add column if not exists has_completed_onboarding boolean not null default false;
