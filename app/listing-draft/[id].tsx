import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { openEmail, openPhone, openWebUrl } from '@/lib/links';
import { useResource } from '@/hooks/use-resources';

export default function ListingDraftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { resource, loading, error } = useResource(id);

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
        <Text style={{ fontSize: 16, color: FreepassColors.textSecondary }}>Unable to load this draft resource.</Text>
        {error ? (
          <Text style={{ fontSize: 13, color: FreepassColors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            {error}
          </Text>
        ) : (
          <Text style={{ fontSize: 13, color: FreepassColors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            Draft resources require a staff-accessible data policy before they can be previewed here.
          </Text>
        )}
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: FreepassColors.primary, fontWeight: '600' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <IconSymbol name="xmark" size={20} color={FreepassColors.white} />
        </Pressable>
        <Text style={styles.draftBadge}>DRAFT</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageCard}>
          <View style={styles.imagePlaceholder}>
            <IconSymbol name="map.fill" size={48} color={FreepassColors.lightGray} />
          </View>
        </View>

        <View style={styles.section}>
          {resource.address && <Text style={styles.label}>{resource.address}</Text>}
          <Text style={styles.companyName}>{resource.name}</Text>
          {resource.phone && <Text style={styles.detail}>{resource.phone}</Text>}

          {resource.website && (
            <>
              <Text style={styles.sectionTitle}>Web Address</Text>
              <Pressable onPress={() => openWebUrl(resource.website)}>
                <Text style={[styles.detail, { textDecorationLine: 'underline' }]}>{resource.website}</Text>
              </Pressable>
            </>
          )}

          {resource.description && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{resource.description}</Text>
            </View>
          )}
        </View>

        {resource.tags && resource.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Types of Service:</Text>
            {resource.tags.map((tag, i) => (
              <Text key={i} style={styles.serviceItem}>+ {tag}</Text>
            ))}
          </View>
        )}

        {resource.email && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.contactEmail}>{resource.email}</Text>
            <View style={styles.contactActions}>
              <Pressable style={styles.contactBtn} onPress={() => openEmail(resource.email)}>
                <Text style={styles.contactBtnText}>SEND EMAIL</Text>
              </Pressable>
              {resource.phone && (
                <Pressable style={styles.contactBtn} onPress={() => openPhone(resource.phone)}>
                  <Text style={styles.contactBtnText}>PHONE CALL</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {resource.hours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hours of Operation</Text>
            <Text style={styles.detail}>{resource.hours}</Text>
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
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FreepassColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: FreepassColors.accentLight,
    backgroundColor: FreepassColors.primaryDark,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  imageCard: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2dd4bf',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 180,
    backgroundColor: FreepassColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: FreepassColors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: { fontSize: 14, color: FreepassColors.white, marginBottom: 4 },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: FreepassColors.accentLight,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 8,
  },
  descriptionBox: {
    backgroundColor: FreepassColors.white,
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: FreepassColors.text,
    lineHeight: 20,
  },
  serviceItem: {
    fontSize: 14,
    color: FreepassColors.white,
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: FreepassColors.accentLight,
    marginBottom: 12,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactBtn: {
    flex: 1,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
