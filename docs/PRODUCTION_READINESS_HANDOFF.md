# FreePass production audit — September 17, 2026

**Release decision: not ready for public launch yet.** The OpenAI implementation, database hardening and content corrections are implemented and deployed where applicable. A new mobile build is being prepared. Email delivery, operations, directory review, and final-device acceptance remain gates. This replaces the older build-10/Gemini handoff; do not follow the old automated review-submission instructions.

## Apple rejection status

Apple's two reported problems were AI data-sharing consent (5.1.1/5.1.2) and indefinite login loading (2.1).

- Casey now requires version-2 consent identifying OpenAI, the data sent, purpose, optional profile sharing, voice processing, and revocation. Declining leaves other app features available. Revocation cancels pending client requests and stops audio. Previously consented users must accept the new notice.
- Login/network/bootstrap requests have deadlines and visible retry errors. The production database currently responds, but availability cannot be guaranteed by client timeouts.
- The privacy policy is live at https://freepass-privacy.vercel.app. Its matching source change is in draft PR https://github.com/tianyi-gu/freepass-privacy/pull/2 and has already been deployed to production; merge that PR before any later main-branch redeployment.
- ASC version 1.0 remains **Prepare for Submission**, with build **8** attached. Build **10** is processed but contains the old Google/Groq implementation. Neither is the release candidate for this audit. No App Review submission or public release was performed.
- Age declaration was verified through ASC: 18+ override (17+ legacy tier), user-generated content and messaging enabled. Privacy labels are being corrected to cover saved ZIP codes and learning/saved-resource activity.

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

Website reachability is not factual verification. No resource had a full verification date, and this audit did not invent those dates. [Field-level source checks](audit/verified-content-changes.md) and [review inventory](audit/content-review.csv) record the evidence and remaining work.

## Verification evidence

Local ignored evidence is under `.context/audit/`; do not upload raw transcripts, browser dumps or credential-bearing test logs.

- TypeScript, ESLint and **28 automated tests pass**, including malformed output, prompt injection boundaries, identity/consent checks, provider/directory failures, and request-body timeout.
- **14/14 live model evaluation cases pass** against the real directory, including out-of-scope requests, fabricated-resource requests and crisis scenarios. This is a finite regression set, not universal accuracy proof.
- Deployed Edge Function: real directory chat, speech generation and M4A transcription pass. Invalid consent returns 403; invalid identity returns 401. Forwarded-IP spoofing did not create a new allowance; forged Cloudflare IP was blocked at the gateway.
- **12 live database/security assertions pass** using two isolated synthetic accounts. Test accounts, posts and files were cleaned up.
- Xcode-signed Release simulator build succeeds; provider-key values were absent from the generated bundle. Unsigned builds initially failed SecureStore entitlements and are not counted as passing builds.
- Seven native guest flows have passed: launch, resource search/details, event history/empty state, Casey consent plus real answer, budget expense, learning academy, and guest community access. Three first attempts hit an XCTest startup/AX error; independent clean launches passed.
- Further final-build login/consent, iPad, and packaging checks are in progress; update this section with their exact result before release.

## Remaining release gates

1. **Configure production authentication email.** No custom SMTP is configured; Supabase's default mailer only serves team addresses and is limited to two emails/hour. Ordinary signup/password reset is not production-ready. The owner must supply a sender domain/provider and credentials; complete DNS/provider setup and verify real non-team signup confirmation, resend, password recovery and expired-code behavior. Keep confirmation enabled. See [email setup](audit/EMAIL_SETUP.md).
2. **Set production operations.** The project is on Supabase Free with no dashboard backups. Prior auto-pause/IO incidents caused outages. Choose an appropriate production plan/compute, configure backups and a restore test, provider budgets/alerts, availability monitoring and support ownership. An upgrade alone does not prove IO headroom.
3. **Approve and maintain real content.** Staff must verify published contact details/hours/services and program policy, decide whether to supply future events, and own resource submissions and community reports. The application cannot verify live vacancies or eligibility.
4. **Rotate credentials exposed in older binaries before public launch**, coordinating other uses of the same key. Reusing the existing OpenAI key was authorized for this migration; it has not been blindly rotated. Removing EAS variables does not remove keys from already-distributed builds.
5. **Accept the actual release build on physical iPhone/iPad.** Verify microphone/audio quality, camera/photo document upload/deletion, maps with location denied/granted, offline recovery, account deletion, accessibility, and the real email flows. Simulator/API evidence does not prove physical hardware or email delivery.
6. **Finish App Store release deliberately.** Merge code and privacy-policy PRs, attach the new OpenAI build, refresh screenshots/review notes if needed, verify the reviewer account, then submit. Apple has not approved these changes. Never run an old script that attaches build 10 and submits automatically.

Dependency audit still reports 19 transitive development/build-tool advisories (8 high, 11 moderate), chiefly Metro's image parser and legacy UUID consumers. Compatible fixes reduced the original findings; blindly overriding to incompatible major versions would break the build. Review the remaining toolchain upgrade separately and use only trusted build assets. `expo-av` is deprecated and needs migration before a future Expo SDK upgrade.
