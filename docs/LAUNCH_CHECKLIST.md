# FreePass Launch Checklist

Last updated: 2026-09-16 (build 8 resubmission)

## Status (2026-09-16) — build 8 submitted with the rejection fixes

- ✅ Rejection fixes (PR #4, merged 2026-09-10) verified on main: tsc/lint
  clean; consent notice names Google/Groq/OpenAI + what is sent + purpose,
  gates the composer, revocable in Account → Privacy; all Supabase requests
  time-boxed (15s / 60s storage) with inline login retry.
- ✅ Approved privacy policy text (freepass-privacy PR #1) deployed to
  https://freepass-privacy.vercel.app — the hosted page had not been
  redeployed after the text change.
- ✅ App Review notes rewritten to describe both fixes and where to find the
  consent notice (Home → Ask Casey, guest OK).
- ✅ Supabase confirmed ACTIVE_HEALTHY; demo login re-verified (HTTP 200).
- ✅ EAS build 8 (e5d1cf9f) started with --auto-submit; a script attaches it
  to version 1.0 and files the review submission once Apple finishes
  processing.
- ⚠️ Supabase Management API token (`SUPABASE_ACCESS_TOKEN`) now returns 401
  — revoked/expired. Disk IO and pause state can only be checked in the
  dashboard until a new PAT is issued.
- ❌ Still human: upgrade Supabase to Pro + check Reports → Disk IO (the
  reviewer's login hang was the paused/IO-starved DB); optionally reply in
  the Resolution Center thread pointing at the new build.

## Status (2026-09-10) — build 7 REJECTED, resubmission needed

Apple rejected 1.0 (build 7) on 2026-09-10 (submission
`03547123-6c61-4609-b30b-03229ae33198`, iPhone 17 Pro Max / iOS 26.6):

- **5.1.1(i) / 5.1.2(i)** — data sent to third-party AI without in-app
  disclosure + consent. ✅ Fixed in code: Casey now shows a consent notice
  (what is sent, to Google/Groq/OpenAI, why) before any AI call; declining
  keeps the rest of the app usable; revocable in Account → Privacy. Privacy
  policy text updated (`docs/PRIVACY_POLICY_DRAFT.md`; matching change in the
  `freepass-privacy` repo must be merged/deployed so the hosted URL matches).
- **2.1(a)** — indefinite loading on login. The Supabase project had
  auto-paused (2026-09-09) and was out of Disk IO budget. ✅ Fixed in code:
  every Supabase request is time-boxed, login/bootstrap have explicit
  timeouts, login failures show an inline error with Retry, and a
  cold-start deadlock in the auth listener was removed.
- ❌ Human steps before resubmitting — two separate Supabase problems, each
  with its own fix:
  1. **Auto-pause (inactivity):** resume the project now, then **upgrade to
     Pro**, which removes Free-plan auto-pausing. A keep-alive ping only
     masks it on Free and does nothing for the next item.
  2. **Disk IO budget exhausted:** check Reports → Disk IO in the dashboard.
     Neither Pro nor a keep-alive restores IO on its own — the budget scales
     with the compute add-on size, so raise the compute tier and/or cut the
     IO-heavy load (large scans, missing indexes) before review.
  Then: verify the demo login works; merge + deploy the privacy-policy
  change; build with EAS (`--auto-submit`); in the Resolution Center reply
  describing the consent screen (Casey → first open) and the login
  hardening; update App Review notes to mention the consent screen appears
  on first use of Casey.

## Status (2026-08-10, evening)

- ✅ iOS build 7 (all fixes) built AND submitted to TestFlight
  (build 383b91e3; submission dc8ecf73 finished 1:24 PM)
- ✅ **DB migration APPLIED and verified** via Management API: documents
  bucket private, delete_account/upvote functions live, reports +
  blocked_users tables with correct RLS, anonymous posting closed.
  Moderation smoke-tested end to end against prod (guest report → staff
  read → cleanup).
- ✅ Supabase auth config fixed: site_url was localhost:3000 (confirmation
  links dead-ended) → now fountainfund.org; recovery email now sends the
  OTP code the in-app flow expects. Email confirmation confirmed ON.
- ✅ Signing credentials + .env restored into this workspace (gitignored)
- ✅ ASC listing: support URL, draft description, and keywords set via API
  (review/edit wording in App Store Connect before submitting)
- ✅ Live DB: 103 published resources; 1 uncategorized
  (`Community Behavioral Health`); **no future events — newest is Oct 2025**
- ❌ Privacy policy: fountainfund.org has NO existing policy (checked
  footer + /privacy-policy, /privacy, /legal, /terms — all 404). The draft
  in docs/PRIVACY_POLICY_DRAFT.md must be approved and hosted; Apple
  requires a live URL.
- ✅ Screenshots: 6 iPhone (6.9") + 6 iPad (13") captured from the Release
  simulator build and uploaded to ASC via API (UPLOAD_COMPLETE). Capturing
  them also E2E-validated the new build's guest flow, resources, Casey,
  courses, and budget screens.
- ✅ Build 7 attached to version 1.0
- ✅ Age rating questionnaire answered via API (honest answers + 17+
  override; displays as 18+ under Apple's 2025 tiers)
- ✅ Categories set: Lifestyle (primary) + Education (secondary)
- ✅ App Review demo account created and login-verified:
  applereview@freepass-demo.app / ReviewFreePass#2026
- ❌ Review contact details: blocked on a contact PHONE number (+1 format)
- ❌ App Privacy nutrition labels: NO public API exists — must be filled in
  the ASC web UI (~10 min; answers documented in the launch summary)
- ❌ Privacy policy URL: still not found on fountainfund.org (all standard
  paths 404) — need the exact published URL
- ⚠️ **CRITICAL: Supabase free tier auto-paused twice in one week.** A
  paused DB takes the whole app down for real users. Upgrade the project
  to Pro (or configure a keep-alive ping) BEFORE the app goes live.
- Decisions made: 17+ age rating OK; keep iPad support (→ iPad screenshots
  required)

This is the single source of truth for what must happen before the app goes
live to real users. Code changes from the August 2026 fix pass are already in
this branch; the items below are the **deployment and decision steps that
code alone cannot do**.

## 1. Apply the database migration (REQUIRED — app features depend on it)

Run `scripts/production-launch-fixes.sql` against project
`ihlhrorrxcwsxnxqufpb` (Supabase Dashboard → SQL Editor, or via the Supabase
MCP once re-authenticated). It is idempotent.

The shipped app code now assumes this migration. Until it is applied:

- Account deletion (`rpc delete_account`) fails.
- Report/block features fail (no `reports` / `blocked_users` tables).
- New questions/answers/posts fail to insert (client now sends `user_id`,
  and the tightened policies require it).
- Upvotes fail (no `upvote_question` / `upvote_answer` functions).
- Staff View shows nothing for staff (no `is_staff` column/policies).

After applying, verify:

```sql
select public from storage.buckets where id = 'documents';        -- false
select count(*) from pg_policies where tablename = 'reports';     -- 2
select is_staff from public.profiles limit 1;                     -- runs
select proname from pg_proc where proname in
  ('delete_account','upvote_question','upvote_answer');           -- 3 rows
```

Then flag actual staff members:

```sql
update public.profiles set is_staff = true where email = 'staff@example.org';
```

## 2. Supabase dashboard settings (REQUIRED)

- **Auth → Email templates → Reset Password**: include the OTP code in the
  body (add `{{ .Token }}`), e.g. "Your FreePass reset code is {{ .Token }}".
  The in-app forgot-password flow asks the user to type this code.
- **Auth → Email templates → Confirm signup**: confirm it's sensible; the
  app now tells users to tap the link before logging in.
- Confirm whether **email confirmation** is ON (the app supports both, but
  the duplicate-email detection path assumes ON).

## 3. App Store Connect (REQUIRED — needs Fountain Fund input)

- **Privacy policy URL**: review/approve `docs/PRIVACY_POLICY_DRAFT.md`,
  host it (fountainfund.org page is fine), and set the URL in ASC. This is a
  hard App Review requirement given the data collected (IDs, survey answers,
  location, voice, AI chat).
- **Support URL**: the app links to fountainfund.org; put the same in ASC.
- **App Privacy nutrition labels**: declare collection of contact info,
  user content (photos/docs, messages), identifiers, precise location,
  audio; sharing with Google (Gemini), Groq (chat fallback + Whisper), and
  OpenAI (text-to-speech) for app functionality — all three must be listed.
  No tracking SDKs exist, so declare "Data Not Used for Tracking".
- **Age rating**: recommend 17+ given the unfiltered-topic AI assistant.
- **iPad**: either test on iPad (screenshots required) or set
  `ios.supportsTablet: false` in app.json before the next build.

## 4. Content decisions (Fountain Fund)

- `app/loan-inquiry.tsx` was rewritten to state only facts verified against
  fountainfund.org/questions (Aug 2026): loans are FOR people with a record
  of past incarceration; individual terms; link out for current numbers.
  The previous screen's terms (including a bullet requiring "no involvement
  with the criminal legal system", "Form 12B", vehicle rules, loan tiers)
  could not be verified anywhere and were removed. **If any of that was
  real Philadelphia-program policy, Fountain Fund should supply approved
  copy and it can go back in.**
- `app/money-smart.tsx` / learning academy: the claim that an FDIC Money
  Smart certificate is REQUIRED before loan approval is not on the public
  FAQ, so it now says "may ask… check with staff". Confirm the real policy.
- Testimonials in `app/fountain-fund.tsx` were verified against
  fountainfund.org/impact (Charisse Becnel, Dormen Lisby — both real) and
  kept, with a source note. Confirm Fountain Fund is happy with in-app use.
- Events table: live data was stale (all 2025). Add current events, or the
  calendar ships empty.
- Resource data: phone/address/hours accuracy still needs a staff pass;
  `Community Behavioral Health` still needs a category.

## 5. Remaining engineering follow-ups (not blockers, do soon)

- **LLM proxy**: Gemini/Groq keys are still `EXPO_PUBLIC_*` (bundled in the
  IPA, extractable, shared quota). The right fix is a Supabase Edge Function
  proxy with per-user rate limiting. Until then: set per-day quota caps and
  bundle-ID restrictions on the Gemini key in Google Cloud console, and
  billing alerts on both providers.
- **Session storage**: Supabase session sits in AsyncStorage (plaintext).
  Consider the SecureStore + AES pattern.
- **expo-av → expo-audio**: expo-av is deprecated and removed in SDK 55;
  Casey's recording path needs migrating before the next SDK upgrade.
- **Release signing**: production builds/submissions only work from the one
  machine holding local credentials and the ASC key at an absolute path in
  `eas.json`. Move to EAS-managed credentials for bus-factor.
- Consider persisting Casey conversations across tab switches.

## 6. Pre-submission verification

```bash
npx tsc --noEmit          # passes
npx expo lint             # passes
npx expo-doctor           # 18/18
npx expo export --platform web --output-dir /tmp/freepass-export
# Maestro (appIds now match the real bundle id):
maestro test .maestro/
```

Manual device pass (iPhone, production-like build):
- Sign up → confirm email → log in → survey → Casey (with and without
  consent), voice input, crisis message shows the 988 card
- Documents: add/view/delete an ID photo; airplane-mode error states
- Community board: post, report, block; guest sees sign-in prompt
- Q&A: ask, answer, edit own, upvote; edit is absent on others' posts
- Account: password reset with emailed code; delete account end-to-end
  (verify storage objects are gone in the dashboard afterwards)
- Native map on a real device with location granted and denied
