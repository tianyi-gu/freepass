import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import { blockUser, fetchBlockedIds, submitReport } from '@/lib/moderation';
import { supabase } from '@/lib/supabase';

interface Answer {
  id: string;
  answer: string;
  answered_by: string | null;
  upvotes: number;
  user_id: string | null;
}

interface Question {
  id: string;
  question: string;
  upvotes: number;
  category: string | null;
  user_id: string | null;
}

export default function QuestionViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const signedInUserId = user && !user.isGuest ? user.id : null;
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setLoadError(true);
      return;
    }
    let cancelled = false;
    Promise.all([
      supabase.from('questions').select('*').eq('id', id).maybeSingle(),
      supabase.from('answers').select('*').eq('question_id', id).order('upvotes', { ascending: false }),
      fetchBlockedIds(signedInUserId),
    ])
      .then(([qRes, aRes, blocked]) => {
        if (cancelled) return;
        if (qRes.error || !qRes.data) setLoadError(true);
        if (qRes.data) setQuestion(qRes.data);
        if (aRes.data) {
          setAnswers((aRes.data as Answer[]).filter((a) => !a.user_id || !blocked.has(a.user_id)));
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, signedInUserId]);

  const upvoteQuestion = useCallback(async () => {
    if (!question) return;
    if (!signedInUserId) {
      Alert.alert('Sign in required', 'Please create an account or log in to upvote.');
      return;
    }
    const { data, error } = await supabase.rpc('upvote_question', { qid: question.id });
    if (error || typeof data !== 'number') {
      Alert.alert('Could not upvote', 'Please try again in a moment.');
      return;
    }
    setQuestion((prev) => (prev ? { ...prev, upvotes: data } : prev));
  }, [question, signedInUserId]);

  const upvoteAnswer = useCallback(async (answerId: string) => {
    if (!signedInUserId) {
      Alert.alert('Sign in required', 'Please create an account or log in to upvote.');
      return;
    }
    const { data, error } = await supabase.rpc('upvote_answer', { aid: answerId });
    if (error || typeof data !== 'number') {
      Alert.alert('Could not upvote', 'Please try again in a moment.');
      return;
    }
    setAnswers((prev) => prev.map((ans) => (ans.id === answerId ? { ...ans, upvotes: data } : ans)));
  }, [signedInUserId]);

  const reportOptions = useCallback(
    (contentType: 'question' | 'answer', contentId: string, authorId: string | null, authorName: string) => {
      const options: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [
        {
          text: contentType === 'question' ? 'Report question' : 'Report answer',
          onPress: async () => {
            const { error } = await submitReport(contentType, contentId, signedInUserId);
            Alert.alert(
              error ? 'Could not send report' : 'Report sent',
              error ?? 'Thank you. Our team will review this.',
            );
          },
        },
      ];
      if (signedInUserId && authorId && authorId !== signedInUserId) {
        options.push({
          text: `Block ${authorName}`,
          style: 'destructive',
          onPress: async () => {
            const { error } = await blockUser(signedInUserId, authorId);
            if (error) {
              Alert.alert('Could not block', error);
              return;
            }
            setAnswers((prev) => prev.filter((a) => a.user_id !== authorId));
            Alert.alert('Blocked', `You won't see posts from ${authorName} anymore.`);
          },
        });
      }
      options.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert('Options', undefined, options);
    },
    [signedInUserId],
  );

  const ownsQuestion = !!signedInUserId && question?.user_id === signedInUserId;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Question View</Text>
        <View style={styles.headerRightActions}>
          {ownsQuestion ? (
            <Pressable
              style={styles.editBtn}
              onPress={() =>
                router.push(
                  `/modal/edit-question?questionId=${id}&currentText=${encodeURIComponent(question?.question ?? '')}` as never
                )
              }>
              <IconSymbol name="square.and.pencil" size={18} color={FreepassColors.white} />
            </Pressable>
          ) : question ? (
            <Pressable
              style={styles.editBtn}
              accessibilityRole="button"
              accessibilityLabel="Report or block"
              onPress={() =>
                reportOptions('question', question.id, question.user_id, 'this member')
              }>
              <IconSymbol name="ellipsis" size={18} color={FreepassColors.white} />
            </Pressable>
          ) : null}
          <Pressable style={styles.upvoteBtn} onPress={upvoteQuestion}>
            <IconSymbol name="hand.thumbsup.fill" size={18} color={FreepassColors.white} />
            <Text style={styles.upvoteText}>{question?.upvotes ?? 0}</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={FreepassColors.white} size="large" />
        </View>
      ) : (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Question:</Text>
          <Text style={styles.questionText}>
            {question?.question ??
              (loadError
                ? 'This question could not be loaded. It may have been removed, or you may be offline.'
                : 'Question not found')}
          </Text>
          {question?.category && <Text style={styles.categoryTag}>{question.category}</Text>}
        </View>

        <Text style={styles.answersLabel}>Answers ({answers.length}):</Text>
        {answers.length === 0 ? (
          <Text style={styles.noAnswers}>No answers yet. Be the first to respond!</Text>
        ) : (
          answers.map((a) => {
            const ownsAnswer = !!signedInUserId && a.user_id === signedInUserId;
            return (
            <View key={a.id} style={styles.answerCard}>
              <Text style={styles.answerText}>{a.answer}</Text>
              <View style={styles.answerMain}>
                <Text style={styles.answerName}>{a.answered_by ?? 'Anonymous'}</Text>
                {ownsAnswer ? (
                  <Pressable
                    style={styles.answerEditBtn}
                    onPress={() =>
                      router.push(
                        `/modal/edit-answer?answerId=${a.id}&currentText=${encodeURIComponent(a.answer)}` as never
                      )
                    }>
                    <IconSymbol name="square.and.pencil" size={16} color={FreepassColors.textSecondary} />
                  </Pressable>
                ) : (
                  <Pressable
                    style={styles.answerEditBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Report or block"
                    onPress={() => reportOptions('answer', a.id, a.user_id, a.answered_by ?? 'this member')}>
                    <IconSymbol name="ellipsis" size={16} color={FreepassColors.textSecondary} />
                  </Pressable>
                )}
                <Pressable style={styles.answerUpvote} onPress={() => upvoteAnswer(a.id)}>
                  <IconSymbol name="hand.thumbsup.fill" size={16} color={FreepassColors.textSecondary} />
                  <Text style={styles.answerUpvoteText}>{a.upvotes}</Text>
                </Pressable>
              </View>
            </View>
            );
          })
        )}
      </ScrollView>
      )}

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
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    padding: 8,
  },
  answerEditBtn: {
    padding: 4,
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
