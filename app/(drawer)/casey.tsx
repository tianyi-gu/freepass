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
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Groq is used as an automatic backup for the chat when Gemini is unavailable
// (e.g. depleted billing / quota). Speech-to-text also uses the same Groq key.
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_CHAT_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are Casey, a warm and supportive reentry resource assistant for FreePass, a Philadelphia app helping formerly incarcerated individuals find support in Philadelphia.

Your goal is to have a short, guided conversation before recommending resources. Follow this flow:

1. If the user's message is vague (e.g. "hi", "help", "I need help"), ask ONE clarifying question to understand their most urgent need. Example: "Of course! To point you in the right direction — are you looking for help with housing, employment, mental health, legal support, or something else?"

2. If the user names a category (e.g. "I want a job", "housing"), ask ONE follow-up to personalize. Example for jobs: "Got it! Do you have a specific type of work in mind, or are you open to any opportunities right now?"

3. Once you have enough context (after at most 2 clarifying exchanges), recommend 2-3 specific organizations from the provided list. For each one include:
  - The org name
  - One sentence on why it fits their specific situation
  - The phone number

Rules:
- Only recommend organizations from the directory below — never invent or guess at organizations, phone numbers, or hours
- Keep every message to 3-4 sentences max
- Be warm, human, and encouraging — never clinical or bureaucratic
- The directory below is the complete list of FreePass resources. If nothing in it matches the user's need, say so honestly and suggest they call 211 — don't stretch a poor match
- If the user's profile below is provided, use it to personalize from the start — don't re-ask things you already know (their name, location, needs, housing/work situation). Lead with what's most relevant to them, but still confirm briefly before recommending.`;

// Maps onboarding survey question IDs to short, readable labels for Casey's context.
const SURVEY_LABELS: Record<string, string> = {
  preferred_name: 'Preferred name',
  zip_code: 'Area / ZIP',
  time_home: 'Time since coming home',
  immediate_needs: 'Looking for help with',
  employment_status: 'Work situation',
  work_interests: 'Work interests',
  housing_status: 'Housing situation',
  financial_help: 'Wants financial help with',
  education_level: 'Education',
  learning_interest: 'Interested in learning',
  support_system: 'Has a support system',
  has_caseworker: 'Working with a case worker',
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
};

const OPENING_MESSAGE: Message = {
  id: 'opening',
  role: 'bot',
  text: "Hi, I'm Casey. I'm so glad you're here. I can help you find resources in Philadelphia — whether it's a job, housing, legal help, or anything else. What's on your mind?",
};

function buildContext(resources: Resource[]): string {
  if (resources.length === 0) {
    return 'The resource directory could not be loaded right now. Do not invent or recommend any organization — apologize and suggest the user browse the Resources tab or call 211.';
  }
  return resources
    .map(
      (r) =>
        `Org: ${r.name} | Location: ${[r.address, r.city].filter(Boolean).join(', ') || 'Location not listed'} | Services: ${(r.tags || []).join(', ') || 'Not tagged'} | Phone: ${r.phone || 'Phone not listed'} | ${r.description || 'No description listed'}`
    )
    .join('\n');
}

type GeminiPart = { text: string };
type GeminiContent = { role: string; parts: GeminiPart[] };
type GeminiPayload = {
  system_instruction: { parts: GeminiPart[] };
  contents: GeminiContent[];
};

function buildSystemInstruction(resourceContext: string, userContext: string): string {
  const profileBlock = userContext ? `\n\n${userContext}` : '';
  return `${SYSTEM_PROMPT}${profileBlock}\n\nHere is the complete FreePass directory of Philadelphia reentry resources:\n\n${resourceContext}`;
}

function buildGeminiPayload(
  history: Message[],
  currentUserText: string,
  resourceContext: string,
  userContext: string
): GeminiPayload {
  const contents: GeminiContent[] = [];

  for (const msg of history) {
    if (msg.id === 'opening') continue;
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  }

  contents.push({ role: 'user', parts: [{ text: currentUserText }] });

  return {
    system_instruction: {
      parts: [{ text: buildSystemInstruction(resourceContext, userContext) }],
    },
    contents,
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

  for (const msg of history) {
    if (msg.id === 'opening') continue;
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    });
  }

  messages.push({ role: 'user', content: currentUserText });
  return messages;
}

