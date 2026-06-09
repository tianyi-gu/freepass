import { Drawer } from 'expo-router/drawer';

import { FreepassDrawerContent } from '@/components/freepass-drawer';
import { FreepassColors } from '@/constants/theme';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <FreepassDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: FreepassColors.primary,
          width: 300,
        },
        drawerType: 'front',
        swipeEnabled: true,
      }}>
      <Drawer.Screen name="index" options={{ drawerLabel: () => null, title: 'Home' }} />
      <Drawer.Screen name="account" options={{ drawerLabel: () => null }} />
      <Drawer.Screen name="message-board" options={{ drawerLabel: () => null }} />
      <Drawer.Screen name="learning-academy" options={{ drawerLabel: () => null }} />
      <Drawer.Screen name="event-calendar" options={{ drawerLabel: () => null }} />
      <Drawer.Screen name="ask-question" options={{ drawerLabel: () => null }} />
      <Drawer.Screen name="user-guide" options={{ drawerLabel: () => null }} />
      <Drawer.Screen name="casey" options={{ drawerLabel: () => null }} />
      <Drawer.Screen name="budget" options={{ drawerLabel: () => null }} />
    </Drawer>
  );
}
