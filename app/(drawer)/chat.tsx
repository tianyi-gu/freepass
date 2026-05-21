import { DrawerActions } from '@react-navigation/native';
import { router, useNavigation } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassTabBar } from '@/components/freepass-tab-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useResources } from '@/hooks/use-resources';

export default function ChatScreen() {
  const navigation = useNavigation();
  const { resources, loading } = useResources();

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuBtn}>
            <IconSymbol name="line.3.horizontal" size={22} color={FreepassColors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={styles.headerRight}>
            <IconSymbol name="person.fill" size={22} color={FreepassColors.white} />
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerBtn}
            onPress={() => router.push('/modal/recent-messages' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="rectangle.grid.2x2.fill" size={14} color={FreepassColors.white} />
            <Text style={styles.headerBtnText}>VIEW CHANNELS</Text>
          </Pressable>
          <Pressable
            style={styles.headerBtn}
            onPress={() => router.replace('/(drawer)/account' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="person.fill" size={14} color={FreepassColors.white} />
            <Text style={styles.headerBtnText}>ACCOUNT</Text>
          </Pressable>
        </View>
      </View>
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
        {loading ? (
          <ActivityIndicator color={FreepassColors.primary} style={{ marginTop: 20 }} />
        ) : resources.length === 0 ? (
          <Text style={styles.emptyText}>No channels available.</Text>
        ) : (
          resources.map((r) => (
            <Pressable
              key={r.id}
              style={styles.channelItem}
              onPress={() => router.push(`/chat/${r.id}` as never)}
              android_ripple={{ color: FreepassColors.lightGray }}>
              <View style={styles.channelIcon}>
                <IconSymbol name="person.fill" size={24} color={FreepassColors.textSecondary} />
              </View>
              <View style={styles.channelContent}>
                <Text style={styles.channelName}>{r.name}</Text>
                {r.phone && <Text style={styles.channelMeta}>{r.phone}</Text>}
              </View>
              <IconSymbol name="square.and.pencil" size={18} color={FreepassColors.textSecondary} />
            </Pressable>
          ))
        )}
      </ScrollView>
      <FreepassTabBar activeTab="chat" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  headerBar: {
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuBtn: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.white,
    textAlign: 'center',
  },
  headerRight: { width: 40 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: FreepassColors.primaryDark,
    borderRadius: 8,
  },
  headerBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 20 },
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
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  channelIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FreepassColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  channelContent: { flex: 1 },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.text,
    marginBottom: 2,
  },
  channelMeta: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
  },
  emptyText: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});
