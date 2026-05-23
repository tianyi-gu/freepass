import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import { supabase } from '@/lib/supabase';

export default function GiveFeedbackModal() {
  const { resourceName } = useLocalSearchParams<{ resourceName: string }>();
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();

  const title = resourceName ? `Give Feedback on ${resourceName}` : 'Give Feedback';

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('questions').insert({
      question: feedback.trim(),
      category: 'Feedback',
      asked_by: user?.displayName ?? 'Anonymous',
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Error', 'Could not submit your feedback. Please try again.');
      return;
    }
    Alert.alert('Thank You', 'Your feedback has been submitted.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={18} color={FreepassColors.white} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>What is your feedback for this resource?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter feedback..."
          placeholderTextColor={FreepassColors.textSecondary}
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={4}
        />
        <Pressable
          style={[styles.submitBtn, (!feedback.trim() || submitting) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!feedback.trim() || submitting}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Feedback'}</Text>
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
    flex: 1,
    fontSize: 18,
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
