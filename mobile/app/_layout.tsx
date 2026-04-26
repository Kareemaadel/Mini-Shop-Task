import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../src/theme';

export default function RootLayout() {
  const { isHydrated, user, hydrate } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (user && inAuthGroup) {
      // Redirect to the app if logged in
      router.replace('/(app)/(tabs)/shop');
    } else if (!user && !inAuthGroup) {
      // Redirect to login if not logged in
      router.replace('/(auth)/login');
    }
  }, [user, isHydrated, segments]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}
