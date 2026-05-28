# FreePass Production Readiness Handoff

Last updated: 2026-05-28

This document captures the production-readiness audit and fix context for future agents working on the Hack4Impact x FreePass app. It intentionally separates code fixes from live Supabase/data work so future work does not accidentally claim completion when content or deployment is still required.

## Current Summary

The app is substantially closer to production-ready, but still needs client/content verification before final shipment. Code fixes have been made for the most visible broken flows: resource search/category matching, map web build failure, misleading resource/event submission states, onboarding persistence, Fountain Fund link, budget input visibility, and missing community board schema.

The production Supabase patch has already been applied to project `ihlhrorrxcwsxnxqufpb` through the configured Supabase MCP server.

Post-patch verification:

- `community_posts` table exists.
- `resources.last_verified` column exists.
- Known filler events with `example` or `test` titles were removed.
- One resource still has `category_id = null`: `Community Behavioral Health`.

## Code Changes Made

### Resource Search, Categories, And Details

- Added `lib/resource-utils.ts`.
- Search now checks resource name, description, address, city, state, zip, phone, email, website, hours, category name, and tags.
- Category browsing now matches resources by `category_id` when present and by tags when imported Adalo data did not populate `category_id`.
- Resource detail pages use `maybeSingle()` and show actionable failure text for missing/unpublished/deleted resources instead of only a generic not-found state.
- Staff draft resource routing now goes to `/listing-draft/[id]` instead of the published listing route.

Key files:

- `lib/resource-utils.ts`
- `hooks/use-resources.ts`
- `app/quick-list.tsx`
- `app/category-search.tsx`
- `app/resource-types.tsx`
- `app/listing/[id].tsx`
- `app/listing-draft/[id].tsx`
- `app/staff-view.tsx`

### Map And Near Me

- `app/map-view.tsx` no longer statically imports `react-native-maps` on web.
- Web export now succeeds.
- Native platforms still load `react-native-maps`.
- If coordinates are missing, the screen now clearly says map pins are unavailable and keeps the searchable resource list plus directions actions.

Remaining validation:

- Test native map rendering on iOS/Android device or simulator with location permission.

### Event Uploads And Event Display

- Event creation now requires a signed-in user and gives explicit review/pending messaging.
- Event detail uses `maybeSingle()` and better error state text.
- Event calendar and calendar view now display load errors instead of silently showing empty content.
- Known filler/test/example events were removed from the generated migration SQL and blocked in future Adalo import scripts.

Key files:

- `app/add-event.tsx`
- `hooks/use-events.ts`
- `app/event/[id].tsx`
- `app/(drawer)/event-calendar.tsx`
- `app/calendar-view.tsx`
- `scripts/migrate-adalo-data.mjs`
- `scripts/generate-migration-sql.mjs`
- `scripts/migrate-data.sql`

Remaining validation:

- Client must provide current/future event data. Before cleanup, live events were all in 2025 and stale as of 2026-05-28.

### Resource Submission

- Resource submission now requires sign-in.
- Failed submission shows the actual Supabase error message instead of a vague generic error.
- Submit button now shows a submitting state.

Key file:

- `app/add-resource.tsx`

Deployment dependency:

- Insert policy for draft resources is included in `scripts/production-readiness-fixes.sql` and has been applied to live Supabase.

### Community Board

- Added `community_posts` to `supabase-schema.sql`.
- Added read/insert/delete RLS policies in both schema and production patch.
- Community board screens now surface Supabase load/post errors.

Key files:

- `app/community-board.tsx`
- `app/(drawer)/message-board.tsx`
- `supabase-schema.sql`
- `scripts/production-readiness-fixes.sql`

### Fountain Fund Link

- Updated link to `https://www.fountainfund.org/`.

Key file:

- `app/fountain-fund.tsx`

### Budget Worksheet

- Improved input contrast, cursor color, selection color, line height, and large budget input visibility.

Key file:

- `app/(drawer)/budget.tsx`

### Onboarding And User Data

- Survey answers now store JSON values correctly instead of stringifying them before inserting into a `jsonb` column.
- Survey answers are loaded back into the user profile on session initialization/auth change.
- Zip code answer updates the profile zip code when present.

