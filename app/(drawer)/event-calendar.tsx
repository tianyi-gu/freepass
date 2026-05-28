import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { FreepassTabBar } from '@/components/freepass-tab-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  end_date: string | null;
  instructor: string | null;
}

export default function EventCalendarScreen() {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        setAllEvents(data ?? []);
        setLoading(false);
      });
  }, []);

  const now = new Date().toISOString();
  const { upcoming, past } = useMemo(() => {
    const up: EventItem[] = [];
    const pa: EventItem[] = [];
    for (const e of allEvents) {
      if (e.event_date >= now) up.push(e);
      else pa.push(e);
    }
    pa.reverse();
    return { upcoming: up, past: pa };
  }, [allEvents, now]);

  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showMenu showBack={false} />
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Event Calendar</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerBtn} onPress={() => router.push('/add-event' as never)}>
            <IconSymbol name="plus" size={16} color={FreepassColors.white} />
            <Text style={styles.headerBtnText}>ADD EVENT</Text>
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={() => router.push('/calendar-view' as never)}>
            <IconSymbol name="calendar" size={16} color={FreepassColors.white} />
            <Text style={styles.headerBtnText}>CALENDAR VIEW</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Here is where you can create appointments for yourself as you reach out to job opportunities, schedule with
          health providers, and other uses.
        </Text>
        <Text style={styles.intro}>
          This will also allow organizations to connect their outreach calendar, to display when community events are
          coming up.
        </Text>

        {loading ? (
          <ActivityIndicator color={FreepassColors.primary} style={{ marginTop: 20 }} />
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.errorText}>Could not load events.</Text>
            <Text style={styles.emptySub}>{error}</Text>
          </View>
        ) : allEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events yet</Text>
            <Text style={styles.emptySub}>Check back soon or add your own!</Text>
          </View>
        ) : (
          <>
            {upcoming.length > 0 && (
              <Text style={styles.sectionLabel}>Upcoming</Text>
            )}
            {upcoming.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventImage}>
                  <Text style={styles.eventImageText}>fp</Text>
                </View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventTime}>{new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
                  <Text style={styles.eventName}>{event.title}</Text>
                  {event.description && <Text style={styles.eventDesc} numberOfLines={3}>{event.description}</Text>}
                  {event.instructor && <Text style={styles.eventInstructor}>Hosted by {event.instructor}</Text>}
                  <Pressable
                    style={styles.detailsBtn}
                    onPress={() => router.push(`/event/${event.id}` as never)}
                    android_ripple={{ color: FreepassColors.primaryDark }}>
                    <Text style={styles.detailsBtnText}>SEE DETAILS</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {past.length > 0 && (
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Past Events</Text>
            )}
            {past.map((event) => (
              <View key={event.id} style={[styles.eventCard, { opacity: 0.5 }]}>
                <View style={styles.eventImage}>
                  <Text style={styles.eventImageText}>fp</Text>
                </View>
                <View style={styles.eventContent}>
                  <View style={styles.pastBadgeRow}>
                    <Text style={styles.eventTime}>{new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
                  </View>
                  <Text style={styles.eventName}>{event.title}</Text>
                  {event.description && <Text style={styles.eventDesc} numberOfLines={3}>{event.description}</Text>}
                  {event.instructor && <Text style={styles.eventInstructor}>Hosted by {event.instructor}</Text>}
                  <Pressable
                    style={styles.detailsBtn}
                    onPress={() => router.push(`/event/${event.id}` as never)}
                    android_ripple={{ color: FreepassColors.primaryDark }}>
                    <Text style={styles.detailsBtnText}>SEE DETAILS</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
      <FreepassTabBar activeTab="events" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  headerBar: {
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: FreepassColors.primaryDark,
    borderRadius: 8,
  },
  headerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  intro: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.textSecondary,
  },
  emptySub: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.destructive,
  },
  eventCard: {
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  eventImage: {
    height: 120,
    backgroundColor: FreepassColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventImageText: {
    fontSize: 32,
    fontWeight: '800',
    color: FreepassColors.primary,
  },
  eventContent: { padding: 16 },
  eventTime: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
    marginBottom: 4,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  eventInstructor: {
    fontSize: 13,
    fontWeight: '600',
    color: FreepassColors.accent,
    marginBottom: 12,
  },
  detailsBtn: {
    alignSelf: 'flex-start',
    backgroundColor: FreepassColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  detailsBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 4,
    marginTop: 8,
  },
  pastBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
