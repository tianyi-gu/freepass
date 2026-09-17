# FreePass

**FreePass** is a free iOS app from [The Fountain Fund](https://www.fountainfund.org/)
that helps people returning from incarceration find support in Philadelphia:
a directory of 100+ local organizations (housing, employment, legal aid,
health care, food), an AI assistant ("Casey"), community Q&A and message
board, a private document vault, events, financial education courses, and a
budget tool.

> **New maintainer? Start with [`docs/HANDOFF.md`](docs/HANDOFF.md)** — it
> links to current production-readiness evidence, deployment instructions,
> and App Store status.
> [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md) tracks remaining
> launch work.

## Tech stack

| Area | Choice |
|------|--------|
| App | Expo SDK 54, React 19, React Native 0.81, TypeScript |
| Navigation | Expo Router (drawer + stack + tabs), typed routes |
| Backend | Supabase — Postgres (RLS everywhere), Auth, Storage |
| AI | OpenAI gpt-5.6-luna (validated directory routing), gpt-transcribe (voice input), gpt-4o-mini-tts (speech); server-side Supabase Edge Function |
| Builds | EAS Build + Submit (iOS; bundle `org.thefountainfund.freepass.app`) |
| E2E | Maestro flows in `.maestro/` |

## Getting started

```bash
npm ci
cp .env.example .env       # fill in the two public Supabase settings
npx expo start             # dev server; press i for iOS simulator
```

Deploy Casey and set its server-side OpenAI secret using [the deployment runbook](docs/audit/OPENAI_DEPLOYMENT.md). The mobile app must never contain a provider key. A local `FREEPASS_OPENAI_API_KEY` is only needed for opt-in live evaluations.

The database schema is in `supabase-schema.sql` (fresh install) with
incremental migrations in `scripts/` — see the handoff doc before touching
production.

## Verification

```bash
npm run check             # TypeScript, ESLint, unit/security-contract tests
npx expo-doctor            # project health
# Run selected .maestro flows against a Release simulator build.
# Flows 07/08 require MAESTRO_EMAIL and MAESTRO_PASSWORD in the environment.
# Signup/email delivery requires configured production SMTP.
# npm run evaluate:casey  # opt-in paid API evaluation with synthetic prompts
```

## Project layout

```
app/                 # Screens (Expo Router file-based routes)
  (drawer)/          # Main sections: home, Casey, budget, courses, events…
  modal/             # Modal flows (ask/answer/edit, feedback)
  course|event|listing|question|street-view/[id].tsx   # Detail screens
components/          # Shared UI (header, drawer, tab bar, icons)
contexts/            # user-context: auth, guest mode, account deletion
hooks/               # Data hooks (resources, documents, budget, saved)
lib/                 # supabase client, moderation, safe link helpers
constants/           # Theme + onboarding survey questions
scripts/             # SQL migrations + data import tooling
docs/                # HANDOFF, LAUNCH_CHECKLIST, privacy policy draft
.maestro/            # E2E flows (appId must match the real bundle id)
```

## Releases (iOS)

```bash
eas build --platform ios --profile production
# After validation, upload the specific build to TestFlight with eas submit.
# App Review submission/public release are separate steps.
```

Signing uses local credentials (`credentials.json` + `credentials/`, not in
git) and an App Store Connect API key — locations and the full release
readiness gates are linked from `docs/HANDOFF.md`. Android is not configured (no
`android.package`).
