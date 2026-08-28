import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { openWebUrl } from '@/lib/links';

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
            A guide to accessing capital through The Fountain Fund&apos;s loan programs. Tap below to review the full
            New Loan Inquiry Process on The Fountain Fund&apos;s website.
          </Text>
        </View>

        <Pressable
          style={styles.videoPlaceholder}
          onPress={() => openWebUrl(LOAN_INQUIRY_URL)}>
          <IconSymbol name="doc.text.fill" size={48} color={FreepassColors.accentLight} />
          <Text style={styles.videoText}>New Loan Inquiry Process</Text>
          <Text style={styles.videoSubtext}>Tap to review the loan inquiry process</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Who the loans are for</Text>
        <Text style={styles.body}>
          The Fountain Fund makes low-interest loans specifically for people who have been
          incarcerated. Having a record is not a barrier here — it&apos;s who the program is for,
          and no one is turned away because of the type of conviction or how long they served.
        </Text>

        <Text style={styles.sectionTitle}>What The Fountain Fund looks at</Text>
        <Text style={styles.bullet}>• A record of past incarceration.</Text>
        <Text style={styles.bullet}>• Your ability to pay the loan back.</Text>
        <Text style={styles.bullet}>• How the loan would improve your circumstances.</Text>
        <Text style={styles.body}>
          Loan amounts and terms are decided individually with you, to set you up for success.
          Loans have been used for vehicles, debt consolidation, work tools, small businesses,
          housing costs, and more.
        </Text>

        {/* Loan terms change; this screen deliberately avoids hard numbers.
            Everything above is sourced from fountainfund.org/questions
            (verified August 2026). */}
        <Text style={styles.sectionTitle}>Current terms and how to apply</Text>
        <Text style={styles.body}>
          For current loan amounts, interest rates, and the full inquiry process, use the link at
          the top of this page or visit fountainfund.org. The details there are always the most
          up to date — when in doubt, ask a Fountain Fund staff member.
        </Text>

        <Pressable
          style={styles.ctaBtn}
          onPress={() => router.push('/modal/ask-question' as never)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.ctaText}>Ask a Question about The Fountain Fund</Text>
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
