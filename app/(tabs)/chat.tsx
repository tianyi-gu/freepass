import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_CHANNELS = [
  { id: '1', name: 'Housing Resource Center' },
  { id: '2', name: 'Employment Services' },
  { id: '3', name: 'Community Support Group' },
];

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader title="Chat" showLogo={false} showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Messages</Text>
          <Text style={styles.sectionSubtitle}>Sorted by Name</Text>
          <Pressable
            style={styles.addChannel}
            onPress={() => router.push('/modal/recent-messages' as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <IconSymbol name="plus" size={18} color={FreepassColors.primary} />
            <Text style={styles.addChannelText}>Add a Channel</Text>
          </Pressable>
        </View>

        {MOCK_CHANNELS.map((channel) => (
          <Pressable
            key={channel.id}
            style={styles.channelItem}
            onPress={() => router.push(`/chat/${channel.id}` as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <Text style={styles.channelName}>{channel.name}</Text>
            <IconSymbol name="chevron.right" size={18} color={FreepassColors.textSecondary} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginBottom: 12,
  },
  addChannel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  addChannelText: {
    fontSize: 14,
    color: FreepassColors.primary,
    fontWeight: '500',
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.text,
  },
});
