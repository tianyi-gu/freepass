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
export { CASEY_CONSENT_VERSION as AI_CONSENT_VERSION } from '@/lib/casey-contract';

export const PRIVACY_POLICY_URL = 'https://freepass-privacy.vercel.app';

export type AiDisclosureItem = { title: string; detail: string };

// What leaves the device. Keep in sync with app/(drawer)/casey.tsx —
// requestCasey (messages + optional profile opt-in),
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
    title: 'OpenAI',
    detail:
      "Reads your conversation to select resources from the FreePass directory, turns microphone recordings into text, and turns Casey's replies into audio when you use the speaker or Auto-read. Requests pass through FreePass's Supabase backend.",
  },
];

export const AI_PURPOSE_TEXT =
  'This information is used to help Casey understand your request, select directory entries, and provide voice features. FreePass does not sell your information or use it for advertising. OpenAI processes API data under its own terms, including retention for abuse monitoring; we request that chat responses are not stored as retrievable conversations. Nothing is sent to OpenAI until you agree.';

export const AI_CHOICE_TEXT =
  'If you say no, Casey stays off, but everything else in FreePass still works. You can change your mind any time in Account → Privacy.';
