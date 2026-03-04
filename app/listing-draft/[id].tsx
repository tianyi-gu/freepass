import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function ListingDraftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <IconSymbol name="xmark" size={20} color={FreepassColors.white} />
        </Pressable>
        <Pressable style={styles.headerBtn}>
          <IconSymbol name="square.and.pencil" size={20} color={FreepassColors.white} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageCard}>
          <View style={styles.imagePlaceholder}>
            <IconSymbol name="map.fill" size={48} color={FreepassColors.lightGray} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Street Address</Text>
          <Text style={styles.companyName}>Company Name</Text>
          <Text style={styles.detail}>Phone Number</Text>

          <Pressable
            style={styles.streetviewBtn}
            onPress={() => router.push(`/street-view/${id}` as never)}>
            <IconSymbol name="map.fill" size={18} color={FreepassColors.text} />
            <Text style={styles.streetviewText}>360 STREETVIEW</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Web Address</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.placeholder}>Text Description</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.smallLabel}>Accessed by: Full Name</Text>
          <Text style={styles.sectionTitle}>Types of Service:</Text>
          <Text style={styles.serviceItem}>Service Type 1</Text>
          <Text style={styles.serviceItem}>Service Type 2</Text>
          <Text style={styles.serviceItem}>Service Type 3</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Main Contact Position</Text>
          <Text style={styles.contactName}>Main Name</Text>
          <Text style={styles.contactEmail}>Main Contact Email</Text>
          <View style={styles.contactActions}>
            <Pressable style={styles.contactBtn}>
              <Text style={styles.contactBtnText}>SEND EMAIL</Text>
            </Pressable>
            <Pressable style={styles.contactBtn}>
              <Text style={styles.contactBtnText}>PHONE CALL</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Secondary Contact Position</Text>
          <Text style={styles.contactName}>Secondary Name</Text>
          <Text style={styles.contactEmail}>Secondary Contact Email</Text>
          <View style={styles.contactActions}>
            <Pressable style={styles.contactBtn}>
              <Text style={styles.contactBtnText}>SEND EMAIL</Text>
            </Pressable>
            <Pressable style={styles.contactBtn}>
              <Text style={styles.contactBtnText}>PHONE CALL</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.highlightsCard}>
          <View style={styles.highlightsHeader}>
            <Text style={styles.highlightsTitle}>Highlights</Text>
            <IconSymbol name="info.circle" size={18} color={FreepassColors.textSecondary} />
          </View>
          <Text style={styles.viewInMap}>View in Map</Text>
          <View style={styles.highlightRow}>
            <View style={styles.highlightItem}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={FreepassColors.primary} />
              <Text style={styles.highlightText}>Replies Often</Text>
            </View>
            <View style={styles.highlightItem}>
              <Text style={styles.highlightText}>This Company has been interviewed for you!</Text>
              <IconSymbol name="building.2.fill" size={18} color={FreepassColors.primary} />
            </View>
          </View>
          <View style={styles.highlightRow}>
            <View style={styles.highlightItem}>
              <IconSymbol name="star.fill" size={18} color={FreepassColors.primary} />
              <Text style={styles.highlightText}>Contacted Often</Text>
            </View>
          </View>
          <Text style={styles.region}>Region</Text>
        </View>

        <View style={styles.interviewCard}>
          <Text style={styles.interviewText}>
            This organization has been personally interviewed about their offered services and how to access them.
          </Text>
          <Pressable style={styles.reviewBtn} android_ripple={{ color: FreepassColors.primaryDark }}>
            <Text style={styles.reviewBtnText}>REVIEW</Text>
          </Pressable>
        </View>

        <Pressable style={styles.messagesCard}>
          <IconSymbol name="bubble.left.and.bubble.right.fill" size={20} color={FreepassColors.primary} />
          <Text style={styles.messagesText}>View recent messages and feedback on Company Name</Text>
        </Pressable>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FreepassColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
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
  streetviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FreepassColors.cardBg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  streetviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.text,
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
    minHeight: 80,
  },
  placeholder: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
  },
  smallLabel: {
    fontSize: 13,
    color: FreepassColors.accentLight,
    marginBottom: 8,
  },
  serviceItem: {
    fontSize: 14,
    color: FreepassColors.white,
    marginBottom: 4,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '700',
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
  highlightsCard: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  highlightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.text,
  },
  viewInMap: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginBottom: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  highlightItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FreepassColors.white,
    borderRadius: 10,
    padding: 12,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    color: FreepassColors.text,
  },
  region: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginTop: 4,
  },
  interviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FreepassColors.accentLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  interviewText: {
    flex: 1,
    fontSize: 14,
    color: FreepassColors.text,
    marginRight: 12,
  },
  reviewBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  reviewBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  messagesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
  },
  messagesText: {
    flex: 1,
    fontSize: 14,
    color: FreepassColors.text,
  },
});
