import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

const MOCK_EVENTS = [
  {
    id: '1',
    name: 'Community Job Fair',
    startTime: 'Thursday, May 4th, 2024 at 4:00 PM',
    description: 'Meet local employers and explore job opportunities.',
  },
];

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Events</Text>
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
      <View style={styles.tabs}>
        <View style={[styles.tab, styles.tabActive]}>
          <Text style={styles.tabActiveText}>Upcoming</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Past</Text>
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

        {MOCK_EVENTS.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventImage}>
              <Text style={styles.eventImageText}>fp</Text>
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTime}>{event.startTime}</Text>
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventDesc}>{event.description}</Text>
              <Pressable
                style={styles.detailsBtn}
                onPress={() => router.push(`/event/${event.id}` as never)}
                android_ripple={{ color: FreepassColors.primaryDark }}>
                <Text style={styles.detailsBtnText}>SEE DETAILS</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  headerBar: {
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 20,
    paddingTop: 48,
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: FreepassColors.accentLight,
  },
  tabText: {
    fontSize: 15,
    color: FreepassColors.accentLight,
    opacity: 0.8,
  },
  tabActiveText: {
    fontSize: 15,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  intro: {
    fontSize: 15,
    color: FreepassColors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
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
    marginBottom: 12,
    lineHeight: 20,
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
});
