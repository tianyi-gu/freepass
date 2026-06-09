import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { FreepassTabBar } from '@/components/freepass-tab-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const BANZAI_URL = 'https://fountainfund.banzai.org/wellness';

interface Course {
  id: string;
  name: string;
  description: string | null;
  course_type: string | null;
  web_link: string | null;
  video_link: string | null;
}

export default function LearningAcademyScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('courses')
      .select('id, name, description, course_type, web_link, video_link')
      .eq('in_learning_academy', true)
      .eq('is_hidden', false)
      .order('display_order', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setCourses(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showMenu showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroImage}>
          <IconSymbol name="book.fill" size={48} color={FreepassColors.accentLight} />
        </View>

        <Text style={styles.fundLabel}>THE FOUNTAIN FUND</Text>
        <Text style={styles.title}>About the Learning Academy</Text>
        <Text style={styles.body}>
          The Fountain Fund increases economic opportunities for formerly incarcerated people to improve their lives
          and remain in their communities.
        </Text>

        <Pressable
          style={styles.ctaBtn}
          onPress={() => router.push('/fountain-fund' as never)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <IconSymbol name="globe" size={20} color={FreepassColors.white} />
          <Text style={styles.ctaText}>WHAT IS THE FOUNTAIN FUND?</Text>
        </Pressable>

        <Pressable
          style={[styles.ctaBtn, styles.ctaBtnAccent]}
          onPress={() => Linking.openURL(BANZAI_URL)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <IconSymbol name="book.fill" size={20} color={FreepassColors.white} />
          <Text style={styles.ctaText}>FINANCIAL EDUCATION (BANZAI)</Text>
        </Pressable>

        <Text style={styles.body}>
          FreePass includes The Fountain Fund&apos;s vetted resources and courses to help you achieve independence and
          financial stability.
        </Text>
        <Text style={styles.body}>
          The Learning Academy Program offers self-guided exercises, certifications, and on-demand video workshops for
          financial well-being—accessible to all FreePass account holders.
        </Text>

        <View style={styles.darkSection}>
          <Text style={styles.darkText}>
            Wondering how a loan is accessed through The Fountain Fund? Please use this link to review the process.
          </Text>
          <Pressable
            style={styles.darkBtn}
            onPress={() => router.push('/loan-inquiry' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol name="doc.text.fill" size={20} color={FreepassColors.white} />
            <Text style={styles.ctaText}>NEW LOAN INQUIRY PROCESS</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>FreePass Courses provided by The Fountain Fund</Text>
        {loading ? (
          <ActivityIndicator color={FreepassColors.primary} style={{ marginTop: 20 }} />
        ) : courses.length === 0 ? (
          <Text style={styles.emptyText}>No courses available yet.</Text>
        ) : (
          courses.map((c) => (
            <Pressable
              key={c.id}
              style={styles.courseCard}
              onPress={() => {
                const link = c.web_link || c.video_link;
                if (link) {
                  if (link.startsWith('http')) {
                    Linking.openURL(link);
                  } else {
                    router.push(link as never);
                  }
                }
              }}
              android_ripple={{ color: FreepassColors.lightGray }}>
              <View style={styles.courseImage}>
                <IconSymbol name="book.fill" size={28} color={FreepassColors.textSecondary} />
              </View>
              <View style={styles.courseContent}>
                <Text style={styles.courseName}>{c.name}</Text>
                {c.description && <Text style={styles.courseDesc} numberOfLines={2}>{c.description}</Text>}
                {c.course_type && <Text style={styles.courseType}>{c.course_type}</Text>}
              </View>
            </Pressable>
          ))
        )}

        <View style={styles.darkSection}>
          <Text style={styles.darkText}>
            In order to have your loan application approved, you must obtain a completed certificate from the FDIC
            Money Smart program. Instructions have been included and can be completed here:
          </Text>
          <Pressable
            style={styles.darkBtn}
            onPress={() => router.push('/money-smart' as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <Text style={styles.ctaText}>REVIEW MONEY SMART COURSES</Text>
          </Pressable>
        </View>
      </ScrollView>
      <FreepassTabBar activeTab="courses" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  heroImage: {
    height: 160,
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  fundLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: FreepassColors.accent,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: FreepassColors.primary,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: FreepassColors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: FreepassColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  ctaBtnAccent: {
    backgroundColor: FreepassColors.accent,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  darkSection: {
    backgroundColor: FreepassColors.primary,
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
  },
  darkText: {
    fontSize: 15,
    color: FreepassColors.accentLight,
    lineHeight: 22,
    marginBottom: 16,
  },
  darkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'stretch',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: FreepassColors.primary,
    marginBottom: 16,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: FreepassColors.lightGray,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseContent: { flex: 1 },
  courseName: {
    fontSize: 17,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 4,
  },
  courseDesc: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
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
