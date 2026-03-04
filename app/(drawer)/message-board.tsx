import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_TOPICS = [
  { id: '1', title: 'Housing Tips in Philadelphia', replies: 12, lastPost: '2 days ago' },
  { id: '2', title: 'Job Fair This Week – Share Your Experience', replies: 8, lastPost: '1 day ago' },
  { id: '3', title: 'Best Resources for Legal Aid?', replies: 15, lastPost: '3 hours ago' },
  { id: '4', title: 'Financial Coaching – Recommendations', replies: 5, lastPost: '5 days ago' },
];

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
        {MOCK_TOPICS.map((topic) => (
          <Pressable
            key={topic.id}
            style={styles.topicCard}
            onPress={() => router.push('/community-board' as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <View style={styles.topicIcon}>
              <IconSymbol name="bubble.left.and.bubble.right.fill" size={24} color={FreepassColors.primary} />
            </View>
            <View style={styles.topicContent}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicMeta}>
                {topic.replies} replies · {topic.lastPost}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={FreepassColors.textSecondary} />
          </Pressable>
        ))}
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
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  topicIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: FreepassColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topicContent: { flex: 1 },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.text,
    marginBottom: 4,
  },
  topicMeta: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
  },
});
