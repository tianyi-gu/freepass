import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { FreepassTabBar } from '@/components/freepass-tab-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import { supabase } from '@/lib/supabase';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_KEY;

const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Groq is used as an automatic backup for the chat when Gemini is unavailable
// (e.g. depleted billing / quota). Speech-to-text also uses the same Groq key.
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_CHAT_MODEL = 'llama-3.3-70b-versatile';

// Abort provider calls that hang on a bad cell connection instead of letting
// the platform default (60s+) freeze the chat behind a spinner.
const REQUEST_TIMEOUT_MS = 20000;

// Only the most recent turns are sent to the model. The directory block
// dominates the prompt anyway; unbounded history grows cost quadratically and
// lets an early wrong answer keep re-conditioning later replies.
const HISTORY_LIMIT = 12;

// Hard cap on a voice recording so a forgotten live mic can't upload
// minutes of ambient audio.
const MAX_RECORDING_MS = 60000;

// Persisted user choices
const AUTO_SPEAK_KEY = '@freepass_casey_autospeak';
const SHARE_PROFILE_KEY = '@freepass_casey_share_profile';

const SYSTEM_PROMPT = `You are Casey, a warm and supportive reentry resource assistant for FreePass, a Philadelphia app helping formerly incarcerated individuals find support in Philadelphia.

Your goal is to have a short, guided conversation before recommending resources. Follow this flow:

1. If the user's message is vague (e.g. "hi", "help", "I need help"), ask ONE clarifying question to understand their most urgent need. Example: "Of course! To point you in the right direction — are you looking for help with housing, employment, mental health, legal support, or something else?"

2. If the user names a category (e.g. "I want a job", "housing"), ask ONE follow-up to personalize. Example for jobs: "Got it! Do you have a specific type of work in mind, or are you open to any opportunities right now?"

3. Once you have enough context (after at most 2 clarifying exchanges), recommend 2-3 specific organizations from the provided list. For each one include:
  - The org name
  - One sentence on why it fits their specific situation
  - The phone number

Rules:
- Only recommend organizations from the directory below — never invent or guess at organizations, phone numbers, hours, or websites. If a detail is marked "not listed", say you don't have it and suggest calling to ask.
- Directory details can go out of date. When you share an org, remind the user to call ahead to confirm hours and services.
- If the user talks about wanting to hurt themselves or someone else, being in danger, abuse at home, or a mental health emergency, drop the resource flow immediately. Tell them they can call or text 988 (the Suicide & Crisis Lifeline, free, 24/7), and to call 911 if they are in immediate danger. Be gentle and take as many sentences as you need — the length limit below does not apply in a crisis.
- You are not a lawyer, doctor, or financial advisor. Do not answer questions about parole or probation conditions, court cases, immigration, medications, diagnoses, or whether to take a loan or financial product. Say plainly that you can't advise on that, and point them to a relevant organization from the directory or to 211.
- Stay on the topic of finding support and resources in Philadelphia. If asked about unrelated things, gently steer back.
- Keep every message to 3-4 sentences max (except in a crisis).
- Be warm, human, and encouraging — never clinical or bureaucratic
- The directory below is the complete list of FreePass resources. If nothing in it matches the user's need, say so honestly and suggest they call 211 — don't stretch a poor match
- If the user's profile below is provided, use it to personalize from the start — don't re-ask things you already know (their name, location, needs, housing/work situation). Lead with what's most relevant to them, but still confirm briefly before recommending.`;

// Maps onboarding survey question IDs to short, readable labels for Casey's
// context. Deliberately excludes time_home and has_caseworker — they add
// little routing value and are the most sensitive fields to send off-device.
const SURVEY_LABELS: Record<string, string> = {
  preferred_name: 'Preferred name',
  zip_code: 'Area / ZIP',
  immediate_needs: 'Looking for help with',
  employment_status: 'Work situation',
  work_interests: 'Work interests',
  housing_status: 'Housing situation',
  financial_help: 'Wants financial help with',
  education_level: 'Education',
  learning_interest: 'Interested in learning',
  support_system: 'Has a support system',
};

