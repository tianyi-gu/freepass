import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_POSTS = [
  {
    id: '1',
    author: 'User A',
    time: '2 days ago',
    body: 'I found this great housing resource in North Philly. They helped me get my application in order. Happy to share details!',
    replies: 5,
  },
  {
    id: '2',
    author: 'User B',
    time: '1 day ago',
    body: 'Job fair at the community center this Thursday. Anyone else planning to go?',
    replies: 8,
  },
  {
    id: '3',
    author: 'User C',
    time: '5 hours ago',
    body: 'Recommendation for financial coaching – The Fountain Fund has been really helpful. Check out their courses in the Learning Academy.',
    replies: 3,
  },
];

export default function CommunityBoardScreen() {
  const [comment, setComment] = useState('');

  return (
    <View style={styles.container}>
      <FreepassHeader title="Community Message Board" showBack showLogo={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Leave a comment and connect with the community. Share resources, ask questions, and support others on their
          reentry journey.
        </Text>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            placeholderTextColor={FreepassColors.textSecondary}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <Pressable style={styles.postBtn} android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="paperplane.fill" size={18} color={FreepassColors.white} />
            <Text style={styles.postBtnText}>POST</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Recent Posts</Text>
        {MOCK_POSTS.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Text style={styles.postAuthor}>{post.author}</Text>
              <Text style={styles.postTime}>{post.time}</Text>
            </View>
            <Text style={styles.postBody}>{post.body}</Text>
            <Pressable style={styles.replyBtn}>
              <IconSymbol name="bubble.left.and.bubble.right.fill" size={16} color={FreepassColors.primary} />
              <Text style={styles.replyText}>{post.replies} replies</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  intro: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: FreepassColors.text,
    minHeight: 100,
    marginBottom: 12,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FreepassColors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  postBtnText: {
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
  postCard: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.text,
  },
  postTime: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
  },
  postBody: {
    fontSize: 15,
    color: FreepassColors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  replyText: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.primary,
  },
});
