/**
 * Migrate data from Adalo CSV exports into Supabase.
 *
 * Usage:
 *   node scripts/migrate-adalo-data.mjs
 *
 * Requires: .env with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 * (uses the service role key if SUPABASE_SERVICE_ROLE_KEY is set, otherwise anon key)
 */

import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config(); // load .env

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or key in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSV_DIR = '/Users/tianyievansgu/Downloads';

function readCSV(filename) {
  const raw = readFileSync(`${CSV_DIR}/${filename}`, 'utf-8');
  return parse(raw, { columns: true, skip_empty_lines: true, relax_column_count: true });
}

function parseLatLong(raw) {
  if (!raw || !raw.trim()) return { latitude: null, longitude: null };
  // Formats: "39.954214° N –75.167305° W" or "39.95710, -75.16240"
  const cleaned = raw.replace(/°/g, '').replace(/[NnSsEeWw]/g, '').replace(/–/g, '-').trim();
  const parts = cleaned.split(/[,\s]+/).filter(Boolean).map(Number);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { latitude: parts[0], longitude: parts[1] };
  }
  return { latitude: null, longitude: null };
}

function buildTags(row) {
  const tags = [];
  if (row['Service Type 1']?.trim()) tags.push(row['Service Type 1'].trim());
  if (row['Service Type 2']?.trim()) tags.push(row['Service Type 2'].trim());
  if (row['Service Type 3']?.trim()) tags.push(row['Service Type 3'].trim());
  return tags;
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

// ─── RESOURCE CATEGORIES ────────────────────────────────────────
async function migrateResourceCategories() {
  const rows = readCSV('Resource_Type.csv');
  console.log(`\n📦 Resource Categories: ${rows.length} rows`);

  // Clear existing
  await supabase.from('resource_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const records = rows.map((r, i) => ({
    name: r.Name?.trim(),
    sort_order: i + 1,
  })).filter(r => r.name);

  const { error } = await supabase.from('resource_categories').insert(records);
  if (error) console.error('  ❌ Error:', error.message);
  else console.log(`  ✅ Inserted ${records.length} categories`);
}

// ─── RESOURCES ──────────────────────────────────────────────────
async function migrateResources() {
  const rows = readCSV('FreePass_Resources (1).csv');
  console.log(`\n📦 Resources: ${rows.length} rows`);

  // Clear existing
  await supabase.from('saved_resources').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('resources').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Filter out drafts and rows without names
  const validRows = rows.filter(r => r['Company Name']?.trim() && r['Draft?'] !== 'TRUE');
  console.log(`  (${validRows.length} non-draft resources with names)`);

  const records = validRows.map(r => {
    const { latitude, longitude } = parseLatLong(r['Lat Long']);
    return {
      name: r['Company Name']?.trim(),
      description: r['Text Description']?.trim() || null,
      address: r['LOCATION']?.trim() || null,
      city: 'Philadelphia',
      state: 'PA',
      zip_code: r['Zip Code']?.trim() || null,
      phone: r['Phone Number']?.trim() || null,
      email: r['Main Email']?.trim() || null,
      website: r['Web Address']?.trim() || null,
      hours: (r['Hours'] || r['Hours of Service'] || '').trim() || null,
      latitude,
      longitude,
      is_published: true,
      tags: buildTags(r),
    };
  });

  // Insert in batches of 50
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    const { error } = await supabase.from('resources').insert(batch);
    if (error) {
      console.error(`  ❌ Error at batch ${i}:`, error.message);
    } else {
      console.log(`  ✅ Inserted batch ${i + 1}-${Math.min(i + 50, records.length)}`);
    }
  }
}

// ─── EVENTS ─────────────────────────────────────────────────────
async function migrateEvents() {
  const rows = readCSV('Events.csv');
  console.log(`\n📦 Events: ${rows.length} rows`);

  // Clear existing
  await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const records = rows
    .filter(r => r['Event Name']?.trim() && r['Start Time'])
    .filter(isProductionEvent)
    .map(r => ({
      title: r['Event Name']?.trim(),
      description: r['Description']?.trim() || null,
      location: r['Location']?.trim() || null,
      instructor: r['Instructor / Host']?.trim() || null,
      event_date: r['Start Time'],
      end_date: r['End Time'] || null,
      is_published: true,
    }));

  const { error } = await supabase.from('events').insert(records);
  if (error) console.error('  ❌ Error:', error.message);
  else console.log(`  ✅ Inserted ${records.length} events`);
}