// Builds a concise profile block from the user's onboarding survey answers so
// Casey can personalize. Returns '' when there's nothing useful to include.
function buildUserContext(
  displayName: string | undefined,
  answers: Record<string, string | string[]> | undefined,
): string {
  const lines: string[] = [];
  if (displayName) lines.push(`Name: ${displayName}`);

  for (const [id, label] of Object.entries(SURVEY_LABELS)) {
    const value = answers?.[id];
    if (!value) continue;
    const text = Array.isArray(value) ? value.join(', ') : value;
    if (text && text.trim()) lines.push(`${label}: ${text.trim()}`);
  }

  if (lines.length === 0) return '';
  return `Here is what the user shared about themselves during sign-up. Use it to personalize, but don't read it back to them verbatim:\n${lines.join('\n')}`;
}

type Resource = {
  name: string;
  address: string | null;
  city: string | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  tags: string[];
};

type Message = {
  id: string;
  role: 'user' | 'bot';
  text: string;
  // Synthetic messages (opening, errors, crisis cards) are shown in the UI
  // but never sent back to the model as conversation history.
  synthetic?: boolean;
};

const OPENING_MESSAGE: Message = {
  id: 'opening',
  role: 'bot',
  synthetic: true,
  text: "Hi, I'm Casey. I'm so glad you're here. I can help you find resources in Philadelphia — whether it's a job, housing, legal help, or anything else. What's on your mind? Just so you know: I can make mistakes, so double-check details like phone numbers before you rely on them.",
};

// Deterministic crisis screen — never leave this to the model. Numbers here
// are national, stable lines only.
const CRISIS_PATTERNS: RegExp[] = [
  /suicid/i,
  /kill\s+(myself|me|himself|herself|themselves)/i,
  /end\s+(my\s+life|it\s+all)/i,
  /hurt\s+(myself|himself|herself)/i,
  /self[-\s]?harm/i,
  /want(?:\s+to|na)\s+die/i,
  /better\s+off\s+dead/i,
  /no\s+reason\s+to\s+(live|keep\s+going)/i,
  /don'?t\s+want\s+to\s+(live|be\s+here)/i,
  /overdos/i,
  /(hitting|beating|abusing|hurting)\s+me\b/i,
  /domestic\s+violence/i,
  /abusive\s+(partner|relationship|home|boyfriend|girlfriend|husband|wife)/i,
  /kill\s+(him|her|them|someone)/i,
];

