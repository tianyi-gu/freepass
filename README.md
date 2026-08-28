# FreePass

**FreePass** is a free iOS app from [The Fountain Fund](https://www.fountainfund.org/)
that helps people returning from incarceration find support in Philadelphia:
a directory of 100+ local organizations (housing, employment, legal aid,
health care, food), an AI assistant ("Casey"), community Q&A and message
board, a private document vault, events, financial education courses, and a
budget tool.

> **New maintainer? Start with [`docs/HANDOFF.md`](docs/HANDOFF.md)** — it
> covers the architecture, every external service and credential, the
> operations runbook, and current App Store status.
> [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md) tracks remaining
> launch work.

## Tech stack

| Area | Choice |
|------|--------|
| App | Expo SDK 54, React 19, React Native 0.81, TypeScript |
| Navigation | Expo Router (drawer + stack + tabs), typed routes |
| Backend | Supabase — Postgres (RLS everywhere), Auth, Storage |
| AI | Google Gemini 2.5 Flash (chat) with Groq Llama 3.3 fallback; Groq Whisper (speech-to-text); OpenAI gpt-4o-mini-tts (speech, device-voice fallback) |
| Builds | EAS Build + Submit (iOS; bundle `org.thefountainfund.freepass.app`) |
| E2E | Maestro flows in `.maestro/` |

## Getting started

```bash
npm install
cp .env.example .env       # fill in Supabase + AI keys (see docs/HANDOFF.md)
npx expo start             # dev server; press i for iOS simulator
```

The database schema is in `supabase-schema.sql` (fresh install) with
incremental migrations in `scripts/` — see the handoff doc before touching
production.

## Verification

```bash
npx tsc --noEmit           # typecheck
npx expo lint              # ESLint
npx expo-doctor            # project health
maestro test .maestro/     # E2E (requires a simulator build; see handoff doc)
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
npx eas-cli build --platform ios --profile production --auto-submit
```

Signing uses local credentials (`credentials.json` + `credentials/`, not in
git) and an App Store Connect API key — locations and the full release
runbook are in `docs/HANDOFF.md`. Android is not configured (no
`android.package`).
