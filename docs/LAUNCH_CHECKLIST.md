# FreePass Launch Checklist

Last updated: 2026-08-10 (production-readiness fix pass)

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
  audio; sharing with Google (Gemini) and Groq for app functionality.
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
