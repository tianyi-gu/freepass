import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useResources, useResourceCategories } from '@/hooks/use-resources';

export default function ResourceTypesScreen() {
  const { categories } = useResourceCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { resources, loading } = useResources(selectedCategory);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedName = categories.find(c => c.id === selectedCategory)?.name ?? 'Select a Category...';

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
        <Pressable style={styles.filterDropdown} onPress={() => setDropdownOpen(!dropdownOpen)}>
          <IconSymbol name="chevron.down" size={20} color={FreepassColors.textSecondary} />
          <Text style={styles.filterPlaceholder}>{selectedName}</Text>
          <IconSymbol name="chevron.down" size={18} color={FreepassColors.textSecondary} style={styles.filterArrow} />
        </Pressable>
        {dropdownOpen && (
          <View style={styles.dropdown}>
            <Pressable style={styles.dropdownItem} onPress={() => { setSelectedCategory(undefined); setDropdownOpen(false); }}>
              <Text style={styles.dropdownText}>All Categories</Text>
            </Pressable>
            {categories.map(c => (
              <Pressable key={c.id} style={styles.dropdownItem} onPress={() => { setSelectedCategory(c.id); setDropdownOpen(false); }}>
                <Text style={styles.dropdownText}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={FreepassColors.white} style={{ marginTop: 20 }} />
        ) : resources.length === 0 ? (
          <Text style={styles.emptyText}>No resources found for this category.</Text>
        ) : resources.map((r) => (
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
              {r.phone && <Text style={styles.cardDetail}>{r.phone}</Text>}
              {r.website && <Text style={styles.cardDetail}>{r.website}</Text>}
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
  dropdown: {
    backgroundColor: FreepassColors.white,
    borderRadius: 10,
    marginTop: 8,
    maxHeight: 250,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: FreepassColors.lightGray,
  },
  dropdownText: {
    fontSize: 15,
    color: FreepassColors.text,
  },
  emptyText: {
    fontSize: 15,
    color: FreepassColors.accentLight,
    textAlign: 'center',
    marginTop: 20,
  },
});
