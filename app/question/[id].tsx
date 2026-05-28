import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

interface Answer {
  id: string;
  answer: string;
  answered_by: string | null;
  upvotes: number;
}

interface Question {
  id: string;
  question: string;
  upvotes: number;
  category: string | null;
}

export default function QuestionViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('questions').select('*').eq('id', id).single(),
      supabase.from('answers').select('*').eq('question_id', id).order('upvotes', { ascending: false }),
    ]).then(([qRes, aRes]) => {
      if (qRes.data) setQuestion(qRes.data);
      if (aRes.data) setAnswers(aRes.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={FreepassColors.white} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Question View</Text>
        <Pressable
          style={styles.upvoteBtn}
          onPress={async () => {
            if (!question) return;
            const newCount = (question.upvotes ?? 0) + 1;
            await supabase.from('questions').update({ upvotes: newCount }).eq('id', question.id);
            setQuestion({ ...question, upvotes: newCount });
          }}>
          <IconSymbol name="hand.thumbsup.fill" size={18} color={FreepassColors.white} />
          <Text style={styles.upvoteText}>{question?.upvotes ?? 0}</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Question:</Text>
          <Text style={styles.questionText}>{question?.question ?? 'Question not found'}</Text>
          {question?.category && <Text style={styles.categoryTag}>{question.category}</Text>}
        </View>

        <Text style={styles.answersLabel}>Answers ({answers.length}):</Text>
        {answers.length === 0 ? (
          <Text style={styles.noAnswers}>No answers yet. Be the first to respond!</Text>
        ) : (
          answers.map((a) => (
            <View key={a.id} style={styles.answerCard}>
              <Text style={styles.answerText}>{a.answer}</Text>
              <View style={styles.answerMain}>
                <Text style={styles.answerName}>{a.answered_by ?? 'Anonymous'}</Text>
                <Pressable
                  style={styles.answerUpvote}
                  onPress={async () => {
                    const newCount = (a.upvotes ?? 0) + 1;
                    await supabase.from('answers').update({ upvotes: newCount }).eq('id', a.id);
                    setAnswers((prev) => prev.map((ans) => ans.id === a.id ? { ...ans, upvotes: newCount } : ans));
                  }}>
                  <IconSymbol name="hand.thumbsup.fill" size={16} color={FreepassColors.textSecondary} />
                  <Text style={styles.answerUpvoteText}>{a.upvotes}</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        style={styles.addAnswerBtn}
        onPress={() => router.push(`/modal/answer-question?questionId=${id}` as never)}
        android_ripple={{ color: FreepassColors.primaryDark }}>
        <IconSymbol name="plus" size={20} color={FreepassColors.white} />
        <Text style={styles.addAnswerBtnText}>ADD AN ANSWER</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.primaryDark },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: { fontSize: 15, fontWeight: '600', color: FreepassColors.white },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  upvoteText: { fontSize: 12, fontWeight: '600', color: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  questionCard: {
    backgroundColor: FreepassColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.text,
  },
  answersLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 12,
  },
  answerCard: {
    backgroundColor: FreepassColors.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  answerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  answerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.text,
  },
  answerUpvote: {
    alignItems: 'center',
  },
  answerText: {
    fontSize: 15,
    color: FreepassColors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  answerUpvoteText: {
    fontSize: 10,
    color: FreepassColors.textSecondary,
    marginTop: 2,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '600',
    color: FreepassColors.accent,
    marginTop: 8,
  },
  noAnswers: {
    fontSize: 15,
    color: FreepassColors.accentLight,
    textAlign: 'center',
    marginTop: 20,
  },
  addAnswerBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 16,
  },
  addAnswerBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
