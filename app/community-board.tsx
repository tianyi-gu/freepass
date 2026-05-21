import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

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
          <Pressable
            style={[styles.postBtn, !comment.trim() && { opacity: 0.5 }]}
            disabled={!comment.trim()}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="paperplane.fill" size={18} color={FreepassColors.white} />
            <Text style={styles.postBtnText}>POST</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Recent Posts</Text>
        <View style={styles.emptyState}>
          <IconSymbol name="bubble.left.and.bubble.right.fill" size={40} color={FreepassColors.lightGray} />
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyText}>Be the first to share with the community!</Text>
        </View>
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
  emptyText: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginTop: 4,
  },
});
