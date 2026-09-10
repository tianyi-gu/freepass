// Single source of truth for the Casey AI data-sharing disclosure.
//
// App Review (Guidelines 5.1.1(i) / 5.1.2(i)) requires that, BEFORE any
// personal data goes to a third-party AI service, the app itself tells the
// user what is sent and to whom, and gets an explicit OK. Putting this only in
// the privacy policy is not sufficient. The lists below are rendered verbatim
// in the in-app consent screen and mirrored in the privacy policy — when the
// code starts sending something new (or to someone new), update BOTH and bump
// AI_CONSENT_VERSION so every user is asked again.

export const AI_CONSENT_STORAGE_KEY = '@freepass_ai_consent';

// Bump when the disclosure text or the set of providers/data changes.
export const AI_CONSENT_VERSION = 1;

export const PRIVACY_POLICY_URL = 'https://freepass-privacy.vercel.app';

export type AiDisclosureItem = { title: string; detail: string };

// What leaves the device. Keep in sync with app/(drawer)/casey.tsx —
// buildGeminiPayload / buildGroqMessages (messages + optional profile block),
// stopAndTranscribe (voice recording), fetchOpenAiSpeech (reply text).
export const AI_DATA_SENT: AiDisclosureItem[] = [
  {
    title: 'Your messages',
    detail: "What you type to Casey, and Casey's replies in the same conversation.",
  },
  {
    title: 'Your voice',
    detail:
      'If you tap the microphone, the recording is sent to be turned into text, then deleted from your phone.',
  },
  {
    title: 'Your name and survey answers',
    detail:
      'Only if you also say yes to personalization inside the chat. Two answers are never sent: how long you have been home and whether you have a caseworker.',
  },
];

// Who receives it. Names must match the services actually called.
export const AI_PROVIDERS: AiDisclosureItem[] = [
  {
    title: 'Google (Gemini)',
    detail: "Reads your messages and writes Casey's replies.",
  },
  {
    title: 'Groq',
    detail:
      'Backup for writing replies when Google is unavailable, and turns your voice recordings into text.',
  },
  {
    title: 'OpenAI',
    detail:
      "Turns Casey's replies into spoken audio when you tap the speaker button or turn on Auto-read.",
  },
];

export const AI_PURPOSE_TEXT =
  'This information is used only so Casey can understand you, suggest resources from the FreePass directory, and read replies aloud. FreePass does not sell your information or use it for advertising. Each company processes it under its own privacy terms and is required to protect it. Nothing is sent to these companies until you agree.';

export const AI_CHOICE_TEXT =
  'If you say no, Casey stays off, but everything else in FreePass still works. You can change your mind any time in Account → Privacy.';
