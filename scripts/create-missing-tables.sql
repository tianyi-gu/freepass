-- ============================================================
-- Create missing tables: courses, course_tasks, questions, answers
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- COURSES
create table if not exists public.courses (
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

-- COURSE TASKS
create table if not exists public.course_tasks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  name text not null,
  description text,
  sort_order float,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- QUESTIONS
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  category text,
  upvotes int default 0,
  is_faq boolean default false,
  asked_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ANSWERS
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete cascade not null,
  answer text not null,
  answered_by text,
  upvotes int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- INDEXES
create index if not exists idx_course_tasks_course_id on public.course_tasks(course_id);
create index if not exists idx_answers_question_id on public.answers(question_id);

-- RLS
alter table public.courses enable row level security;
alter table public.course_tasks enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;

-- POLICIES
create policy "Anyone can view courses"
  on public.courses for select using (true);

create policy "Anyone can view course tasks"
  on public.course_tasks for select using (true);

create policy "Anyone can view questions"
  on public.questions for select using (true);

create policy "Authenticated users can ask questions"
  on public.questions for insert to authenticated with check (true);

create policy "Anyone can view answers"
  on public.answers for select using (true);

create policy "Authenticated users can answer"
  on public.answers for insert to authenticated with check (true);

-- TRIGGERS
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
