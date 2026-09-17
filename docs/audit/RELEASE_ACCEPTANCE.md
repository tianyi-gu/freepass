# Additional release acceptance — September 17, 2026

The owner confirmed directory verification and the credential/security work complete, authorized the remaining available checks and operations work, accepted the remaining limitations, and requested merging both PRs and preparing submission. Those owner sign-offs are recorded separately from automated evidence.

## Passed in this follow-up

- Existing 30 unit tests, TypeScript and ESLint checks.
- Reviewer login and profile retrieval against production.
- Fresh ordinary signup, required confirmation, actual Gmail delivery and redemption.
- Rejection of an actual recovery code as `otp_expired`, after changing only the synthetic account's recovery timestamp to two hours earlier. Global one-hour expiry was unchanged; this was controlled timestamp aging, not an elapsed-hour test.
- Real OpenAI-backed speech generation and transcription of the synthetic M4A sample, through the deployed Edge Function.
- Browser app login using the confirmed account; actual image selection/upload, persistence after reload, private image/notes rendering.
- Browser map search with location denied; nearest-resource view with an explicitly granted, simulated Philadelphia location. Initial browser permission-emulation attempts failed until the grant was applied to the correct browser context.
- Browser directory outage shows an error/retry rather than fabricated empty data; retry reloads real entries after connectivity returns.
- Browser consent decline disables Casey; accepting enables a real directory response.
- Synthetic account, document metadata and actual nested Storage file cleanup, independently verified on the backend. The backend correctly refused account deletion until the nested file was removed.
- Six production service/model health checks and a small read-only availability burst.
- Database and Storage export, an isolated PostgreSQL restore, encrypted archive round-trip and tamper rejection. See [operations](OPERATIONS.md).

The browser checks exercised the exported release source against production using isolated synthetic data. They are not physical iOS tests. Initial selector collisions in repeated resource names and document notes were corrected in the test harness; they were not application failures.

## Not newly verified

No physical iPhone/iPad was connected. The available device appeared offline in Xcode. Fresh iPhone/iPad simulator automation attempts repeatedly failed to connect to the XCTest driver before executing app steps. The simulator app itself launched; this follow-up does not count those automation attempts as passes. Prior successful native login, retry, consent, session restoration, document viewing, deletion and guest-flow evidence remains in the main audit.

Physical microphone/camera quality, native photo-picker behavior, actual TestFlight email flows, another recipient domain's email delivery, full accessibility/VoiceOver acceptance, and sustained production capacity remain unverified. Browser geolocation was simulated, and the voice sample was synthetic.

App Store Connect has build 13 attached and release timing set to **Manual**. Submission and public release are separate actions and have not been performed by this preparation work. No mobile implementation changes were made during the final operations pass.
