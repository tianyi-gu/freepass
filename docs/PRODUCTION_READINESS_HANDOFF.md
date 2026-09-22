# FreePass production audit — current status September 22, 2026

**Build 14 was rejected on September 21 for AI privacy disclosure/permission (5.1.1(i), 5.1.2(i)); it is not awaiting approval.** A revised disclosure, permission controls, policy and tests are being prepared in a replacement binary. [The September 22 rejection audit](audit/PRIVACY_REJECTION_2026-09-22.md) and [launch checklist](LAUNCH_CHECKLIST.md) are the current release records.

The audit below is retained as **historical September 17 evidence**. Its build-13 preparation/submission statements are superseded by the successful build-14 submission and subsequent rejection. Earlier successful tests do not mean Apple accepted the previous privacy UX. Public release remains manual and has not occurred.

---

# Historical production audit — September 17, 2026

**Release decision: prepared for the owner-authorized merge and App Review preparation, with the follow-up limits below explicitly acknowledged.** The owner confirmed directory verification and credential/security work complete on September 17. Additional browser app, email expiry, voice and backup checks are in [release acceptance](audit/RELEASE_ACCEPTANCE.md) and [operations](audit/OPERATIONS.md). No physical device was available. Build 13 (`97817a46-ed17-4e27-802d-af9e52d36c23`) remains the signed candidate, processed **VALID** and attached to ASC version 1.0. Release timing is now **MANUAL**. No App Review submission or public release has been performed. No mobile implementation changed in the final operations pass; a new binary is not needed for these workflow/documentation changes.

## Apple rejection status

Apple's two reported problems were AI data-sharing consent (5.1.1/5.1.2) and indefinite login loading (2.1).

- Casey now requires version-2 consent identifying OpenAI, the data sent, purpose, optional profile sharing, voice processing, and revocation. Declining leaves other app features available. Revocation cancels pending client requests and stops audio. Previously consented users must accept the new notice.
- Login/network/bootstrap requests have deadlines and visible retry errors. The production database currently responds, but availability cannot be guaranteed by client timeouts.
- The privacy policy is live at https://freepass-privacy.vercel.app. Its matching source change is in PR https://github.com/tianyi-gu/freepass-privacy/pull/2 and has already been deployed to production; merge that PR before any later main-branch redeployment.
- ASC version 1.0 remains **Prepare for Submission**, with build **13** attached (ASC build ID `f2980964-5913-4e14-a524-10324193c72a`). Reviewer notes now describe OpenAI consent, bounded login and deletion. Both Casey screenshots were replaced with captures of the current native app; all six iPhone and six iPad screenshots are processed. Builds 8 and 10 are obsolete. No App Review submission or public release was performed.
- Age declaration was verified through ASC: 18+ override (17+ legacy tier), user-generated content and messaging enabled. Published privacy labels now include Coarse Location (saved ZIP codes) and Product Interaction (learning/saved-resource activity); Other User Content also declares optional personalization. All nine declared types are linked to the account and are not used for tracking.

## What changed

### OpenAI and factual output

`gpt-5.6-luna` handles directory routing through the Responses API with strict structured output and `store:false`. `gpt-transcribe` handles voice input and `gpt-4o-mini-tts` reads replies. The existing OpenAI key is now a Supabase Edge Function secret; new mobile code has no provider key. Obsolete public Google/Groq/OpenAI variables were removed from the production EAS environment.

The model returns only known resource IDs and a small set of decisions. Server validation rejects fabricated IDs, duplicate IDs and invalid combinations. The app displays authored guidance and exact directory facts, never arbitrary model-written facts, phone numbers, eligibility or availability claims. Directory failures and provider failures show an error rather than fabricated fallback data. Crisis support has a deterministic local response.

This does **not** prove zero hallucinations: resource selection can still be wrong, source records can be stale, transcription can be mistaken, and crisis detection is not exhaustive. Voice transcription is shown for review before sending. The directory still requires ongoing staff verification. See [deployment and limits](audit/OPENAI_DEPLOYMENT.md).

### Security and persistence

The deployed migration prevents users from granting themselves staff privileges, editing others' Q&A through legacy upvote policies, reading others' feedback/private documents, seeing hidden courses, or bypassing block visibility rules. Voting is restricted to once per account. Server-side community text checks supplement reporting/blocking; they do not replace human moderation.

Account deletion first removes actual document objects via Storage, then deletes the account and private database rows; it refuses to declare success while document objects remain. Native authentication sessions use chunked Keychain/SecureStore storage. Private UI resets on identity changes; budget data is namespaced by account. Local budget mutations report storage failures rather than displaying false success.

Casey verifies signed-in identities server-side, loads its own directory/profile allowlist, imposes body/message/audio/time limits, and stores HMAC usage counters without raw messages/IPs. Initial quotas are guest 6/minute and 40/day, signed-in 12/minute and 150/day, all actions combined; global 1,000/day. These are launch safeguards, not a capacity guarantee.

### Public content