// ─── COURSES ────────────────────────────────────────────────────
async function migrateCourses() {
  const rows = readCSV('Courses.csv');
  console.log(`\n📦 Courses: ${rows.length} rows`);

  // Clear existing
  const { error: delTasksErr } = await supabase.from('course_tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delTasksErr && !delTasksErr.message.includes('does not exist')) console.error('  ⚠️ Could not clear course_tasks:', delTasksErr.message);
  const { error: delErr } = await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr && !delErr.message.includes('does not exist')) console.error('  ⚠️ Could not clear courses:', delErr.message);

  const records = rows
    .filter(r => r['Course Name']?.trim())
    .map(r => ({
      name: r['Course Name']?.trim(),
      description: r['Course Description']?.trim() || null,
      course_type: r['Course Type']?.trim() || null,
      web_link: r['Web Link']?.trim() || null,
      video_link: r['Video Link']?.trim() || null,
      in_learning_academy: r['[ Learning Academy? ]'] === 'TRUE',
      is_hidden: r['Keep Hidden?'] === 'TRUE',
      is_featured: r['Featured Course?'] === 'TRUE',
      display_order: r['Display Order'] ? parseInt(r['Display Order']) || null : null,
    }));

  const { data, error } = await supabase.from('courses').insert(records).select('id, name');
  if (error) {
    console.error('  ❌ Error:', error.message);
    return {};
  }
  console.log(`  ✅ Inserted ${records.length} courses`);

  // Return a name→id map for course_tasks
  const courseMap = {};
  if (data) data.forEach(c => { courseMap[c.name] = c.id; });
  return courseMap;
}

// ─── COURSE TASKS ───────────────────────────────────────────────
async function migrateCourseTasks(courseMap) {
  const rows = readCSV('Course_Tasks.csv');
  console.log(`\n📦 Course Tasks: ${rows.length} rows`);

  const records = rows
    .filter(r => r['Name']?.trim() && r['Course'])
    .map(r => ({
      name: r['Name']?.trim(),
      description: r['Description']?.trim() || null,
      sort_order: r['Order'] ? parseFloat(r['Order']) : null,
      course_id: courseMap[r['Course']?.trim()] || null,
    }))
    .filter(r => r.course_id);

  if (records.length === 0) {
    console.log('  ⚠️ No matching courses found for tasks');
    return;
  }

  const { error } = await supabase.from('course_tasks').insert(records);
  if (error) console.error('  ❌ Error:', error.message);
  else console.log(`  ✅ Inserted ${records.length} course tasks`);
}

// ─── QUESTIONS & ANSWERS ────────────────────────────────────────
async function migrateQuestions() {
  const qRows = readCSV('User_Questions.csv');
  const aRows = readCSV('Answers.csv');
  console.log(`\n📦 Questions: ${qRows.length}, Answers: ${aRows.length}`);

  // Clear existing
  const { error: delAErr } = await supabase.from('answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delAErr && !delAErr.message.includes('does not exist')) console.error('  ⚠️', delAErr.message);
  const { error: delQErr } = await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delQErr && !delQErr.message.includes('does not exist')) console.error('  ⚠️', delQErr.message);

  const questionRecords = qRows
    .filter(r => r['Question']?.trim())
    .map(r => ({
      question: r['Question']?.trim(),
      category: r['Question Category']?.trim() || null,
      upvotes: parseInt(r['Upvotes']) || 0,
      is_faq: r['FAQ?'] === 'TRUE',
      asked_by: r['User Asking']?.trim() || null,
    }));

  const { data: insertedQs, error: qErr } = await supabase.from('questions').insert(questionRecords).select('id, question');
  if (qErr) {
    console.error('  ❌ Questions error:', qErr.message);
    return;
  }
  console.log(`  ✅ Inserted ${questionRecords.length} questions`);

  // Build question text → id map
  const qMap = {};
  if (insertedQs) insertedQs.forEach(q => { qMap[q.question] = q.id; });

  const answerRecords = aRows
    .filter(r => r['Answer Description']?.trim())
    .map(r => ({
      answer: r['Answer Description']?.trim(),
      question_id: qMap[r['Belongs to Question']?.trim()] || null,
      answered_by: r['User']?.trim() || null,
      upvotes: parseInt(r['Upvotes']) || 0,
    }))
    .filter(r => r.question_id); // Only answers with matching questions

  if (answerRecords.length > 0) {
    const { error: aErr } = await supabase.from('answers').insert(answerRecords);
    if (aErr) console.error('  ❌ Answers error:', aErr.message);
    else console.log(`  ✅ Inserted ${answerRecords.length} answers`);
  }
}

// ─── MAIN ───────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting Adalo → Supabase migration');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   Key type: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon'}`);

  await migrateResourceCategories();
  await migrateResources();
  await migrateEvents();
  const courseMap = await migrateCourses();
  await migrateCourseTasks(courseMap);
  await migrateQuestions();

  // Final counts
  console.log('\n📊 Final counts:');
  for (const table of ['resource_categories', 'resources', 'events', 'courses', 'course_tasks', 'questions', 'answers']) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`   ${table}: ❌ ${error.message}`);
    } else {
      console.log(`   ${table}: ${count} rows`);
    }
  }

  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
