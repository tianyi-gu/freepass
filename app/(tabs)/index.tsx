import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Welcome to Freepass</Text>
          <Text style={styles.heroSubtitle}>
            Resources to support your reintegration journey. Find housing, employment, and community support.
          </Text>
        </View>

        <Pressable
          style={styles.card}
          onPress={() => router.push('/category-search' as never)}
          android_ripple={{ color: FreepassColors.lightGray }}>
          <View style={styles.cardIcon}>
            <IconSymbol name="rectangle.stack.fill" size={32} color={FreepassColors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Category Search</Text>
            <Text style={styles.cardSubtitle}>Browse housing, employment, and low-income assistance resources</Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={FreepassColors.textSecondary} />
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push('/map-view' as never)}
          android_ripple={{ color: FreepassColors.lightGray }}>
          <View style={styles.cardIcon}>
            <IconSymbol name="map.fill" size={32} color={FreepassColors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Resources Near You</Text>
            <Text style={styles.cardSubtitle}>Find organizations and services in your area</Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={FreepassColors.textSecondary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  hero: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: FreepassColors.textSecondary,
    lineHeight: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: FreepassColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: FreepassColors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    lineHeight: 20,
  },
});
