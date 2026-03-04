import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DATES = Array.from({ length: 31 }, (_, i) => i + 1);

export default function CalendarViewScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar View</Text>
        <Pressable>
          <IconSymbol name="calendar" size={24} color={FreepassColors.white} />
        </Pressable>
      </View>

      <View style={styles.calendar}>
        <View style={styles.monthNav}>
          <Pressable>
            <IconSymbol name="chevron.left" size={24} color={FreepassColors.white} />
          </Pressable>
          <Text style={styles.monthText}>March 2026</Text>
          <Pressable>
            <IconSymbol name="chevron.right" size={24} color={FreepassColors.white} />
          </Pressable>
        </View>
        <View style={styles.daysRow}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.dayHeader}>
              {d}
            </Text>
          ))}
        </View>
        <View style={styles.datesGrid}>
          {DATES.map((d) => (
            <View key={d} style={[styles.dateCell, d === 3 && styles.dateToday]}>
              <Text style={[styles.dateText, d === 3 && styles.dateTodayText]}>{d}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.eventsTitle}>All Upcoming Events</Text>
        <View style={styles.eventCard}>
          <View style={styles.eventLogo}>
            <Text style={styles.eventLogoText}>fp</Text>
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>Event Name</Text>
            <Text style={styles.eventTime}>Start Time</Text>
          </View>
        </View>
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
    marginHorizontal: '2%',
  },
  dateText: {
    fontSize: 14,
    color: FreepassColors.text,
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
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  eventLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: FreepassColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventLogoText: {
    fontSize: 18,
    fontWeight: '800',
    color: FreepassColors.primary,
  },
  eventInfo: { flex: 1 },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.text,
  },
  eventTime: {
    fontSize: 13,
    color: FreepassColors.textSecondary,
    marginTop: 2,
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
});
