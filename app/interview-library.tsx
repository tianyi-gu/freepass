import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { openWebUrl } from '@/lib/links';
import { supabase } from '@/lib/supabase';

interface Course {
  id: string;
  name: string;
  description: string | null;
  course_type: string | null;
  video_link: string | null;
  web_link: string | null;
}

export default function InterviewLibraryScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('courses')
      .select('id, name, description, course_type, video_link, web_link')
      .eq('is_hidden', false)
      .order('display_order', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setCourses(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <FreepassHeader title="Interview Library" showBack showLogo={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <IconSymbol name="play.rectangle.fill" size={48} color={FreepassColors.accent} />
          <Text style={styles.introTitle}>Interview Library</Text>
          <Text style={styles.introText}>
            This library is for videos from local organizations explaining what they offer and
            what to expect when you visit, along with interviews from people in the reentry
            community. Content is added over time as organizations share it.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Courses & Videos</Text>
        {loading ? (
          <ActivityIndicator color={FreepassColors.primary} style={{ marginTop: 20 }} />
        ) : courses.length === 0 ? (
          <Text style={styles.emptyText}>No courses available yet.</Text>
        ) : (
          courses.map((course) => (
            <Pressable
              key={course.id}
              style={styles.courseCard}
              onPress={() => {
                const link = course.video_link || course.web_link;
                if (link) openWebUrl(link);
                else router.push(`/course/${course.id}` as never);
              }}
              android_ripple={{ color: FreepassColors.lightGray }}>
              <View style={styles.courseImage}>
                <IconSymbol name={course.video_link ? 'play.rectangle.fill' : 'book.fill'} size={32} color={FreepassColors.textSecondary} />
              </View>
              <View style={styles.courseContent}>
                <Text style={styles.courseName}>{course.name}</Text>
                {course.description && <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>}
                {course.course_type && <Text style={styles.courseType}>{course.course_type}</Text>}
              </View>
              <IconSymbol name="chevron.right" size={22} color={FreepassColors.textSecondary} />
            </Pressable>
          ))
        )}
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
  courseType: {
    fontSize: 12,
    fontWeight: '600',
    color: FreepassColors.accent,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});
