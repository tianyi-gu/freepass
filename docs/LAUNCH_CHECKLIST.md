# FreePass launch checklist

Updated September 22, 2026. **Build 14 was submitted and rejected on September 21 under 5.1.1(i)/5.1.2(i).** The earlier build-13 preparation notes are superseded. The revised privacy candidate requires a new binary. See [privacy rejection audit](audit/PRIVACY_REJECTION_2026-09-22.md) for current evidence and release status.

- [x] Replace Gemini/Groq with server-side OpenAI and strict directory-only decisions.
- [x] Deploy the Edge Function, security migration and content corrections.
- [x] Remove provider keys from new mobile code and production EAS public variables.
- [x] Name OpenAI in the permission heading/button and disclose chat, microphone, read-aloud and optional survey sharing.
- [x] Require new local disclosure-version-3 consent from existing users; keep survey sharing separately off by default each session.
- [x] Provide decline, in-chat review/revocation, Account privacy controls and continued non-AI access.
- [x] Pass TypeScript, ESLint, 43 unit tests, iPhone/iPad browser consent checks and the native Release build.
- [x] Complete native consent acceptance and live backend/reviewer checks for the replacement candidate.
- [ ] Publish the matching updated policy and refresh reviewer instructions/evidence.
- [x] Verify current published App Privacy declarations against the data inventory.
- [ ] Merge the tested app candidate, upload its new build and verify Apple processing.
- [ ] Resubmit the replacement build with revised reviewer instructions.
- [x] Keep App Store release timing **Manual**.
- [ ] Release manually after Apple approves and the owner decides to launch.

Prior directory/security owner sign-offs, email checks and operations work remain documented in [release acceptance](audit/RELEASE_ACCEPTANCE.md) and [operations](audit/OPERATIONS.md). They are historical evidence, not newly repeated tests.

## Follow-up limits acknowledged by the owner

- Test the actual TestFlight build on physical iPhone/iPad: microphone/audio quality, camera, native photo picker, accessibility and real-device email flows. No physical device was connected. Additional native automation attempts failed at the XCTest driver connection, before app steps ran; prior successful native evidence remains documented.
- Test email delivery to another recipient domain and monitor the initial Gmail 20-emails/hour cap. Expiry rejection was checked by aging only a synthetic account's recovery timestamp, not by waiting an hour in real time.
- Decide on Supabase capacity/paid hosting, scheduled off-site backups, provider spending alerts and human support/moderation coverage. The project remains Free; the new encrypted backup is local, not an automatic disaster-recovery service.
- Continue dependency maintenance. The owner reports the security assessment complete; this does not imply every transitive build-tool advisory was removed from the lockfile.

See [production audit](PRODUCTION_READINESS_HANDOFF.md) for the full evidence and scope. Build 14 was submitted after that preparation; no public release has occurred.
