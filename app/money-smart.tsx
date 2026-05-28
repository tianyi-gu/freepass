import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { FreepassColors } from '@/constants/theme';

const BANZAI_URL = 'https://fountainfund.banzai.org/wellness';
const FDIC_CATALOG_URL = 'https://catalog.fdic.gov/';

const MONEY_SMART_COURSES = [
  { title: 'Your Income and Expenses', desc: 'Track and understand your money coming in and money going out.' },
  { title: 'Making Housing Decisions', desc: 'Explore options when estimating housing payments and acquiring a rental.' },
  { title: 'Your Money Values and Influences', desc: 'Understand what matters to you and how it affects your finance management.' },
  { title: 'Your Spending and Saving Plan', desc: 'Use your finance information to develop a spending and saving plan.' },
  { title: 'Building Your Financial Future', desc: 'Create a personal plan to build assets for a solid financial future.' },
  { title: 'You Can Bank On It', desc: 'Understand banking services and build a positive relationship with a financial institution.' },
  { title: 'Your Savings', desc: 'Find ways to save money for your goals, large purchases, and unexpected expenses.' },
  { title: 'Borrowing Basics', desc: 'Research and consider options for borrowing money and what they entail.' },
  { title: 'Buying a Home', desc: 'Prepare to finance the purchase of a home, and move forward to finalize.' },
  { title: 'Credit Reports and Scores', desc: 'Learn ways to understand, access, and improve your credit reports and scores.' },
  { title: 'Managing Debt', desc: 'Understand the meaning of debt and how to manage it.' },
  { title: 'Using Credit Cards', desc: 'Learn how credit cards work and how to manage its finances.' },
  { title: 'Disasters - Financial Preparation', desc: 'Learn ways to prepare financially for potential disasters and recover.' },
  { title: 'Protecting Your Identity', desc: 'Learn asset risk management and how to protect yourself against fraud.' },
];

export default function MoneySmartScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader title="Money Smart" showBack showLogo={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.fundLabel}>THE FOUNTAIN FUND</Text>
          <Text style={styles.title}>Learning Academy</Text>
          <Text style={styles.subtitle}>Money Smart Process</Text>
          <Text style={styles.body}>
            The Fountain Fund requires participants to provide a certificate of completion from at least one FDIC
            Money Smart course before their loan is approved.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step by Step Explanation:</Text>
          <Text style={styles.body}>
            To obtain a certificate, a user account must be created on the FDIC website. This can be started by going
            here:
          </Text>
          <Pressable
            style={styles.ctaBtn}
            onPress={() => Linking.openURL(FDIC_CATALOG_URL)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <Text style={styles.ctaText}>CREATE ACCOUNT</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choosing a Course:</Text>
          <Text style={styles.body}>
            There are 14 possible courses to choose. While only one is required to proceed, we recommend completing what
            is relevant towards your increased responsibility and aid the approval of your loan.
          </Text>
          <Pressable
            style={styles.ctaBtn}
            onPress={() => router.push('/loan-inquiry' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <Text style={styles.ctaText}>LOAN INQUIRY PROCESS</Text>
          </Pressable>
        </View>

        <Text style={styles.courseListTitle}>Courses:</Text>
        {MONEY_SMART_COURSES.map((c, i) => (
          <View key={i} style={styles.courseRow}>
            <Pressable style={styles.courseBtn} onPress={() => Linking.openURL(FDIC_CATALOG_URL)}>
              <Text style={styles.courseBtnText}>{c.title}</Text>
            </Pressable>
            <Text style={styles.courseDesc}>{c.desc}</Text>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Education:</Text>
          <Text style={styles.body}>
            Access additional financial wellness resources provided by The Fountain Fund through Banzai.
          </Text>
          <Pressable
            style={styles.ctaBtn}
            onPress={() => Linking.openURL(BANZAI_URL)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <Text style={styles.ctaText}>FINANCIAL EDUCATION (BANZAI)</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.finalBtn}
          onPress={() => router.push('/loan-inquiry' as never)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.ctaText}>INQUIRE ABOUT A LOAN</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  header: {
    marginBottom: 24,
  },
  fundLabel: {
    fontSize: 12,
    color: FreepassColors.accentLight,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: FreepassColors.accentLight,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: FreepassColors.white,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: FreepassColors.white,
    lineHeight: 24,
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 12,
  },
  ctaBtn: {
    backgroundColor: FreepassColors.primaryDark,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  courseListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 16,
  },
  courseRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  courseBtn: {
    flex: 1,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  courseBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.primary,
  },
  courseDesc: {
    flex: 1,
    fontSize: 13,
    color: FreepassColors.accentLight,
    lineHeight: 20,
  },
  finalBtn: {
    backgroundColor: FreepassColors.primaryDark,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
});
