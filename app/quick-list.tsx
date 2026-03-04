import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_RESOURCES = [
  { id: '1', name: 'Housing Resource Center', phone: '(555) 123-4567', web: 'www.example.org', isFavorite: false },
  { id: '2', name: 'Employment Services Inc', phone: '(555) 234-5678', web: 'www.example2.org', isFavorite: true },
  { id: '3', name: 'Community Legal Aid', phone: '(555) 345-6789', web: 'www.example3.org', isFavorite: false },
];

export default function QuickListScreen() {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const resources = showFavoritesOnly
    ? MOCK_RESOURCES.filter((r) => r.isFavorite)
    : MOCK_RESOURCES;

  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        <Pressable
          style={styles.actionBtn}
          onPress={() => router.push('/map-view' as never)}
          android_ripple={{ color: FreepassColors.accent }}>
          <Text style={styles.actionBtnText}>Find Resources Near Me Now</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.actionBtnDark]}
          onPress={() => router.push('/category-search' as never)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.actionBtnText}>Search by Category</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.actionBtnDark]}
          onPress={() => router.push('/resource-types' as never)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.actionBtnText}>Sort By Type of Resource</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.actionBtnLight]}
          onPress={() => router.push('/add-resource' as never)}
          android_ripple={{ color: FreepassColors.lightGray }}>
          <IconSymbol name="plus" size={18} color={FreepassColors.primary} />
          <Text style={styles.actionBtnTextDark}>SUBMIT NEW RESOURCE</Text>
        </Pressable>

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

        {resources.map((r) => (
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
              <IconSymbol
                name={r.isFavorite ? 'heart.fill' : 'heart'}
                size={22}
                color={r.isFavorite ? FreepassColors.accent : FreepassColors.lightGray}
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
  actionBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBtnDark: {
    backgroundColor: FreepassColors.primary,
  },
  actionBtnLight: {
    backgroundColor: FreepassColors.accentLight,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  actionBtnTextDark: {
    fontSize: 15,
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
    backgroundColor: FreepassColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
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
