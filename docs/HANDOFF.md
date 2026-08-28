# FreePass — Maintainer Handoff

Last updated: 2026-08-27. Written for a developer or team taking over
maintenance. Read this top to bottom once; afterwards the README covers
day-to-day commands and `docs/LAUNCH_CHECKLIST.md` tracks open launch items.

## 1. What this app is

FreePass is an iOS app (Expo/React Native) for people returning from
incarceration in Philadelphia, built for the nonprofit **The Fountain Fund**
(primary org contact: Michael, who owns the Apple Developer organization).
Users are often on older phones, prepaid data, or shared devices, and the
data involved (reentry status, health needs, ID photos) is unusually
sensitive — treat privacy regressions as launch blockers, not nits.

**Current status:** version 1.0 (build 7) was submitted to App Store review
on 2026-08-27 (`WAITING_FOR_REVIEW`). TestFlight has builds 1–7. Android has
never been configured.

## 2. Architecture

```
 iPhone app (Expo RN, this repo)
   │
   ├── Supabase project `ihlhrorrxcwsxnxqufpb`  (all app data)
   │     ├── Postgres + RLS  — resources, events, courses, Q&A, posts,
   │     │                     profiles, survey answers, documents metadata,
   │     │                     reports, blocked_users
   │     ├── Auth (email/password; email confirmation ON; OTP-code password reset)
   │     └── Storage bucket `documents` (PRIVATE) — user ID photos, per-user folders
   │
   ├── Google Gemini 2.5 Flash  — Casey chat (primary)
   ├── Groq                     — Casey chat fallback (llama-3.3-70b) + Whisper STT
   └── OpenAI                   — Casey TTS (gpt-4o-mini-tts; device voice fallback)
```

There is **no custom backend server**. The app talks to Supabase with the
anon key under row-level security, and calls the AI providers directly with
`EXPO_PUBLIC_*` keys bundled in the binary. That direct-call design is the
single biggest known architectural debt — see §7.

### Key code paths

| Area | Files | Notes |
|---|---|---|
| Auth/session/guest | `contexts/user-context.tsx` | Signup (email-confirm flow), login, guest mode, survey-answer stashing with owner tags (prevents cross-user leaks on shared phones), logout (wipes all `@freepass_*` local data), `deleteAccount()` (calls `delete_account()` SQL function), OTP password reset. |
| Casey AI | `app/(drawer)/casey.tsx` | Read the header comments before editing. Deterministic crisis card (988/911) fires on keyword match *before* any model call; Gemini safety blocks must **never** fall back to Groq; profile data goes to providers only after in-chat opt-in consent; full published directory is sent each turn (deliberate — see in-file comment); history capped at 12 turns; 20s timeouts; auto-speak defaults OFF. |
| Moderation | `lib/moderation.ts` + `community-board.tsx`, `question/[id].tsx`, `modal/*` | Language filter on submission, `reports` (write-only for users, staff-readable), `blocked_users` (client filters blocked authors). Apple 1.2 compliance depends on these. |
| Documents vault | `hooks/use-documents.ts`, `app/documents.tsx` | Private bucket, per-user folder = `auth.uid()`, 1-hour signed URLs. Storage delete is verified *before* the metadata row is removed — keep that order. |
| Link safety | `lib/links.ts` | All outbound links/phone/email/directions go through these helpers (imported data contains scheme-less URLs and prose in phone fields). |
| Survey | `constants/onboarding-questions.ts`, `app/onboarding.tsx` | Every question skippable. `time_home` and `has_caseworker` are collected but deliberately **never sent to AI providers**. |

### Database

`supabase-schema.sql` is the canonical fresh-install schema; production was
migrated to match with `scripts/production-launch-fixes.sql` (idempotent,
applied 2026-08-27). Conventions that matter:

- Every table has RLS; user-owned rows are scoped `auth.uid() = user_id`.
- Writes that RLS may silently drop are checked with `.select()` row counts
  in the client — keep doing this for any new UPDATE/DELETE.
- `resources`/`events` submissions insert with `is_published = false`; staff
  publish via dashboard. Policy rejects `is_published = true` from clients.
- Upvotes go through `upvote_question()`/`upvote_answer()` (security
  definer) because direct row updates are blocked for non-owners.
- `profiles.is_staff` gates the Staff View screen and draft visibility.
  Flag staff: `update profiles set is_staff = true where email = '…';`
- Account deletion = `delete_account()` (security definer): anonymizes UGC,
  purges the user's storage objects, deletes the auth user (cascades).

## 3. Accounts, credentials, and where they live

A new team must obtain or rotate ALL of these:

