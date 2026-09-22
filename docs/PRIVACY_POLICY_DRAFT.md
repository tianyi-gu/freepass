# FreePass Privacy Policy

**Updated:** September 22, 2026
**Contact:** tianyi@asterialabs.ai (FreePass app team, on behalf of The Fountain Fund)

FreePass helps people returning from incarceration find resources, events, education, and support in Philadelphia. This policy explains what the app collects, why, who receives it, and your choices.

## Information and its use

- **Account details:** your email, display name, password, and optional ZIP code are used to create and protect your account and provide recovery. Supabase handles authentication and stores password hashes. Native session credentials are stored in the device's secure credential storage in the current app.
- **Optional survey answers:** answers about the support you need are stored with your account, or locally before sign-in, to remember your preferences. You can skip questions. Selected answers are sent to Casey only with the separate personalization choice described below.
- **Documents:** photos you choose or take are uploaded to a private Supabase storage bucket. Other users cannot read them. Authorized infrastructure administrators may access account data when necessary to operate or support the service. Do not upload documents you do not want the service to process.
- **Public contributions:** community posts, questions, and answers are visible with your chosen display name. Feedback is restricted to its author and staff in the updated backend. Reports and block lists support moderation. Resource and event submissions are reviewed before publication.
- **Location:** with device permission, the app uses your location to sort nearby resources on your device. It does not intentionally store your precise location in the FreePass database. Opening external maps sends the selected destination to the map provider.
- **Budget:** budget and expense entries are stored on your device, separately by app account. They are not sent to Casey or the FreePass database.
- **Casey conversation and audio:** handled as described below. Chats are held in app memory and are not saved as a conversation history in the FreePass database.
- **Service and abuse prevention:** providers receive ordinary connection information, such as an IP address, when you use their services. Casey's backend keeps keyed, non-reversible identifiers and request counters for rate limiting, not raw IP addresses or conversation text in that table. These counters expire after two days and are removed on subsequent requests. Infrastructure providers may retain operational/security logs under their own terms.

This information comes from your inputs, device permissions, and service requests. FreePass does not buy personal data, sell it, or use it for advertising. The app does not include advertising or third-party analytics tracking SDKs.

## Casey and third-party AI

Casey is optional. **OpenAI is the AI provider for the current FreePass app. Supabase processes requests as FreePass's backend.** Opening Casey shows **“Share with OpenAI?”** before you can type, record, or request generated speech. The notice identifies the data and purposes below. **“Allow sharing with OpenAI”** gives permission; **“Don't allow”** keeps Casey off without blocking the rest of FreePass. The revised disclosure asks again even if you accepted an older version.

