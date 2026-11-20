import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/AuthContext';

function AppStack() {
  const { user, restoring } = useAuth();

  if (restoring) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator accessibilityLabel="Restoring session" />
      </View>
    );
  }

  return (

    //Expo Navigation section here Stack
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="index" />
      </Stack.Protected>
    </Stack>
  );
}


//Rootlayout section for the AppStack . also for the user Auth
export default function RootLayout() {
  return (
    <AuthProvider>
      <AppStack />
    </AuthProvider>
  );
}