function isCrisisMessage(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

const CRISIS_REPLY =
  "It sounds like you may be going through something really serious right now, and I want you to talk to a real person, not just an app. You can call or text 988 any time, day or night — that's the Suicide & Crisis Lifeline, it's free, and the people there can help. If you're in immediate danger, call 911. If home isn't safe, the National Domestic Violence Hotline is 1-800-799-7233. You matter, and you don't have to handle this alone. I'm still here if you want help finding other resources.";

function buildContext(resources: Resource[]): string {
  if (resources.length === 0) {
    return 'The resource directory could not be loaded right now. Do not invent or recommend any organization — apologize and suggest the user browse the Resources tab or call 211.';
  }
  return resources
    .map(
      (r) =>
        `Org: ${r.name} | Location: ${[r.address, r.city].filter(Boolean).join(', ') || 'Location not listed'} | Services: ${(r.tags || []).join(', ') || 'Not tagged'} | Phone: ${r.phone || 'Phone not listed'} | Hours: ${r.hours || 'Hours not listed'} | Website: ${r.website || 'Website not listed'} | ${r.description || 'No description listed'}`
    )
    .join('\n');
}

type GeminiPart = { text: string };
type GeminiContent = { role: string; parts: GeminiPart[] };
type GeminiPayload = {
  system_instruction: { parts: GeminiPart[] };
  contents: GeminiContent[];
  generationConfig: {
    maxOutputTokens: number;
    temperature: number;
    thinkingConfig: { thinkingBudget: number };
  };
};

function buildSystemInstruction(resourceContext: string, userContext: string): string {
  const profileBlock = userContext ? `\n\n${userContext}` : '';
  return `${SYSTEM_PROMPT}${profileBlock}\n\nHere is the complete FreePass directory of Philadelphia reentry resources:\n\n${resourceContext}`;
}

// Recent, real conversation turns only — no synthetic UI messages.
function recentHistory(history: Message[]): Message[] {
  return history.filter((m) => !m.synthetic).slice(-HISTORY_LIMIT);
}

function buildGeminiPayload(
  history: Message[],
  currentUserText: string,
  resourceContext: string,
  userContext: string
): GeminiPayload {
  const contents: GeminiContent[] = recentHistory(history).map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  contents.push({ role: 'user', parts: [{ text: currentUserText }] });

  return {
    system_instruction: {
      parts: [{ text: buildSystemInstruction(resourceContext, userContext) }],
    },
    contents,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.4,
      // Routing a need to 2-3 rows of a provided list doesn't benefit from
      // extended thinking; it just adds latency and output-rate token cost.
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
}

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function buildGroqMessages(
  history: Message[],
  currentUserText: string,
  resourceContext: string,
  userContext: string
): ChatMessage[] {
  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemInstruction(resourceContext, userContext) },
  ];

  for (const msg of recentHistory(history)) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    });
  }

  messages.push({ role: 'user', content: currentUserText });
  return messages;
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Gemini refused to answer for safety reasons. Must NOT be retried on Groq —
// that would bypass the safety filter on exactly the messages it caught.
class SafetyBlockError extends Error {
  constructor() {
    super('Gemini safety block');
    this.name = 'SafetyBlockError';
  }
}

// Primary: Gemini. Throws on any failure so the caller can fall back to Groq —
// except SafetyBlockError, which the caller must handle without falling back.
async function fetchGeminiReply(
  history: Message[],
  text: string,
  context: string,
  userContext: string
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY.');

  const res = await fetchWithTimeout(`${GEMINI_API_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildGeminiPayload(history, text, context, userContext)),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`);

  const finishReason = json?.candidates?.[0]?.finishReason;
  if (
    json?.promptFeedback?.blockReason ||
    finishReason === 'SAFETY' ||
    finishReason === 'PROHIBITED_CONTENT'
  ) {
    throw new SafetyBlockError();
  }

  const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) throw new Error('Empty Gemini response');
  return reply;
}

