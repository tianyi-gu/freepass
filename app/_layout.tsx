import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserProvider } from '@/contexts/user-context';

export const unstable_settings = {
  initialRouteName: '(drawer)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="category-search" />
        <Stack.Screen name="listing/[id]" />
        <Stack.Screen name="map-view" />
        <Stack.Screen name="street-view/[id]" />
        <Stack.Screen name="question/[id]" />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="add-event" />
        <Stack.Screen name="calendar-view" />
        <Stack.Screen name="user-guide" />
        <Stack.Screen name="interview-library" />
        <Stack.Screen name="community-board" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="quick-list" />
        <Stack.Screen name="staff-view" />
        <Stack.Screen name="resource-types" />
        <Stack.Screen name="add-resource" />
        <Stack.Screen name="fountain-fund" />
        <Stack.Screen name="money-smart" />
        <Stack.Screen name="loan-inquiry" />
        <Stack.Screen name="course/[id]" />
        <Stack.Screen name="listing-draft/[id]" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="documents" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </UserProvider>
    </SafeAreaProvider>
  );
}
