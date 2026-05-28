/**
 * Reads Adalo CSV exports and generates a SQL migration file.
 * The SQL can be pasted directly into Supabase SQL Editor (runs as superuser).
 *
 * Usage:
 *   node scripts/generate-migration-sql.mjs
 *
 * Output: scripts/migrate-data.sql
 */

import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';

const CSV_DIR = '/Users/tianyievansgu/Downloads';

function readCSV(filename) {
  const raw = readFileSync(`${CSV_DIR}/${filename}`, 'utf-8');
  return parse(raw, { columns: true, skip_empty_lines: true, relax_column_count: true });
}

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  const s = String(val).trim();
  if (!s) return 'NULL';
  return `'${s.replace(/'/g, "''")}'`;
}

function escBool(val) {
  return val === 'TRUE' || val === true ? 'TRUE' : 'FALSE';
}

function escInt(val) {
  if (!val || !String(val).trim()) return 'NULL';
  const n = parseInt(String(val).trim());
  return isNaN(n) ? 'NULL' : String(n);
}

function escFloat(val) {
  if (!val || !String(val).trim()) return 'NULL';
  const n = parseFloat(String(val).trim());
  return isNaN(n) ? 'NULL' : String(n);
}

function parseLatLong(raw) {
  if (!raw || !raw.trim()) return { latitude: 'NULL', longitude: 'NULL' };
  const cleaned = raw.replace(/°/g, '').replace(/[NnSsEeWw]/g, '').replace(/–/g, '-').trim();
  const parts = cleaned.split(/[,\s]+/).filter(Boolean).map(Number);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { latitude: String(parts[0]), longitude: String(parts[1]) };
  }
  return { latitude: 'NULL', longitude: 'NULL' };
}

function buildTagsArray(row) {
  const tags = [];
  if (row['Service Type 1']?.trim()) tags.push(row['Service Type 1'].trim());
  if (row['Service Type 2']?.trim()) tags.push(row['Service Type 2'].trim());
  if (row['Service Type 3']?.trim()) tags.push(row['Service Type 3'].trim());
  if (tags.length === 0) return "'{}'";
  return `ARRAY[${tags.map(t => esc(t)).join(', ')}]`;
}

function isProductionEvent(row) {
  const text = [
    row['Event Name'],
    row['Description'],
    row['Location'],
    row['Instructor / Host'],
  ].join(' ').toLowerCase();
  return !/\b(example|test)\b/.test(text);
}

let sql = '';

function emit(line) {
  sql += line + '\n';
}

// ─── HEADER ────────────────────────────────────────────────────
emit('-- ============================================================');
emit('-- FreePass Data Migration — Generated from Adalo CSV exports');
emit(`-- Generated: ${new Date().toISOString()}`);
emit('-- Run in: Supabase Dashboard > SQL Editor > New Query');
emit('-- ============================================================');
emit('');
emit('BEGIN;');
emit('');

// ─── CREATE MISSING TABLES ─────────────────────────────────────
emit('-- Create missing tables if they do not exist');
emit('');
emit(`CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  course_type text,
  web_link text,
  video_link text,
  in_learning_academy boolean DEFAULT false,
  is_hidden boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  display_order int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);`);
emit('');
emit(`CREATE TABLE IF NOT EXISTS public.course_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  sort_order float,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);`);
emit('');
emit(`CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  category text,
  upvotes int DEFAULT 0,
  is_faq boolean DEFAULT false,
  asked_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);`);
emit('');
emit(`CREATE TABLE IF NOT EXISTS public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  answer text NOT NULL,
  answered_by text,
  upvotes int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);`);
emit('');

// Enable RLS + policies (idempotent)
emit('ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;');
emit('ALTER TABLE public.course_tasks ENABLE ROW LEVEL SECURITY;');
emit('ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;');
emit('ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;');
emit('');
emit(`DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='courses' AND policyname='Anyone can view courses') THEN
    CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='course_tasks' AND policyname='Anyone can view course tasks') THEN
    CREATE POLICY "Anyone can view course tasks" ON public.course_tasks FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='questions' AND policyname='Anyone can view questions') THEN
    CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='questions' AND policyname='Authenticated users can ask questions') THEN
    CREATE POLICY "Authenticated users can ask questions" ON public.questions FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='answers' AND policyname='Anyone can view answers') THEN
    CREATE POLICY "Anyone can view answers" ON public.answers FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='answers' AND policyname='Authenticated users can answer') THEN
    CREATE POLICY "Authenticated users can answer" ON public.answers FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;`);