- **Chat:** your submitted message and up to eight recent conversation turns (your messages and Casey's replies) pass through Supabase to OpenAI. OpenAI selects directory entries or a response category; FreePass supplies the wording and directory contact details. Anything you type can contain personal data. AI may select an unsuitable entry; contact organizations to verify details and availability.
- **Voice input:** only when you use the microphone, your recording passes through Supabase to OpenAI for transcription. You review the returned transcript before sending it as a chat message. The recording is deleted from the app's cache after transcription or cancellation.
- **Read aloud:** only when you use a speaker button or Auto-read, reply text passes through Supabase to OpenAI for speech generation. The voice is artificial. Generated audio is temporarily cached on the device and removed when the Casey screen is destroyed. The app may fall back to device speech synthesis.
- **Optional survey sharing:** this is off by default and requires a separate **“Allow survey sharing”** choice within Casey for the current session. The eligible answers are preferred name, ZIP code, immediate needs, employment status, work interests, housing status, financial-help needs, education level or education, learning interests, and support system. Time since release and the caseworker answer are excluded. Private document files, budget entries and account credentials are not automatically sent to OpenAI. Any information you yourself include in a message or recording is part of that message or recording.

You can review or withdraw permission using **Casey → Review or turn off sharing → Don't allow**, or **Account → Privacy → Casey AI data sharing → Turn Off**. Withdrawal stops new AI requests and cancels requests pending in the app; it cannot recall data already received by a provider. Optional survey permission is cleared when AI sharing is turned off or the Casey screen/session ends. The app stores the main permission's disclosure version, decision time and account/guest identity locally; it asks again after a material disclosure change or account change.

### AI data protection and retention

FreePass uses OpenAI for the processing described above, through encrypted HTTPS requests from its Supabase backend. We do not sell AI conversations or intentionally log their request/response bodies in our backend. Chat responses are held in app memory rather than saved as FreePass conversation records. OpenAI's documented API policy does not use API data for model training unless the API customer explicitly opts in; FreePass does not intentionally submit data for training.

Our chat requests disable retrievable response storage. That does **not** eliminate all provider retention. OpenAI documents abuse-monitoring retention for chat and speech generation of up to 30 days by default, with exceptions for law or protection against harm. Audio transcription has no application-state or abuse-monitoring retention in OpenAI's endpoint table. Prompt caching may retain encrypted processing state for up to 24 hours. These controls are described in [OpenAI's API data controls](https://developers.openai.com/api/docs/guides/your-data). FreePass does not claim zero retention or that revoking consent deletes every provider log immediately.

Older, retired test versions used Google Gemini and Groq as disclosed in their notices. The current app does not send AI requests to either service; this historical note does not expand your current OpenAI permission.

## Providers and external links

**Supabase** operates the database, authentication, private file storage, and Casey backend. AI providers receive only the information described above, after consent. FreePass requires every third party that receives user data on our behalf, including OpenAI and Supabase, to provide the same or equal protection of user data as described in this policy and required by Apple’s App Review Guidelines. This includes using data only for the disclosed processing and permitted security/legal purposes, protecting its confidentiality and security, limiting access, and honoring applicable retention and deletion obligations. We remain responsible for selecting and reviewing providers; their published terms are not a waiver of these commitments. Provider retention and lawful-disclosure obligations are not overridden by an in-app setting.

**Google/Gmail** delivers account-confirmation and password-recovery emails. Google receives the recipient email address, message contents (including verification links or codes), and email delivery metadata. Deleting a FreePass account does not automatically remove email copies from sender or recipient mailboxes. Google's processing and retention are described in [Google's privacy policy](https://policies.google.com/privacy).

Courses, organization websites, email, phone, and maps links open outside FreePass. Those services have their own policies. FreePass does not control their availability or collect information you submit directly to them. We do not voluntarily share private documents or survey responses with employers, parole/probation authorities, or law enforcement; legally required disclosures may apply.

## Retention and deletion

Account information, survey answers, saved resources, and document files remain until account deletion. Use **Account → Delete Account** while signed in. The updated deletion flow first removes actual document files through the Storage API, then deletes the account and associated private records. If file removal fails, the account remains so you can retry. You can also contact the app team to request help.

Public posts, questions, and answers may remain after deletion with the display name replaced by “Deleted user.” Text you personally included in a public post is not automatically redacted; delete or edit such posts before account deletion, or contact us for help. Reports may remain for moderation with the reporter association removed. Provider backups and security logs, where present, follow provider retention schedules and are not promised to disappear immediately.

Logging out clears FreePass's personal local data, including local budgets, pending answers, and AI consent. Conversations in memory are cleared when the session ends or the app screen is destroyed; they may remain while navigating within the same app session. Device backups, OS behavior, and provider retention are outside the app's immediate deletion controls.

## Your choices

You can browse without an account, skip survey questions, decline AI, decline personalization, revoke microphone/location/photo permissions in device settings, edit or remove your public contributions, and delete your account. Casey is not an emergency service; call 911 for immediate danger or call/text 988 for suicide and crisis support in the US.

## Children and changes

FreePass is intended for adults and is not directed at children under 13. Contact us if a child's personal information was provided. We will update this page when practices change and request new in-app consent when AI recipients or sharing change materially.
