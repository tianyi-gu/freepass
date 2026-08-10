import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import {
  BLOCKED_LANGUAGE_MESSAGE,
  blockUser,
  containsBlockedLanguage,
  fetchBlockedIds,
  submitReport,
} from '@/lib/moderation';
import { supabase } from '@/lib/supabase';

type Post = {
  id: string;
  display_name: string;
  content: string;
  created_at: string;
  user_id: string | null;
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommunityBoardScreen() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signedInUserId = user && !user.isGuest ? user.id : null;

  useEffect(() => {
    Promise.all([
      supabase
        .from('community_posts')
        .select('id, display_name, content, created_at, user_id')
        .order('created_at', { ascending: false }),
      fetchBlockedIds(signedInUserId),
    ]).then(([{ data, error: err }, blocked]) => {
      if (err) setError(err.message);
      if (data) {
        setPosts((data as Post[]).filter((p) => !p.user_id || !blocked.has(p.user_id)));
      }
      setLoading(false);
    });
  }, [signedInUserId]);

  const handlePost = useCallback(async () => {
    const text = comment.trim();
    if (!text || posting) return;
    if (!user || user.isGuest) {
      Alert.alert('Sign in required', 'Please create an account or log in to post on the community board.');
      return;
    }
    if (containsBlockedLanguage(text)) {
      Alert.alert('Please rephrase', BLOCKED_LANGUAGE_MESSAGE);
      return;
    }
    setPosting(true);
    const { data, error } = await supabase
      .from('community_posts')
      .insert({ content: text, display_name: user.displayName || 'Anonymous', user_id: user.id })
      .select('id, display_name, content, created_at, user_id')
      .single();
    if (!error && data) {
      setPosts((prev) => [data as Post, ...prev]);
      setComment('');
    } else if (error) {
      setError(error.message);
    }
    setPosting(false);
  }, [comment, posting, user]);

  const handlePostOptions = useCallback(
    (item: Post) => {
      const options: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [
        {
          text: 'Report post',
          onPress: async () => {
            const { error: err } = await submitReport('community_post', item.id, signedInUserId);
            Alert.alert(
              err ? 'Could not send report' : 'Report sent',
              err ?? 'Thank you. Our team will review this post.',
            );
          },
        },
      ];
      if (signedInUserId && item.user_id && item.user_id !== signedInUserId) {
        options.push({
          text: `Block ${item.display_name}`,
          style: 'destructive',
          onPress: async () => {
            const { error: err } = await blockUser(signedInUserId, item.user_id!);
            if (err) {
              Alert.alert('Could not block', err);
              return;
            }
            setPosts((prev) => prev.filter((p) => p.user_id !== item.user_id));
            Alert.alert('Blocked', `You won't see posts from ${item.display_name} anymore.`);
          },
        });
      }
      options.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert('Post options', undefined, options);
    },
    [signedInUserId],
  );

  const renderPost = ({ item }: { item: Post }) => {
    const isOwner = !!signedInUserId && item.user_id === signedInUserId;
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.postAvatar}>
            <Text style={styles.postAvatarText}>
              {item.display_name[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.postMeta}>
            <Text style={styles.postName}>{item.display_name}</Text>
            <Text style={styles.postTime}>{timeAgo(item.created_at)}</Text>
          </View>
          {isOwner ? (
            <Pressable
              style={styles.postEditBtn}
              hitSlop={8}
              onPress={() =>
                router.push(
                  `/modal/edit-message?messageId=${item.id}&currentText=${encodeURIComponent(item.content)}` as never
                )
              }>
              <IconSymbol name="square.and.pencil" size={18} color={FreepassColors.textSecondary} />
            </Pressable>
          ) : (
            <Pressable
              style={styles.postEditBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Report or block"
              onPress={() => handlePostOptions(item)}>
              <IconSymbol name="ellipsis" size={18} color={FreepassColors.textSecondary} />
            </Pressable>
          )}
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FreepassHeader title="Community Board" showBack showLogo={false} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <Text style={styles.intro}>
                Share resources, ask questions, and support others on their reentry journey.
              </Text>
              {signedInUserId ? (
                <View style={styles.inputSection}>
                  <TextInput
                    style={styles.input}
                    placeholder="Write a message..."
                    placeholderTextColor={FreepassColors.textSecondary}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    maxLength={500}
                  />
                  <Pressable
                    style={[styles.postBtn, (!comment.trim() || posting) && styles.postBtnDisabled]}
                    onPress={handlePost}
                    disabled={!comment.trim() || posting}>
                    {posting ? (
                      <ActivityIndicator size="small" color={FreepassColors.white} />
                    ) : (
                      <Text style={styles.postBtnText}>POST</Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.signInPrompt}
                  onPress={() => router.push('/signup' as never)}>
                  <Text style={styles.signInPromptText}>
                    Sign in to post. You can read the board as a guest.
                  </Text>
                </Pressable>
              )}
              <View style={styles.kindnessBanner}>
                <Text style={styles.kindnessText}>
                  Please keep this space kind and supportive. We&apos;re all on a journey.
                </Text>
              </View>
              <Text style={styles.sectionTitle}>Recent Posts</Text>
              {error && <Text style={styles.errorText}>{error}</Text>}
              {loading && (
                <ActivityIndicator
                  style={styles.loader}
                  color={FreepassColors.primary}
                />
              )}
            </View>
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No posts yet</Text>
                <Text style={styles.emptyText}>Be the first to share with the community!</Text>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  flex: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 48 },
  intro: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  inputSection: { marginBottom: 16 },
  input: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: FreepassColors.text,
    minHeight: 90,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FreepassColors.primary,
    paddingVertical: 13,
    borderRadius: 10,
  },
  postBtnDisabled: { opacity: 0.45 },
  postBtnText: { fontSize: 15, fontWeight: '700', color: FreepassColors.white },
  signInPrompt: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
    alignItems: 'center',
  },
  signInPromptText: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.primary,
  },
  kindnessBanner: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: FreepassColors.accent,
  },
  kindnessText: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 12,
  },
  loader: { marginVertical: 24 },
  postCard: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FreepassColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: { color: FreepassColors.white, fontWeight: '700', fontSize: 15 },
  postMeta: { flex: 1 },
  postName: { fontSize: 14, fontWeight: '700', color: FreepassColors.text },
  postTime: { fontSize: 12, color: FreepassColors.textSecondary, marginTop: 1 },
  postEditBtn: { padding: 4 },
  postContent: { fontSize: 15, color: FreepassColors.text, lineHeight: 22 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: FreepassColors.text, marginBottom: 4 },
  emptyText: { fontSize: 14, color: FreepassColors.textSecondary },
  errorText: {
    fontSize: 14,
    color: FreepassColors.destructive,
    marginBottom: 12,
  },
});
