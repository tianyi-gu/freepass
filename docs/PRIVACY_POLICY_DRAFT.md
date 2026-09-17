# FreePass Privacy Policy

**Updated:** September 17, 2026
**Contact:** tianyi@asterialabs.ai (FreePass app team, on behalf of The Fountain Fund)

FreePass helps people returning from incarceration find resources, events, education, and support in Philadelphia. This policy explains what the app collects, why, who receives it, and your choices.

## Information and its use

- **Account details:** your email, display name, password, and optional ZIP code are used to create and protect your account and provide recovery. Supabase handles authentication and stores password hashes. Native session credentials are stored in the device's secure credential storage in the new OpenAI release.
- **Optional survey answers:** answers about the support you need are stored with your account, or locally before sign-in, to remember your preferences. You can skip questions. Selected answers are sent to Casey only with the separate personalization choice described below.
- **Documents:** photos you choose or take are uploaded to a private Supabase storage bucket. Other users cannot read them. Authorized infrastructure administrators may access account data when necessary to operate or support the service. Do not upload documents you do not want the service to process.
- **Public contributions:** community posts, questions, and answers are visible with your chosen display name. Feedback is restricted to its author and staff in the updated backend. Reports and block lists support moderation. Resource and event submissions are reviewed before publication.
- **Location:** with device permission, the app uses your location to sort nearby resources on your device. It does not intentionally store your precise location in the FreePass database. Opening external maps sends the selected destination to the map provider.
- **Budget:** budget and expense entries are stored on your device, separately by app account. They are not sent to Casey or the FreePass database.
- **Casey conversation and audio:** handled as described below. Chats are held in app memory and are not saved as a conversation history in the FreePass database.
- **Service and abuse prevention:** providers receive ordinary connection information, such as an IP address, when you use their services. Casey's backend keeps keyed, non-reversible identifiers and request counters for rate limiting, not raw IP addresses or conversation text in that table. These counters expire after two days and are removed on subsequent requests. Infrastructure providers may retain operational/security logs under their own terms.

This information comes from your inputs, device permissions, and service requests. FreePass does not buy personal data, sell it, or use it for advertising. The app does not include advertising or third-party analytics tracking SDKs.

## Casey and third-party AI

Before Casey sends anything to an AI provider, the app explains the data, recipients, and purpose and asks you to agree. Declining keeps Casey off while the rest of FreePass remains available. You can revoke consent in **Account → Privacy**. Revocation stops new AI requests and cancels requests still pending in the app; it cannot undo data already received by a provider.

**In the new OpenAI release (consent version 2):**

- Your message and a limited recent conversation are sent through FreePass's Supabase backend to **OpenAI**. OpenAI selects entries from the FreePass directory or an authored response category. FreePass supplies the displayed wording and directory contact details. AI can still select an unsuitable entry, and directory records may be out of date; contact organizations to confirm services and availability.
- If you use the microphone, your recording is sent through the same backend to **OpenAI** for transcription. The transcript appears in the input box for you to review and send. The recording is deleted from the app's cache after transcription or cancellation.
- If you use a speaker button or Auto-read, Casey's reply text is sent to **OpenAI** for generated speech. The generated voice is artificial. Temporary speech files are cached on the device and deleted when the Casey screen is destroyed; the app may also use device speech synthesis.
- Personalization is off unless you separately agree inside Casey. With that choice, selected survey answers, including a name you provided, may accompany the request. **How long you have been home and whether you have a caseworker are excluded.** Documents and budget entries are never included.

**Earlier TestFlight builds (consent version 1):** chat requests use **Google Gemini**, with **Groq** as fallback; microphone transcription uses **Groq**, and spoken replies use **OpenAI**. Those builds show their own provider disclosure. Update to the new release for the OpenAI-only Casey path.

We do not intentionally log AI request/response bodies in our backend or sell conversations. Chat calls request `store:false`, disabling retrievable OpenAI Responses storage. This is **not** a promise of zero provider retention: OpenAI's API security and abuse-monitoring retention rules still apply. Provider processing is governed by applicable service and data-processing terms, including [OpenAI's API data controls](https://developers.openai.com/api/docs/guides/your-data), [Google's Gemini API terms](https://ai.google.dev/gemini-api/terms), and [Groq's privacy policy](https://groq.com/privacy-policy).

## Providers and external links

**Supabase** operates the database, authentication, private file storage, and Casey backend. AI providers receive only the information described above, after consent. We require service providers processing data on our behalf to provide the same or equal protection described by this policy under their applicable data-processing terms. Provider retention and lawful-disclosure obligations are not overridden by an in-app setting.

Courses, organization websites, email, phone, and maps links open outside FreePass. Those services have their own policies. FreePass does not control their availability or collect information you submit directly to them. We do not voluntarily share private documents or survey responses with employers, parole/probation authorities, or law enforcement; legally required disclosures may apply.

## Retention and deletion

Account information, survey answers, saved resources, and document files remain until account deletion. Use **Account → Delete Account** while signed in. The updated deletion flow first removes actual document files through the Storage API, then deletes the account and associated private records. If file removal fails, the account remains so you can retry. You can also contact the app team to request help.

Public posts, questions, and answers may remain after deletion with the display name replaced by “Deleted user.” Text you personally included in a public post is not automatically redacted; delete or edit such posts before account deletion, or contact us for help. Reports may remain for moderation with the reporter association removed. Provider backups and security logs, where present, follow provider retention schedules and are not promised to disappear immediately.

Logging out clears FreePass's personal local data, including local budgets, pending answers, and AI consent. Conversations in memory are cleared when the session ends or the app screen is destroyed; they may remain while navigating within the same app session. Device backups, OS behavior, and provider retention are outside the app's immediate deletion controls.

## Your choices

You can browse without an account, skip survey questions, decline AI, decline personalization, revoke microphone/location/photo permissions in device settings, edit or remove your public contributions, and delete your account. Casey is not an emergency service; call 911 for immediate danger or call/text 988 for suicide and crisis support in the US.

## Children and changes

FreePass is intended for adults and is not directed at children under 13. Contact us if a child's personal information was provided. We will update this page when practices change and request new in-app consent when AI recipients or sharing change materially.
