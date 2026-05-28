import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const LOAN_INQUIRY_URL = 'https://sites.google.com/fountainfund.org/loan-inquiry/home';

export default function LoanInquiryScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader title="Loan Inquiry" showBack showLogo={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.fundLabel}>THE FOUNTAIN FUND</Text>
          <Text style={styles.title}>Learning Academy</Text>
          <Text style={styles.subtitle}>New Loan Inquiry Process</Text>
          <Text style={styles.body}>
            A loan user&apos;s guide to access capital through various loans. This video features Tom, who serves on a
            Loan Review Committee (LRC), describing the process within The Fountain Fund as the final step in
            underwriting.
          </Text>
        </View>

        <Pressable
          style={styles.videoPlaceholder}
          onPress={() => Linking.openURL(LOAN_INQUIRY_URL)}>
          <IconSymbol name="play.rectangle.fill" size={48} color={FreepassColors.accentLight} />
          <Text style={styles.videoText}>Loan Inquiry Guide</Text>
          <Text style={styles.videoSubtext}>Tap to open the full loan inquiry process</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Loan Process</Text>
        <Text style={styles.body}>
          Initial stages involve submitting information to The Fountain Fund for credit and eligibility verification.
          Loan inquiry processing includes a forms meeting to determine an accurate loan amount. Submission to the
          collection office and assignment to a Case Manager follows.
        </Text>
        <Text style={styles.body}>
          Upon approval, you will be directed to the Lender Portal for loan management.
        </Text>

        <Text style={styles.sectionTitle}>Borrower Eligibility Requirements</Text>
        <Text style={styles.bullet}>• No association or involvement with any criminal legal system.</Text>
        <Text style={styles.bullet}>• Must have current income.</Text>
        <Text style={styles.bullet}>• Mustn&apos;t have 3 current outstanding loans or 3x the monthly loan amount.</Text>
        <Text style={styles.bullet}>• No bankruptcies with a lender organization in the past 3 years.</Text>
        <Text style={styles.bullet}>• Must complete Form 12B, Money benefit details before loan approval.</Text>
        <Text style={styles.bullet}>• Steady income source for the last 6 months.</Text>

        <Text style={styles.sectionTitle}>Vehicle Loan Requirements</Text>
        <Text style={styles.bullet}>• Min loan amount $5,000, max loan $15,000 for a private party sale.</Text>
        <Text style={styles.bullet}>• Max loan length 48 months.</Text>
        <Text style={styles.bullet}>• Vehicle cannot be more than 10 years old.</Text>
        <Text style={styles.bullet}>• Vehicle cannot have more than 150,000 miles.</Text>
        <Text style={styles.bullet}>• Clean vehicle title with no accidents.</Text>

        <Text style={styles.sectionTitle}>Small Business Loans</Text>
        <Text style={styles.bullet}>• Min loan amount $10,000.</Text>
        <Text style={styles.bullet}>• Max loan length 24 months.</Text>
        <Text style={styles.bullet}>• Provide Business Plan Outline.</Text>

        <Text style={styles.sectionTitle}>Medium Business Loans</Text>
        <Text style={styles.bullet}>• Min loan amount $20,000.</Text>
        <Text style={styles.bullet}>• Max loan length 36 months.</Text>

        <Text style={styles.sectionTitle}>Large Business Loans</Text>
        <Text style={styles.bullet}>• Min loan amount $30,000.</Text>
        <Text style={styles.bullet}>• Max loan length 48 months.</Text>

        <Pressable
          style={styles.ctaBtn}
          onPress={() => router.push('/modal/ask-question' as never)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.ctaText}>Request an Ask of Questions about The Fountain Fund</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  header: { marginBottom: 24 },
  fundLabel: {
    fontSize: 12,
    color: FreepassColors.accentLight,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: FreepassColors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: FreepassColors.accentLight,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: FreepassColors.white,
    lineHeight: 24,
    marginBottom: 12,
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  videoText: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.accentLight,
    marginTop: 12,
  },
  videoSubtext: {
    fontSize: 13,
    color: FreepassColors.accentLight,
    marginTop: 4,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.white,
    marginTop: 20,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 14,
    color: FreepassColors.white,
    lineHeight: 22,
    marginBottom: 4,
  },
  ctaBtn: {
    backgroundColor: FreepassColors.primaryDark,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 32,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
    textAlign: 'center',
  },
});
