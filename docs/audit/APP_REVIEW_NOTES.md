# Prepared App Review notes

These notes are saved in App Store Connect with OpenAI build 13 attached. Keep App Review unsubmitted until the release gates in `../LAUNCH_CHECKLIST.md` pass. Do not submit these against build 8 or 10. Reviewer credentials remain in App Store Connect, not in this file.

---

FreePass helps people returning from incarceration find Philadelphia community resources. Browsing resources, courses, events and Casey is available without an account.

AI privacy: From Home, tap Casey. Before any AI processing, a full-screen notice identifies OpenAI, explains messages/history and optional profile sharing, voice transcription and spoken replies, and links to the privacy policy. The user can accept or decline. Declining disables Casey while other features remain available. Open menu → Account → Privacy → Casey AI data sharing allows consent to be revoked. Previously accepted consent is requested again for this provider change.

Casey now runs through a server-side OpenAI service. It selects from the real FreePass directory; the displayed organization names and phone numbers come from that directory, with a request to call ahead. It does not provide professional advice, determine eligibility or promise availability. Provider/network failures show an explicit retry message.

Login: The demo account provided in App Review Information is confirmed and can be used from Home → Create Free Account → Log In. Authentication has bounded timeouts and a visible retry control, so a network failure does not leave an indefinite spinner. Account → Delete Account deletes private account data and document files. Community posts can be reported, and authors can be blocked.

The updated privacy policy is at https://freepass-privacy.vercel.app. App Privacy labels include account/contact information, sensitive/user content, photos, audio, saved coarse location and learning/saved-resource activity. There is no advertising tracking.
