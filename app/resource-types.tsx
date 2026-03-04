import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_RESOURCES = [
  { id: '1', name: 'Housing Resource Center', phone: '(555) 123-4567', web: 'www.example.org' },
  { id: '2', name: 'Employment Services Inc', phone: '(555) 234-5678', web: 'www.example2.org' },
  { id: '3', name: 'Community Legal Aid', phone: '(555) 345-6789', web: 'www.example3.org' },
  { id: '4', name: 'Health Services Hub', phone: '(555) 456-7890', web: 'www.example4.org' },
];

export default function ResourceTypesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Sort by Type of Resource</Text>
        <View style={styles.filterDropdown}>
          <IconSymbol name="chevron.down" size={20} color={FreepassColors.textSecondary} />
          <Text style={styles.filterPlaceholder}>Select a Category...</Text>
          <IconSymbol name="chevron.down" size={18} color={FreepassColors.textSecondary} style={styles.filterArrow} />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {MOCK_RESOURCES.map((r) => (
          <Pressable
            key={r.id}
            style={styles.resourceCard}
            onPress={() => router.push(`/listing/${r.id}` as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <View style={styles.cardImage}>
              <IconSymbol name="map.fill" size={32} color={FreepassColors.lightGray} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{r.name}</Text>
              <Text style={styles.cardDetail}>{r.phone}</Text>
              <Text style={styles.cardDetail}>{r.web}</Text>
            </View>
            <Pressable style={styles.favoriteBtn} hitSlop={8}>
              <IconSymbol name="heart" size={22} color={FreepassColors.lightGray} />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
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
  banner: {
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: FreepassColors.white,
    marginBottom: 16,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filterPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: FreepassColors.textSecondary,
  },
  filterArrow: { marginLeft: 8 },
  scroll: { flex: 1, backgroundColor: FreepassColors.primary },
  scrollContent: { padding: 20, paddingBottom: 48 },
  resourceCard: {
    flexDirection: 'row',
    backgroundColor: FreepassColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FreepassColors.accent,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: FreepassColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
    marginBottom: 2,
  },
  favoriteBtn: { padding: 4 },
});
