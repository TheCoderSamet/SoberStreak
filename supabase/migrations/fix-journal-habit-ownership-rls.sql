-- Run once in Supabase SQL Editor (or via migration) after rls.sql.
-- Ensures journal/progress rows cannot reference another user's habit.

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
