import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { type Resource, useResources } from '@/hooks/use-resources';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function openDirections(resource: Resource) {
  const query = resource.address
    ? `${resource.address}, ${resource.city}, ${resource.state}`
    : `${resource.name}, ${resource.city}, ${resource.state}`;
  const encoded = encodeURIComponent(query);
  const url =
    Platform.OS === 'ios'
      ? `maps://app?daddr=${encoded}`
      : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  Linking.openURL(url);
}

const PHILADELPHIA_REGION: Region = {
  latitude: 39.9526,
  longitude: -75.1652,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export default function MapViewScreen() {
  const { resources, loading } = useResources();
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapRegion, setMapRegion] = useState<Region>(PHILADELPHIA_REGION);

  useEffect(() => {
    requestLocation();
  }, []);

  async function requestLocation() {
    setLocationStatus('loading');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationStatus('denied');
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      setMapRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });
      setLocationStatus('granted');
    } catch {
      setLocationStatus('denied');
    }
  }

  const mappableResources = resources.filter((r) => r.latitude != null && r.longitude != null);

  const sortedResources = useMemo(() => {
    const filtered = searchQuery.trim()
      ? resources.filter((r) => {
          const q = searchQuery.toLowerCase();
          return (
            r.name.toLowerCase().includes(q) ||
            (r.address ?? '').toLowerCase().includes(q) ||
            (r.tags ?? []).some((t) => t.toLowerCase().includes(q))
          );
        })
      : resources;

    if (!userLocation) return filtered;

    return [...filtered].sort((a, b) => {
      const distA =
        a.latitude != null && a.longitude != null
          ? haversineDistance(userLocation.lat, userLocation.lon, a.latitude, a.longitude)
          : Infinity;
      const distB =
        b.latitude != null && b.longitude != null
          ? haversineDistance(userLocation.lat, userLocation.lon, b.latitude, b.longitude)
          : Infinity;
      return distA - distB;
    });
  }, [resources, userLocation, searchQuery]);

  function distanceLabel(resource: Resource): string | null {
    if (!userLocation || resource.latitude == null || resource.longitude == null) return null;
    const d = haversineDistance(userLocation.lat, userLocation.lon, resource.latitude, resource.longitude);
    return d < 1 ? `${(d * 5280).toFixed(0)} ft away` : `${d.toFixed(1)} mi away`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Resources Near You</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Location status */}
        {locationStatus === 'denied' && (
          <View style={styles.locationBanner}>
            <IconSymbol name="location.slash.fill" size={18} color={FreepassColors.destructive} />
            <Text style={styles.locationBannerText}>
              Location access denied. Resources are listed alphabetically.{' '}
              <Text style={styles.locationRetry} onPress={requestLocation}>Try again</Text>
            </Text>
          </View>
        )}
        {locationStatus === 'granted' && (
          <View style={[styles.locationBanner, styles.locationBannerSuccess]}>
            <IconSymbol name="location.fill" size={18} color={FreepassColors.accent} />
            <Text style={[styles.locationBannerText, styles.locationBannerTextSuccess]}>
              Showing resources closest to you first.
            </Text>
          </View>
        )}

        {/* Map */}
        {mappableResources.length > 0 && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={mapRegion}
              showsUserLocation={locationStatus === 'granted'}
              showsMyLocationButton>
              {mappableResources.map((r) => (
                <Marker
                  key={r.id}
                  coordinate={{ latitude: r.latitude!, longitude: r.longitude! }}
                  title={r.name}
                  description={r.address ?? undefined}
                  onCalloutPress={() => router.push(`/listing/${r.id}` as never)}
                />
              ))}
            </MapView>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={FreepassColors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, address, or tag..."
            placeholderTextColor={FreepassColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {locationStatus === 'granted' ? 'Nearest Resources' : 'All Resources'}
          {!loading && ` (${sortedResources.length})`}
        </Text>

        {loading || locationStatus === 'loading' ? (
          <ActivityIndicator color={FreepassColors.primary} style={{ marginTop: 40 }} />
        ) : sortedResources.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="magnifyingglass" size={40} color={FreepassColors.lightGray} />
            <Text style={styles.emptyText}>No resources found.</Text>
          </View>
        ) : (
          sortedResources.map((r) => {
            const dist = distanceLabel(r);
            return (
              <Pressable
                key={r.id}
                style={styles.resourceCard}
                onPress={() => router.push(`/listing/${r.id}` as never)}
                android_ripple={{ color: FreepassColors.lightGray }}>
                <View style={styles.cardImage}>
                  <IconSymbol name="map.fill" size={28} color={FreepassColors.primary} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{r.name}</Text>
                  {r.address && (
                    <Text style={styles.cardDetail}>{r.address}</Text>
                  )}
                  {dist && (
                    <View style={styles.distanceRow}>
                      <IconSymbol name="location.fill" size={12} color={FreepassColors.accent} />
                      <Text style={styles.distanceText}>{dist}</Text>
                    </View>
                  )}
                  {r.phone && <Text style={styles.cardDetail}>{r.phone}</Text>}
                </View>
                <Pressable
                  style={styles.directionsBtn}
                  hitSlop={8}
                  onPress={() => openDirections(r)}>
                  <IconSymbol name="arrow.triangle.turn.up.right.circle.fill" size={32} color={FreepassColors.accent} />
                </Pressable>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    gap: 12,
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
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },

  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  locationBannerSuccess: {
    backgroundColor: '#F0FFF4',
    borderColor: '#C6F6D5',
  },
  locationBannerText: {
    flex: 1,
    fontSize: 14,
    color: FreepassColors.text,
    lineHeight: 20,
  },
  locationBannerTextSuccess: {
    color: FreepassColors.accent,
  },
  locationRetry: {
    fontWeight: '700',
    color: FreepassColors.primary,
    textDecorationLine: 'underline',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.offWhite,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 10,
    fontSize: 16,
    color: FreepassColors.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: FreepassColors.textSecondary,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: FreepassColors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 2,
  },
  cardDetail: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
    marginTop: 2,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: FreepassColors.accent,
  },
  directionsBtn: {
    paddingLeft: 8,
  },
});
