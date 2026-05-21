import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Audio } from 'expo-av';
import { File as ExpoFile, Paths } from 'expo-file-system';
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
import { supabase } from '@/lib/supabase';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are Casey, a warm and supportive reentry resource assistant for FreePass, a Philadelphia app helping formerly incarcerated individuals find support in Philadelphia.

Your goal is to have a short, guided conversation before recommending resources. Follow this flow:

1. If the user's message is vague (e.g. "hi", "help", "I need help"), ask ONE clarifying question to understand their most urgent need. Example: "Of course! To point you in the right direction — are you looking for help with housing, employment, mental health, legal support, or something else?"

2. If the user names a category (e.g. "I want a job", "housing"), ask ONE follow-up to personalize. Example for jobs: "Got it! Do you have a specific type of work in mind, or are you open to any opportunities right now?"

3. Once you have enough context (after at most 2 clarifying exchanges), recommend 2-3 specific organizations from the provided list. For each one include:
  - The org name
  - One sentence on why it fits their specific situation
  - The phone number

Rules:
- Never recommend organizations not in the provided list
- Keep every message to 3-4 sentences max
- Be warm, human, and encouraging — never clinical or bureaucratic
- If the user's need doesn't match any resource well, be honest and suggest they call 211`;

type Resource = {
  name: string;
  address: string;
  city: string;
  description: string;
  phone: string;
  website: string;
  hours: string;
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

function filterResources(resources: Resource[], query: string): Resource[] {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (!keywords.length) return resources.slice(0, 5);

  const scored = resources
    .map((r) => {
      const haystack = [...(r.tags || []), r.name, r.description]
        .join(' ')
        .toLowerCase();
      const hits = keywords.filter((kw) => haystack.includes(kw)).length;
      return { resource: r, hits };
    })
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 6)
    .map((x) => x.resource);

  return scored.length > 0 ? scored : resources.slice(0, 5);
}

function buildContext(resources: Resource[]): string {
  return resources
    .map(
      (r) =>
        `Org: ${r.name} | Location: ${r.address}, ${r.city} | Services: ${(r.tags || []).join(', ')} | Phone: ${r.phone} | ${r.description}`
    )
    .join('\n');
}

function buildGroqMessages(
  history: Message[],
  currentUserText: string,
  resourceContext: string
): { role: string; content: string }[] {
  const msgs: { role: string; content: string }[] = [];

  msgs.push({
    role: 'system',
    content: `${SYSTEM_PROMPT}\n\nHere are the available Philadelphia reentry resources you may recommend from:\n\n${resourceContext}`,
  });

  for (const msg of history) {
    if (msg.id === 'opening') continue;
    msgs.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    });
  }

  msgs.push({ role: 'user', content: currentUserText });

  return msgs;
}

type VoiceGender = 'female' | 'male';

const GROQ_TTS_URL = 'https://api.groq.com/openai/v1/audio/speech';
const TTS_VOICES: Record<VoiceGender, string> = {
  female: 'Arista-PlayAI',
  male: 'Fritz-PlayAI',
};

export default function CaseyScreen() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('female');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const soundRef = useRef<Audio.Sound | null>(null);

  const stopSpeaking = useCallback(async () => {
    if (soundRef.current) {
      try { await soundRef.current.stopAsync(); } catch {}
      try { await soundRef.current.unloadAsync(); } catch {}
      soundRef.current = null;
    }
    setIsSpeaking(false);
    setSpeakingMsgId(null);
  }, []);

  // Speak a message using Groq cloud TTS (PlayAI voices)
  const speakText = useCallback(
    async (text: string, msgId: string) => {
      await stopSpeaking();
      setSpeakingMsgId(msgId);
      setIsSpeaking(true);

      try {
        const res = await fetch(GROQ_TTS_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROQ_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'playai-tts',
            input: text,
            voice: TTS_VOICES[voiceGender],
            response_format: 'mp3',
          }),
        });

        if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);

        const blob = await res.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const ttsFile = new ExpoFile(Paths.cache, `casey_tts_${Date.now()}.mp3`);
        ttsFile.write(base64, { encoding: 'base64' });

        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          { uri: ttsFile.uri },
          { shouldPlay: true }
        );
        soundRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsSpeaking(false);
            setSpeakingMsgId(null);
            sound.unloadAsync();
            soundRef.current = null;
            try { ttsFile.delete(); } catch {}
          }
        });
      } catch (err) {
        console.error('[Casey TTS]', err);
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      }
    },
    [voiceGender, stopSpeaking]
  );

  // Speech recognition event handlers
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript ?? '';
    setInput(transcript);
    if (event.isFinal) {
      setIsListening(false);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    if (event.error !== 'no-speech') {
      Alert.alert('Speech error', event.message || 'Could not recognize speech. Please try again.');
    }
  });

  const toggleListening = useCallback(async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Please allow microphone and speech recognition access in Settings.');
      return;
    }
    setIsListening(true);
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      addsPunctuation: true,
    });
  }, [isListening]);

  // Stop audio when leaving the screen
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    supabase
      .from('resources')
      .select('name, address, city, description, phone, website, hours, tags')
      .then(({ data, error }) => {
        if (error) { console.error('[Casey] Supabase fetch error:', error); return; }
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
      const allUserText = historySnapshot
        .filter((m) => m.role === 'user')
        .map((m) => m.text)
        .join(' ');
      const matched = filterResources(resources, allUserText);
      const context = buildContext(matched);
      const groqMessages = buildGroqMessages(messages, text, context);

      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: groqMessages,
          max_tokens: 1000,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
      }

      const reply =
        json?.choices?.[0]?.message?.content ??
        "I'm sorry, I couldn't find a good match right now. Try rephrasing your question.";

      const replyId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: replyId, role: 'bot', text: reply },
      ]);

      // Auto-read Casey's response
      speakText(reply, replyId);
    } catch (err) {
      console.error('[Casey] Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: "Sorry, I'm having trouble connecting right now. Please try again.",
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
                name={isCurrentlySpeaking ? 'speaker.slash.fill' : 'speaker.wave.2.fill'}
                size={16}
                color={isCurrentlySpeaking ? FreepassColors.destructive : FreepassColors.textSecondary}
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
          <Pressable
            style={[styles.micBtn, isListening && styles.micBtnActive]}
            onPress={toggleListening}
            disabled={loading}>
            <IconSymbol
              name={isListening ? 'stop.fill' : 'mic.fill'}
              size={20}
              color={isListening ? FreepassColors.white : FreepassColors.primary}
            />
          </Pressable>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={isListening ? 'Listening...' : 'Message Casey...'}
            placeholderTextColor={isListening ? FreepassColors.accent : FreepassColors.textSecondary}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit
            onSubmitEditing={sendMessage}
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}>
            <Text style={styles.sendBtnText}>Send</Text>
          </Pressable>
        </View>
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
});