The scan covered 103 original resource records and 47 course rows. Corrected stale PA CareerLink addresses/links, Horizon House's link, Help at Home's phone and unsupported program association, and Money Smart's missing course link. Quarantined one uncorroborated Cordelia Homes record; **102 resources remain published**. The 36 previously hidden courses are now blocked at database and direct-route level; 11 are visible. All five imported events are historical and the UI labels that honestly.

Website reachability is not factual verification. At the initial automated audit no resource had a full verification date. The owner subsequently confirmed the staff verification complete; this follow-up did not fabricate verification timestamps or claim an independent staff review. [Field-level source checks](audit/verified-content-changes.md) and [review inventory](audit/content-review.csv) record the evidence and remaining work.

## Verification evidence

Local ignored evidence is under `.context/audit/`; do not upload raw transcripts, browser dumps or credential-bearing test logs.

- TypeScript, ESLint and **30 automated tests pass**, including malformed output, prompt injection boundaries, identity/consent checks, provider/directory failures, and request-body timeout.
- **14/14 live model evaluation cases pass** against the real directory (expected decision, schema validity and basic service-topic relevance), including out-of-scope requests, fabricated-resource requests and crisis scenarios. This is a finite regression set, not universal accuracy proof.
- Deployed Edge Function: real directory chat, speech generation and M4A transcription pass. Invalid consent returns 403; invalid identity returns 401. Forwarded-IP spoofing did not create a new allowance; forged Cloudflare IP was blocked at the gateway.
- **12 live database/security assertions pass** using two isolated synthetic accounts. Test accounts, posts and files were cleaned up.
- **12 additional live email/authentication assertions pass**: ordinary non-team signup and initial delivery, confirmation resend/link redemption, required confirmation, sign-in, recovery delivery/code validation/password change, old-password rejection and synthetic-account cleanup. Gmail SMTP settings and the 20/hour limit persisted after reloading the dashboard.
- Xcode-signed Release simulator build succeeds; provider-key values were absent from the generated bundle. Unsigned builds initially failed SecureStore entitlements and are not counted as passing builds.
- Seven native guest flows passed on both iPhone (iOS 18.1) and iPad (iPadOS 26.5): launch, resource search/details, event history/empty state, Casey consent plus real answer, budget expense, learning academy, and guest community access. Three first iPhone attempts hit an XCTest startup/AX error; independent clean launches passed.
- Native successful login, failed-login retry, consent decline/enable/revoke, secure-session restoration after process restart, and reading a private synthetic document also passed. Account deletion passed through the native UI; a separate backend check confirmed the account, metadata rows and nested storage file were gone. Several initial automation failures were incorrect selectors or retained Keychain sessions; tests now sign out through FreePass instead of wiping the simulator Keychain.
- Expo Doctor **18/18**, web export, signed production iOS build, and GitHub checks pass. App Store Connect has accepted build 13 and the refreshed screenshots; this is processing acceptance, not App Review approval.
- The temporary project-scoped Supabase deployment token was revoked and verified to return 401. The temporary browser connection was stopped, and credential-bearing automation artifacts were removed. The permanent OpenAI server secret remains configured.

## Owner sign-offs and remaining scope

The owner reports directory verification and the credential/security follow-up complete. These are owner attestations, not newly repeated external contact checks or a provider-key revocation audit. The finite live Casey/voice checks pass after that sign-off.

The owner authorized testing as far as the available tools permit, doing the available operations work, accepting the remaining limitations, merging both PRs and preparing submission. [The launch checklist](LAUNCH_CHECKLIST.md) separates preparation from actual submission and public release.

- **Physical-device acceptance:** no connected iPhone/iPad. Prior successful native simulator tests remain valid evidence; new attempts failed in the XCTest automation driver before app interaction. New browser app tests verify login, image upload/private viewing, denied/granted simulated location, consent and network recovery. They do not establish physical camera/audio quality, native photo-picker behavior or full VoiceOver accessibility.
- **Email:** Gmail SMTP remains configured, confirmation required and capped at 20/hour. Fresh delivery/confirmation and an expired recovery code were checked. Another recipient domain and actual TestFlight email flows remain unverified.
- **Operations:** hourly/daily GitHub Actions checks are configured in the merged source workflow. An encrypted local database plus Storage snapshot and isolated PostgreSQL restore are prepared. Scheduled off-site backups, managed-service disaster recovery, provider spending alerts, hosting upgrades and human support/moderation coverage are still follow-up work. No paid plan was purchased.
- **Apple:** build 13, 12 screenshots, labels and reviewer notes are prepared; reviewer credentials work. Release timing is manual. Submission and Apple's approval remain outstanding.

The last dependency audit reported 19 transitive development/build-tool advisories (8 high, 11 moderate). The owner reports the security work/assessment complete; no lockfile changes in this final pass removed those findings. Compatible fixes had reduced the original findings; incompatible major overrides were not forced. `expo-av` migration remains maintenance for a future Expo SDK upgrade.
