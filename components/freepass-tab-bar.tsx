import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

type TabId = 'home' | 'chat' | 'casey' | 'courses' | 'events' | 'budget';

const TABS: { id: TabId; label: string; icon: string; route: string }[] = [
  { id: 'home', label: 'Home', icon: 'house.fill', route: '/(drawer)' },
  { id: 'casey', label: 'Casey', icon: 'sparkles', route: '/(drawer)/casey' },
  { id: 'budget', label: 'Budget', icon: 'chart.bar.fill', route: '/(drawer)/budget' },
  { id: 'courses', label: 'Courses', icon: 'play.rectangle.fill', route: '/(drawer)/learning-academy' },
  { id: 'events', label: 'Events', icon: 'calendar', route: '/(drawer)/event-calendar' },
];

export function FreepassTabBar({ activeTab }: { activeTab: TabId }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={styles.tab}
            onPress={() => router.replace(tab.route as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <IconSymbol
                name={tab.icon as any}
                size={22}
                color={isActive ? FreepassColors.white : 'rgba(255,255,255,0.5)'}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: FreepassColors.primary,
    paddingTop: 10,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    gap: 4,
  },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: FreepassColors.accent,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  labelActive: {
    color: FreepassColors.accentLight,
    fontWeight: '700',
    opacity: 1,
  },
});