Key file:

- `contexts/user-context.tsx`

### Casey AI

- Casey now reads `EXPO_PUBLIC_GEMINI_API_KEY`.
- Missing Gemini config produces a clear message telling the user to use resource search or ask staff.
- Resource context building now handles null phone/address/description fields without passing `"null"` into prompts.
- `.env.example` now documents Gemini instead of Groq.

Key files:

- `app/(drawer)/casey.tsx`
- `.env.example`

Production caveat:

- `EXPO_PUBLIC_GEMINI_API_KEY` is bundled into the client. For production, restrict the key appropriately or move Gemini calls behind a backend proxy.

### Courses And Loan Inquiry

- Course tasks now render `name`, matching the Supabase `course_tasks` schema.
- Loan inquiry video placeholder now explicitly says the video is not configured in FreePass yet and directs users to Fountain Fund for current materials.

Key files:

- `app/course/[id].tsx`
- `app/loan-inquiry.tsx`

## Supabase Changes

The file `scripts/production-readiness-fixes.sql` was added and applied to project `ihlhrorrxcwsxnxqufpb`.

It does the following:

- Adds `public.resources.last_verified`.
- Backfills `public.resources.category_id` from tags when tags match category names.
- Deletes known filler events:
  - `Example resource 2`
  - `Example Resource 3`
  - `Collecting Resources (test)`
- Adds insert policies for signed-in users submitting draft resources/events.
- Creates `public.community_posts`.
- Enables RLS and policies for community posts.

Verification after applying:

```sql
select count(*) from public.resources where category_id is null;
-- 1

select to_regclass('public.community_posts') is not null;
-- true

select count(*) from public.events
where title ilike '%example%' or title ilike '%test%';
-- 0

select exists (
  select 1
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'resources'
    and column_name = 'last_verified'
);
-- true
```

Remaining data cleanup:

- Categorize `Community Behavioral Health`, which currently has no tags and no category:
  - Name: `Community Behavioral Health`
  - Phone: `(215) 413-3100`
  - Address: `801 Market St, Philadelphia, PA 19107, USA`
  - Website: `cbhphilly.org/contact-list/`

Do not auto-categorize this without client/staff confirmation.

## Remaining Blockers And Questions

### Client/Data Required

- Verify resource phone numbers, addresses, descriptions, websites, and hours. The app can display and flag freshness, but it cannot know whether records are factually current.
- Add current/future events. The old live data was stale.
- Decide the correct category/tag for `Community Behavioral Health`.
- Provide actual loan inquiry video/link if that feature is expected to be in-app.
- Confirm whether submitted resources/events should stay draft until staff review or publish automatically.

### Product/Engineering Required

- Chat is still local-only. It clearly tells users messages do not persist. A real chat feature needs schema/API/product requirements.
- Casey currently calls Gemini from the client. Production should ideally use a backend proxy if abuse, quota, or key exposure is a concern.
- Native map behavior still needs iOS/Android device verification.
- Old Adalo parity cannot be fully proven without access to the original Adalo app/feature list.

## Checks Run

These checks passed after the changes:

```bash
npx tsc --noEmit
npm run lint
npx expo export --platform web --output-dir /tmp/freepass-export
```

There is no `test` script in `package.json`.

## MCP Context

Supabase MCP was configured for the project:

```bash
codex mcp add supabase --url "https://mcp.supabase.com/mcp?project_ref=ihlhrorrxcwsxnxqufpb"
codex mcp login supabase
```

The active session could not hot-load the MCP server, so a fresh `codex exec` sub-session was used to apply the SQL through the Supabase MCP. Future sessions should see the configured server normally.

## Notes For Future Agents

- Do not commit `.env`; it is gitignored and contains environment-specific values.
- Do not invent resource categories, phone numbers, addresses, events, or videos.
- Use `scripts/production-readiness-fixes.sql` as the record of applied production DB changes.
- Keep changes small and verify after each step.
- If adding real backend chat, define schema/RLS first; do not continue relying on local-only messages.
