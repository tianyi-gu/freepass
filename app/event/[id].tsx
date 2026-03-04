import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.imageBanner}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={20} color={FreepassColors.white} />
        </Pressable>
        <View style={styles.bannerPattern}>
          <Text style={styles.bannerLogo}>fp</Text>
        </View>
      </View>
      <View style={styles.titleBanner}>
        <Text style={styles.eventName}>Event Name</Text>
        <Text style={styles.eventDesc}>Description</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Instructor</Text>
              <Text style={styles.detailValue}>Instructor / Host</Text>
            </View>
            <View style={styles.avatarPlaceholder} />
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="calendar" size={20} color={FreepassColors.textSecondary} />
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Start Time</Text>
              <Text style={styles.detailValue}>Thursday, May 4th, 2024 at 4:00 PM</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="bubble.left.and.bubble.right.fill" size={20} color={FreepassColors.textSecondary} />
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Connected by Full Name</Text>
              <Text style={styles.detailValue}>Phone Number</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <IconSymbol name="map.fill" size={20} color={FreepassColors.textSecondary} />
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>123 Main St, City, State</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  imageBanner: {
    height: 200,
    backgroundColor: FreepassColors.accentLight,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FreepassColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerPattern: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLogo: {
    fontSize: 48,
    fontWeight: '800',
    color: FreepassColors.primary,
  },
  titleBanner: {
    backgroundColor: FreepassColors.primary,
    padding: 16,
    paddingTop: 20,
  },
  eventName: {
    fontSize: 22,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  eventDesc: {
    fontSize: 14,
    color: FreepassColors.accentLight,
    marginTop: 4,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  detailCard: {
    backgroundColor: FreepassColors.white,
    borderRadius: 12,
    padding: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FreepassColors.lightGray,
  },
  detailLeft: { flex: 1, marginLeft: 12 },
  detailLabel: {
    fontSize: 12,
    color: FreepassColors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.text,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FreepassColors.lightGray,
  },
});