emit('');

// ─── CREATE INDEXES ────────────────────────────────────────────
emit('CREATE INDEX IF NOT EXISTS idx_course_tasks_course_id ON public.course_tasks(course_id);');
emit('CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);');
emit('');

// ─── CLEAR EXISTING DATA ──────────────────────────────────────
emit('-- Clear existing data (order matters for FK constraints)');
emit('DELETE FROM public.answers;');
emit('DELETE FROM public.questions;');
emit('DELETE FROM public.course_tasks;');
emit('DELETE FROM public.courses;');
emit('DELETE FROM public.saved_resources;');
emit('DELETE FROM public.resources;');
emit('DELETE FROM public.resource_categories;');
emit('DELETE FROM public.events;');
emit('');

// ─── RESOURCE CATEGORIES ──────────────────────────────────────
console.log('Reading Resource_Type.csv...');
const catRows = readCSV('Resource_Type.csv');
emit(`-- Resource Categories (${catRows.length} rows)`);
catRows.filter(r => r.Name?.trim()).forEach((r, i) => {
  emit(`INSERT INTO public.resource_categories (name, sort_order) VALUES (${esc(r.Name)}, ${i + 1});`);
});
emit('');

// ─── RESOURCES ─────────────────────────────────────────────────
console.log('Reading FreePass_Resources (1).csv...');
const resRows = readCSV('FreePass_Resources (1).csv');
const validRes = resRows.filter(r => r['Company Name']?.trim() && r['Draft?'] !== 'TRUE');
emit(`-- Resources (${validRes.length} non-draft rows)`);
validRes.forEach(r => {
  const { latitude, longitude } = parseLatLong(r['Lat Long']);
  const hours = (r['Hours'] || r['Hours of Service'] || '').trim() || null;
  emit(`INSERT INTO public.resources (name, description, address, city, state, zip_code, phone, email, website, hours, latitude, longitude, is_published, tags) VALUES (${esc(r['Company Name'])}, ${esc(r['Text Description'])}, ${esc(r['LOCATION'])}, 'Philadelphia', 'PA', ${esc(r['Zip Code'])}, ${esc(r['Phone Number'])}, ${esc(r['Main Email'])}, ${esc(r['Web Address'])}, ${esc(hours)}, ${latitude}, ${longitude}, TRUE, ${buildTagsArray(r)});`);
});
emit('');

// ─── EVENTS ────────────────────────────────────────────────────
console.log('Reading Events.csv...');
const evtRows = readCSV('Events.csv');
const validEvt = evtRows.filter(r => r['Event Name']?.trim() && r['Start Time']).filter(isProductionEvent);
emit(`-- Events (${validEvt.length} rows)`);
validEvt.forEach(r => {
  emit(`INSERT INTO public.events (title, description, location, instructor, event_date, end_date, is_published) VALUES (${esc(r['Event Name'])}, ${esc(r['Description'])}, ${esc(r['Location'])}, ${esc(r['Instructor / Host'])}, ${esc(r['Start Time'])}, ${esc(r['End Time'])}, TRUE);`);
});
emit('');

// ─── COURSES ───────────────────────────────────────────────────
console.log('Reading Courses.csv...');
const crsRows = readCSV('Courses.csv');
const validCrs = crsRows.filter(r => r['Course Name']?.trim());
emit(`-- Courses (${validCrs.length} rows)`);
validCrs.forEach(r => {
  emit(`INSERT INTO public.courses (name, description, course_type, web_link, video_link, in_learning_academy, is_hidden, is_featured, display_order) VALUES (${esc(r['Course Name'])}, ${esc(r['Course Description'])}, ${esc(r['Course Type'])}, ${esc(r['Web Link'])}, ${esc(r['Video Link'])}, ${escBool(r['[ Learning Academy? ]'])}, ${escBool(r['Keep Hidden?'])}, ${escBool(r['Featured Course?'])}, ${escInt(r['Display Order'])});`);
});
emit('');

