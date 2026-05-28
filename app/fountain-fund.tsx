import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const FOUNTAIN_FUND_URL = 'https://www.fountainfund.org/';

export default function FountainFundScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader title="Fountain Fund" showBack showLogo={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>THE FOUNTAIN FUND</Text>
        <Text style={styles.title}>About the Fountain Fund</Text>
        <Text style={styles.intro}>
          The Fountain Fund increases economic opportunities for formerly incarcerated people to improve their lives
          and remain in their communities.
        </Text>
        <Text style={styles.body}>
          We provide low-interest loans and financial coaching to formerly incarcerated people, helping them build
          credit and achieve their self-determined goals. The Fountain Fund also advocates for public policy that
          increases economic opportunities and reduces obstacles for formerly incarcerated people.
        </Text>

        <Pressable
          style={styles.ctaBtn}
          onPress={() => Linking.openURL(FOUNTAIN_FUND_URL)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <IconSymbol name="globe" size={20} color={FreepassColors.white} />
          <Text style={styles.ctaText}>FOUNTAIN FUND WEBSITE</Text>
        </Pressable>

        <Text style={styles.body}>
          Along with providing loans, the Fountain Fund is committed to offering information and resources related to
          finances and credit building. This required financial literacy training includes group workshops as well as
          one-on-one financial coaching for our Client Partners to give them the information, understanding and skills
          to build credit.
        </Text>

        <View style={styles.testimonialSection}>
          <View style={styles.testimonialImage}>
            <IconSymbol name="person.fill" size={48} color="rgba(255,255,255,0.5)" />
            <Text style={styles.testimonialImageText}>Melli&apos;s Story</Text>
          </View>
          <Text style={styles.caption}>Everyone has a story about their relationship with money.</Text>
          <Text style={styles.body}>
            Listen to how Melli turned her financial stress into success by utilizing The Fountain Fund&apos;s services
            and courses.
          </Text>
          <Text style={styles.quote}>
            &quot;Fountain Fund has given me the ability to function better in my community and be proud of who I am
            and how far I have came. I&apos;ve been in my position almost two years and with the help of the Fountain
            Fund I&apos;ve been offered better jobs with higher pay. They have guided me in many ways on how to present
            myself and never stop reaching for better.&quot;
          </Text>
          <Pressable
            style={[styles.ctaBtn, styles.ctaBtnDark]}
            onPress={() => router.replace('/(drawer)/learning-academy' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="play.rectangle.fill" size={20} color={FreepassColors.white} />
            <Text style={styles.ctaText}>LEARNING ACADEMY COURSES</Text>
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
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: FreepassColors.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: FreepassColors.primary,
    marginBottom: 16,
  },
  intro: {
    fontSize: 16,
    color: FreepassColors.primary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
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
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 16,
  },
  ctaBtnDark: {
    backgroundColor: FreepassColors.primary,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  testimonialSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: FreepassColors.lightGray,
  },
  testimonialImage: {
    height: 200,
    backgroundColor: FreepassColors.primary,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  caption: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 12,
  },
  quote: {
    fontSize: 15,
    color: FreepassColors.text,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 20,
  },
});
