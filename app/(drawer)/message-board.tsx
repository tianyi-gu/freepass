import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function MessageBoardScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showMenu showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Message Board</Text>
          <Text style={styles.subtitle}>Leave a comment and connect with the community.</Text>
        </View>

        <Text style={styles.body}>
          Want to hear what the community has found so far? Our platform makes it easy to plan and organize your steps
          plus coordinate with your group. Whether it&apos;s finding work, a good doctor, or community events, FreePass
          lets you chat with people on the same path.
        </Text>

        <Pressable
          style={styles.ctaBtn}
          onPress={() => router.push('/community-board' as never)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <IconSymbol name="bubble.left.and.bubble.right.fill" size={20} color={FreepassColors.white} />
          <Text style={styles.ctaBtnText}>MESSAGE BOARD</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Recent Topics</Text>
        <View style={styles.emptyState}>
          <IconSymbol name="bubble.left.and.bubble.right.fill" size={40} color={FreepassColors.lightGray} />
          <Text style={styles.emptyTitle}>No topics yet</Text>
          <Text style={styles.emptySubtext}>Community discussions will appear here.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },
  header: { marginBottom: 12 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: FreepassColors.textSecondary,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
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
    marginBottom: 28,
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: FreepassColors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginTop: 4,
  },
});
