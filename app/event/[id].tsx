import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useEvent } from '@/hooks/use-events';

export default function EventDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { event, loading, error } = useEvent(id);

  const handleShare = async () => {
    if (!event) return;
    const when = new Date(event.event_date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    const lines = [event.title, when];
    const place = event.location || event.address;
    if (place) lines.push(place);
    if (event.description) lines.push('', event.description);
    lines.push('', 'Shared from FreePass');
    try {
      await Share.share({ title: event.title, message: lines.join('\n') });
    } catch {
      // user dismissed the share sheet — no action needed
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={FreepassColors.primary} size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: FreepassColors.textSecondary }}>Event not found.</Text>
        {error ? (
          <Text style={{ fontSize: 13, color: FreepassColors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            {error}
          </Text>
        ) : (
          <Text style={{ fontSize: 13, color: FreepassColors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            This link may point to an unpublished or deleted event.
          </Text>
        )}
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: FreepassColors.primary, fontWeight: '600' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <View style={styles.container}>
      <View style={styles.imageBanner}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 8 }]}>
          <IconSymbol name="chevron.left" size={20} color={FreepassColors.white} />
        </Pressable>
        <Pressable onPress={handleShare} style={[styles.shareBtn, { top: insets.top + 8 }]}>
          <IconSymbol name="square.and.arrow.up" size={20} color={FreepassColors.white} />
        </Pressable>
        <View style={styles.bannerPattern}>
          <Text style={styles.bannerLogo}>fp</Text>
        </View>
      </View>
      <View style={styles.titleBanner}>
        <Text style={styles.eventName}>{event.title}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {event.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descText}>{event.description}</Text>
          </View>
        ) : null}

        <View style={[styles.detailCard, event.description ? styles.detailCardSpaced : null]}>
          {event.instructor && (
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>Instructor</Text>
                <Text style={styles.detailValue}>{event.instructor}</Text>
              </View>
              <View style={styles.avatarPlaceholder} />
            </View>
          )}
          <View style={styles.detailRow}>
            <IconSymbol name="calendar" size={20} color={FreepassColors.textSecondary} />
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Start Time</Text>
              <Text style={styles.detailValue}>{formatDate(event.event_date)}</Text>
            </View>
          </View>
          {event.end_date && (
            <View style={styles.detailRow}>
              <IconSymbol name="calendar" size={20} color={FreepassColors.textSecondary} />
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>End Time</Text>
                <Text style={styles.detailValue}>{formatDate(event.end_date)}</Text>
              </View>
            </View>
          )}
          {(event.location || event.address) && (
            <View style={styles.detailRow}>
              <IconSymbol name="map.fill" size={20} color={FreepassColors.textSecondary} />
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location || event.address}</Text>
              </View>
            </View>
          )}
        </View>

        <Pressable style={styles.shareEventBtn} onPress={handleShare} android_ripple={{ color: FreepassColors.primaryDark }}>
          <IconSymbol name="square.and.arrow.up" size={20} color={FreepassColors.white} />
          <Text style={styles.shareEventBtnText}>SHARE EVENT</Text>
        </Pressable>
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
    top: 12,
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
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  descCard: {
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
  descText: {
    fontSize: 15,
    color: FreepassColors.text,
    lineHeight: 24,
  },
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
  detailCardSpaced: {
    marginTop: 16,
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
  shareBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FreepassColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FreepassColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  shareEventBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
