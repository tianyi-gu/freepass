# FreePass handoff

The September 22, 2026 [privacy rejection audit](audit/PRIVACY_REJECTION_2026-09-22.md) is the current release record. Build 14 was submitted, then rejected for AI privacy disclosure/permission. Its replacement explicitly names OpenAI, renews consent, makes survey sharing session-specific and provides persistent withdrawal controls. Public release remains manual.

Start with the rejection audit and [release checklist](LAUNCH_CHECKLIST.md). Prior production/security evidence is retained in [production readiness](PRODUCTION_READINESS_HANDOFF.md). Deployment details are in [the OpenAI runbook](audit/OPENAI_DEPLOYMENT.md); resolved email setup and its ongoing capacity limits are documented in [email setup](audit/EMAIL_SETUP.md) and [operations](audit/OPERATIONS.md).

Current workspace branch: `project-status-overview`; target: `origin/main`. Do not rename the branch. Never commit `.context`, `.env`, signing material, service keys or raw session transcripts. Obtain reviewer credentials from App Store Connect rather than putting them in a handoff document.
