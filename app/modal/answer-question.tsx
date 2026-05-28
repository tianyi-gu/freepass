import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import { supabase } from '@/lib/supabase';

export default function AnswerQuestionModal() {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();

  const handleSubmit = async () => {
    if (!answer.trim()) {
      Alert.alert('Missing info', 'Please enter your answer.');
      return;
    }
    if (!questionId) {
      Alert.alert('Error', 'Could not identify the question. Please go back and try again.');
      return;
    }
    if (!user || user.isGuest) {
      Alert.alert('Sign in required', 'Please create an account or log in before answering a question.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('answers').insert({
      question_id: questionId,
      answer: answer.trim(),
      answered_by: user?.displayName ?? 'Anonymous',
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Error', 'Could not post your answer. Please try again.');
      return;
    }
    Alert.alert('Answer Submitted', 'Your answer has been posted.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Answer a Question</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={18} color={FreepassColors.white} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>What&apos;s your answer?</Text>
        <TextInput
          style={styles.input}
          placeholder="Answer the question..."
          placeholderTextColor={FreepassColors.textSecondary}
          value={answer}
          onChangeText={setAnswer}
          multiline
        />
        <Pressable
          style={[styles.submitBtn, (!answer.trim() || submitting) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!answer.trim() || submitting}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.submitBtnText}>{submitting ? 'POSTING...' : 'ANSWER'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FreepassColors.primaryDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FreepassColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
    paddingTop: 0,
  },
  label: {
    fontSize: 15,
    color: FreepassColors.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: FreepassColors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
