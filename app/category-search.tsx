import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const CATEGORIES = [
  {
    id: 'housing',
    title: 'Housing Assistance',
    subtitle: 'Use these resources to get current information.',
    resource: { name: 'Company Name', phone: 'Phone Number', web: 'Web Address' },
    links: [
      { id: 'weather', title: 'Weather', sub: 'Philadelphia' },
      { id: 'transit', title: 'Transit Related', sub: 'SEPTA' },
      { id: 'retail', title: 'Retail', sub: '7-Day' },
    ],
  },
  {
    id: 'employment',
    title: 'Employment Assistance',
    subtitle: 'Use these resources to get current information.',
    resource: { name: 'Company Name', phone: 'Phone Number', web: 'Web Address' },
    links: [
      { id: 'weather', title: 'Weather', sub: 'Philadelphia' },
      { id: 'transit', title: 'Transit Related', sub: 'SEPTA' },
      { id: 'retail', title: 'Retail', sub: '7-Day' },
    ],
  },
  {
    id: 'lowincome',
    title: 'Low Income Assistance',
    subtitle: 'Use these resources to get current information.',
    resource: { name: 'Company Name', phone: 'Phone Number', web: 'Web Address' },
    links: [
      { id: 'weather', title: 'Weather', sub: 'Philadelphia' },
      { id: 'transit', title: 'Transit Related', sub: 'SEPTA' },
      { id: 'retail', title: 'Retail', sub: '7-Day' },
    ],
  },
];

export default function CategorySearchScreen() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    housing: true,
    employment: true,
    lowincome: true,
  });

  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <View style={styles.container}>
      <FreepassHeader title="Category Search" showBack showLogo={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((cat) => (
          <View key={cat.id} style={styles.category}>
            <Pressable style={styles.categoryHeader} onPress={() => toggle(cat.id)}>
              <View style={styles.categoryHeaderLeft}>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categorySubtitle}>{cat.subtitle}</Text>
              </View>
              <IconSymbol
                name={expanded[cat.id] ? 'chevron.up' : 'chevron.down'}
                size={20}
                color={FreepassColors.text}
              />
            </Pressable>
            {expanded[cat.id] && (
              <>
                <Pressable
                  style={styles.resourceCard}
                  onPress={() => router.push(`/listing/${cat.id}` as never)}
                  android_ripple={{ color: FreepassColors.lightGray }}>
                  <View style={styles.resourceIcon}>
                    <IconSymbol name="doc.text.fill" size={24} color={FreepassColors.textSecondary} />
                  </View>
                  <View>
                    <Text style={styles.resourceText}>{cat.resource.name}</Text>
                    <Text style={styles.resourceText}>{cat.resource.phone}</Text>
                    <Text style={styles.resourceText}>{cat.resource.web}</Text>
                  </View>
                </Pressable>
                {cat.links.map((link) => (
                  <Pressable
                    key={link.id}
                    style={styles.linkRow}
                    onPress={() => router.push(`/listing/${cat.id}-${link.id}` as never)}
                    android_ripple={{ color: FreepassColors.lightGray }}>
                    <IconSymbol name="doc.text.fill" size={20} color={FreepassColors.primary} />
                    <View style={styles.linkContent}>
                      <Text style={styles.linkTitle}>{link.title}</Text>
                      <Text style={styles.linkSub}>{link.sub}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={18} color={FreepassColors.textSecondary} />
                  </Pressable>
                ))}
              </>
            )}
          </View>
        ))}

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
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: FreepassColors.lightGray,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  resourceIcon: {
    marginRight: 12,
  },
  resourceText: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginBottom: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FreepassColors.lightGray,
  },
  linkContent: { flex: 1, marginLeft: 12 },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.text,
  },
  linkSub: {
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
