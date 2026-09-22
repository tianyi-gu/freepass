# App Review notes for the revised privacy candidate

Updated September 22, 2026. Build 14 was rejected September 21; these notes describe its replacement and must accompany the new binary. Reviewer credentials remain only in App Store Connect.

---

FreePass helps people returning from incarceration find Philadelphia community resources. Browsing resources, courses, events and Casey is available without an account.

AI PRIVACY FIX — build 15, replacing rejected build 14 (Guidelines 5.1.1(i), 5.1.2(i)):
1. From Home, tap Casey in the bottom navigation. Before any AI message, recording/transcription or speech generation, the full-screen “Share with OpenAI?” notice names OpenAI and explains messages/recent replies, optional microphone recordings, reply text for read-aloud, and separately optional survey answers. Requests pass through FreePass's Supabase backend.
2. Scroll to the bottom if needed. “Allow sharing with OpenAI” explicitly authorizes the listed processing. “Don't allow” keeps Casey off while Resources, Budget, Courses and other non-AI features remain usable. The app makes no AI request merely by displaying or accepting the notice.
3. Everyone is asked again under revised local disclosure version 3, including users who accepted build 14's earlier notice. For repeat testing, open Casey → Review or turn off sharing; alternatively Account → Privacy → Casey AI data sharing → Turn Off.
4. Signed-in survey sharing is a separate “Allow survey sharing” choice, off by default for each Casey screen/session. Without that choice, the backend does not load/send survey answers. The notice lists the allowed categories. Documents, budget entries, credentials, time since release and caseworker answer are not automatically included.
5. The policy linked directly in the notice is https://freepass-privacy.vercel.app (updated September 22, 2026). It documents collection methods, each data use/recipient, retention, withdrawal/deletion and the same-or-equal provider protection commitment. Permission is requested in the app, not only in this policy.

Casey selects from the real FreePass directory; organization names and phone numbers come from that directory. Users are asked to verify availability. It does not determine eligibility, promise availability or provide professional advice. AI/network failures show an explicit retry message.

Login: Use the supplied demo account via Home → Create Free Account → Log In. Authentication has bounded timeouts and visible retry controls. Account → Delete Account deletes private account data and document files. Community posts can be reported, and authors can be blocked. Reviewer credentials remain in the separate fields below.
