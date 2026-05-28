import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

interface Course {
  id: string;
  name: string;
  description: string | null;
  course_type: string | null;
  video_link: string | null;
  web_link: string | null;
}

interface CourseTask {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export default function CourseViewScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<CourseTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('courses').select('*').eq('id', id).single(),
      supabase.from('course_tasks').select('*').eq('course_id', id).order('sort_order'),
    ]).then(([courseRes, tasksRes]) => {
      setCourse(courseRes.data);
      setTasks(tasksRes.data ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={FreepassColors.white} size="large" />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: FreepassColors.accentLight }}>Course not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: FreepassColors.white, fontWeight: '600' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={18} color={FreepassColors.white} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerLogo}>FP</Text>
      </View>
      <View style={styles.titleBar}>
        <Text style={styles.courseName}>{course.name}</Text>
        {course.course_type && <Text style={styles.courseType}>{course.course_type}</Text>}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {course.description && (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{course.description}</Text>
          </>
        )}

        {course.video_link && (
          <Pressable
            style={styles.videoPlaceholder}
            onPress={() => Linking.openURL(course.video_link!)}>
            <IconSymbol name="play.rectangle.fill" size={64} color={FreepassColors.primary} />
            <Text style={styles.videoLinkText}>Tap to watch video</Text>
          </Pressable>
        )}

        {course.web_link && (
          <Pressable
            style={styles.reviewBtn}
            onPress={() => Linking.openURL(course.web_link!)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="globe" size={20} color={FreepassColors.white} />
            <Text style={styles.reviewBtnText}>OPEN COURSE LINK</Text>
          </Pressable>
        )}

        {tasks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Course Tasks</Text>
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <Text style={styles.taskTitle}>{task.name}</Text>
                {task.description && <Text style={styles.taskDesc}>{task.description}</Text>}
              </View>
            ))}
          </>
        )}
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
    paddingTop: 12,
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
  videoLinkText: {
    marginTop: 8,
    fontSize: 14,
    color: FreepassColors.primary,
    fontWeight: '600',
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
  courseType: {
    fontSize: 14,
    color: FreepassColors.accentLight,
    marginTop: 4,
  },
  taskCard: {
    backgroundColor: FreepassColors.primaryDark,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  taskDesc: {
    fontSize: 14,
    color: FreepassColors.accentLight,
    marginTop: 4,
    lineHeight: 20,
  },
});
