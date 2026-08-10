import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader, FreepassLogo } from '@/components/freepass-header';
import { FreepassTabBar } from '@/components/freepass-tab-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import { useDocuments } from '@/hooks/use-documents';

function QuickActionBtn({
  icon,
  label,
  onPress,
  accent,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  accent?: boolean;
}) {
  return (
    <Pressable
      style={[styles.quickBtn, accent && styles.quickBtnAccent]}
      onPress={onPress}
      android_ripple={{ color: FreepassColors.lightGray }}>
      <View style={[styles.quickBtnIcon, accent && styles.quickBtnIconAccent]}>
        <IconSymbol name={icon as any} size={22} color={accent ? FreepassColors.white : FreepassColors.primary} />
      </View>
      <Text style={[styles.quickBtnLabel, accent && styles.quickBtnLabelAccent]}>{label}</Text>
    </Pressable>
  );
}

function FeatureCard({
  label,
  title,
  body,
  btnText,
  btnIcon,
  onPress,
  dark,
}: {
  label: string;
  title: string;
  body: string;
  btnText: string;
  btnIcon: string;
  onPress: () => void;
  dark?: boolean;
}) {
  return (
    <View style={[styles.featureCard, dark && styles.featureCardDark]}>
      <Text style={[styles.featureLabel, dark && styles.featureLabelDark]}>{label}</Text>
      <Text style={[styles.featureTitle, dark && styles.featureTitleDark]}>{title}</Text>
      <Text style={[styles.featureBody, dark && styles.featureBodyDark]}>{body}</Text>
      <Pressable
        style={[styles.featureBtn, dark && styles.featureBtnDark]}
        onPress={onPress}
        android_ripple={{ color: dark ? FreepassColors.accent : FreepassColors.primaryDark }}>
        <IconSymbol name={btnIcon as any} size={18} color={FreepassColors.white} />
        <Text style={styles.featureBtnText}>{btnText}</Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useUser();
  const documentsUserId = user && !user.isGuest ? user.id : null;
  const { documents } = useDocuments(documentsUserId);
  const showDocumentsPrompt = !!documentsUserId && documents.length === 0;

  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showMenu showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View>
          <Image
            source={require('@/assets/images/hero-crowd.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroContent}>
            <View style={styles.heroTitleRow}>
              <View style={styles.heroTitleText}>
                <Text style={styles.heroFountainFund}>The Fountain Fund</Text>
                <Text style={styles.heroPhiladelphia}>Philadelphia</Text>
              </View>
              <View style={styles.heroLogoBox}>
                <FreepassLogo size={56} />
              </View>
            </View>
            <Text style={styles.heroFreePass}>FreePass</Text>
            <Text style={styles.heroSubline}>
              {user ? `Welcome back, ${user.displayName || 'there'}!` : 'Your free resource guide for reentry in Philadelphia'}
            </Text>
            {!user && (
              <Pressable
                style={styles.heroSignUpButton}
                onPress={() => router.push('/signup' as never)}>
                <IconSymbol name="plus" size={16} color={FreepassColors.white} />
                <Text style={styles.heroSignUpText}>CREATE FREE ACCOUNT</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>

          {/* Greeting card for logged-in users */}
          {user && !user.isGuest && (
            <View style={styles.greetingCard}>
              <View style={styles.greetingAccent} />
              <View style={styles.greetingContent}>
                <Text style={styles.greetingName}>Hello, {user.displayName || 'there'}!</Text>
                <Text style={styles.greetingSubtext}>Ready to find your next resource?</Text>
              </View>
              <IconSymbol name="hand.wave.fill" size={28} color={FreepassColors.accentLight} />
            </View>
          )}

          {/* Document prompt */}
          {showDocumentsPrompt && (
            <View style={styles.docPromptCard}>
              <View style={styles.docPromptIconWrap}>
                <IconSymbol name="doc.text.fill" size={20} color={FreepassColors.white} />
              </View>
              <View style={styles.docPromptText}>
                <Text style={styles.docPromptTitle}>Keep your documents safe</Text>
                <Text style={styles.docPromptBody}>
                  Snap a photo of your ID, certifications, or paperwork — private to your account.
                </Text>
              </View>
              <Pressable
                style={styles.docPromptBtn}
                onPress={() => router.push('/documents' as never)}>
                <IconSymbol name="plus" size={14} color={FreepassColors.accent} />
                <Text style={styles.docPromptBtnText}>Add</Text>
              </Pressable>
            </View>
          )}

          {/* Quick access grid */}
          <Text style={styles.sectionLabel}>QUICK ACCESS</Text>
          <View style={styles.quickGrid}>
            <QuickActionBtn icon="magnifyingglass" label="Resources" onPress={() => router.push('/quick-list' as never)} />
            <QuickActionBtn icon="location.fill" label="Near Me" onPress={() => router.push('/map-view' as never)} accent />
            <QuickActionBtn icon="sparkles" label="Ask Casey" onPress={() => router.replace('/(drawer)/casey' as never)} />
            <QuickActionBtn icon="calendar" label="Events" onPress={() => router.replace('/(drawer)/event-calendar' as never)} />
          </View>

          {/* Feature cards */}
          <Text style={styles.sectionLabel}>EXPLORE</Text>

          <FeatureCard
            label="RESOURCES"
            title="Search Our Database"
            body="Housing, employment, legal aid, mental health, and more — all in one place to help you navigate reentry with confidence."
            btnText="SEARCH DATABASE"
            btnIcon="magnifyingglass"
            onPress={() => router.push('/quick-list' as never)}
          />

          <FeatureCard
            label="FINANCIAL LITERACY"
            title="Learning Academy"
            body="Access Fountain Fund courses on financial stability, credit building, and academic opportunities — designed for your journey."
            btnText="ACCESS LEARNING ACADEMY"
            btnIcon="play.rectangle.fill"
            onPress={() => router.replace('/(drawer)/learning-academy' as never)}
            dark
          />

          <FeatureCard
            label="COMMUNITY"
            title="Message Board"
            body="Connect with others on the same path. Share resources, wins, and support each other through the reentry journey."
            btnText="VISIT COMMUNITY BOARD"
            btnIcon="bubble.left.and.bubble.right.fill"
            onPress={() => router.replace('/(drawer)/message-board' as never)}
          />

          <FeatureCard
            label="MEDIA"
            title="Interview Library"
            body="Watch videos of local organizations and hear from people who've been through reentry — so you know what to expect."
            btnText="VIEW COURSES & VIDEOS"
            btnIcon="play.rectangle.fill"
            onPress={() => router.push('/interview-library' as never)}
            dark
          />

          {!user && (
            <View style={styles.joinCard}>
              <Text style={styles.joinTitle}>Join FreePass for Free</Text>
              <Text style={styles.joinBody}>
                Create an account to save resources, get personalized recommendations, and connect with your community.
              </Text>
              <Pressable
                style={styles.joinBtn}
                onPress={() => router.push('/signup' as never)}>
                <IconSymbol name="plus" size={16} color={FreepassColors.white} />
                <Text style={styles.joinBtnText}>SIGN UP FREE</Text>
              </Pressable>
            </View>
          )}

        </View>
      </ScrollView>
      <FreepassTabBar activeTab="home" />
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 3,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.offWhite },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // Hero
  heroImage: { width: '100%', height: 220 },
  heroContent: {
    backgroundColor: FreepassColors.primary,
    padding: 24,
    paddingBottom: 28,
  },
  heroTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  heroTitleText: { flex: 1 },
  heroLogoBox: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  heroFountainFund: {
    fontSize: 13,
    fontWeight: '600',
    color: FreepassColors.accentLight,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroPhiladelphia: { fontSize: 22, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  heroFreePass: {
    fontSize: 44,
    fontWeight: '800',
    color: FreepassColors.white,
    letterSpacing: -1,
    marginBottom: 4,
  },
  heroSubline: {
    fontSize: 15,
    color: FreepassColors.accentLight,
    fontWeight: '500',
    marginBottom: 16,
  },
  heroSignUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  heroSignUpText: { fontSize: 14, fontWeight: '700', color: FreepassColors.white },

  // Body
  body: { padding: 16, gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: FreepassColors.textSecondary,
    letterSpacing: 1.2,
    marginTop: 8,
    marginBottom: 10,
    marginLeft: 2,
  },

  // Greeting card
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  greetingAccent: {
    width: 5,
    alignSelf: 'stretch',
    backgroundColor: FreepassColors.accent,
  },
  greetingContent: { flex: 1, padding: 14 },
  greetingName: { fontSize: 18, fontWeight: '800', color: FreepassColors.text },
  greetingSubtext: { fontSize: 13, color: FreepassColors.textSecondary, marginTop: 2 },

  // Document prompt
  docPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: FreepassColors.primary,
    borderRadius: 14,
    padding: 14,
    ...CARD_SHADOW,
  },
  docPromptIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docPromptText: { flex: 1 },
  docPromptTitle: { fontSize: 14, fontWeight: '700', color: FreepassColors.white },
  docPromptBody: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2, lineHeight: 17 },
  docPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: FreepassColors.white,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  docPromptBtnText: { fontSize: 13, fontWeight: '700', color: FreepassColors.accent },

  // Quick access grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  quickBtn: {
    width: '47.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: FreepassColors.white,
    borderRadius: 14,
    padding: 14,
    ...CARD_SHADOW,
  },
  quickBtnAccent: {
    backgroundColor: FreepassColors.primary,
  },
  quickBtnIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: FreepassColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnIconAccent: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  quickBtnLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: FreepassColors.text,
    flex: 1,
  },
  quickBtnLabelAccent: {
    color: FreepassColors.white,
  },

  // Feature cards
  featureCard: {
    backgroundColor: FreepassColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 4,
    ...CARD_SHADOW,
  },
  featureCardDark: {
    backgroundColor: FreepassColors.primary,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: FreepassColors.accent,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  featureLabelDark: {
    color: FreepassColors.accentLight,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: FreepassColors.text,
    marginBottom: 8,
    lineHeight: 28,
  },
  featureTitleDark: {
    color: FreepassColors.white,
  },
  featureBody: {
    fontSize: 14,
    lineHeight: 21,
    color: FreepassColors.textSecondary,
    marginBottom: 16,
  },
  featureBodyDark: {
    color: 'rgba(255,255,255,0.75)',
  },
  featureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 13,
    borderRadius: 10,
  },
  featureBtnDark: {
    backgroundColor: FreepassColors.accentLight,
  },
  featureBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: FreepassColors.white,
  },

  // Join card
  joinCard: {
    backgroundColor: FreepassColors.accent,
    borderRadius: 16,
    padding: 20,
    marginTop: 4,
    ...CARD_SHADOW,
  },
  joinTitle: { fontSize: 20, fontWeight: '800', color: FreepassColors.white, marginBottom: 8 },
  joinBody: { fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FreepassColors.white,
    paddingVertical: 13,
    borderRadius: 10,
  },
  joinBtnText: { fontSize: 14, fontWeight: '700', color: FreepassColors.accent },
});
