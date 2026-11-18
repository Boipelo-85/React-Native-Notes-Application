import { Stack } from 'expo-router';

import { AuthProvider, useAuth } from '@/context/AuthContext';

function AppStack() {
  const { user } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppStack />
    </AuthProvider>
  );
}