// Backup: Groq. Used automatically when Gemini is unavailable.
async function fetchGroqReply(
  history: Message[],
  text: string,
  context: string,
  userContext: string
): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('Missing EXPO_PUBLIC_GROQ_KEY.');

  const res = await fetchWithTimeout(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_CHAT_MODEL,
      messages: buildGroqMessages(history, text, context, userContext),
      max_tokens: 1024,
      temperature: 0.4,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`);

  const reply = json?.choices?.[0]?.message?.content;
  if (!reply) throw new Error('Empty Groq response');
  return reply;
}

type VoiceGender = 'female' | 'male';

// Pitch fallback for gender when no matching installed voice is found.
// Kept subtle — aggressive pitch-shifting is what made speech sound robotic.
const VOICE_PITCH: Record<VoiceGender, number> = {
  female: 1.15,
  male: 0.9,
};

// Known iOS voice names by gender, best-first. Matched at runtime against
// the device's installed voices — never hardcode a voice identifier, since
// availability varies by device/OS version and a missing one breaks speech.
const FEMALE_VOICE_NAMES = ['ava', 'zoe', 'allison', 'samantha', 'susan', 'nicky', 'karen'];
const MALE_VOICE_NAMES = ['evan', 'nathan', 'tom', 'aaron', 'alex', 'daniel', 'fred'];

// TTS engines read "(215) 686-7175" unpredictably as prose. Phone numbers are
// the single most action-critical thing Casey says, so space the digits out.
function formatForSpeech(text: string): string {
  return text
    .replace(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, (m) => m.replace(/\D/g, '').split('').join(' '))
    .replace(/\b(988|911|211)\b/g, (m) => m.split('').join(' '));
}

export default function CaseyScreen() {
  const { user } = useUser();
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesStatus, setResourcesStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('female');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [installedVoices, setInstalledVoices] = useState<Speech.Voice[]>([]);
  // null = user hasn't decided yet (banner shows); false = declined
  const [shareProfile, setShareProfile] = useState<boolean | null>(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    // Voice list can be empty on first call while the system warms up; a
    // failure here simply leaves the system-default voice in place.
    Speech.getAvailableVoicesAsync()
      .then(setInstalledVoices)
      .catch(() => {});

    AsyncStorage.getItem(AUTO_SPEAK_KEY)
      .then((v) => setAutoSpeak(v === 'yes'))
      .catch(() => {});
    AsyncStorage.getItem(SHARE_PROFILE_KEY)
      .then((v) => setShareProfile(v === null ? null : v === 'yes'))
      .catch(() => {});
  }, []);

  const setAndStoreAutoSpeak = useCallback((value: boolean) => {
    setAutoSpeak(value);
    AsyncStorage.setItem(AUTO_SPEAK_KEY, value ? 'yes' : 'no').catch(() => {});
  }, []);

  const setAndStoreShareProfile = useCallback((value: boolean) => {
    setShareProfile(value);
    AsyncStorage.setItem(SHARE_PROFILE_KEY, value ? 'yes' : 'no').catch(() => {});
  }, []);

  // Best installed en-US voice for the requested gender. Prefers
  // Enhanced-quality variants; returns undefined when nothing matches so
  // the caller can fall back to the default voice + gentle pitch shift.
  const pickVoice = useCallback(
    (gender: VoiceGender): Speech.Voice | undefined => {
      const enUS = installedVoices.filter((v) => v.language === 'en-US');
      if (enUS.length === 0) return undefined;
      const enhancedFirst = [...enUS].sort(
        (a, b) =>
          (b.quality === Speech.VoiceQuality.Enhanced ? 1 : 0) -
          (a.quality === Speech.VoiceQuality.Enhanced ? 1 : 0),
      );
      const names = gender === 'female' ? FEMALE_VOICE_NAMES : MALE_VOICE_NAMES;
      for (const name of names) {
        const match = enhancedFirst.find((v) => v.name?.toLowerCase().includes(name));
        if (match) return match;
      }
      return undefined;
    },
    [installedVoices],
  );
  const listRef = useRef<FlatList>(null);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
    setSpeakingMsgId(null);
  }, []);

  const speakText = useCallback(
    (text: string, msgId: string) => {
      Speech.stop();
      setSpeakingMsgId(msgId);
      setIsSpeaking(true);

      // A real gendered voice at natural pitch sounds far more human than
      // the default voice pitch-shifted; only pitch-shift when no matching
      // voice is installed.
      const voice = pickVoice(voiceGender);
      const options: Speech.SpeechOptions = {
        language: 'en-US',
        ...(voice ? { voice: voice.identifier } : { pitch: VOICE_PITCH[voiceGender] }),
        onDone: () => { setIsSpeaking(false); setSpeakingMsgId(null); },
        onStopped: () => { setIsSpeaking(false); setSpeakingMsgId(null); },
        onError: () => { setIsSpeaking(false); setSpeakingMsgId(null); },
      };

      Speech.speak(formatForSpeech(text), options);
    },
    [voiceGender, pickVoice]
  );

  // Audio recording ref for speech-to-text
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const stopAndTranscribe = useCallback(async () => {
    const recording = recordingRef.current;
    // Clear the ref immediately: if stopping fails, the next mic tap must be
    // able to start a fresh recording rather than being wedged forever.
    recordingRef.current = null;
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsListening(false);
    if (!recording) return;

    setIsTranscribing(true);
    let uri: string | null = null;
    try {
      try {
        await recording.stopAndUnloadAsync();
      } finally {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
      }
      uri = recording.getURI();

      if (!uri) throw new Error('No recording URI');
      if (!GROQ_API_KEY) throw new Error('Speech-to-text is not configured.');

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');

      const res = await fetchWithTimeout('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`);

      const transcript = json.text?.trim();
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    } catch (err: any) {
      if (__DEV__) console.error('[Casey] Transcription error:', err);
      Alert.alert(
        'Voice input failed',
        "Sorry, I couldn't hear that. Please try again, or type your message instead.",
      );
    } finally {
      // Never leave audio of the user's voice sitting in the app cache.
      if (uri) FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      setIsTranscribing(false);
    }
  }, []);

  const toggleListening = useCallback(async () => {
    // If currently recording, stop and transcribe
    if (recordingRef.current) {
      await stopAndTranscribe();
      return;
    }

    // Stop TTS if playing
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    }

    // Start recording
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Microphone access needed', 'Please allow microphone access in Settings to use voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsListening(true);
      recordingTimerRef.current = setTimeout(() => {
        stopAndTranscribe();
      }, MAX_RECORDING_MS);
    } catch (err: any) {
      if (__DEV__) console.error('[Casey] Recording error:', err);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
      Alert.alert(
        'Microphone error',
        "Sorry, the microphone couldn't start. Please try again, or type your message instead.",
      );
    }
  }, [isSpeaking, stopAndTranscribe]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);

  const loadResources = useCallback(() => {
    setResourcesStatus('loading');
    supabase
      .from('resources')
      .select('name, address, city, description, phone, website, hours, tags')
      .eq('is_published', true)
      .then(({ data, error }) => {
        if (error || !data) {
          if (__DEV__) console.error('[Casey] Supabase fetch error:', error);
          setResourcesStatus('error');
          return;
        }
        setResources(data as Resource[]);
        setResourcesStatus('ready');
      });
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || inFlightRef.current) return;
    inFlightRef.current = true;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    const historySnapshot = [...messages, userMsg];
    setMessages(historySnapshot);
    setInput('');

    // Crisis messages get a deterministic, hardcoded response — never rely on
    // a model (or its safety-filter fallback path) for this.
    if (isCrisisMessage(text)) {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now() + 1}`, role: 'bot', text: CRISIS_REPLY, synthetic: true },
      ]);
      inFlightRef.current = false;
      return;
    }

    setLoading(true);

    try {
      const surveyAnswers =
        user && !user.isGuest && shareProfile === true ? user.surveyAnswers : undefined;
      const userContext = buildUserContext(
        user && !user.isGuest && shareProfile === true ? user.displayName : undefined,
        surveyAnswers,
      );

      // The full published directory is small (~100 orgs, ~8k tokens), so send
      // all of it and let the model match semantically. Keyword pre-filtering
      // missed needs phrased differently from the tags (e.g. "somewhere to
      // sleep" vs "housing") and padded misses with arbitrary orgs.
      const context = buildContext(resources);

      // Primary provider is Gemini; if it fails for availability reasons
      // (e.g. quota / billing depleted), automatically fall back to Groq so
      // the chat keeps working. Safety blocks are NOT availability failures
      // and never fall back.
      let reply: string;
      try {
        reply = await fetchGeminiReply(messages, text, context, userContext);
      } catch (geminiErr) {
        if (geminiErr instanceof SafetyBlockError) throw geminiErr;
        if (__DEV__) console.warn('[Casey] Gemini failed, falling back to Groq:', geminiErr);
        reply = await fetchGroqReply(messages, text, context, userContext);
      }

      const replyId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: replyId, role: 'bot', text: reply },
      ]);

      if (autoSpeak) speakText(reply, replyId);
    } catch (err) {
      if (err instanceof SafetyBlockError) {
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now() + 1}`, role: 'bot', text: CRISIS_REPLY, synthetic: true },
        ]);
      } else {
        if (__DEV__) console.error('[Casey] Both providers failed:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'bot',
            synthetic: true,
            text: "Sorry — I'm having trouble connecting right now. You can browse the Resources tab in the meantime, or call 211 any time for help finding services. Please try me again in a few minutes.",
          },
        ]);
      }
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const isCurrentlySpeaking = isSpeaking && speakingMsgId === item.id;
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>C</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.text}</Text>
          {!isUser && (
            <Pressable
              style={styles.speakerBtn}
              accessibilityRole="button"
              accessibilityLabel={isCurrentlySpeaking ? 'Stop reading this message' : 'Read this message aloud'}
              onPress={() =>
                isCurrentlySpeaking ? stopSpeaking() : speakText(item.text, item.id)
              }>
              <IconSymbol
                name="speaker.wave.2.fill"
                size={16}
                color={isCurrentlySpeaking ? FreepassColors.accent : FreepassColors.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const showConsentBanner = shareProfile === null && !!user && !user.isGuest;
  const sendDisabled = !input.trim() || loading || resourcesStatus === 'loading';

  return (
    <View style={styles.container}>
      <FreepassHeader showMenu title="Casey" />
      <View style={styles.voiceBar}>
        <IconSymbol name="speaker.wave.2.fill" size={16} color={FreepassColors.textSecondary} />
        <Text style={styles.voiceLabel}>Voice:</Text>
        <Pressable
          style={[styles.voiceOption, voiceGender === 'female' && styles.voiceOptionActive]}
          accessibilityRole="button"
          accessibilityLabel="Use a female voice"
          onPress={() => { setVoiceGender('female'); if (isSpeaking) stopSpeaking(); }}>
          <Text style={[styles.voiceOptionText, voiceGender === 'female' && styles.voiceOptionTextActive]}>Female</Text>
        </Pressable>
        <Pressable
          style={[styles.voiceOption, voiceGender === 'male' && styles.voiceOptionActive]}
          accessibilityRole="button"
          accessibilityLabel="Use a male voice"
          onPress={() => { setVoiceGender('male'); if (isSpeaking) stopSpeaking(); }}>
          <Text style={[styles.voiceOptionText, voiceGender === 'male' && styles.voiceOptionTextActive]}>Male</Text>
        </Pressable>
        <View style={styles.voiceBarSpacer} />
        <Pressable
          style={[styles.voiceOption, autoSpeak && styles.voiceOptionActive]}
          accessibilityRole="switch"
          accessibilityState={{ checked: autoSpeak }}
          accessibilityLabel="Automatically read Casey's replies aloud"
          onPress={() => {
            const next = !autoSpeak;
            setAndStoreAutoSpeak(next);
            if (!next && isSpeaking) stopSpeaking();
          }}>
          <Text style={[styles.voiceOptionText, autoSpeak && styles.voiceOptionTextActive]}>
            {autoSpeak ? 'Auto-read: On' : 'Auto-read: Off'}
          </Text>
        </Pressable>
      </View>
      {resourcesStatus !== 'ready' && (
        <View style={styles.statusStrip}>
          {resourcesStatus === 'loading' ? (
            <Text style={styles.statusStripText}>Loading the resource directory…</Text>
          ) : (
            <>
              <Text style={styles.statusStripText}>
                Couldn&apos;t load the resource directory.
              </Text>
              <Pressable
                onPress={loadResources}
                accessibilityRole="button"
                accessibilityLabel="Retry loading the resource directory">
                <Text style={styles.statusStripRetry}>Retry</Text>
              </Pressable>
            </>
          )}
        </View>
      )}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />
        {loading && (
          <View style={styles.typingRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>C</Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color={FreepassColors.primary} />
            </View>
          </View>
        )}
        {showConsentBanner && (
          <View style={styles.consentBanner}>
            <Text style={styles.consentText}>
              Casey can use your survey answers (like the kind of help you&apos;re looking for) to
              personalize suggestions. Your messages and anything you share are processed by
              outside AI services (Google Gemini and Groq). Share your survey answers with Casey?
            </Text>
            <View style={styles.consentButtons}>
              <Pressable
                style={styles.consentBtnPrimary}
                accessibilityRole="button"
                accessibilityLabel="Yes, use my survey answers to personalize"
                onPress={() => setAndStoreShareProfile(true)}>
                <Text style={styles.consentBtnPrimaryText}>Yes, personalize</Text>
              </Pressable>
              <Pressable
                style={styles.consentBtnSecondary}
                accessibilityRole="button"
                accessibilityLabel="No, don't share my survey answers"
                onPress={() => setAndStoreShareProfile(false)}>
                <Text style={styles.consentBtnSecondaryText}>No thanks</Text>
              </Pressable>
            </View>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={isListening ? 'Listening... tap mic to stop' : isTranscribing ? 'Transcribing...' : 'Message Casey...'}
            placeholderTextColor={isListening ? FreepassColors.accent : FreepassColors.textSecondary}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={sendMessage}
          />
          <Pressable
            style={[styles.micBtn, isListening && styles.micBtnActive]}
            onPress={toggleListening}
            accessibilityRole="button"
            accessibilityLabel={isListening ? 'Stop recording' : 'Speak your message'}
            disabled={isTranscribing}>
            {isTranscribing ? (
              <ActivityIndicator size="small" color={FreepassColors.textSecondary} />
            ) : (
              <IconSymbol
                name="mic.fill"
                size={20}
                color={isListening ? FreepassColors.white : FreepassColors.textSecondary}
              />
            )}
          </Pressable>
          <Pressable
            style={[styles.sendBtn, sendDisabled && styles.sendBtnDisabled]}
            onPress={sendMessage}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={sendDisabled}>
            <Text style={styles.sendBtnText}>Send</Text>
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>
          Casey can make mistakes — double-check phone numbers and hours before relying on them.
          Messages are processed by outside AI services. Call 211 for urgent needs, or call/text
          988 in a crisis.
        </Text>
      </KeyboardAvoidingView>
      <FreepassTabBar activeTab="casey" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  flex: { flex: 1 },
  messageList: {
    padding: 16,
    paddingBottom: 8,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FreepassColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: FreepassColors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleBot: {
    backgroundColor: FreepassColors.cardBg,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: FreepassColors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: FreepassColors.text,
  },
  bubbleTextUser: {
    color: FreepassColors.white,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: FreepassColors.lightGray,
    backgroundColor: FreepassColors.white,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: FreepassColors.text,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FreepassColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
  },
  micBtnActive: {
    backgroundColor: FreepassColors.destructive,
    borderColor: FreepassColors.destructive,
  },
  sendBtn: {
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: FreepassColors.accent,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: FreepassColors.lightGray,
  },
  sendBtnText: {
    color: FreepassColors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  voiceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: FreepassColors.lightGray,
    backgroundColor: FreepassColors.offWhite,
  },
  voiceBarSpacer: {
    flex: 1,
  },
  voiceLabel: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
    fontWeight: '500',
  },
  voiceOption: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: FreepassColors.white,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
  },
  voiceOptionActive: {
    backgroundColor: FreepassColors.primary,
    borderColor: FreepassColors.primary,
  },
  voiceOptionText: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
    fontWeight: '500',
  },
  voiceOptionTextActive: {
    color: FreepassColors.white,
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: FreepassColors.cardBg,
  },
  statusStripText: {
    fontSize: 12,
    color: FreepassColors.textSecondary,
  },
  statusStripRetry: {
    fontSize: 12,
    fontWeight: '700',
    color: FreepassColors.accent,
  },
  consentBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: FreepassColors.cardBg,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
  },
  consentText: {
    fontSize: 13,
    lineHeight: 18,
    color: FreepassColors.text,
  },
  consentButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  consentBtnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: FreepassColors.primary,
  },
  consentBtnPrimaryText: {
    color: FreepassColors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  consentBtnSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: FreepassColors.white,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
  },
  consentBtnSecondaryText: {
    color: FreepassColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  speakerBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
    padding: 4,
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 16,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
    backgroundColor: FreepassColors.white,
  },
});
