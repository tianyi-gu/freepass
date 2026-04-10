import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function AnswerQuestionModal() {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (!answer.trim()) {
      Alert.alert('Missing info', 'Please enter your answer.');
      return;
    }
    // TODO: Submit to backend
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
          style={[styles.submitBtn, !answer.trim() && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!answer.trim()}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.submitBtnText}>ANSWER</Text>
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
