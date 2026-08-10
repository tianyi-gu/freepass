-- ============================================================
-- FreePass Production Launch Fixes — August 2026
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- (or apply via the Supabase MCP once re-authenticated)
--
-- This migration is the DB half of the App Store readiness work:
--   1. Account deletion (Apple 5.1.1(v))
--   2. UGC moderation: reports + blocks (Apple 1.2)
--   3. Ownership columns + owner-scoped UPDATE/DELETE policies
--      (fixes silent no-op edits that showed false "Updated!" alerts)
--   4. Tighten community_posts INSERT (was open to the anon role)
--   5. profiles.is_staff flag to gate the Staff View screen
--   6. Assert the documents bucket exists and is PRIVATE
--
-- Every statement is idempotent — safe to run more than once.
-- ============================================================

-- ------------------------------------------------------------
-- 1. STAFF FLAG — gate the staff-only screen in the app.
--    Set manually per staff member:
--      update public.profiles set is_staff = true where email = '...';
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists is_staff boolean not null default false;

-- Staff need to see unpublished draft submissions to review them; the
-- baseline select policy only exposes published rows, so the Staff View
-- screen silently showed nothing.
drop policy if exists "Staff can view draft resources" on public.resources;
create policy "Staff can view draft resources"
  on public.resources for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_staff
  ));

drop policy if exists "Staff can view draft events" on public.events;
create policy "Staff can view draft events"
  on public.events for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_staff
  ));

-- ------------------------------------------------------------
-- 2. OWNERSHIP COLUMNS on Q&A content.
--    asked_by / answered_by were free-text display names, so no
--    ownership policy could ever exist. Existing rows keep a null
--    user_id (nobody can edit/delete them from the app; staff can
--    manage them from the dashboard).
-- ------------------------------------------------------------
alter table public.questions
  add column if not exists user_id uuid references public.profiles(id) on delete set null;
alter table public.answers
  add column if not exists user_id uuid references public.profiles(id) on delete set null;

create index if not exists idx_questions_user_id on public.questions(user_id);
create index if not exists idx_answers_user_id on public.answers(user_id);

-- ------------------------------------------------------------
-- 3. OWNER-SCOPED UPDATE/DELETE POLICIES.
--    Without these, RLS silently dropped every edit while the app
--    showed a success alert, and upvotes never persisted.
--    Upvoting other people's questions is intentionally NOT enabled
--    here; the app no longer pretends votes persist.
-- ------------------------------------------------------------
drop policy if exists "Users can update own questions" on public.questions;
create policy "Users can update own questions"
  on public.questions for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own questions" on public.questions;
create policy "Users can delete own questions"
  on public.questions for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update own answers" on public.answers;
create policy "Users can update own answers"
  on public.answers for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own answers" on public.answers;
create policy "Users can delete own answers"
  on public.answers for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update own posts" on public.community_posts;
create policy "Users can update own posts"
  on public.community_posts for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Require new Q&A content to carry the author's user id.
drop policy if exists "Authenticated users can ask questions" on public.questions;
create policy "Authenticated users can ask questions"
  on public.questions for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can answer" on public.answers;
create policy "Authenticated users can answer"
  on public.answers for insert to authenticated
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. TIGHTEN community_posts INSERT.
--    The old "Anyone can post" (with check true) allowed the anon
--    role — anyone with the bundled anon key could mass-post
--    without an account, attributed to any user_id they liked.
-- ------------------------------------------------------------
drop policy if exists "Anyone can post" on public.community_posts;
create policy "Signed-in users can post as themselves"
  on public.community_posts for insert to authenticated
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 5. REPORTS — Apple 1.2 requires a report mechanism for UGC.
--    Write-only for users (including guests, so anyone who can see
--    content can flag it); readable only by staff.
-- ------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  content_type text not null check (content_type in ('community_post', 'question', 'answer', 'resource', 'event')),
  content_id uuid not null,
  reason text,
  created_at timestamptz default now()
);

