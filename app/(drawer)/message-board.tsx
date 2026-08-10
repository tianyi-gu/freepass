import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type CommunityPost = {
  id: string;
  display_name: string;
  content: string;
  created_at: string;
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function MessageBoardScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('community_posts')
      .select('id, display_name, content, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        if (data) setPosts(data);
        setLoading(false);
      });
  }, []);
  // Blocked-author filtering happens on the full board (community-board.tsx);
  // this preview shows the same feed and links there for all interactions.

  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showMenu showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Message Board</Text>
          <Text style={styles.subtitle}>Leave a comment and connect with the community.</Text>
        </View>

        <Text style={styles.body}>
          Want to hear what the community has found so far? The message board is a public space
          where FreePass members share tips and encouragement — whether it&apos;s finding work, a
          good doctor, or community events, you can learn from people on the same path and post
          your own message.
        </Text>

        <Pressable
          style={styles.ctaBtn}
          onPress={() => router.push('/community-board' as never)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <IconSymbol name="bubble.left.and.bubble.right.fill" size={20} color={FreepassColors.white} />
          <Text style={styles.ctaBtnText}>MESSAGE BOARD</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Recent Topics</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {loading ? (
          <ActivityIndicator size="large" color={FreepassColors.primary} style={{ marginTop: 32 }} />
        ) : posts.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="bubble.left.and.bubble.right.fill" size={40} color={FreepassColors.lightGray} />
            <Text style={styles.emptyTitle}>No topics yet</Text>
            <Text style={styles.emptySubtext}>Community discussions will appear here.</Text>
          </View>
        ) : (
          posts.map((post) => (
            <Pressable
              key={post.id}
              style={styles.postCard}
              onPress={() => router.push('/community-board' as never)}
              android_ripple={{ color: FreepassColors.primaryDark }}>
              <View style={styles.postHeader}>
                <Text style={styles.postAuthor}>{post.display_name}</Text>
                <Text style={styles.postTime}>{formatTime(post.created_at)}</Text>
              </View>
              <Text style={styles.postContent} numberOfLines={3}>
                {post.content.length > 100 ? post.content.slice(0, 100) + '…' : post.content}
              </Text>
            </Pressable>
          ))
        )}
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
  errorText: {
    fontSize: 14,
    color: FreepassColors.destructive,
    marginBottom: 12,
  },
  postCard: {
    backgroundColor: FreepassColors.white,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: FreepassColors.text,
    flexShrink: 1,
  },
  postTime: {
    fontSize: 12,
    color: FreepassColors.textSecondary,
    marginLeft: 8,
  },
  postContent: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    lineHeight: 20,
  },
});
