-- ============================================================
-- FreePass Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES — extends Supabase auth.users with app-specific data
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  zip_code text,
  is_guest boolean default false,
  is_staff boolean not null default false,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. SURVEY ANSWERS — stores onboarding questionnaire responses
create table public.survey_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id text not null,
  answer jsonb not null,  -- string or array of strings
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, question_id)
);

-- 3. RESOURCE CATEGORIES — types of resources (Housing, Employment, etc.)
create table public.resource_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,  -- icon name for the app
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 4. RESOURCES — the main resource listings that staff can manage
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.resource_categories(id),
  name text not null,
  description text,
  address text,
  city text default 'Philadelphia',
  state text default 'PA',
  zip_code text,
  phone text,
  email text,
  website text,
  hours text,  -- e.g. "Mon-Fri 9am-5pm"
  latitude double precision,
  longitude double precision,
  is_published boolean default true,
  tags text[] default '{}',  -- searchable tags
  last_verified timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. EVENTS — community events and workshops
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  address text,
  event_date timestamptz not null,
  end_date timestamptz,
  instructor text,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. SAVED RESOURCES — user favorites / quick list
create table public.saved_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  resource_id uuid references public.resources(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, resource_id)
);

-- 7. USER DOCUMENTS — certifications, IDs, and other important documents
create table public.user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  category text not null default 'Other',  -- ID, Certification, Medical, Legal, Employment, Other
  storage_path text not null,  -- path in the 'documents' storage bucket
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. COURSES — learning content and modules
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  course_type text,
  web_link text,
  video_link text,
  in_learning_academy boolean default false,
  is_hidden boolean default false,
  is_featured boolean default false,
  display_order int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. COURSE TASKS — steps/tasks within a course
create table public.course_tasks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  name text not null,
  description text,
  sort_order float,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. QUESTIONS — community Q&A board
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  question text not null,
  category text,
  upvotes int default 0,
  is_faq boolean default false,
  asked_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 11. ANSWERS — responses to community questions
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  answer text not null,
  answered_by text,
  upvotes int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 12. COMMUNITY POSTS — message board posts
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null default 'Anonymous',
  content text not null,
  created_at timestamptz default now()
);

-- 13. REPORTS — user flags on UGC (Apple 1.2); write-only for users, staff-readable
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  content_type text not null check (content_type in ('community_post', 'question', 'answer', 'resource', 'event')),
  content_id uuid not null,
  reason text,
  created_at timestamptz default now()
);

-- 14. BLOCKED USERS — per-user block list (Apple 1.2); app hides blocked authors' content
create table public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references public.profiles(id) on delete cascade not null,
  blocked_id uuid not null,
  created_at timestamptz default now(),
  unique (blocker_id, blocked_id)
);

-- ============================================================
-- INDEXES — speed up frequent queries
-- ============================================================

create index idx_survey_answers_user_id on public.survey_answers(user_id);
create index idx_resources_category_id on public.resources(category_id);
create index idx_resources_is_published on public.resources(is_published) where is_published = true;
create index idx_saved_resources_user_id on public.saved_resources(user_id);
create index idx_user_documents_user_id on public.user_documents(user_id);
create index idx_events_is_published_date on public.events(is_published, event_date) where is_published = true;
create index idx_course_tasks_course_id on public.course_tasks(course_id);
create index idx_answers_question_id on public.answers(question_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.survey_answers enable row level security;
alter table public.resource_categories enable row level security;
alter table public.resources enable row level security;
alter table public.events enable row level security;
alter table public.saved_resources enable row level security;
alter table public.user_documents enable row level security;
alter table public.courses enable row level security;
alter table public.course_tasks enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.community_posts enable row level security;
alter table public.reports enable row level security;
alter table public.blocked_users enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Survey answers: users can manage their own
create policy "Users can view own survey answers"
  on public.survey_answers for select using (auth.uid() = user_id);
create policy "Users can insert own survey answers"
  on public.survey_answers for insert with check (auth.uid() = user_id);
create policy "Users can update own survey answers"
  on public.survey_answers for update using (auth.uid() = user_id);

-- Resources & categories: everyone can read, only staff can modify
-- (staff modification happens through the Supabase dashboard directly)
create policy "Anyone can view resource categories"
  on public.resource_categories for select using (true);
create policy "Anyone can view published resources"
  on public.resources for select using (is_published = true);
create policy "Authenticated users can submit draft resources"
  on public.resources for insert to authenticated with check (is_published = false);
create policy "Staff can view draft resources"
  on public.resources for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_staff
  ));

