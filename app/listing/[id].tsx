import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useResource } from '@/hooks/use-resources';

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { resource, loading } = useResource(id);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={FreepassColors.primary} size="large" />
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: FreepassColors.textSecondary }}>Resource not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: FreepassColors.primary, fontWeight: '600' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.headerBtnText}>Back</Text>
        </Pressable>
        <Pressable
          style={styles.headerBtnCenter}
          onPress={() => router.push(`/modal/give-feedback?resourceName=${encodeURIComponent(resource?.name ?? '')}` as never)}>
          <IconSymbol name="star.fill" size={16} color={FreepassColors.white} />
          <Text style={styles.headerBtnText}>VIEW FEEDBACK</Text>
        </Pressable>
        <Pressable style={styles.headerIcon}>
          <IconSymbol name="square.and.pencil" size={22} color={FreepassColors.white} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imagePlaceholder}>
          <IconSymbol name="map.fill" size={48} color={FreepassColors.textSecondary} />
          <Text style={styles.imagePlaceholderText}>{resource.name}</Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.companyName}>{resource.name}</Text>
          {resource.address && <Text style={styles.detail}>{resource.address}{resource.city ? `, ${resource.city}` : ''}</Text>}
          {resource.phone && <Text style={styles.detail}>{resource.phone}</Text>}
          {resource.description && <Text style={styles.description}>{resource.description}</Text>}
          {resource.last_verified ? (
            <View style={styles.verifiedBadge}>
              <IconSymbol name="checkmark.seal.fill" size={14} color={FreepassColors.accent} />
              <Text style={styles.verifiedText}>
                Verified {new Date(resource.last_verified).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Text>
            </View>
          ) : (
            <View style={styles.unverifiedBadge}>
              <IconSymbol name="exclamationmark.circle" size={14} color={FreepassColors.textSecondary} />
              <Text style={styles.unverifiedText}>Info may be outdated — please verify before visiting</Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          {resource.phone && (
            <Pressable
              style={styles.actionBtn}
              onPress={() => Linking.openURL(`tel:${resource.phone!.replace(/[^0-9+]/g, '')}`)}>
              <IconSymbol name="phone.fill" size={18} color={FreepassColors.white} />
              <Text style={styles.actionBtnText}>CALL</Text>
            </Pressable>
          )}
          {(resource.address || resource.city) && (
            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                const query = resource.address
                  ? `${resource.address}, ${resource.city}, ${resource.state}`
                  : `${resource.name}, ${resource.city}, ${resource.state}`;
                const encoded = encodeURIComponent(query);
                const url = Platform.OS === 'ios'
                  ? `maps://app?daddr=${encoded}`
                  : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
                Linking.openURL(url);
              }}>
              <IconSymbol name="map.fill" size={18} color={FreepassColors.white} />
              <Text style={styles.actionBtnText}>DIRECTIONS</Text>
            </Pressable>
          )}
          {resource.website && (
            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                const url = resource.website!.startsWith('http') ? resource.website! : `https://${resource.website}`;
                Linking.openURL(url);
              }}>
              <IconSymbol name="globe" size={18} color={FreepassColors.white} />
              <Text style={styles.actionBtnText}>WEBSITE</Text>
            </Pressable>
          )}
        </View>

        {resource.tags && resource.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services Offered:</Text>
            {resource.tags.map((tag, i) => (
              <Text key={i} style={styles.sectionItem}>+ {tag}</Text>
            ))}
          </View>
        )}

        {resource.email && (
          <View style={styles.contactCard}>
            <Text style={styles.contactLabel}>Contact</Text>
            <Text style={styles.contactEmail}>{resource.email}</Text>
            <View style={styles.contactActions}>
              <Pressable
                style={styles.contactBtn}
                onPress={() => Linking.openURL(`mailto:${resource.email}`)}>
                <IconSymbol name="envelope.fill" size={16} color={FreepassColors.white} />
                <Text style={styles.contactBtnText}>Email</Text>
              </Pressable>
              {resource.phone && (
                <Pressable
                  style={styles.contactBtn}
                  onPress={() => Linking.openURL(`tel:${resource.phone!.replace(/[^0-9+]/g, '')}`)}>
                  <IconSymbol name="phone.fill" size={16} color={FreepassColors.white} />
                  <Text style={styles.contactBtnText}>Call</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.actionsRow}>
            <Pressable style={styles.sectionBtn} onPress={() => router.push('/map-view' as never)}>
              <IconSymbol name="map.fill" size={16} color={FreepassColors.white} />
              <Text style={styles.sectionBtnText}>MAP VIEW</Text>
            </Pressable>
            <Pressable
              style={styles.sectionBtn}
              onPress={() => router.push(`/modal/give-feedback?resourceName=${encodeURIComponent(resource?.name ?? '')}` as never)}>
              <Text style={styles.sectionBtnText}>FEEDBACK</Text>
            </Pressable>
          </View>
        </View>

        {resource.hours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hours of operation</Text>
            <Text style={styles.sectionText}>{resource.hours}</Text>
          </View>
        )}
      </ScrollView>
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
    paddingTop: 48,
    paddingBottom: 14,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBtnCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtnText: { fontSize: 14, fontWeight: '600', color: FreepassColors.white },
  headerIcon: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  imagePlaceholder: {
    height: 180,
    backgroundColor: FreepassColors.lightGray,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: FreepassColors.textSecondary,
  },
  detailsCard: {
    backgroundColor: FreepassColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: FreepassColors.text,
    lineHeight: 21,
    marginBottom: 4,
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  verifiedText: {
    fontSize: 12,
    color: FreepassColors.accent,
    fontWeight: '600',
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  unverifiedText: {
    fontSize: 12,
    color: FreepassColors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FreepassColors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  section: {
    backgroundColor: FreepassColors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 8,
  },
  sectionItem: {
    fontSize: 14,
    color: FreepassColors.white,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: FreepassColors.white,
  },
  highlightNote: {
    fontSize: 13,
    color: FreepassColors.accentLight,
    marginTop: 8,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: FreepassColors.primaryDark,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sectionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  contactCard: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: FreepassColors.textSecondary,
    marginBottom: 2,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '700',
    color: FreepassColors.text,
  },
  contactEmail: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  contactActions: { flexDirection: 'row', gap: 12 },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: FreepassColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  messagesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  messagesText: {
    flex: 1,
    fontSize: 14,
    color: FreepassColors.text,
  },
  similarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 12,
  },
  similarScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  similarCard: {
    width: 160,
    marginRight: 12,
  },
  similarImage: {
    height: 100,
    backgroundColor: FreepassColors.lightGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  similarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  similarName: {
    fontSize: 13,
    fontWeight: '600',
    color: FreepassColors.text,
  },
  viewBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: FreepassColors.primary,
  },
});
