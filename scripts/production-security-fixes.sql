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
