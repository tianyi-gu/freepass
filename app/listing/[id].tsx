import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.headerBtnText}>Back</Text>
        </Pressable>
        <Pressable
          style={styles.headerBtnCenter}
          onPress={() => router.push('/modal/give-feedback' as never)}>
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
          <Text style={styles.imagePlaceholderText}>Company Image</Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.companyName}>Company Name</Text>
          <Text style={styles.detail}>Street Address</Text>
          <Text style={styles.detail}>Phone Number</Text>
          <Text style={styles.detail}>Text Description</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionBtn} onPress={() => router.push(`/street-view/${id}` as never)}>
            <IconSymbol name="map.fill" size={18} color={FreepassColors.white} />
            <Text style={styles.actionBtnText}>360 STREETVIEW</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => Linking.openURL('https://example.org')}>
            <IconSymbol name="globe" size={18} color={FreepassColors.white} />
            <Text style={styles.actionBtnText}>WEBSITE</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Offered:</Text>
          <Text style={styles.sectionItem}>+ Service Type 1</Text>
          <Text style={styles.sectionItem}>+ Service Type 2</Text>
          <Text style={styles.sectionItem}>+ Service Type 3</Text>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactLabel}>Main Contact Position</Text>
          <Text style={styles.contactName}>Main Name</Text>
          <Text style={styles.contactEmail}>Main Contact Email</Text>
          <View style={styles.contactActions}>
            <Pressable style={styles.contactBtn}>
              <IconSymbol name="envelope.fill" size={16} color={FreepassColors.white} />
              <Text style={styles.contactBtnText}>Email</Text>
            </Pressable>
            <Pressable style={styles.contactBtn}>
              <IconSymbol name="phone.fill" size={16} color={FreepassColors.white} />
              <Text style={styles.contactBtnText}>Call</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactLabel}>Secondary Contact Position</Text>
          <Text style={styles.contactName}>Secondary Name</Text>
          <Text style={styles.contactEmail}>Secondary Contact Email</Text>
          <View style={styles.contactActions}>
            <Pressable style={styles.contactBtn}>
              <IconSymbol name="envelope.fill" size={16} color={FreepassColors.white} />
              <Text style={styles.contactBtnText}>Email</Text>
            </Pressable>
            <Pressable style={styles.contactBtn}>
              <IconSymbol name="phone.fill" size={16} color={FreepassColors.white} />
              <Text style={styles.contactBtnText}>Call</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <Text style={styles.sectionItem}>✓ Replies Often</Text>
          <Text style={styles.sectionItem}>✓ Contacted Often</Text>
          <Text style={styles.highlightNote}>
            This organization has been personally interviewed about their offered services and how to access them.
          </Text>
          <View style={styles.actionsRow}>
            <Pressable style={styles.sectionBtn} onPress={() => router.push('/map-view' as never)}>
              <IconSymbol name="map.fill" size={16} color={FreepassColors.white} />
              <Text style={styles.sectionBtnText}>MAP VIEW</Text>
            </Pressable>
            <Pressable style={styles.sectionBtn}>
              <Text style={styles.sectionBtnText}>MORE INFO</Text>
            </Pressable>
            <Pressable
              style={styles.sectionBtn}
              onPress={() => router.push('/modal/give-feedback' as never)}>
              <Text style={styles.sectionBtnText}>FEEDBACK</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours of operation</Text>
          <Text style={styles.sectionText}>Hours</Text>
        </View>

        <Pressable style={styles.messagesCard}>
          <IconSymbol name="bubble.left.and.bubble.right.fill" size={20} color={FreepassColors.primary} />
          <Text style={styles.messagesText}>View recent messages and feedback on Company Name</Text>
        </Pressable>

        <Text style={styles.similarTitle}>Similar Resources</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarScroll}>
          {[1, 2].map((i) => (
            <View key={i} style={styles.similarCard}>
              <View style={styles.similarImage} />
              <View style={styles.similarFooter}>
                <Text style={styles.similarName}>FreePass Resource</Text>
                <Pressable style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
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
