import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_ANSWERS = [
  { id: '1', name: 'Staff Member', upvotes: 5 },
  { id: '2', name: 'Community Helper', upvotes: 3 },
  { id: '3', name: 'Resource Guide', upvotes: 2 },
];

export default function QuestionViewScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Question View</Text>
        <View style={styles.upvoteBtn}>
          <IconSymbol name="hand.thumbsup.fill" size={18} color={FreepassColors.white} />
          <Text style={styles.upvoteText}>Upvotes</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Question:</Text>
          <Text style={styles.questionText}>How do I apply for housing assistance in my area?</Text>
        </View>

        <Text style={styles.answersLabel}>Answers:</Text>
        {MOCK_ANSWERS.map((a) => (
          <View key={a.id} style={styles.answerCard}>
            <View style={styles.answerMain}>
              <Text style={styles.answerName}>{a.name}</Text>
              <Pressable style={styles.answerUpvote}>
                <IconSymbol name="hand.thumbsup.fill" size={16} color={FreepassColors.textSecondary} />
                <Text style={styles.answerUpvoteText}>Upvotes</Text>
              </Pressable>
              <Pressable hitSlop={8}>
                <IconSymbol name="ellipsis" size={20} color={FreepassColors.textSecondary} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable
        style={styles.addAnswerBtn}
        onPress={() => router.push('/modal/answer-question' as never)}
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
  answerUpvoteText: {
    fontSize: 10,
    color: FreepassColors.textSecondary,
    marginTop: 2,
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