// Primary: Gemini. Throws on any failure so the caller can fall back to Groq.
async function fetchGeminiReply(
  history: Message[],
  text: string,
  context: string,
  userContext: string
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY.');

  const res = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildGeminiPayload(history, text, context, userContext)),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`);

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

  const res = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_CHAT_MODEL,
      messages: buildGroqMessages(history, text, context, userContext),
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

// Primary TTS: OpenAI gpt-4o-mini-tts — far more natural than device speech
// synthesis. Device speech (above) remains the fallback when the key is
// missing or the request fails, so voice keeps working offline.
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';
const OPENAI_TTS_MODEL = 'gpt-4o-mini-tts';
const OPENAI_TTS_VOICES: Record<VoiceGender, string> = {
  female: 'nova',
  male: 'onyx',
};
const OPENAI_TTS_INSTRUCTIONS =
  'Speak warmly and supportively, at a relaxed natural pace, like a friendly caseworker reassuring someone.';

// Synthesizes speech with OpenAI and returns a local file URI for playback.
// Written to the cache directory so replays of the same message are free.
async function fetchOpenAiSpeech(
  text: string,
  gender: VoiceGender,
  cacheKey: string,
): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error('Missing EXPO_PUBLIC_OPENAI_API_KEY.');

  const res = await fetch(OPENAI_TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_TTS_MODEL,
      voice: OPENAI_TTS_VOICES[gender],
      input: text,
      instructions: OPENAI_TTS_INSTRUCTIONS,
      response_format: 'mp3',
    }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
  }

  // RN's fetch has no arrayBuffer support on all platforms; go through
  // blob → data URL to get base64 for expo-file-system.
  const blob = await res.blob();
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.slice(dataUrl.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });

  const uri = `${FileSystem.cacheDirectory}casey-tts-${cacheKey}.mp3`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

export default function CaseyScreen() {
  const { user } = useUser();
  const [resources, setResources] = useState<Resource[]>([]);
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('female');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [installedVoices, setInstalledVoices] = useState<Speech.Voice[]>([]);

  useEffect(() => {
    // Voice list can be empty on first call while the system warms up; a
    // failure here simply leaves the system-default voice in place.
    Speech.getAvailableVoicesAsync()
      .then(setInstalledVoices)
      .catch(() => {});
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

  // Currently playing OpenAI TTS sound, if any.
  const soundRef = useRef<Audio.Sound | null>(null);
  // Bumped whenever speech is (re)started or stopped so in-flight synthesis
  // requests know they've been superseded and must not start playing.
  const speakSeqRef = useRef(0);
  // msgId+gender → local audio file URI, so replaying a message is free.
  const ttsFileCacheRef = useRef<Map<string, string>>(new Map());

  const stopSpeaking = useCallback(() => {
    speakSeqRef.current += 1;
    Speech.stop();
    const sound = soundRef.current;
    soundRef.current = null;
    sound?.unloadAsync().catch(() => {});
    setIsSpeaking(false);
    setSpeakingMsgId(null);
  }, []);

  // Fallback: on-device speech synthesis. A real gendered voice at natural
  // pitch sounds far more human than the default voice pitch-shifted; only
  // pitch-shift when no matching voice is installed.
  const speakWithDevice = useCallback(
    (text: string) => {
      const voice = pickVoice(voiceGender);
      const options: Speech.SpeechOptions = {
        language: 'en-US',
        ...(voice ? { voice: voice.identifier } : { pitch: VOICE_PITCH[voiceGender] }),
        onDone: () => { setIsSpeaking(false); setSpeakingMsgId(null); },
        onStopped: () => { setIsSpeaking(false); setSpeakingMsgId(null); },
        onError: () => { setIsSpeaking(false); setSpeakingMsgId(null); },
      };

      Speech.speak(text, options);
    },
    [voiceGender, pickVoice]
  );

  const speakText = useCallback(
    async (text: string, msgId: string) => {
      stopSpeaking();
      const seq = speakSeqRef.current;
      setSpeakingMsgId(msgId);
      setIsSpeaking(true);

      try {
        const cacheKey = `${msgId}-${voiceGender}`;
        let uri = ttsFileCacheRef.current.get(cacheKey);
        if (!uri) {
          uri = await fetchOpenAiSpeech(text, voiceGender, cacheKey);
          ttsFileCacheRef.current.set(cacheKey, uri);
        }
        // Another speak/stop happened while we were synthesizing.
        if (speakSeqRef.current !== seq) return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        if (speakSeqRef.current !== seq) {
          sound.unloadAsync().catch(() => {});
          return;
        }
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded || !status.didJustFinish) return;
          if (soundRef.current === sound) {
            soundRef.current = null;
            setIsSpeaking(false);
            setSpeakingMsgId(null);
          }
          sound.unloadAsync().catch(() => {});
        });
      } catch (err) {
        if (__DEV__) console.warn('[Casey] OpenAI TTS failed, using device speech:', err);
        if (speakSeqRef.current !== seq) return;
        speakWithDevice(text);
      }
    },
    [voiceGender, stopSpeaking, speakWithDevice]
  );

  // Audio recording ref for speech-to-text
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const toggleListening = useCallback(async () => {
    // If currently recording, stop and transcribe
    if (isListening && recordingRef.current) {
      setIsListening(false);
      setIsTranscribing(true);
      try {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null;
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

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

        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
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
        Alert.alert('Transcription error', err?.message || 'Could not transcribe audio.');
      } finally {
        setIsTranscribing(false);
      }
      return;
    }

    // Stop TTS if playing
    if (isSpeaking) stopSpeaking();

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
    } catch (err: any) {
      if (__DEV__) console.error('[Casey] Recording error:', err);
      Alert.alert('Microphone error', err?.message || 'Could not start recording.');
    }
  }, [isListening, isSpeaking, stopSpeaking]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    supabase
      .from('resources')
      .select('name, address, city, description, phone, website, hours, tags')
      .eq('is_published', true)
      .then(({ data, error }) => {
        if (error) { if (__DEV__) console.error('[Casey] Supabase fetch error:', error); return; }
        if (data) setResources(data as Resource[]);
      });
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    const historySnapshot = [...messages, userMsg];
    setMessages(historySnapshot);
    setInput('');
    setLoading(true);

    try {
      const surveyAnswers = user && !user.isGuest ? user.surveyAnswers : undefined;
      const userContext = buildUserContext(
        user && !user.isGuest ? user.displayName : undefined,
        surveyAnswers,
      );

      // The full published directory is small (~100 orgs, ~8k tokens), so send
      // all of it and let the model match semantically. Keyword pre-filtering
      // missed needs phrased differently from the tags (e.g. "somewhere to
      // sleep" vs "housing") and padded misses with arbitrary orgs.
      const context = buildContext(resources);

      // Primary provider is Gemini; if it fails for any reason (e.g. quota /
      // billing depleted), automatically fall back to Groq so the chat keeps
      // working for users without interruption.
      let reply: string;
      try {
        reply = await fetchGeminiReply(messages, text, context, userContext);
      } catch (geminiErr) {
        if (__DEV__) console.warn('[Casey] Gemini failed, falling back to Groq:', geminiErr);
        reply = await fetchGroqReply(messages, text, context, userContext);
      }

      const replyId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: replyId, role: 'bot', text: reply },
      ]);

      // Auto-read Casey's response
      speakText(reply, replyId);
    } catch (err) {
      if (__DEV__) console.error('[Casey] Both providers failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: "Sorry, I'm having trouble connecting right now. Please try Resources or try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.container}>
      <FreepassHeader showMenu title="Casey" />
      <View style={styles.voiceBar}>
        <IconSymbol name="speaker.wave.2.fill" size={16} color={FreepassColors.textSecondary} />
        <Text style={styles.voiceLabel}>Voice:</Text>
        <Pressable
          style={[styles.voiceOption, voiceGender === 'female' && styles.voiceOptionActive]}
          onPress={() => { setVoiceGender('female'); if (isSpeaking) stopSpeaking(); }}>
          <Text style={[styles.voiceOptionText, voiceGender === 'female' && styles.voiceOptionTextActive]}>Female</Text>
        </Pressable>
        <Pressable
          style={[styles.voiceOption, voiceGender === 'male' && styles.voiceOptionActive]}
          onPress={() => { setVoiceGender('male'); if (isSpeaking) stopSpeaking(); }}>
          <Text style={[styles.voiceOptionText, voiceGender === 'male' && styles.voiceOptionTextActive]}>Male</Text>
        </Pressable>
      </View>
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
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}>
            <Text style={styles.sendBtnText}>Send</Text>
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>
          Casey can make mistakes. Double-check phone numbers and hours, and call 211 for urgent needs.
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
  speakerBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
    padding: 4,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 15,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
    backgroundColor: FreepassColors.white,
  },
});
