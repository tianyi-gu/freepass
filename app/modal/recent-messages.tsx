import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useResources } from '@/hooks/use-resources';

export default function RecentMessagesModal() {
  const { resources, loading } = useResources();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Messages for</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={18} color={FreepassColors.white} />
        </Pressable>
      </View>
      <View style={styles.sorted}>
        <Text style={styles.sortedTitle}>Sorted by Name</Text>
        <Pressable>
          <Text style={styles.addChannel}>+ Add a Channel</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={FreepassColors.accentLight} style={{ marginTop: 20 }} />
        ) : resources.length === 0 ? (
          <Text style={styles.emptyText}>No channels available.</Text>
        ) : (
          resources.map((r) => (
            <Pressable
              key={r.id}
              style={styles.channelItem}
              onPress={() => {
                router.back();
                router.push(`/chat/${r.id}` as never);
              }}
              android_ripple={{ color: FreepassColors.primaryDark }}>
              <Text style={styles.channelName}>{r.name}</Text>
              <IconSymbol name="chevron.right" size={18} color={FreepassColors.white} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FreepassColors.primaryDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FreepassColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sorted: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sortedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 4,
  },
  addChannel: {
    fontSize: 14,
    color: FreepassColors.accentLight,
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FreepassColors.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  emptyText: {
    fontSize: 15,
    color: FreepassColors.accentLight,
    textAlign: 'center',
    marginTop: 20,
  },
});
