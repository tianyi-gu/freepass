import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_QUESTIONS = [
  { id: '1', title: 'Question', answersCount: 0 },
  { id: '2', title: 'Question', answersCount: 0 },
  { id: '3', title: 'Question', answersCount: 0 },
  { id: '4', title: 'Question', answersCount: 0 },
];

const MOCK_DRAFTS = [
  { id: '1', name: 'Company Name', phone: 'Phone Number', web: 'Web Address' },
  { id: '2', name: 'Company Name', phone: 'Phone Number', web: 'Web Address' },
  { id: '3', name: 'Company Name', phone: 'Phone Number', web: 'Web Address' },
];

export default function StaffViewScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
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

        {MOCK_QUESTIONS.map((q) => (
          <View key={q.id} style={styles.questionCard}>
            <View style={styles.questionIcon}>
              <IconSymbol name="doc.text.fill" size={24} color={FreepassColors.textSecondary} />
            </View>
            <View style={styles.questionContent}>
              <Text style={styles.questionTitle}>{q.title}</Text>
              <Text style={styles.questionMeta}>Answers: {q.answersCount}</Text>
            </View>
            <Pressable
              style={styles.answerBtn}
              onPress={() => router.push('/modal/answer-question' as never)}
              android_ripple={{ color: FreepassColors.primaryDark }}>
              <Text style={styles.answerBtnText}>ANSWER</Text>
            </Pressable>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Draft (New) Resources to Review</Text>

        {MOCK_DRAFTS.map((d) => (
          <Pressable
            key={d.id}
            style={styles.draftCard}
            onPress={() => router.push(`/listing-draft/${d.id}` as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <View style={styles.draftIcon}>
              <IconSymbol name="doc.text.fill" size={24} color={FreepassColors.textSecondary} />
            </View>
            <View style={styles.draftContent}>
              <Text style={styles.draftName}>{d.name}</Text>
              <Text style={styles.draftMeta}>{d.phone}</Text>
              <Text style={styles.draftMeta}>{d.web}</Text>
            </View>
            <Pressable style={styles.checkbox}>
              <View style={styles.checkboxBox} />
            </Pressable>
          </Pressable>
        ))}
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
    paddingTop: 48,
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
    fontSize: 12,
    color: FreepassColors.primaryDark,
    marginTop: 2,
  },
  checkbox: { padding: 4 },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: FreepassColors.white,
  },
});
