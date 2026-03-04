import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_COURSES = [
  { id: '1', name: 'Reentry Job Search Basics', description: 'Learn strategies for finding employment after reentry.' },
  { id: '2', name: 'Housing Resources Guide', description: 'Navigate housing options and applications in your area.' },
  { id: '3', name: 'Financial Literacy Fundamentals', description: 'Building credit and managing your finances.' },
  { id: '4', name: 'Organization Interview: Community Legal Aid', description: 'Hear from staff about services and what to expect.' },
];

export default function InterviewLibraryScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader title="Interview Library" showBack showLogo={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <IconSymbol name="play.rectangle.fill" size={48} color={FreepassColors.accent} />
          <Text style={styles.introTitle}>Interview Library</Text>
          <Text style={styles.introText}>
            You can view videos of local organizations who explain their facility and what to expect when you visit.
            This includes employers and other resources. We also provide and share interviews with individuals recently
            returning from prison and those involved in the reentry process.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Courses & Videos</Text>
        {MOCK_COURSES.map((course) => (
          <Pressable
            key={course.id}
            style={styles.courseCard}
            onPress={() => router.push(`/course/${course.id}` as never)}
            android_ripple={{ color: FreepassColors.lightGray }}>
            <View style={styles.courseImage}>
              <IconSymbol name="play.rectangle.fill" size={32} color={FreepassColors.textSecondary} />
            </View>
            <View style={styles.courseContent}>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.courseDesc}>{course.description}</Text>
            </View>
            <IconSymbol name="chevron.right" size={22} color={FreepassColors.textSecondary} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  intro: {
    alignItems: 'center',
    marginBottom: 28,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: FreepassColors.text,
    marginTop: 12,
    marginBottom: 12,
  },
  introText: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 16,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  courseImage: {
    width: 80,
    height: 60,
    backgroundColor: FreepassColors.lightGray,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  courseContent: { flex: 1 },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 4,
  },
  courseDesc: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    lineHeight: 20,
  },
});
