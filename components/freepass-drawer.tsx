import { DrawerContentScrollView } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FreepassLogo } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';

const MENU_ITEMS = [
  { id: 'casey', label: 'Casey (AI Assistant)', icon: 'sparkles', route: '/(drawer)/casey' },
  { id: 'account', label: 'Account', icon: 'person.fill', route: '/(drawer)/account' },
  { id: 'documents', label: 'My Documents', icon: 'doc.text.fill', route: '/documents' },
  { id: 'message-board', label: 'Message Board', icon: 'rectangle.grid.2x2.fill', route: '/(drawer)/message-board' },
  { id: 'chat', label: 'Chat', icon: 'bubble.left.and.bubble.right.fill', route: '/(drawer)/chat' },
  { id: 'learning-academy', label: 'Learning Academy', icon: 'book.fill', route: '/(drawer)/learning-academy' },
  { id: 'event-calendar', label: 'Event Calendar', icon: 'calendar', route: '/(drawer)/event-calendar' },
  { id: 'ask-question', label: 'Ask a Question', icon: 'questionmark.circle.fill', route: '/(drawer)/ask-question' },
  { id: 'budget', label: 'Budget Manager', icon: 'chart.bar.fill', route: '/(drawer)/budget' },
  { id: 'user-guide', label: 'New User Guide', icon: 'doc.text.fill', route: '/(drawer)/user-guide' },
] as const;

export function FreepassDrawerContent(props: any) {
  const { user } = useUser();
  const state = props.state;
  const currentRoute = state.routes[state.index]?.name;

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <FreepassLogo size={32} />
          <Pressable onPress={() => props.navigation.closeDrawer()} style={styles.closeBtn}>
            <IconSymbol name="chevron.left" size={22} color={FreepassColors.white} />
          </Pressable>
        </View>

        {MENU_ITEMS.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <Pressable
              key={item.id}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => {
              props.navigation.closeDrawer();
              if (item.route.startsWith('/(drawer)/')) {
                props.navigation.navigate(getDrawerRoute(item.route) as never);
              } else {
                router.push(item.route as never);
              }
            }}>
              <IconSymbol
                name={item.icon as any}
                size={24}
                color={isActive ? FreepassColors.accentLight : FreepassColors.white}
              />
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>FreePass Financial Literacy Access</Text>
          <Text style={styles.cardBody}>
            Here&apos;s where you can learn how to use FreePass, and gain access our certification classes. Head on over
            to our Academy to get the latest tips & tricks!
          </Text>
          <Pressable
            style={styles.learnMoreBtn}
            onPress={() => props.navigation.navigate('learning-academy')}
            android_ripple={{ color: FreepassColors.primaryDark }}>
            <Text style={styles.learnMoreText}>Learn More</Text>
            <IconSymbol name="arrow.up.right" size={16} color={FreepassColors.white} />
          </Pressable>
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <FreepassLogo size={24} />
        <Text style={styles.userName}>{user?.displayName ?? (user?.isGuest ? 'Guest' : 'Account')}</Text>
      </View>
    </View>
  );
}

function getDrawerRoute(route: string): string {
  const map: Record<string, string> = {
    '/(drawer)/account': 'account',
    '/(drawer)/message-board': 'message-board',
    '/(drawer)/chat': 'chat',
    '/(drawer)/learning-academy': 'learning-academy',
    '/(drawer)/event-calendar': 'event-calendar',
    '/(drawer)/ask-question': 'ask-question',
    '/(drawer)/user-guide': 'user-guide',
    '/(drawer)/casey': 'casey',
    '/(drawer)/budget': 'budget',
  };
  return map[route] ?? 'index';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FreepassColors.primary,
  },
  scrollContent: {
    paddingTop: 48,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  closeBtn: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuItemActive: {
    backgroundColor: FreepassColors.primaryDark,
  },
  menuLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: FreepassColors.white,
  },
  menuLabelActive: {
    color: FreepassColors.accentLight,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: FreepassColors.accent,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: FreepassColors.white,
    marginBottom: 12,
  },
  cardBody: {
    fontSize: 14,
    color: FreepassColors.white,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.95,
  },
  learnMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: FreepassColors.primaryDark,
    borderRadius: 8,
  },
  learnMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  userName: {
    fontSize: 15,
    color: FreepassColors.white,
    fontWeight: '500',
  },
});
