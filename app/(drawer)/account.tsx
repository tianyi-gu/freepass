import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';

export default function AccountScreen() {
  const { user, logOut } = useUser();

  const handleLogOut = useCallback(async () => {
    await logOut();
    router.replace('/signup');
  }, [logOut]);

  // Not logged in or guest — prompt to create account
  if (!user || user.isGuest) {
    return (
      <View style={styles.container}>
        <FreepassHeader showLogo showMenu showBack={false} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <IconSymbol name="person.fill" size={48} color={FreepassColors.primary} />
            </View>
            <Text style={styles.userName}>Guest User</Text>
            <Text style={styles.userEmail}>Browsing as guest</Text>
          </View>

          <View style={styles.promptCard}>
            <Text style={styles.promptTitle}>Get More from FreePass</Text>
            <Text style={styles.promptBody}>
              Create a free account to save resources, get personalized recommendations, and connect
              with the community.
            </Text>
            <Pressable
              style={styles.createAccountBtn}
              onPress={() => router.push('/signup')}
              android_ripple={{ color: FreepassColors.primaryDark }}>
              <IconSymbol name="plus" size={18} color={FreepassColors.white} />
              <Text style={styles.createAccountText}>CREATE AN ACCOUNT</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resources</Text>
            <Pressable
              style={styles.menuRow}
              onPress={() => router.push('/quick-list' as never)}
              android_ripple={{ color: FreepassColors.lightGray }}>
              <IconSymbol name="map.fill" size={22} color={FreepassColors.primary} />
              <Text style={styles.menuLabel}>Browse Resources</Text>
              <IconSymbol name="chevron.right" size={20} color={FreepassColors.textSecondary} />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Logged-in user
  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showMenu showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user.displayName || 'FreePass User'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Pressable style={styles.menuRow} android_ripple={{ color: FreepassColors.lightGray }}>
            <IconSymbol name="person.fill" size={22} color={FreepassColors.primary} />
            <Text style={styles.menuLabel}>Edit Profile</Text>
            <IconSymbol name="chevron.right" size={20} color={FreepassColors.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.menuRow}
            onPress={() => router.push('/onboarding' as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <IconSymbol name="doc.text.fill" size={22} color={FreepassColors.primary} />
            <Text style={styles.menuLabel}>Retake Survey</Text>
            <IconSymbol name="chevron.right" size={20} color={FreepassColors.textSecondary} />
          </Pressable>
          <Pressable style={styles.menuRow} android_ripple={{ color: FreepassColors.lightGray }}>
            <IconSymbol name="envelope.fill" size={22} color={FreepassColors.primary} />
            <Text style={styles.menuLabel}>Notifications</Text>
            <IconSymbol name="chevron.right" size={20} color={FreepassColors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <Pressable
            style={styles.menuRow}
            onPress={() => router.push('/quick-list' as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <IconSymbol name="map.fill" size={22} color={FreepassColors.primary} />
            <Text style={styles.menuLabel}>Saved Resources</Text>
            <IconSymbol name="chevron.right" size={20} color={FreepassColors.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.menuRow}
            onPress={() => router.replace('/(drawer)/event-calendar' as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <IconSymbol name="calendar" size={22} color={FreepassColors.primary} />
            <Text style={styles.menuLabel}>My Events</Text>
            <IconSymbol name="chevron.right" size={20} color={FreepassColors.textSecondary} />
          </Pressable>
        </View>

        {Object.keys(user.surveyAnswers).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Profile Summary</Text>
            {user.surveyAnswers.immediate_needs && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Looking for help with</Text>
                <Text style={styles.summaryValue}>
                  {Array.isArray(user.surveyAnswers.immediate_needs)
                    ? (user.surveyAnswers.immediate_needs as string[]).join(', ')
                    : user.surveyAnswers.immediate_needs}
                </Text>
              </View>
            )}
            {user.surveyAnswers.employment_status && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Employment</Text>
                <Text style={styles.summaryValue}>{user.surveyAnswers.employment_status}</Text>
              </View>
            )}
            {user.surveyAnswers.housing_status && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Housing</Text>
                <Text style={styles.summaryValue}>{user.surveyAnswers.housing_status}</Text>
              </View>
            )}
          </View>
        )}

        <Pressable style={styles.logoutBtn} onPress={handleLogOut} android_ripple={{ color: FreepassColors.lightGray }}>
          <IconSymbol name="person.fill" size={20} color={FreepassColors.destructive} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: FreepassColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '800',
    color: FreepassColors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
  },
  promptCard: {
    backgroundColor: FreepassColors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 8,
  },
  promptBody: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  },
  createAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FreepassColors.accentLight,
    paddingVertical: 14,
    borderRadius: 10,
  },
  createAccountText: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.cardBg,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderRadius: 10,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: FreepassColors.text,
    marginLeft: 14,
  },
  summaryRow: {
    backgroundColor: FreepassColors.cardBg,
    padding: 16,
    borderRadius: 10,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: FreepassColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    color: FreepassColors.text,
    lineHeight: 22,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.destructive,
  },
});
