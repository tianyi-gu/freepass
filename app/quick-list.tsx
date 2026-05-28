import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useResources } from '@/hooks/use-resources';
import { useSavedResources } from '@/hooks/use-saved-resources';
import { resourceMatchesSearch } from '@/lib/resource-utils';

export default function QuickListScreen() {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { resources: allResources, loading } = useResources();
  const { isSaved, toggleSave } = useSavedResources();

  const resources = useMemo(() => allResources.filter((r) => {
    if (showFavoritesOnly && !isSaved(r.id)) return false;
    if (searchQuery.trim()) {
      return resourceMatchesSearch(r, searchQuery);
    }
    return true;
  }), [allResources, showFavoritesOnly, searchQuery, isSaved]);

  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.branding}>
          <Text style={styles.brandTitle}>FreePass Quick List</Text>
          <Text style={styles.brandSubtitle}>
            To find relevant services in your area, you may use the Search Bar, choose Search by Category, or view
            Resources near you.
          </Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <IconSymbol name="magnifyingglass" size={20} color={FreepassColors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Resources..."
              placeholderTextColor={FreepassColors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Text style={styles.sectionHeading}>Below are relevant services in your area.</Text>
        </View>

        <View style={styles.actionGrid}>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnAccent]}
            onPress={() => router.push('/map-view' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="location.fill" size={16} color={FreepassColors.white} />
            <Text style={styles.actionBtnText}>Near Me</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnDark]}
            onPress={() => router.push('/category-search' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="square.grid.2x2.fill" size={16} color={FreepassColors.white} />
            <Text style={styles.actionBtnText}>By Category</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnDark]}
            onPress={() => router.push('/resource-types' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="list.bullet" size={16} color={FreepassColors.white} />
            <Text style={styles.actionBtnText}>By Type</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnLight]}
            onPress={() => router.push('/add-resource' as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <IconSymbol name="plus" size={16} color={FreepassColors.primary} />
            <Text style={styles.actionBtnTextDark}>Submit</Text>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          <Pressable
            style={styles.checkbox}
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <View style={[styles.checkboxBox, showFavoritesOnly && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>Show Favorites Only</Text>
          </Pressable>
          <Pressable
            style={styles.staffBtn}
            onPress={() => router.push('/staff-view' as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <IconSymbol name="person.fill" size={16} color={FreepassColors.primary} />
            <Text style={styles.staffBtnText}>Staff View</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={FreepassColors.primary} style={{ marginTop: 20 }} />
        ) : resources.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="magnifyingglass" size={40} color={FreepassColors.lightGray} />
            <Text style={styles.emptyText}>No resources found.</Text>
            <Text style={styles.emptySubtext}>Try a different search term.</Text>
          </View>
        ) : resources.map((r) => (
          <Pressable
            key={r.id}
            style={styles.resourceCard}
            onPress={() => router.push(`/listing/${r.id}` as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <View style={styles.cardIconWrap}>
              <IconSymbol name="building.2.fill" size={22} color={FreepassColors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{r.name}</Text>
              {r.address && <Text style={styles.cardDetail}>{r.address}</Text>}
              {r.phone && (
                <View style={styles.phoneChip}>
                  <IconSymbol name="phone.fill" size={10} color={FreepassColors.accent} />
                  <Text style={styles.phoneChipText}>{r.phone}</Text>
                </View>
              )}
              {r.tags && r.tags.length > 0 && (
                <View style={styles.tagRow}>
                  {r.tags.slice(0, 2).map((t, i) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <Pressable style={styles.favoriteBtn} hitSlop={8} onPress={() => toggleSave(r.id)}>
              <IconSymbol
                name={isSaved(r.id) ? 'heart.fill' : 'heart'}
                size={22}
                color={isSaved(r.id) ? FreepassColors.accent : FreepassColors.lightGray}
              />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  branding: { marginBottom: 20 },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: FreepassColors.primary,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
    lineHeight: 22,
  },
  searchSection: { marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: FreepassColors.text,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.text,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    width: '47.5%',
    justifyContent: 'center',
  },
  actionBtnAccent: {
    backgroundColor: FreepassColors.accent,
  },
  actionBtnDark: {
    backgroundColor: FreepassColors.primary,
  },
  actionBtnLight: {
    backgroundColor: FreepassColors.offWhite,
    borderWidth: 1.5,
    borderColor: FreepassColors.lightGray,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  actionBtnTextDark: {
    fontSize: 13,
    fontWeight: '700',
    color: FreepassColors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: FreepassColors.primary,
  },
  checkboxChecked: {
    backgroundColor: FreepassColors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: FreepassColors.text,
  },
  staffBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  staffBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.primary,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: FreepassColors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: FreepassColors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 3,
    lineHeight: 21,
  },
  cardDetail: {
    fontSize: 12,
    color: FreepassColors.textSecondary,
    marginBottom: 2,
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  phoneChipText: {
    fontSize: 12,
    color: FreepassColors.accent,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    color: FreepassColors.textSecondary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
    marginTop: 4,
  },
  favoriteBtn: { padding: 4, marginLeft: 4 },
});
