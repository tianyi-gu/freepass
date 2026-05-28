import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useResource } from '@/hooks/use-resources';

export default function StreetViewScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { resource, loading } = useResource(id);

  const hasCoords = resource?.latitude != null && resource?.longitude != null;
  const address = resource?.address
    ? `${resource.address}, ${resource.city ?? 'Philadelphia'}, ${resource.state ?? 'PA'}`
    : null;

  const openInMaps = () => {
    if (hasCoords) {
      const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${resource!.latitude},${resource!.longitude}`;
      Linking.openURL(url);
    } else if (address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={FreepassColors.white} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Street View</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <IconSymbol name="map.fill" size={48} color={FreepassColors.primary} />
          <Text style={styles.resourceName}>{resource?.name ?? 'Resource'}</Text>
          {address && <Text style={styles.resourceAddress}>{address}</Text>}
        </View>
        {(hasCoords || address) ? (
          <Pressable
            style={styles.openMapsBtn}
            onPress={openInMaps}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="map.fill" size={20} color={FreepassColors.white} />
            <Text style={styles.openMapsBtnText}>OPEN IN GOOGLE MAPS</Text>
          </Pressable>
        ) : (
          <Text style={styles.noLocationText}>
            No location data available for this resource.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 16,
    padding: 32,
    width: '100%',
    marginBottom: 24,
  },
  resourceName: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: FreepassColors.text,
    textAlign: 'center',
  },
  resourceAddress: {
    marginTop: 8,
    fontSize: 15,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FreepassColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  openMapsBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  noLocationText: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
  },
});
