import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useEvents } from '@/hooks/use-events';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarViewScreen() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { events, loading } = useEvents();

  const monthEvents = events.filter((e) => {
    const d = new Date(e.event_date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const eventDays = new Set(monthEvents.map((e) => new Date(e.event_date).getDate()));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const goToPrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  // Build calendar grid with leading blanks for first week offset
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={FreepassColors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Calendar View</Text>
        <Pressable onPress={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}>
          <IconSymbol name="calendar" size={24} color={FreepassColors.white} />
        </Pressable>
      </View>

      <View style={styles.calendar}>
        <View style={styles.monthNav}>
          <Pressable onPress={goToPrevMonth} hitSlop={12}>
            <IconSymbol name="chevron.left" size={24} color={FreepassColors.white} />
          </Pressable>
          <Text style={styles.monthText}>{MONTH_NAMES[month]} {year}</Text>
          <Pressable onPress={goToNextMonth} hitSlop={12}>
            <IconSymbol name="chevron.right" size={24} color={FreepassColors.white} />
          </Pressable>
        </View>
        <View style={styles.daysRow}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.dayHeader}>{d}</Text>
          ))}
        </View>
        <View style={styles.datesGrid}>
          {cells.map((d, i) => (
            <View key={i} style={[styles.dateCell, d !== null && isCurrentMonth && d === today.getDate() && styles.dateToday]}>
              {d !== null && (
                <>
                  <Text style={[styles.dateText, isCurrentMonth && d === today.getDate() && styles.dateTodayText]}>
                    {d}
                  </Text>
                  {eventDays.has(d) && <View style={styles.eventDot} />}
                </>
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.eventsTitle}>All Upcoming Events</Text>
        {loading ? (
          <ActivityIndicator size="large" color={FreepassColors.primary} style={{ marginVertical: 24 }} />
        ) : monthEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events this month</Text>
            <Text style={styles.emptySub}>Events will appear here once added.</Text>
          </View>
        ) : (
          monthEvents.map((e) => (
            <Pressable
              key={e.id}
              style={styles.eventCard}
              onPress={() => router.push(`/event/${e.id}` as never)}>
              <Text style={styles.eventCardTitle}>{e.title}</Text>
              <Text style={styles.eventCardDate}>
                {new Date(e.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              {e.location ? <Text style={styles.eventCardMeta}>{e.location}</Text> : null}
              {e.instructor ? <Text style={styles.eventCardMeta}>Instructor: {e.instructor}</Text> : null}
            </Pressable>
          ))
        )}
        <Pressable
          style={styles.addEventBtn}
          onPress={() => router.push('/add-event' as never)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <IconSymbol name="plus" size={18} color={FreepassColors.white} />
          <Text style={styles.addEventBtnText}>ADD EVENT TO CALENDAR</Text>
        </Pressable>
        <Text style={styles.addEventNote}>( Registered Businesses )</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  calendar: {
    backgroundColor: FreepassColors.accent,
    padding: 20,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  dayHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: FreepassColors.white,
    width: '14.28%',
    textAlign: 'center',
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateToday: {
    backgroundColor: FreepassColors.white,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 14,
    color: FreepassColors.white,
  },
  dateTodayText: {
    color: FreepassColors.primary,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  eventsTitle: {
    fontSize: 14,
    color: FreepassColors.accent,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: FreepassColors.textSecondary,
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginTop: 4,
  },
  addEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FreepassColors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  addEventBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  addEventNote: {
    fontSize: 12,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: FreepassColors.white,
    marginTop: 2,
  },
  eventCard: {
    backgroundColor: FreepassColors.white,
    borderWidth: 1,
    borderColor: FreepassColors.accent,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  eventCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: FreepassColors.primary,
    marginBottom: 4,
  },
  eventCardDate: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
    marginBottom: 2,
  },
  eventCardMeta: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
  },
});
