import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { FreepassLogo } from '@/components/freepass-header';
import { FreepassTabBar } from '@/components/freepass-tab-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showMenu showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero / Intro Section */}
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
                <FreepassLogo size={64} />
              </View>
            </View>
            <Text style={styles.heroFreePass}>FreePass</Text>
            <Text style={styles.heroSubline}>New user screen. Login / Signup</Text>
            <Text style={styles.heroDescription}>
              Welcome to your comprehensive resource portal –designed to empower the successful reentry journey in
              Philadelphia and expanding areas.
            </Text>
            <Pressable
              style={styles.heroSignUpButton}
              onPress={() => router.push('/signup' as never)}
              android_ripple={{ color: FreepassColors.primaryDark }}>
              <IconSymbol name="plus" size={18} color={FreepassColors.white} />
              <Text style={styles.ctaText}>SIGN UP</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionOrange}>
          <Text style={styles.sectionTitleDark}>Access Local Resources</Text>
          <Text style={styles.sectionTitleLight}>in a Quick List</Text>
          <Text style={styles.sectionBody}>
            We provide a centralized hub, connecting you to essential services: housing, employment, legal aid, and more
            – to help navigate your reentry with confidence.
          </Text>
          <Pressable
            style={styles.ctaButton}
            onPress={() => router.push('/quick-list' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="magnifyingglass" size={20} color={FreepassColors.white} />
            <Text style={styles.ctaText}>SEARCH DATABASE</Text>
          </Pressable>
        </View>

        <View style={[styles.sectionOrange, styles.sectionOrangeLight]}>
          <Text style={styles.sectionTitleDark}>Your Connection to</Text>
          <Text style={styles.sectionTitleLight}>Financial Literacy Access</Text>
          <Text style={styles.sectionBody}>
            Through FreePass, you have the ability to find support through the Fountain Fund&apos;s courses on financial
            stability and academic opportunities.
          </Text>
          <Pressable
            style={styles.ctaButton}
            onPress={() => router.replace('/(drawer)/learning-academy' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="chevron.right" size={20} color={FreepassColors.white} />
            <Text style={styles.ctaText}>ACCESS LEARNING ACADEMY</Text>
          </Pressable>
        </View>

        <View style={[styles.sectionOrange, styles.sectionOrangeLight]}>
          <Text style={styles.sectionTitleLight}>Give Feedback</Text>
          <Text style={styles.sectionBody}>
            Want to hear what the community has found so far? Our platform makes it easy to plan and organize your steps
            plus coordinate with your group. Whether it&apos;s finding work, a good doctor, or community events, FreePass
            lets you chat with people on the same path.
          </Text>
          <Pressable
            style={styles.ctaButton}
            onPress={() => router.replace('/(drawer)/message-board' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="chevron.right" size={20} color={FreepassColors.white} />
            <Text style={styles.ctaText}>MESSAGE BOARD</Text>
          </Pressable>
        </View>

        <View style={styles.sectionBrown}>
          <Text style={styles.sectionSubtitle}>What have I learned?</Text>
          <Text style={styles.sectionTitleOrange}>Interview Library</Text>
          <Text style={styles.sectionBodyLight}>
            You can view videos of local organizations who explain their facility and what to expect when you visit.
            This includes employers and other resources. We also provide and share interviews with individuals recently
            returning from prison and those involved in the reentry process.
          </Text>
          <Pressable
            style={styles.ctaButtonLight}
            onPress={() => router.push('/interview-library' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="play.rectangle.fill" size={20} color={FreepassColors.white} />
            <Text style={styles.ctaText}>VIEW COURSES AND VIDEOS</Text>
          </Pressable>
        </View>

        <View style={styles.sectionBrown}>
          <Text style={styles.sectionTitleLight}>Join FreePass for Free!</Text>
          <Text style={styles.sectionBodyLight}>
            Ready to get started? Sign up and start building your own community today. It&apos;s easy, fun, and a great
            way to connect with others who share your passions. Find out what FreePass is all about!
          </Text>
          <Pressable
            style={styles.signUpButton}
            onPress={() => router.push('/signup' as never)}
            android_ripple={{ color: FreepassColors.accent }}>
            <Text style={styles.ctaText}>CLICK HERE TO SIGN UP!</Text>
          </Pressable>
        </View>
      </ScrollView>
      <FreepassTabBar activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  heroImage: {
    width: '100%',
    height: 260,
  },
  heroImagePlaceholder: {
    width: '100%',
    height: 260,
    backgroundColor: '#2A4A6C',
  },
  heroContent: {
    backgroundColor: '#1A3A5C',
    padding: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  heroTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  heroTitleText: {
    flex: 1,
  },
  heroLogoBox: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  heroFountainFund: {
    fontSize: 20,
    fontWeight: '600',
    color: FreepassColors.accentLight,
    marginBottom: 2,
  },
  heroPhiladelphia: {
    fontSize: 28,
    fontWeight: '800',
    color: FreepassColors.white,
  },
  heroFreePass: {
    fontSize: 48,
    fontWeight: '800',
    color: FreepassColors.white,
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroSubline: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.accentLight,
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: FreepassColors.white,
    opacity: 0.95,
    marginBottom: 24,
  },
  heroSignUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FreepassColors.accentLight,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignSelf: 'center',
  },
  sectionOrange: {
    backgroundColor: FreepassColors.accent,
    padding: 24,
    paddingTop: 28,
  },
  sectionOrangeLight: {
    backgroundColor: FreepassColors.accentLight,
  },
  sectionBrown: {
    backgroundColor: FreepassColors.primary,
    padding: 24,
    paddingTop: 28,
  },
  sectionTitleDark: {
    fontSize: 22,
    fontWeight: '700',
    color: FreepassColors.primary,
    marginBottom: 4,
  },
  sectionTitleLight: {
    fontSize: 26,
    fontWeight: '800',
    color: FreepassColors.white,
    marginBottom: 12,
  },
  sectionTitleOrange: {
    fontSize: 24,
    fontWeight: '800',
    color: FreepassColors.accentLight,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: FreepassColors.accentLight,
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 16,
    lineHeight: 24,
    color: FreepassColors.white,
    opacity: 0.95,
    marginBottom: 20,
  },
  sectionBodyLight: {
    fontSize: 16,
    lineHeight: 24,
    color: FreepassColors.offWhite,
    marginBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: FreepassColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  ctaButtonLight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: FreepassColors.accentLight,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
