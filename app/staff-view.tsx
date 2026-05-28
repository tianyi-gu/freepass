import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

interface Question {
  id: string;
  question: string;
  category: string | null;
  answer_count: number;
}

export default function StaffViewScreen() {
  const insets = useSafeAreaInsets();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [drafts, setDrafts] = useState<{id: string; name: string; phone: string | null; email: string | null; created_at: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('questions')
      .select('id, question, category, answers(count)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const mapped = (data ?? []).map((q: any) => ({
          id: q.id,
          question: q.question,
          category: q.category,
          answer_count: q.answers?.[0]?.count ?? 0,
        }));
        setQuestions(mapped.filter((q: Question) => q.answer_count === 0));
        setLoading(false);
      });

    supabase
      .from('resources')
      .select('id, name, phone, email, created_at')
      .eq('is_published', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDrafts(data ?? []);
      });
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.logoText}>fp</Text>
          <Text style={styles.title}>FreePass Staff View</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Resource User Feedback</Text>
        <Text style={styles.sectionTitle}>Unanswered Questions</Text>

        {loading ? (
          <ActivityIndicator color={FreepassColors.accentLight} style={{ marginTop: 12 }} />
        ) : questions.length === 0 ? (
          <Text style={styles.emptyText}>All questions have been answered!</Text>
        ) : (
          questions.map((q) => (
            <View key={q.id} style={styles.questionCard}>
              <View style={styles.questionIcon}>
                <IconSymbol name="doc.text.fill" size={24} color={FreepassColors.textSecondary} />
              </View>
              <View style={styles.questionContent}>
                <Text style={styles.questionTitle} numberOfLines={2}>{q.question}</Text>
                <Text style={styles.questionMeta}>Answers: {q.answer_count}</Text>
              </View>
              <Pressable
                style={styles.answerBtn}
                onPress={() => router.push(`/question/${q.id}` as never)}
                android_ripple={{ color: FreepassColors.primaryDark }}>
                <Text style={styles.answerBtnText}>ANSWER</Text>
              </Pressable>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Draft (New) Resources to Review</Text>
        {drafts.length === 0 ? (
          <Text style={styles.emptyText}>No draft resources pending review.</Text>
        ) : (
          drafts.map((draft) => (
            <Pressable
              key={draft.id}
              style={styles.draftCard}
              onPress={() => router.push(`/listing-draft/${draft.id}` as never)}
              android_ripple={{ color: FreepassColors.primaryDark }}>
              <View style={styles.draftIcon}>
                <IconSymbol name="building.2.fill" size={24} color={FreepassColors.textSecondary} />
              </View>
              <View style={styles.draftContent}>
                <Text style={styles.draftName}>{draft.name}</Text>
                {draft.phone ? <Text style={styles.draftMeta}>{draft.phone}</Text> : null}
                {draft.email ? <Text style={styles.draftMeta}>{draft.email}</Text> : null}
              </View>
              <IconSymbol name="chevron.right" size={18} color={FreepassColors.accentLight} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: FreepassColors.accentLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  sectionLabel: {
    fontSize: 14,
    color: FreepassColors.accentLight,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 16,
    marginTop: 8,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  questionIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionContent: { flex: 1 },
  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  questionMeta: {
    fontSize: 13,
    color: FreepassColors.accentLight,
    marginTop: 2,
  },
  answerBtn: {
    backgroundColor: FreepassColors.accentLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  answerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  emptyText: {
    fontSize: 15,
    color: FreepassColors.accentLight,
    marginBottom: 16,
  },
  draftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  draftIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  draftContent: { flex: 1 },
  draftName: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  draftMeta: {
    fontSize: 13,
    color: FreepassColors.accentLight,
    marginTop: 2,
  },
});
