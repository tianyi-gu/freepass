# FreePass handoff

The September 17, 2026 OpenAI/security audit supersedes the older Gemini/Groq and build-10 notes.

Start with [production readiness and evidence](PRODUCTION_READINESS_HANDOFF.md), then [the release checklist](LAUNCH_CHECKLIST.md). Deployment details are in [the OpenAI runbook](audit/OPENAI_DEPLOYMENT.md); the unresolved signup/recovery blocker is in [email setup](audit/EMAIL_SETUP.md).

Current workspace branch: `project-status-overview`; target: `origin/main`. Do not rename the branch. No App Review submission or public release has been made for the new implementation. Never commit `.context`, `.env`, signing material, service keys or raw session transcripts. Obtain reviewer credentials from App Store Connect rather than putting them in a handoff document.
