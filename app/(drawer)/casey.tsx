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
import { supabase } from '@/lib/supabase';

const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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

function filterResources(resources: Resource[], query: string): Resource[] {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (!keywords.length) return resources.slice(0, 5);

  const scored = resources
    .map((r) => {
      const haystack = [...(r.tags || []), r.name, r.description]
        .filter(Boolean)
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

function buildGeminiPayload(
  history: Message[],
  currentUserText: string,
  resourceContext: string
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
      parts: [
        {
          text: `${SYSTEM_PROMPT}\n\nHere are the available Philadelphia reentry resources you may recommend from:\n\n${resourceContext}`,
        },
      ],
    },
    contents,
  };
}

type VoiceGender = 'female' | 'male';

// Pitch values for gender-based voice selection (works on all platforms)
const VOICE_PITCH: Record<VoiceGender, number> = {
  female: 1.3,
  male: 0.8,
};

export default function CaseyScreen() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const isListening = false; // speech recognition disabled — requires native build
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('female');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const speechAvailable = false;

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

      const options: Speech.SpeechOptions = {
        language: 'en-US',
        pitch: VOICE_PITCH[voiceGender],
        onDone: () => { setIsSpeaking(false); setSpeakingMsgId(null); },
        onStopped: () => { setIsSpeaking(false); setSpeakingMsgId(null); },
        onError: () => { setIsSpeaking(false); setSpeakingMsgId(null); },
      };

      Speech.speak(text, options);
    },
    [voiceGender]
  );

  // Speech recognition disabled — expo-speech-recognition requires a native build.
  // The mic button is hidden when speechAvailable is false.
  // To re-enable: install expo-speech-recognition in a dev client build and set speechAvailable to true.

  // Stop audio when leaving the screen
  useEffect(() => {
    return () => { Speech.stop(); };
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
      const allUserText = historySnapshot
        .filter((m) => m.role === 'user')
        .map((m) => m.text)
        .join(' ');
      const matched = filterResources(resources, allUserText);
      const context = buildContext(matched);
      const payload = buildGeminiPayload(messages, text, context);

      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY.');
      }
      if (__DEV__) {
        console.log('[Casey] Gemini API key exists:', !!apiKey);
      }

      const res = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        if (__DEV__) console.error('[Casey] Gemini API error:', JSON.stringify(json, null, 2));
        throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
      }

      const reply =
        json?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "I'm sorry, I couldn't find a good match right now. Try rephrasing your question.";

      const replyId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: replyId, role: 'bot', text: reply },
      ]);

      // Auto-read Casey's response
      speakText(reply, replyId);
    } catch (err) {
      if (__DEV__) console.error('[Casey] Error:', err);
      const message = err instanceof Error && err.message.includes('EXPO_PUBLIC_GEMINI_API_KEY')
        ? 'Casey is not configured yet. Please ask a staff member to add the AI service key, or use Resources to search directly.'
        : "Sorry, I'm having trouble connecting right now. Please try Resources or try again in a moment.";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: message,
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
            placeholder="Message Casey..."
            placeholderTextColor={FreepassColors.textSecondary}
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
