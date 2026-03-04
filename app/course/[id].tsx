import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function CourseViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerLogo}>FP</Text>
      </View>
      <View style={styles.titleBar}>
        <Text style={styles.courseName}>Course Name</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>Course description placeholder.</Text>

        <View style={styles.videoPlaceholder}>
          <IconSymbol name="play.rectangle.fill" size={64} color={FreepassColors.lightGray} />
        </View>
        <View style={styles.videoControls} />

        <Pressable style={styles.reviewBtn} android_ripple={{ color: FreepassColors.primaryDark }}>
          <IconSymbol name="doc.text.fill" size={20} color={FreepassColors.white} />
          <Text style={styles.reviewBtnText}>REVIEW COURSE INFORMATION</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Relevant Resources</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resourcesScroll}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.resourceCard}>
              <View style={styles.resourceImage} />
              <View style={styles.resourceFooter}>
                <Text style={styles.resourceName}>FreePass Resource</Text>
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
  container: { flex: 1, backgroundColor: FreepassColors.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
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
  banner: {
    height: 120,
    backgroundColor: FreepassColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLogo: {
    fontSize: 36,
    fontWeight: '800',
    color: FreepassColors.primary,
  },
  titleBar: {
    backgroundColor: FreepassColors.primary,
    padding: 16,
  },
  courseName: {
    fontSize: 22,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: FreepassColors.accentLight,
    marginBottom: 16,
  },
  videoPlaceholder: {
    height: 220,
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  videoControls: {
    height: 40,
    marginBottom: 24,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FreepassColors.primaryDark,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 24,
  },
  reviewBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  resourcesScroll: { marginHorizontal: -20 },
  resourceCard: {
    width: 160,
    marginRight: 12,
  },
  resourceImage: {
    height: 100,
    backgroundColor: FreepassColors.lightGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  resourceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resourceName: {
    fontSize: 12,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  viewBtn: {
    paddingVertical: 4,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: FreepassColors.accentLight,
  },
});
