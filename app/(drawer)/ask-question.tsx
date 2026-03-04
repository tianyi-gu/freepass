import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_QUESTIONS = [
  { id: '1', title: 'How do I apply for housing assistance?', answersCount: 3 },
  { id: '2', title: 'What documents are needed for employment programs?', answersCount: 5 },
  { id: '3', title: 'Where can I find free legal services?', answersCount: 2 },
];

export default function AskQuestionScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showMenu showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Q & A</Text>
        <Text style={styles.intro}>
          Use this page to find answers to your questions, search for information, and ask new questions. FreePass staff
          will regularly monitor this page and answer questions.
        </Text>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => router.push('/modal/ask-question' as never)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <IconSymbol name="questionmark.circle.fill" size={20} color={FreepassColors.white} />
          <Text style={styles.primaryBtnText}>ASK A QUESTION</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Browse Questions</Text>
        {MOCK_QUESTIONS.map((q) => (
          <Pressable
            key={q.id}
            style={styles.questionCard}
            onPress={() => router.push(`/question/${q.id}` as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <View style={styles.questionIcon}>
              <IconSymbol name="doc.text.fill" size={24} color={FreepassColors.textSecondary} />
            </View>
            <View style={styles.questionContent}>
              <Text style={styles.questionTitle}>{q.title}</Text>
              <Text style={styles.questionMeta}>Answers: {q.answersCount}</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={FreepassColors.textSecondary} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 12,
  },
  intro: {
    fontSize: 16,
    color: FreepassColors.textSecondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: FreepassColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 24,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.accent,
    marginBottom: 16,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  questionIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: FreepassColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionContent: { flex: 1 },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.text,
    marginBottom: 4,
  },
  questionMeta: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
  },
});