| Thing | Where it is today | Notes |
|---|---|---|
| GitHub repo | github.com/tianyi-gu/freepass (private) | Transfer or fork to the org. |
| Apple Developer org | The Fountain Fund (Michael is admin) | App record `6787856599`, bundle `org.thefountainfund.freepass.app`. |
| ASC API key | `~/.appstoreconnect/private_keys/AuthKey_8WPG35YTXM.p8` on Tianyi's Mac; key ID + issuer in `eas.json` | Used by `eas submit` and all ASC automation. An org admin can issue a new key for the new team. |
| iOS signing | `credentials.json` + `credentials/` dir (gitignored) on Tianyi's Mac (also `~/Desktop/workspace/code/freepass/freepass/`) | Distribution cert + provisioning profile. Consider migrating to EAS-managed credentials (`eas credentials`) to end the single-laptop dependency. |
| Expo/EAS account | `tianyigu` (project `freepass`, id `68a063f4-…`) | Builds + the four production env vars (`eas env:list --environment production`). Transfer project to an org account. |
| Supabase | Project `ihlhrorrxcwsxnxqufpb` on Tianyi's personal account | **FREE TIER — auto-pauses after ~1 week idle, which kills the live app.** Upgrade to Pro and/or transfer to an org. Management API PAT used for ops lives in workspace `.env` (`SUPABASE_ACCESS_TOKEN`). |
| Gemini key | EAS env + local `.env` (`EXPO_PUBLIC_GEMINI_API_KEY`) | Google consumer API tier. Set quota caps + bundle-ID restrictions in Google Cloud console. |
| Groq key | EAS env + `.env` (`EXPO_PUBLIC_GROQ_KEY`) | Chat fallback + Whisper STT. |
| OpenAI key | `.env` (`EXPO_PUBLIC_OPENAI_API_KEY`) | Casey TTS. **Not yet added to EAS production env** — until it is, release builds silently use the device-voice fallback. |
| Privacy policy | https://freepass-privacy.vercel.app (Vercel project `freepass-privacy` on Tianyi's personal account) | Move to fountainfund.org when possible, then update the URL in ASC → App Information. |
| App Review demo login | `applereview@freepass-demo.app` / `ReviewFreePass#2026` | Stored in ASC review details. Keep working or update both places. |

## 4. Release runbook (iOS)

1. Verify: `npx tsc --noEmit && npx expo lint && npx expo-doctor`.
2. Bump `version` in `app.json` for user-facing releases (build number is
   remote/auto-incremented).
3. `npx eas-cli build --platform ios --profile production --auto-submit`
   — needs the signing files and ASC key from §3 on the machine.
4. In ASC: attach the processed build to the version, update "What's New",
   submit. (All of this is also scriptable via the ASC API with the key.)
5. Builds take ~5 minutes; Apple processing adds ~15–60 min.

## 5. Operations runbook

- **Database paused / app dead:** Supabase free tier pauses when idle.
  Check `GET https://api.supabase.com/v1/projects/ihlhrorrxcwsxnxqufpb`
  (PAT auth); resume with `POST …/restore`. Permanent fix: Pro plan.
- **Apply SQL to prod:** Dashboard SQL editor, or Management API
  `POST …/database/query`. Keep `supabase-schema.sql` in sync with any
  migration you add under `scripts/`.
- **Moderation:** reports land in `public.reports` (staff-readable only).
  Review + delete offending content via dashboard; there is no staff UI for
  reports yet (Staff View shows unanswered questions + resource drafts).
- **Content:** resources/events/courses are managed directly in the
  database by staff. Events need future-dated rows or the calendar is
  empty. One resource (`Community Behavioral Health`) still lacks a
  category.
- **Auth emails:** Supabase Auth config was customized — `site_url` points
  at fountainfund.org and the recovery email contains `{{ .Token }}` (the
  app's forgot-password flow asks for that code). Don't reset these.
- **E2E:** build a Release sim app (`npx expo run:ios --configuration
  Release --device "iPhone 16 Pro Max"`), then `maestro test .maestro/`.
  Flows 01–06 and 08 are read-safe; 07/09 write to prod (test accounts).

## 6. History / context documents

- `docs/LAUNCH_CHECKLIST.md` — launch state and remaining items (living doc).
- `docs/PRODUCTION_READINESS_HANDOFF.md` — May 2026 snapshot, partially
  stale, kept for history.
- `docs/PRIVACY_POLICY_DRAFT.md` — source text of the hosted policy.
- The August 2026 hardening pass (commits `31c55f1`…`4ba4bd7`) added: crisis
  handling + AI consent, account deletion, password reset, UGC moderation,
  owner-scoped RLS, document-vault error handling, and removed fabricated
  loan-eligibility content. Read those commit messages for the reasoning.

## 7. Known debts (ranked)

1. **Client-bundled AI keys.** Gemini/Groq/OpenAI keys ship in the IPA —
   extractable, shared quota, no per-user rate limiting. One abusive user
   can exhaust quotas for everyone. Right fix: a Supabase Edge Function
   proxy holding the keys server-side with per-user limits. Until then keep
   provider quota caps + billing alerts.
2. **Supabase free tier** (see §5) — upgrade before real users.
3. **expo-av is deprecated** (removed in SDK 55). Casey's recorder and TTS
   playback need migrating to `expo-audio` before the next SDK upgrade.
4. **Session tokens in plain AsyncStorage** — consider the
   `expo-secure-store` + AES pattern.
5. **Single-machine release signing** — migrate to EAS-managed credentials.
6. **Casey context cost** — the full directory (~8k tokens) is sent every
   turn (deliberate; see in-file comment). At ~300+ resources, switch to
   retrieval or context caching.
7. Casey conversations don't persist across tab switches; budget data is
   device-only (lost on reinstall) — both are known UX tradeoffs, not bugs.
