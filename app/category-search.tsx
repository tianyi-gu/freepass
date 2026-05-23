import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useResources, useResourceCategories } from '@/hooks/use-resources';

export default function CategorySearchScreen() {
  const { categories, loading: catsLoading } = useResourceCategories();
  const { resources, loading: resLoading } = useResources();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const loading = catsLoading || resLoading;

  return (
    <View style={styles.container}>
      <FreepassHeader title="Category Search" showBack showLogo={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={FreepassColors.primary} style={{ marginTop: 40 }} />
        ) : categories.length === 0 ? (
          <Text style={styles.emptyText}>No categories available.</Text>
        ) : (
          categories.map((cat) => {
            const catResources = resources.filter((r) => r.category_id === cat.id);
            const isExpanded = expanded[cat.id] ?? false;

            return (
              <View key={cat.id} style={styles.category}>
                <Pressable style={styles.categoryHeader} onPress={() => toggle(cat.id)}>
                  <View style={styles.categoryHeaderLeft}>
                    <Text style={styles.categoryTitle}>{cat.name}</Text>
                    <Text style={styles.categorySubtitle}>
                      {catResources.length} resource{catResources.length !== 1 ? 's' : ''} available
                    </Text>
                  </View>
                  <IconSymbol
                    name={isExpanded ? 'chevron.up' : 'chevron.down'}
                    size={20}
                    color={FreepassColors.text}
                  />
                </Pressable>
                {isExpanded && (
                  <>
                    {catResources.length === 0 ? (
                      <Text style={styles.noResources}>No resources in this category yet.</Text>
                    ) : (
                      catResources.map((r) => (
                        <Pressable
                          key={r.id}
                          style={styles.resourceCard}
                          onPress={() => router.push(`/listing/${r.id}` as never)}
                          android_ripple={{ color: FreepassColors.lightGray }}>
                          <View style={styles.resourceIcon}>
                            <IconSymbol
                              name={(cat.icon as any) || 'doc.text.fill'}
                              size={24}
                              color={FreepassColors.primary}
                            />
                          </View>
                          <View style={styles.resourceContent}>
                            <Text style={styles.resourceName}>{r.name}</Text>
                            {r.phone && <Text style={styles.resourceDetail}>{r.phone}</Text>}
                            {r.address && <Text style={styles.resourceDetail}>{r.address}</Text>}
                          </View>
                          <IconSymbol name="chevron.right" size={18} color={FreepassColors.textSecondary} />
                        </Pressable>
                      ))
                    )}
                  </>
                )}
              </View>
            );
          })
        )}

        <View style={styles.cardsRow}>
          <Pressable
            style={[styles.featureCard, styles.featureCardAccent]}
            onPress={() => router.push('/interview-library' as never)}
            android_ripple={{ color: FreepassColors.accentLight }}>
            <Text style={styles.featureCardTitle}>Interview Library</Text>
            <Text style={styles.featureCardSub}>Watch new videos.</Text>
            <IconSymbol name="chevron.right" size={18} color={FreepassColors.primary} />
          </Pressable>
          <Pressable
            style={[styles.featureCard, styles.featureCardDark]}
            onPress={() => router.push('/community-board' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <Text style={styles.featureCardTitleAlt}>Community Message Board</Text>
            <Text style={styles.featureCardSubAlt}>Leave a comment.</Text>
            <IconSymbol name="chevron.right" size={18} color={FreepassColors.white} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  emptyText: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  category: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryHeaderLeft: { flex: 1 },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
  },
  categorySubtitle: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginTop: 4,
  },
  noResources: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FreepassColors.lightGray,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: FreepassColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resourceContent: { flex: 1 },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.text,
  },
  resourceDetail: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
    marginTop: 2,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  featureCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  featureCardAccent: {
    backgroundColor: FreepassColors.accentLight,
  },
  featureCardDark: {
    backgroundColor: FreepassColors.primary,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.primary,
    marginBottom: 4,
  },
  featureCardSub: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
  },
  featureCardTitleAlt: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 4,
  },
  featureCardSubAlt: {
    fontSize: 13,
    color: FreepassColors.accentLight,
  },
});
