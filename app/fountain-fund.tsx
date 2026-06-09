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
          <Text style={styles.caption}>Everyone has a story. Here are a few from our community.</Text>

          <View style={styles.storyCard}>
            <View style={styles.storyHeader}>
              <View style={styles.storyAvatar}>
                <Text style={styles.storyAvatarText}>CB</Text>
              </View>
              <View style={styles.storyHeaderText}>
                <Text style={styles.storyName}>Charisse Becnel</Text>
                <Text style={styles.storyLocation}>New Orleans</Text>
              </View>
            </View>
            <Text style={styles.storyBody}>
              Charisse Becnel, a 30-year-old single mother, had nearly completed her nursing degree, but an inability
              to cover outstanding college expenses nearly derailed her dream.
            </Text>
            <Text style={styles.storyBody}>
              “I had been paying tuition out of pocket, and it was so hard,” says Becnel. With two young boys, the
              financial and emotional stresses felt insurmountable, so she turned to her DCFS caseworker to explore
              other resources. That single conversation created a bridge to the Fountain Fund, and shortly thereafter,
              Becnel secured an academic loan, paid off the remaining tuition and set herself up for success.
            </Text>
            <Text style={styles.storyBody}>
              Despite the many setbacks between 2019–2023, Becnel remarks, “It was all such a blessing, even the hard
              parts. Because everything finally fell into place.” One word she would use to describe walking across the
              graduation stage? SHOCK! “It still doesn’t feel real. I couldn’t believe it was happening.”
            </Text>
            <Text style={styles.storyBody}>
              Since then, Becnel has been hired as an RN with Ochsner Health and has paid her loan off in full. When
              describing the best parts of being a nurse, her voice lights up. “I love it when my patients feel seen and
              heard. Some people are sick for a very long time and they have given up hope. When you give patients the
              best care, they see you like family.”
            </Text>
            <Text style={styles.quote}>
              “Your struggle is temporary. Pray. Seek out others. Don’t feel ashamed. Don’t hold it in. You never know
              who might be a blessing in disguise.”
            </Text>
          </View>

          <View style={styles.storyCard}>
            <View style={styles.storyHeader}>
              <View style={styles.storyAvatar}>
                <Text style={styles.storyAvatarText}>DL</Text>
              </View>
              <View style={styles.storyHeaderText}>
                <Text style={styles.storyName}>Dormen Lisby</Text>
                <Text style={styles.storyLocation}>Philadelphia</Text>
              </View>
            </View>
            <Text style={styles.storyBody}>
              Dormen Lisby is a Renaissance man: an artist, a writer, a teacher, a mentor.
            </Text>
            <Text style={styles.storyBody}>
              As a Program Facilitator with Shining Light, he brings evidence-based practices of positive psychology and
              character strengths into the nation’s prisons. Working with professors, therapists and actors, he helps
              those who are incarcerated find their voice. And he knows these offerings are transformative and
              life-affirming, because they changed his.
            </Text>
            <Text style={styles.storyBody}>
              Lisby spent nearly 26 years in the Pennsylvania Department of Corrections. He faced immense obstacles upon
              reentry, but as Lisby likes to say, “For every door that’s closed, there’s a bigger door waiting to open.”
            </Text>
            <Text style={styles.storyBody}>
              While exploring jobs and starting a small arts business, he quickly realized that having a reliable car
              would be key. He also knew that traditional financing would be impossible. “I don’t believe any of
              society’s banking systems would have provided me with a loan,” he says. “To those systems, I didn’t exist
              prior to 2022.”
            </Text>
            <Text style={styles.storyBody}>
              That’s where the Fountain Fund stepped in with an auto loan to help him on his journey. “They walk you
              through every step of the process,” says Lisby. “They’re transparent. They ask tough questions, but they
              want you to succeed.” Looking back, he remarks, “It wasn’t the loan that was the most important, it was the
              relationships.”
            </Text>
            <Text style={styles.storyBody}>
              Lisby is now the proud owner of “Maxine,” a car that does triple duty — providing essential transportation
              for work, allowing him to participate in exhibits like the Black Boy Art Show, and helping him care for
              family.
            </Text>
          </View>

          <Pressable
            style={[styles.ctaBtn, styles.ctaBtnDark]}
            onPress={() => router.replace('/(drawer)/learning-academy' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="book.fill" size={20} color={FreepassColors.white} />
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
    fontWeight: '600',
    color: FreepassColors.primary,
    lineHeight: 24,
    textAlign: 'left',
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
  caption: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 16,
  },
  storyCard: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  storyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FreepassColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: FreepassColors.white,
  },
  storyHeaderText: {
    flex: 1,
  },
  storyName: {
    fontSize: 17,
    fontWeight: '700',
    color: FreepassColors.primary,
  },
  storyLocation: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
    marginTop: 2,
  },
  storyBody: {
    fontSize: 15,
    color: FreepassColors.text,
    lineHeight: 23,
    marginBottom: 12,
  },
  quote: {
    fontSize: 15,
    color: FreepassColors.primary,
    lineHeight: 24,
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 4,
  },
});