-- Events: everyone can read published
create policy "Anyone can view published events"
  on public.events for select using (is_published = true);
create policy "Authenticated users can submit draft events"
  on public.events for insert to authenticated with check (is_published = false);
create policy "Staff can view draft events"
  on public.events for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_staff
  ));

-- Saved resources: users manage their own
create policy "Users can view own saved resources"
  on public.saved_resources for select using (auth.uid() = user_id);
create policy "Users can save resources"
  on public.saved_resources for insert with check (auth.uid() = user_id);
create policy "Users can unsave resources"
  on public.saved_resources for delete using (auth.uid() = user_id);

-- Courses: everyone can read
create policy "Anyone can view courses"
  on public.courses for select using (true);

-- Course tasks: everyone can read
create policy "Anyone can view course tasks"
  on public.course_tasks for select using (true);

-- Questions: everyone can read; signed-in users create/edit/delete their own
create policy "Anyone can view questions"
  on public.questions for select using (true);
create policy "Authenticated users can ask questions"
  on public.questions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own questions"
  on public.questions for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own questions"
  on public.questions for delete to authenticated using (auth.uid() = user_id);

-- Answers: everyone can read; signed-in users create/edit/delete their own
create policy "Anyone can view answers"
  on public.answers for select using (true);
create policy "Authenticated users can answer"
  on public.answers for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own answers"
  on public.answers for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own answers"
  on public.answers for delete to authenticated using (auth.uid() = user_id);

-- Community posts: everyone can read; only signed-in users can post, as themselves
create policy "Anyone can read posts"
  on public.community_posts for select using (true);
create policy "Signed-in users can post as themselves"
  on public.community_posts for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own posts"
  on public.community_posts for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own posts"
  on public.community_posts for delete using (auth.uid() = user_id);

-- Reports: anyone (including guests) can file; only staff can read
create policy "Anyone can file a report"
  on public.reports for insert
  with check (reporter_id is null or reporter_id = auth.uid());
create policy "Staff can view reports"
  on public.reports for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_staff
  ));

-- Blocked users: users manage their own block list
create policy "Users can view own blocks"
  on public.blocked_users for select to authenticated using (auth.uid() = blocker_id);
create policy "Users can block"
  on public.blocked_users for insert to authenticated with check (auth.uid() = blocker_id);
create policy "Users can unblock"
  on public.blocked_users for delete to authenticated using (auth.uid() = blocker_id);

-- User documents: users manage their own private documents
create policy "Users can view own documents"
  on public.user_documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents"
  on public.user_documents for insert with check (auth.uid() = user_id);
create policy "Users can update own documents"
  on public.user_documents for update using (auth.uid() = user_id);
create policy "Users can delete own documents"
  on public.user_documents for delete using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET — private bucket for user documents
-- Created (and forced private) directly in SQL so the safety of
-- ID photos never depends on a manual dashboard step.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update set public = false;

-- Storage policies for the 'documents' bucket
-- Users can upload/read/delete only files in their own folder (named by user id)
create policy "Users can upload own documents"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own documents"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger resources_updated_at
  before update on public.resources
  for each row execute function public.handle_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute function public.handle_updated_at();

create trigger survey_answers_updated_at
  before update on public.survey_answers
  for each row execute function public.handle_updated_at();

create trigger user_documents_updated_at
  before update on public.user_documents
  for each row execute function public.handle_updated_at();

