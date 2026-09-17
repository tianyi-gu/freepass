# FreePass launch checklist

Updated September 17, 2026. **Build 13 is the submission candidate; builds 8/10 are obsolete.** The owner confirmed directory verification and the remaining credential/security work complete, and authorized merging both PRs after the additional checks. Remaining physical-device and operations limitations are accepted as follow-up work; they are not recorded as passed tests.

- [x] Replace Gemini/Groq with server-side OpenAI and strict directory-only decisions.
- [x] Deploy the Edge Function, security migration and content corrections.
- [x] Remove provider keys from new mobile code and production EAS public variables.
- [x] Version and enforce AI consent; publish matching privacy disclosures.
- [x] Pass unit, live model, database/security, email and prior native acceptance checks.
- [x] Complete the additional browser app and live backend checks described in [release acceptance](audit/RELEASE_ACCEPTANCE.md).
- [x] Record the owner's completion of directory verification and credential/security work. No verification dates were invented in the database.
- [x] Prepare hourly service checks and a daily synthetic Casey check on GitHub Actions; configure the required repository variables/secrets.
- [x] Export the database and actual Storage files, test a local database restore, and verify encrypted backup integrity. See [operations](audit/OPERATIONS.md).
- [x] Process and attach build 13, screenshots, privacy labels and reviewer notes; verify reviewer login.
- [x] Set App Store release timing to **Manual**.
- [x] Prepare [app PR #5](https://github.com/tianyi-gu/freepass/pull/5) and [privacy PR #2](https://github.com/tianyi-gu/freepass-privacy/pull/2) for the owner-authorized merge. Their linked GitHub status records completion.
- [ ] Submit build 13 to App Review. This is a separate action; preparation and merging do not submit it.
- [ ] Release manually after Apple approves and the owner decides to launch.

## Follow-up limits acknowledged by the owner

- Test the actual TestFlight build on physical iPhone/iPad: microphone/audio quality, camera, native photo picker, accessibility and real-device email flows. No physical device was connected. Additional native automation attempts failed at the XCTest driver connection, before app steps ran; prior successful native evidence remains documented.
- Test email delivery to another recipient domain and monitor the initial Gmail 20-emails/hour cap. Expiry rejection was checked by aging only a synthetic account's recovery timestamp, not by waiting an hour in real time.
- Decide on Supabase capacity/paid hosting, scheduled off-site backups, provider spending alerts and human support/moderation coverage. The project remains Free; the new encrypted backup is local, not an automatic disaster-recovery service.
- Continue dependency maintenance. The owner reports the security assessment complete; this does not imply every transitive build-tool advisory was removed from the lockfile.

See [production audit](PRODUCTION_READINESS_HANDOFF.md) for the full evidence and scope. No new App Review submission or public release was performed during preparation.
