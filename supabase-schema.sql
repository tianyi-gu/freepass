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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.survey_answers enable row level security;
alter table public.resource_categories enable row level security;
alter table public.resources enable row level security;
alter table public.events enable row level security;
alter table public.saved_resources enable row level security;

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

-- Events: everyone can read published
create policy "Anyone can view published events"
  on public.events for select using (is_published = true);

-- Saved resources: users manage their own
create policy "Users can view own saved resources"
  on public.saved_resources for select using (auth.uid() = user_id);
create policy "Users can save resources"
  on public.saved_resources for insert with check (auth.uid() = user_id);
create policy "Users can unsave resources"
  on public.saved_resources for delete using (auth.uid() = user_id);

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