create trigger courses_updated_at
  before update on public.courses
  for each row execute function public.handle_updated_at();

create trigger course_tasks_updated_at
  before update on public.course_tasks
  for each row execute function public.handle_updated_at();

create trigger questions_updated_at
  before update on public.questions
  for each row execute function public.handle_updated_at();

create trigger answers_updated_at
  before update on public.answers
  for each row execute function public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ACCOUNT DELETION (Apple 5.1.1(v))
-- Called from the app via supabase.rpc('delete_account').
-- Anonymizes left-behind UGC, purges document files, then deletes
-- the auth user (cascades to all user-owned tables).
-- ============================================================

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

  update public.community_posts
    set display_name = 'Deleted user'
    where user_id = uid;
  update public.questions
    set asked_by = 'Deleted user'
    where user_id = uid;
  update public.answers
    set answered_by = 'Deleted user'
    where user_id = uid;

  if exists (select 1 from storage.objects where bucket_id = 'documents' and (storage.foldername(name))[1] = uid::text) then
    raise exception 'Document files remain. Please retry account deletion.';
  end if;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

-- ============================================================
-- UPVOTES — direct row updates are blocked by RLS for non-owners,
-- so voting goes through these functions (signed-in users only).
-- ============================================================

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

-- ============================================================
-- SEED DATA — sample resource categories
-- ============================================================

insert into public.resource_categories (name, description, icon, sort_order) values
  ('Housing', 'Shelters, transitional housing, and rental assistance', 'house.fill', 1),
  ('Employment', 'Job listings, training programs, and career services', 'building.2.fill', 2),
  ('Legal Aid', 'Legal services, record expungement, and advocacy', 'doc.text.fill', 3),
  ('Healthcare', 'Medical, dental, and mental health services', 'heart.fill', 4),
  ('Education', 'GED programs, college prep, and skill training', 'book.fill', 5),
  ('Financial Services', 'Banking, credit building, and financial coaching', 'chart.line.uptrend.xyaxis', 6),
  ('Food Access', 'Food banks, pantries, and meal programs', 'star.fill', 7),
  ('Transportation', 'Transit assistance and transportation programs', 'map.fill', 8),
  ('Family Services', 'Family reunification and support services', 'bubble.left.and.bubble.right.fill', 9),
  ('ID & Documents', 'Help obtaining identification and vital records', 'rectangle.stack.fill', 10);

-- Apply after production-launch-fixes.sql. Idempotent. No user data deleted.
begin;

-- RLS restricts ROWS, not COLUMNS: the old own-profile UPDATE permitted
-- setting is_staff=true. Restrict grants and guard the flag in a trigger.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, display_name, email, zip_code, is_guest, onboarding_complete) on public.profiles to authenticated;
grant update (display_name, zip_code, onboarding_complete) on public.profiles to authenticated;
create or replace function public.guard_staff_flag()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('anon', 'authenticated') and
    ((TG_OP = 'INSERT' and new.is_staff) or (TG_OP = 'UPDATE' and new.is_staff is distinct from old.is_staff)) then
    raise exception 'Staff access is managed by an administrator';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_staff_flag on public.profiles;
create trigger guard_staff_flag before insert or update on public.profiles
for each row execute function public.guard_staff_flag();

-- Feedback was only hidden in the UI; the public API could still read it.
drop policy if exists "Anyone can view questions" on public.questions;
create policy "Anyone can view questions" on public.questions for select using (
  (category is distinct from 'Feedback' or user_id = auth.uid() or
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_staff))
  and not exists (select 1 from public.blocked_users b where b.blocker_id = auth.uid() and b.blocked_id = user_id)
);
drop policy if exists "Anyone can view answers" on public.answers;
create policy "Anyone can view answers" on public.answers for select using (
  exists (select 1 from public.questions q where q.id = question_id)
  and not exists (select 1 from public.blocked_users b where b.blocker_id = auth.uid() and b.blocked_id = user_id)
);

