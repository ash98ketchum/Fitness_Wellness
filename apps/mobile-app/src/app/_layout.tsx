import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

function RootNavigation() {
  const { token, user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!token && !inAuthGroup && segments[0] !== '' && segments[0] !== undefined) {
      router.replace('/(auth)/login');
    } else if (token) {
      if ((user as any)?.onboardingCompleted === false) {
         if (segments[0] !== 'onboarding') {
           router.replace('/onboarding');
         }
      } else {
         if (inAuthGroup || segments[0] === '' || segments[0] === 'onboarding' || segments[0] === undefined) {
           router.replace('/(app)/dashboard');
         }
      }
    }
  }, [token, user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
      <StatusBar style="light" />
    </AuthProvider>
  );
}
