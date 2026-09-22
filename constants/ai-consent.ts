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

// Disclosure version is independent of the unchanged backend request protocol.
export { AI_CONSENT_VERSION } from '@/lib/ai-consent-record';
export const PRIVACY_POLICY_URL = 'https://freepass-privacy.vercel.app';
export type AiDisclosureItem = { title: string; detail: string };

export const AI_DATA_SENT: AiDisclosureItem[] = [
  { title: 'Chat', detail: 'Your messages and recent Casey replies are sent to OpenAI to find resources in the FreePass directory.' },
  { title: 'Microphone', detail: 'If you use it, your voice recording is sent to OpenAI to turn speech into text. You review the transcript before sending it as a message.' },
  { title: 'Read aloud', detail: 'If you use a speaker button or Auto-read, reply text is sent to OpenAI to create an artificial voice.' },
  { title: 'Optional survey sharing', detail: 'Off unless you separately allow it in this session. It includes your preferred name, ZIP code, needs, work, housing, financial-help, education, learning interests and support-system answers.' },
];
export const AI_PURPOSE_TEXT = 'OpenAI is a third-party AI provider. FreePass sends this data through its Supabase backend. Your documents, budget, account password, time since release and caseworker answer are not automatically included. Anything you type or record may contain personal information.';
export const AI_RETENTION_TEXT = 'OpenAI may retain chat and speech-generation data for security and abuse prevention. Turning sharing off stops new requests; it cannot recall information already sent. See the privacy policy for retention details.';
export const AI_CHOICE_TEXT = 'Allow FreePass to share the data described above with OpenAI? If you decline, Casey stays off and you can still use the rest of FreePass. Review or withdraw permission in Casey or Account → Privacy.';
