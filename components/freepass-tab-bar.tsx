import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

type TabId = 'home' | 'chat' | 'courses' | 'events' | 'qa';

const TABS: { id: TabId; label: string; icon: string; route: string }[] = [
  { id: 'home', label: 'Home', icon: 'house.fill', route: '/(drawer)/index' },
  { id: 'chat', label: 'Chat', icon: 'bubble.left.and.bubble.right.fill', route: '/(drawer)/chat' },
  { id: 'courses', label: 'Courses', icon: 'play.rectangle.fill', route: '/(drawer)/learning-academy' },
  { id: 'events', label: 'Events', icon: 'calendar', route: '/(drawer)/event-calendar' },
  { id: 'qa', label: 'Q&A', icon: 'questionmark.circle.fill', route: '/(drawer)/ask-question' },
];

export function FreepassTabBar({ activeTab }: { activeTab: TabId }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={styles.tab}
            onPress={() => router.replace(tab.route as never)}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <IconSymbol
              name={tab.icon as any}
              size={24}
              color={isActive ? FreepassColors.accentLight : FreepassColors.white}
            />
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: FreepassColors.white,
    marginTop: 4,
    opacity: 0.9,
  },
  labelActive: {
    color: FreepassColors.accentLight,
    opacity: 1,
  },
});