alter table public.reports enable row level security;

drop policy if exists "Anyone can file a report" on public.reports;
create policy "Anyone can file a report"
  on public.reports for insert
  with check (reporter_id is null or reporter_id = auth.uid());

drop policy if exists "Staff can view reports" on public.reports;
create policy "Staff can view reports"
  on public.reports for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_staff
  ));

-- ------------------------------------------------------------
-- 6. BLOCKED USERS — Apple 1.2 requires a block mechanism.
--    The app hides all content authored by blocked user ids.
-- ------------------------------------------------------------
create table if not exists public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references public.profiles(id) on delete cascade not null,
  blocked_id uuid not null,
  created_at timestamptz default now(),
  unique (blocker_id, blocked_id)
);

alter table public.blocked_users enable row level security;

drop policy if exists "Users can view own blocks" on public.blocked_users;
create policy "Users can view own blocks"
  on public.blocked_users for select to authenticated
  using (auth.uid() = blocker_id);

drop policy if exists "Users can block" on public.blocked_users;
create policy "Users can block"
  on public.blocked_users for insert to authenticated
  with check (auth.uid() = blocker_id);

drop policy if exists "Users can unblock" on public.blocked_users;
create policy "Users can unblock"
  on public.blocked_users for delete to authenticated
  using (auth.uid() = blocker_id);

-- ------------------------------------------------------------
-- 7. ACCOUNT DELETION — Apple 5.1.1(v).
--    security definer so it may delete from auth.users and
--    storage.objects. Cascades handle profiles, survey_answers,
--    saved_resources, user_documents, blocked_users. UGC is
--    anonymized rather than deleted (posts stay, name removed).
--    The app also best-effort deletes storage files via the API
--    first; the delete here is the backstop.
-- ------------------------------------------------------------
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Anonymize UGC left behind
  update public.community_posts
    set display_name = 'Deleted user'
    where user_id = uid;
  update public.questions
    set asked_by = 'Deleted user'
    where user_id = uid;
  update public.answers
    set answered_by = 'Deleted user'
    where user_id = uid;

  -- Remove the user's document files (metadata rows cascade below)
  delete from storage.objects
    where bucket_id = 'documents'
      and (storage.foldername(name))[1] = uid::text;

  -- Cascades to profiles and every user-owned table
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

-- ------------------------------------------------------------
-- 7b. UPVOTES — the app previously "upvoted" by updating the row
--     directly, which RLS silently dropped; counts never persisted.
--     These functions make votes real for signed-in users.
-- ------------------------------------------------------------
create or replace function public.upvote_question(qid uuid)
returns int
language sql
security definer
set search_path = public
as $$
  update public.questions
    set upvotes = coalesce(upvotes, 0) + 1
    where id = qid
    returning upvotes;
$$;

create or replace function public.upvote_answer(aid uuid)
returns int
language sql
security definer
set search_path = public
as $$
  update public.answers
    set upvotes = coalesce(upvotes, 0) + 1
    where id = aid
    returning upvotes;
$$;

revoke all on function public.upvote_question(uuid) from public, anon;
revoke all on function public.upvote_answer(uuid) from public, anon;
grant execute on function public.upvote_question(uuid) to authenticated;
grant execute on function public.upvote_answer(uuid) to authenticated;

-- ------------------------------------------------------------
-- 8. DOCUMENTS BUCKET — must exist and must be PRIVATE.
--    The schema previously left this as a manual dashboard step;
--    if it was ever created public, every ID photo was readable
--    without auth. This asserts the safe state either way.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update set public = false;

-- ------------------------------------------------------------
-- Verification — run after applying:
--
-- select is_staff from public.profiles limit 1;
-- select public.delete_account() ...        -- (only from the app!)
-- select public from storage.buckets where id = 'documents';  -- false
-- select policyname from pg_policies
--   where tablename in ('community_posts','questions','answers','reports','blocked_users')
--   order by tablename, policyname;
-- ------------------------------------------------------------
