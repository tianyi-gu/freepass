# FreePass launch checklist

Updated September 17, 2026. **Do not submit build 8 or 10 as the OpenAI release.** The current evidence and limitations are in [the production audit](PRODUCTION_READINESS_HANDOFF.md).

- [x] Replace Gemini/Groq with server-side OpenAI and strict directory-only decisions.
- [x] Deploy the Edge Function, server secret, security migration and verified content corrections.
- [x] Remove provider keys from new mobile code and production EAS public variables.
- [x] Version and enforce AI consent; publish the matching privacy policy.
- [x] Run unit, live model, database/security and native guest-flow checks.
- [x] Pass native login/retry, consent/revocation, session restoration and account deletion checks.
- [x] Process and attach OpenAI build 13; update App Store labels, screenshots and reviewer notes.
- [x] Configure custom SMTP and verify signup/recovery email with an ordinary non-team test account (12 live checks passed).
- [ ] Complete release-device, additional-recipient-domain and time-expired-code email acceptance; monitor Gmail delivery limits.
- [ ] Establish production capacity, backups/restore, monitoring, budgets and support/moderation ownership.
- [ ] Staff-verify directory records and current program information; supply future events if desired.
- [ ] Rotate provider credentials exposed in old TestFlight binaries after checking shared uses.
- [ ] Complete physical-device and final release-build acceptance, including email, voice, documents, maps and deletion.
- [ ] Merge the main code PR and [privacy policy PR #2](https://github.com/tianyi-gu/freepass-privacy/pull/2).
- [ ] Recheck reviewer account access immediately before submission.
- [ ] Submit to App Review, address any response, and release only after approval and the gates above.

No new App Review submission or public release was performed during this audit. Earlier handoff instructions to top up Gemini/Groq or automatically submit build 10 are superseded.
