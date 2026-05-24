-- Sober Streak — Row Level Security policies
-- Run after schema.sql in Supabase SQL Editor.
-- Safe to re-run: drops existing policies before recreating them.

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.journal_entries enable row level security;
alter table public.progress_history enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_supports enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- habits
-- ---------------------------------------------------------------------------
drop policy if exists "habits_select_own" on public.habits;
create policy "habits_select_own"
  on public.habits
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "habits_insert_own" on public.habits;
create policy "habits_insert_own"
  on public.habits
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "habits_update_own" on public.habits;
create policy "habits_update_own"
  on public.habits
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "habits_delete_own" on public.habits;
create policy "habits_delete_own"
  on public.habits
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- journal_entries
-- ---------------------------------------------------------------------------
drop policy if exists "journal_entries_select_own" on public.journal_entries;
create policy "journal_entries_select_own"
  on public.journal_entries
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "journal_entries_insert_own" on public.journal_entries;
create policy "journal_entries_insert_own"
  on public.journal_entries
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.habits h
      where h.id = habit_id
        and h.user_id = auth.uid()
        and h.deleted_at is null
    )
  );

drop policy if exists "journal_entries_update_own" on public.journal_entries;
create policy "journal_entries_update_own"
  on public.journal_entries
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.habits h
      where h.id = habit_id
        and h.user_id = auth.uid()
        and h.deleted_at is null
    )
  );

drop policy if exists "journal_entries_delete_own" on public.journal_entries;
create policy "journal_entries_delete_own"
  on public.journal_entries
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- progress_history
-- ---------------------------------------------------------------------------
drop policy if exists "progress_history_select_own" on public.progress_history;
create policy "progress_history_select_own"
  on public.progress_history
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "progress_history_insert_own" on public.progress_history;
create policy "progress_history_insert_own"
  on public.progress_history
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      habit_id is null
      or exists (
        select 1
        from public.habits h
        where h.id = habit_id
          and h.user_id = auth.uid()
          and h.deleted_at is null
      )
    )
  );

drop policy if exists "progress_history_update_own" on public.progress_history;
create policy "progress_history_update_own"
  on public.progress_history
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      habit_id is null
      or exists (
        select 1
        from public.habits h
        where h.id = habit_id
          and h.user_id = auth.uid()
          and h.deleted_at is null
      )
    )
  );

drop policy if exists "progress_history_delete_own" on public.progress_history;
create policy "progress_history_delete_own"
  on public.progress_history
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- community_posts
-- ---------------------------------------------------------------------------
drop policy if exists "community_posts_select_authenticated" on public.community_posts;
create policy "community_posts_select_authenticated"
  on public.community_posts
  for select
  to authenticated
  using (deleted_at is null);

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
  on public.community_posts
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "community_posts_update_own" on public.community_posts;
create policy "community_posts_update_own"
  on public.community_posts
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "community_posts_delete_own" on public.community_posts;
create policy "community_posts_delete_own"
  on public.community_posts
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- community_supports
-- ---------------------------------------------------------------------------
drop policy if exists "community_supports_select_authenticated" on public.community_supports;
create policy "community_supports_select_authenticated"
  on public.community_supports
  for select
  to authenticated
  using (true);

drop policy if exists "community_supports_insert_own" on public.community_supports;
create policy "community_supports_insert_own"
  on public.community_supports
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "community_supports_delete_own" on public.community_supports;
create policy "community_supports_delete_own"
  on public.community_supports
  for delete
  to authenticated
  using (user_id = auth.uid());
