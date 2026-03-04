import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_COURSES = [
  { id: '1', name: 'Money Smart Process', description: 'FDIC financial literacy certification' },
  { id: '2', name: 'New Loan Inquiry Process', description: 'Access capital through Fountain Fund loans' },
];

export default function LearningAcademyScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showMenu showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroImage}>
          <IconSymbol name="book.fill" size={48} color={FreepassColors.accentLight} />
        </View>

        <Text style={styles.fundLabel}>THE FOUNTAIN FUND</Text>
        <Text style={styles.title}>About the Learning Academy</Text>
        <Text style={styles.body}>
          The Fountain Fund increases economic opportunities for formerly incarcerated people to improve their lives
          and remain in their communities.
        </Text>

        <Pressable
          style={styles.ctaBtn}
          onPress={() => router.push('/fountain-fund' as never)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <IconSymbol name="globe" size={20} color={FreepassColors.white} />
          <Text style={styles.ctaText}>WHAT IS THE FOUNTAIN FUND?</Text>
        </Pressable>

        <Text style={styles.body}>
          FreePass includes The Fountain Fund&apos;s vetted resources and courses to help you achieve independence and
          financial stability.
        </Text>
        <Text style={styles.body}>
          The Learning Academy Program offers self-guided exercises, certifications, and on-demand video workshops for
          financial well-being—accessible to all FreePass account holders.
        </Text>

        <View style={styles.darkSection}>
          <Text style={styles.darkText}>
            Wondering how a loan is accessed through The Fountain Fund? Please use this link to review the process.
          </Text>
          <Pressable
            style={styles.darkBtn}
            onPress={() => router.push('/loan-inquiry' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="doc.text.fill" size={20} color={FreepassColors.white} />
            <Text style={styles.ctaText}>NEW LOAN INQUIRY PROCESS</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>FreePass Courses provided by The Fountain Fund</Text>
        {MOCK_COURSES.map((c) => (
          <Pressable
            key={c.id}
            style={styles.courseCard}
            onPress={() => router.push(`/course/${c.id}` as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <View style={styles.courseImage} />
            <View style={styles.courseContent}>
              <Text style={styles.courseName}>{c.name}</Text>
              <Text style={styles.courseDesc}>{c.description}</Text>
            </View>
          </Pressable>
        ))}

        <View style={styles.darkSection}>
          <Text style={styles.darkText}>
            In order to have your loan application approved, you must obtain a completed certificate from the FDIC
            Money Smart program. Instructions have been included and can be completed here:
          </Text>
          <Pressable
            style={styles.darkBtn}
            onPress={() => router.push('/money-smart' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <Text style={styles.ctaText}>REVIEW MONEY SMART COURSES</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  heroImage: {
    height: 160,
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  fundLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: FreepassColors.accent,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: FreepassColors.primary,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: FreepassColors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: FreepassColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  darkSection: {
    backgroundColor: FreepassColors.primary,
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
  },
  darkText: {
    fontSize: 15,
    color: FreepassColors.accentLight,
    lineHeight: 22,
    marginBottom: 16,
  },
  darkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: FreepassColors.primary,
    marginBottom: 16,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: FreepassColors.lightGray,
    marginRight: 16,
  },
  courseContent: { flex: 1 },
  courseName: {
    fontSize: 17,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 4,
  },
  courseDesc: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
  },
});