drop policy if exists "Anyone can read posts" on public.community_posts;
create policy "Anyone can read posts" on public.community_posts for select using (
  not exists (select 1 from public.blocked_users b where b.blocker_id = auth.uid() and b.blocked_id = user_id)
);

-- Legacy production policies ORed with ownership and permitted editing any
-- row. Drop them before tightening columns.
drop policy if exists "Anyone can upvote questions" on public.questions;
drop policy if exists "Anyone can upvote answers" on public.answers;

-- Owners may edit text, not forge FAQ badges or directly rewrite vote totals.
revoke update on public.questions from anon, authenticated;
grant update (question, category) on public.questions to authenticated;
revoke update on public.answers from anon, authenticated;
grant update (answer) on public.answers to authenticated;

-- Creation cannot forge vote totals, timestamps, FAQ badges, or another
-- author. The existing ownership policies still apply.
revoke insert on public.questions from anon, authenticated;
grant insert (question, category, asked_by, user_id) on public.questions to authenticated;
revoke insert on public.answers from anon, authenticated;
grant insert (question_id, answer, answered_by, user_id) on public.answers to authenticated;
revoke insert, update on public.community_posts from anon, authenticated;
grant insert (content, display_name, user_id) on public.community_posts to authenticated;
grant update (content) on public.community_posts to authenticated;

-- Keep hidden course drafts inaccessible through direct links and the API.
drop policy if exists "Anyone can view courses" on public.courses;
create policy "Anyone can view courses" on public.courses for select using (is_hidden = false);
drop policy if exists "Anyone can view course tasks" on public.course_tasks;
create policy "Anyone can view course tasks" on public.course_tasks for select using (exists (select 1 from public.courses c where c.id = course_id));

-- One recorded vote per account and target; old RPCs allowed unlimited votes.
create table if not exists public.question_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  primary key (user_id, question_id)
);
alter table public.question_votes enable row level security;
revoke all on public.question_votes from public, anon, authenticated;
create or replace function public.upvote_question(qid uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); total integer;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  if not exists (select 1 from public.questions q where q.id = qid and (q.category is distinct from 'Feedback' or q.user_id = uid or exists (select 1 from public.profiles p where p.id = uid and p.is_staff))) then return null; end if;
  insert into public.question_votes(user_id, question_id) values (uid, qid) on conflict do nothing;
  if found then
    update public.questions set upvotes = coalesce(upvotes, 0) + 1 where id = qid;
  end if;
  select upvotes into total from public.questions where id = qid;
  return total;
end;
$$;
revoke all on function public.upvote_question(uuid) from public, anon;
grant execute on function public.upvote_question(uuid) to authenticated;

create table if not exists public.answer_votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  answer_id uuid not null references public.answers(id) on delete cascade,
  primary key (user_id, answer_id)
);
alter table public.answer_votes enable row level security;
revoke all on public.answer_votes from public, anon, authenticated;
create or replace function public.upvote_answer(aid uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); total integer;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  if not exists (select 1 from public.answers a join public.questions q on q.id = a.question_id where a.id = aid and (q.category is distinct from 'Feedback' or q.user_id = uid or exists (select 1 from public.profiles p where p.id = uid and p.is_staff))) then return null; end if;
  insert into public.answer_votes(user_id, answer_id) values (uid, aid) on conflict do nothing;
  if found then
    update public.answers set upvotes = coalesce(upvotes, 0) + 1 where id = aid;
  end if;
  select upvotes into total from public.answers where id = aid;
  return total;
end;
$$;
revoke all on function public.upvote_answer(uuid) from public, anon;
grant execute on function public.upvote_answer(uuid) to authenticated;

