import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_NEARBY = [
  { id: '1', name: 'Housing Resource Center', phone: '(555) 123-4567' },
  { id: '2', name: 'Employment Services Inc', phone: '(555) 234-5678' },
];

export default function MapViewScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Pressable style={styles.mapViewBtn}>
          <Text style={styles.mapViewText}>Map View</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.privacyCard}>
          <Text style={styles.privacyText}>
            Allow access to your device&apos;s location so we can find resources near you. We don&apos;t store your data
            or allow others to access it.
          </Text>
        </View>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={FreepassColors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by address..."
            placeholderTextColor={FreepassColors.textSecondary}
          />
        </View>
        <Text style={styles.sectionTitle}>More Resources Nearby</Text>
        <View style={styles.mapPlaceholder}>
          <IconSymbol name="map.fill" size={64} color={FreepassColors.lightGray} />
          <Text style={styles.mapPlaceholderText}>St. Louis, Missouri</Text>
        </View>
        {MOCK_NEARBY.map((r) => (
          <Pressable
            key={r.id}
            style={styles.resourceCard}
            onPress={() => router.push(`/listing/${r.id}` as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <View style={styles.cardImage}>
              <IconSymbol name="map.fill" size={28} color={FreepassColors.lightGray} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{r.name}</Text>
              <Text style={styles.cardDetail}>{r.phone}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  mapViewBtn: {
    backgroundColor: FreepassColors.primaryDark,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  mapViewText: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  privacyCard: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 15,
    color: FreepassColors.text,
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.white,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 10,
    fontSize: 16,
    color: FreepassColors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 280,
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
    marginBottom: 20,
  },
  mapPlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: FreepassColors.textSecondary,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
  },
  cardImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: FreepassColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.text,
  },
  cardDetail: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
    marginTop: 2,
  },
});
