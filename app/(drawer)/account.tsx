import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showMenu showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <IconSymbol name="person.fill" size={48} color={FreepassColors.primary} />
          </View>
          <Text style={styles.userName}>User Account Name</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Pressable style={styles.menuRow} android_ripple={{ color: FreepassColors.lightGray }}>
            <IconSymbol name="person.fill" size={22} color={FreepassColors.primary} />
            <Text style={styles.menuLabel}>Edit Profile</Text>
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

        <Pressable style={styles.logoutBtn} android_ripple={{ color: FreepassColors.lightGray }}>
          <IconSymbol name="person.fill" size={20} color={FreepassColors.primary} />
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
    color: FreepassColors.primary,
  },
});