-- Enforce the community text filter on direct API writes as well as UI writes.
create or replace function public.guard_community_text()
returns trigger language plpgsql set search_path = '' as $$
declare content_text text;
begin
  content_text := to_jsonb(new)->>TG_ARGV[0];
  if length(trim(coalesce(content_text,''))) = 0 or length(content_text) > 4000 then
    raise exception 'Post must contain between 1 and 4000 characters';
  end if;
  if content_text ~* '(^|[^[:alnum:]_])(fuck|fucking|fucker|motherfucker|shit|bullshit|bitch|bitches|asshole|assholes|cunt|dick|dickhead|pussy|nigger|nigga|faggot|fag|retard|retarded|spic|wetback|chink|kike|whore|slut|kys)([^[:alnum:]_]|$)' then
    raise exception 'Please keep this space kind and supportive';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_community_text on public.questions;
create trigger guard_community_text before insert or update of question on public.questions
for each row execute function public.guard_community_text('question');
drop trigger if exists guard_community_text on public.answers;
create trigger guard_community_text before insert or update of answer on public.answers
for each row execute function public.guard_community_text('answer');
drop trigger if exists guard_community_text on public.community_posts;
create trigger guard_community_text before insert or update of content on public.community_posts
for each row execute function public.guard_community_text('content');

-- A private document row must not point to another person's object. Storage
-- RLS already checks ownership too; this prevents misleading metadata.
drop policy if exists "Users can insert own documents" on public.user_documents;
create policy "Users can insert own documents" on public.user_documents for insert to authenticated with check (
  user_id = auth.uid() and split_part(storage_path, '/', 1) = auth.uid()::text
);
drop policy if exists "Users can update own documents" on public.user_documents;
create policy "Users can update own documents" on public.user_documents for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid() and split_part(storage_path, '/', 1) = auth.uid()::text);

-- Delete real files through Storage API first. SQL must NEVER remove
-- storage.objects metadata: that orphans the underlying private files.
create or replace function public.delete_account()
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  if exists (select 1 from storage.objects where bucket_id = 'documents' and split_part(name, '/', 1) = uid::text) then
    raise exception 'Document files remain. Please retry account deletion.';
  end if;
  update public.community_posts set display_name = 'Deleted user' where user_id = uid;
  update public.questions set asked_by = 'Deleted user' where user_id = uid;
  update public.answers set answered_by = 'Deleted user' where user_id = uid;
  delete from auth.users where id = uid;
end;
$$;
revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

-- Provider usage is bounded in the database, across all edge instances.
-- Only keyed hashes and counters are stored; no raw IPs, prompts, or audio.
create table if not exists public.casey_usage (
  bucket text primary key,
  requests integer not null default 0,
  expires_at timestamptz not null
);
alter table public.casey_usage enable row level security;
revoke all on public.casey_usage from public, anon, authenticated;
create index if not exists casey_usage_expires_idx on public.casey_usage(expires_at);

create or replace function public.consume_casey_quota(actor text, signed_in boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  day_key text := to_char(timezone('UTC', now()), 'YYYY-MM-DD');
  minute_key text := to_char(timezone('UTC', now()), 'YYYY-MM-DD-HH24-MI');
  keys text[];
  limits integer[];
  used integer;
  i integer;
begin
  if actor !~ '^[a-f0-9]{64}$' then raise exception 'Invalid actor'; end if;
  keys := array[actor || ':minute:' || minute_key, actor || ':day:' || day_key, 'global:day:' || day_key];
  limits := array[case when signed_in then 12 else 6 end, case when signed_in then 150 else 40 end, 1000];
  delete from public.casey_usage where expires_at < now();
  for i in 1..3 loop
    insert into public.casey_usage(bucket, requests, expires_at)
      values (keys[i], 1, now() + interval '2 days')
      on conflict (bucket) do update set requests = public.casey_usage.requests + 1
      where public.casey_usage.requests < limits[i]
      returning requests into used;
    if not found then return false; end if;
  end loop;
  return true;
end;
$$;
revoke all on function public.consume_casey_quota(text, boolean) from public, anon, authenticated;
grant execute on function public.consume_casey_quota(text, boolean) to service_role;

-- Keep private uploads bounded and typed.
update storage.buckets set public = false, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/heic','image/heif']
where id = 'documents';

commit;