// ─── COURSE TASKS ──────────────────────────────────────────────
console.log('Reading Course_Tasks.csv...');
const taskRows = readCSV('Course_Tasks.csv');
const validTasks = taskRows.filter(r => r['Name']?.trim() && r['Course']?.trim());
emit(`-- Course Tasks (${validTasks.length} rows)`);
validTasks.forEach(r => {
  const courseName = r['Course'].trim().replace(/'/g, "''");
  emit(`INSERT INTO public.course_tasks (name, description, sort_order, course_id) VALUES (${esc(r['Name'])}, ${esc(r['Description'])}, ${escFloat(r['Order'])}, (SELECT id FROM public.courses WHERE name = '${courseName}' LIMIT 1));`);
});
emit('');

// ─── QUESTIONS ─────────────────────────────────────────────────
console.log('Reading User_Questions.csv...');
const qRows = readCSV('User_Questions.csv');
const validQs = qRows.filter(r => r['Question']?.trim());
emit(`-- Questions (${validQs.length} rows)`);
validQs.forEach(r => {
  emit(`INSERT INTO public.questions (question, category, upvotes, is_faq, asked_by) VALUES (${esc(r['Question'])}, ${esc(r['Question Category'])}, ${escInt(r['Upvotes'])}, ${escBool(r['FAQ?'])}, ${esc(r['User Asking'])});`);
});
emit('');

// ─── ANSWERS ───────────────────────────────────────────────────
console.log('Reading Answers.csv...');
const aRows = readCSV('Answers.csv');
// Skip test entries
const validAs = aRows.filter(r =>
  r['Answer Description']?.trim() &&
  r['Belongs to Question']?.trim() &&
  r['User'] !== 'testuser@example.com'
);
emit(`-- Answers (${validAs.length} rows, excluding test entries)`);
validAs.forEach(r => {
  const questionText = r['Belongs to Question'].trim().replace(/'/g, "''");
  emit(`INSERT INTO public.answers (answer, question_id, answered_by, upvotes) VALUES (${esc(r['Answer Description'])}, (SELECT id FROM public.questions WHERE question = '${questionText}' LIMIT 1), ${esc(r['User'])}, ${escInt(r['Upvotes'])});`);
});
emit('');

// ─── DROP OLD UPPERCASE TABLES ─────────────────────────────────
emit('-- Drop old Adalo-imported uppercase tables (data now in lowercase tables)');
emit('DROP TABLE IF EXISTS public."Courses" CASCADE;');
emit('DROP TABLE IF EXISTS public."Events" CASCADE;');
emit('DROP TABLE IF EXISTS public."Resources" CASCADE;');
emit('');

// ─── VERIFY ────────────────────────────────────────────────────
emit('-- Verification counts');
emit("SELECT 'resource_categories' AS tbl, count(*) FROM public.resource_categories");
emit('UNION ALL');
emit("SELECT 'resources', count(*) FROM public.resources");
emit('UNION ALL');
emit("SELECT 'events', count(*) FROM public.events");
emit('UNION ALL');
emit("SELECT 'courses', count(*) FROM public.courses");
emit('UNION ALL');
emit("SELECT 'course_tasks', count(*) FROM public.course_tasks");
emit('UNION ALL');
emit("SELECT 'questions', count(*) FROM public.questions");
emit('UNION ALL');
emit("SELECT 'answers', count(*) FROM public.answers;");
emit('');
emit('COMMIT;');

// Write the output
const outPath = new URL('./migrate-data.sql', import.meta.url).pathname;
writeFileSync(outPath, sql);
console.log(`\n✅ Generated ${outPath}`);
console.log(`   ${sql.split('\n').length} lines of SQL`);
console.log(`\nNext step: Copy the contents of migrate-data.sql and run in Supabase SQL Editor.`);
