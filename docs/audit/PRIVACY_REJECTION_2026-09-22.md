# Apple AI privacy rejection — September 22, 2026

Apple rejected version 1.0 (14) on September 21 under 5.1.1(i)/5.1.2(i). Submission `3932e741-cb6a-4d67-a125-43c8044a9189` is unresolved; the replacement is being prepared. Public release stays manual. Build 14 already contained an OpenAI consent gate; the reviewer did not provide an exact bypass/reproduction. This change addresses clarity, discoverability and repeat consent without claiming a proven root cause.

## Requirement evidence

| Apple requirement | Revised behavior | Verification |
| --- | --- | --- |
| Identify data sent | Notice lists chat/recent replies, microphone recordings, reply text for read-aloud and the full optional survey categories, purposes and exclusions. | `constants/ai-consent.ts`; iPhone/iPad browser captures; native iPad notice test. |
| Identify recipient | Heading “Share with OpenAI?” and explicit “Allow sharing with OpenAI” button; body identifies Supabase as FreePass's backend. | Rendered notice and policy agree; all client AI paths go through `requestCasey` to the single server handler. |
| Permission before sharing | No composer/recording/speech controls until permission; local disclosure version 3 invalidates all earlier records. Separate survey sharing is off by default for each session. | Unit tests and request-counting browser tests; live backend rejects chat/transcription/speech without wire consent with 403. |
| Real choice/withdrawal | “Don't allow” leaves non-AI features available; Casey has a persistent review/turn-off control; Account privacy supports withdrawal. Pending requests are aborted, late results discarded. | Native iPad Maestro decline/enable/Account-revoke passes; browser decline/reload/in-chat-revoke passes; race-condition unit tests. |
| Complete privacy policy | Collection methods, purposes, recipients, retention/deletion, revocation limits and same-or-equal provider-protection commitment. OpenAI retention is explained without claiming zero retention. | Policy source and mobile HTML reviewed; production publication recorded below. |
| App Store disclosures | Published policy URL and nine data types: Name, Email, Coarse Location, Sensitive Info, Photos/Videos, Audio, Other User Content, User ID, Product Interaction. Personalization declared for relevant name/location/survey content. | Live App Store Connect UI read September 22; audio and all other detailed types shown linked to identity. No new data category introduced by this revision. |
| Reviewer reproducibility | Step-by-step Home → Casey instructions, exact Allow/Don't allow labels, scrolling and repeat/revocation paths, policy URL and separate survey choice. | `APP_REVIEW_NOTES.md`; saved metadata status recorded below. |

The disclosure version is local UX version 3. The unchanged deployed backend consent protocol is version 2 (`CASEY_CONSENT_VERSION`). This avoids breaking the existing backend while ensuring upgraded apps cannot reuse an earlier UI decision.

## Current verification

- TypeScript, ESLint and all **43 tests pass** (`npm run check`).
- Web export and signed Release iPad simulator build pass.
- Isolated Playwright iPhone 390×844 and iPad 834×1194 tests pass: zero AI requests before consent/after decline, decline survives reload, other features remain reachable, explicit enable/review/revoke, old accepted records require the revised notice, no horizontal overflow. One synthetic live chat renders after permission.
- Native Maestro on **iPad Air 11-inch M4, iPadOS 26.5** passes decline, enable and Account privacy revocation. This is the closest installed simulator size to Apple's M3 review device, not a physical M3 test.
- Live reviewer login passes; all three AI actions return 403 without consent; speech/transcription succeed with consent using synthetic content. No reviewer credentials are included in this repository.
- Public provider documentation reviewed: [Apple privacy guidelines](https://developer.apple.com/app-store/review/guidelines/#data-use-and-sharing), [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data), [OpenAI Services Agreement](https://openai.com/policies/services-agreement/), and [Supabase DPA](https://supabase.com/legal/customer-resources/data-processing-addendum). These document provider commitments; they are not a fresh inspection of private OpenAI account data-sharing settings or a claim of a separately negotiated agreement.

Local evidence: `.context/audit/privacy-v3-{check.log,browser-results.json,backend.json,native-build.log,maestro.log}` and rendered screenshots. Raw credential-bearing browser/authentication artifacts must not be committed.

## Release record

- Privacy site: PR [freepass-privacy #3](https://github.com/tianyi-gu/freepass-privacy/pull/3); preview deployment and mobile layout passed. Production publication pending.
- Replacement app PR/build: pending.
- App Review notes/attachments update: pending.
- Resubmission: pending. The rejected build 14 must not be resubmitted unchanged.

Physical-device microphone/camera quality, full VoiceOver acceptance and the operational follow-ups in the launch checklist remain outside these privacy regression checks. Passing them does not guarantee Apple approval or error-free AI resource selection.
