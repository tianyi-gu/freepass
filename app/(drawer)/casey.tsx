import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

import { AiConsentNotice, AiDisabledNotice } from '@/components/ai-consent-notice';
import { FreepassHeader } from '@/components/freepass-header';
import { FreepassTabBar } from '@/components/freepass-tab-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useAiConsent } from '@/contexts/ai-consent-context';
import { useUser } from '@/contexts/user-context';
import { supabase } from '@/lib/supabase';
import { cancelCaseyRequests, CaseyRequestError, requestCasey } from '@/lib/casey-client';
import { CASEY_CRISIS_REPLY, CASEY_MAX_HISTORY, CASEY_MAX_MESSAGE, isCrisisMessage } from '@/lib/casey-contract';

// Provider keys live in the Supabase edge function, never in the app bundle.
const MAX_RECORDING_MS = 60000;
const AUTO_SPEAK_KEY = '@freepass_casey_autospeak';
const SHARE_PROFILE_KEY = '@freepass_casey_share_profile';
type Message = { id: string; role: 'user' | 'bot'; text: string; synthetic?: boolean };
const OPENING_MESSAGE: Message = {
  id: 'opening', role: 'bot', synthetic: true,
  text: "Hi, I'm Casey. I can help you find support in the FreePass directory. What would help most right now? Directory details may be out of date, so please call ahead to confirm services and hours. My spoken voice is AI-generated.",
};

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

// Device TTS engines read "(215) 686-7175" unpredictably as prose. Phone
// numbers are the single most action-critical thing Casey says, so space the
// digits out for the on-device fallback voice. (OpenAI TTS handles the
// formatted number naturally, so it gets the raw text.)
function formatForSpeech(text: string): string {
  return text
    .replace(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, (m) => m.replace(/\D/g, '').split('').join(' '))
    .replace(/\b(988|911|211)\b/g, (m) => m.split('').join(' '));
}

async function fetchOpenAiSpeech(text: string, gender: VoiceGender, cacheKey: string, allowed: () => boolean): Promise<string> {
  const { audio } = await requestCasey<{ audio: string }>({ action: 'speech', text, voice: gender }, allowed);
  if (typeof audio !== 'string') throw new Error('Speech unavailable');
  const uri = `${FileSystem.cacheDirectory}casey-tts-${cacheKey}.mp3`;
  await FileSystem.writeAsStringAsync(uri, audio, { encoding: FileSystem.EncodingType.Base64 });
  if (!allowed()) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
    throw new Error('Speech cancelled');
  }
  return uri;
}

export default function CaseyScreen() {
  const { user } = useUser();
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

  // Device-level consent to send data to the AI providers. Until accepted, the
  // chat UI is replaced by the notice and none of the network paths run.
  const aiConsent = useAiConsent();
  const aiAllowed = aiConsent.status === 'accepted';
  // After declining, the user can ask to see the full notice again from the
  // "Casey is turned off" panel; re-enabling always requires re-reading it.
  const [showConsentNotice, setShowConsentNotice] = useState(false);
  // Consent can be revoked from Account → Privacy while this screen has work
  // in flight (a live recording, a reply still arriving). Async completions
  // must read the status as it is *now*, not as captured when they started.
  const aiAllowedRef = useRef(aiAllowed);
  useLayoutEffect(() => {
    aiAllowedRef.current = aiAllowed;
  }, [aiAllowed]);

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

      Speech.speak(formatForSpeech(text), options);
    },
    [voiceGender, pickVoice]
  );

  const speakText = useCallback(
    async (text: string, msgId: string) => {
      stopSpeaking();
      const seq = speakSeqRef.current;
      setSpeakingMsgId(msgId);
      setIsSpeaking(true);

      // Without *current* consent, never contact OpenAI — on-device speech
      // only. Read the ref: auto-read runs after a reply arrives, by which
      // time consent may have been revoked.
      if (!aiAllowedRef.current) {
        speakWithDevice(text);
        return;
      }

      try {
        const cacheKey = `${msgId}-${voiceGender}`;
        let uri = ttsFileCacheRef.current.get(cacheKey);
        if (!uri) {
          uri = await fetchOpenAiSpeech(text, voiceGender, cacheKey, () => aiAllowedRef.current);
          ttsFileCacheRef.current.set(cacheKey, uri);
        }
        // Another speak/stop happened while we were synthesizing.
        if (speakSeqRef.current !== seq || !aiAllowedRef.current) return;

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
        if (speakSeqRef.current !== seq || !aiAllowedRef.current) return;
        speakWithDevice(text);
      }
    },
    [voiceGender, stopSpeaking, speakWithDevice]
  );

  // Audio recording ref for speech-to-text
  const recordingRef = useRef<Audio.Recording | null>(null);
  const startingRecordingRef = useRef(false);
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

      // Consent may have been revoked (Account → Privacy) while the mic was
      // live — including when the 60s auto-stop timer is what got us here.
      // Never upload in that case; the finally block deletes the file.
      if (!aiAllowedRef.current) return;

      if (!uri) throw new Error('No recording URI');
      const audio = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const json = await requestCasey<{ text: string }>({ action: 'transcribe', audio }, () => aiAllowedRef.current);
      if (!aiAllowedRef.current) return;

      const transcript = json.text?.trim();
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript).slice(0, CASEY_MAX_MESSAGE));
    } catch (err: any) {
      if (__DEV__) console.error('[Casey] Transcription error:', err);
      if (!aiAllowedRef.current) return;
      Alert.alert(
        'Voice input failed',
        "Sorry, I couldn't hear that. Please try again, or type your message instead.",
      );
    } finally {
      // Never leave audio of the user's voice sitting in the app cache.
      uri = uri ?? recording.getURI();
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
    if (isSpeaking) stopSpeaking();

    // Recordings are sent through FreePass to OpenAI for transcription — not without consent.
    if (!aiAllowed) return;

    if (startingRecordingRef.current) return;
    startingRecordingRef.current = true;
    let recording: Audio.Recording | null = null;
    // Start recording
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Microphone access needed', 'Please allow microphone access in Settings to use voice input.');
        return;
      }

      if (!aiAllowedRef.current) return;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      if (!aiAllowedRef.current) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        return;
      }
      recordingRef.current = recording;
      await recording.startAsync();
      if (!aiAllowedRef.current || recordingRef.current !== recording) {
        await recording.stopAndUnloadAsync().catch(() => {});
        const uri = recording.getURI();
        if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
        if (recordingRef.current === recording) recordingRef.current = null;
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        return;
      }
      setIsListening(true);
      recordingTimerRef.current = setTimeout(() => {
        stopAndTranscribe();
      }, MAX_RECORDING_MS);
    } catch (err: any) {
      if (__DEV__) console.error('[Casey] Recording error:', err);
      if (recordingRef.current === recording) recordingRef.current = null;
      if (recording) {
        await recording.stopAndUnloadAsync().catch(() => {});
        const uri = recording.getURI();
        if (uri) await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
      if (!aiAllowedRef.current) return;
      Alert.alert(
        'Microphone error',
        "Sorry, the microphone couldn't start. Please try again, or type your message instead.",
      );
    } finally {
      startingRecordingRef.current = false;
    }
  }, [isSpeaking, stopSpeaking, stopAndTranscribe, aiAllowed]);

  // If consent is revoked while the mic is live, stop right away; the
  // recording is discarded by stopAndTranscribe's own consent check (the
  // ref-sync effect above runs first, so it already sees the new value).
  useEffect(() => {
    if (!aiAllowed) {
      cancelCaseyRequests();
      stopSpeaking();
      if (recordingRef.current) stopAndTranscribe();
    }
  }, [aiAllowed, stopAndTranscribe, stopSpeaking]);

  // Clean up on unmount
  useEffect(() => {
    const cachedFiles = ttsFileCacheRef.current;
    return () => {
      aiAllowedRef.current = false;
      cancelCaseyRequests();
      Speech.stop();
      for (const uri of cachedFiles.values()) FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
      if (recordingRef.current) {
        const recording = recordingRef.current;
        recording.stopAndUnloadAsync().finally(() => {
          const uri = recording.getURI();
          if (uri) FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
        }).catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);

  const loadResources = useCallback(() => {
    setResourcesStatus('loading');
    supabase
      .from('resources')
      .select('id').limit(1)
      .eq('is_published', true)
      .then(({ data, error }) => {
        if (error || !data) {
          if (__DEV__) console.error('[Casey] Supabase fetch error:', error);
          setResourcesStatus('error');
          return;
        }
        setResourcesStatus('ready');
      });
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const sendMessage = async () => {
    const text = input.trim().slice(0, CASEY_MAX_MESSAGE);
    // aiAllowed: the chat UI isn't rendered without consent, but never rely on
    // the UI alone to keep personal data from reaching the providers.
    if (!text || loading || inFlightRef.current || !aiAllowed) return;
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
        { id: `${Date.now() + 1}`, role: 'bot', text: CASEY_CRISIS_REPLY, synthetic: true },
      ]);
      inFlightRef.current = false;
      return;
    }

    setLoading(true);

    try {
      const result = await requestCasey<{ reply: string }>({
        action: 'chat', message: text,
        history: messages.filter((m) => !m.synthetic).slice(-CASEY_MAX_HISTORY).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        personalize: !!user && !user.isGuest && shareProfile === true,
      }, () => aiAllowedRef.current);
      if (!aiAllowedRef.current) return;
      if (typeof result.reply !== 'string' || !result.reply.trim()) throw new Error('Empty reply');
      const replyId = String(Date.now() + 1);
      setMessages((prev) => [...prev.slice(-39), { id: replyId, role: 'bot', text: result.reply }]);
      if (autoSpeak) speakText(result.reply, replyId);
    } catch (error) {
      if (!aiAllowedRef.current) return;
      const busy = error instanceof CaseyRequestError && error.code === 'busy';
      setMessages((prev) => [...prev.slice(-39), {
        id: String(Date.now() + 1), role: 'bot', synthetic: true,
        text: busy ? "Casey has reached a usage limit. Please try again later. You can still browse Resources or call 211 for help finding services."
          : "I couldn't reach Casey right now. Please try again, browse the Resources tab, or call 211 for help finding services.",
      }]);
    } finally {
      inFlightRef.current = false;
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

  // Consent gate: no chat UI (and no provider traffic) until the user has
  // read the disclosure and accepted. 'loading' lasts one storage read.
  if (!aiAllowed) {
    const showNotice = aiConsent.status === 'unknown' || showConsentNotice;
    return (
      <View style={styles.container}>
        <FreepassHeader showMenu title="Casey" />
        {aiConsent.status === 'loading' ? (
          <View style={styles.flex} />
        ) : showNotice ? (
          <AiConsentNotice
            onAccept={() => {
              setShowConsentNotice(false);
              aiConsent.accept();
            }}
            onDecline={() => {
              setShowConsentNotice(false);
              aiConsent.decline();
            }}
          />
        ) : (
          <AiDisabledNotice onTurnOn={() => setShowConsentNotice(true)} />
        )}
        <FreepassTabBar activeTab="casey" />
      </View>
    );
  }

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
              Casey can use your name and survey answers (like the kind of help you&apos;re looking
              for) to personalize suggestions. If you say yes, they are included in what is sent to
              OpenAI through FreePass. Share your survey
              answers with Casey?
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
            maxLength={CASEY_MAX_MESSAGE}
            onChangeText={setInput}
            placeholder={isListening ? 'Listening... tap mic to stop' : isTranscribing ? 'Transcribing...' : 'Message Casey...'}
            placeholderTextColor={isListening ? FreepassColors.accent : FreepassColors.textSecondary}
            multiline
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
          Messages are processed by OpenAI through FreePass; manage this in
          Account → Privacy. Call 211 for urgent needs, or call/text 988 in a crisis.
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
