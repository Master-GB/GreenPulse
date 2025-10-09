import { Stack, useRouter, Redirect } from 'expo-router';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

// This component handles the authentication state and routing
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set initialized to true after the first render
    setInitialized(true);
  }, []);

  // Show loading indicator while checking auth state
  if (loading || !initialized) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#122119' 
      }}>
        <ActivityIndicator size="large" color="#1AE57D" />
      </View>
    );
  }

  // If user is not logged in, show the sign-in screen
  if (!user) {
    return (
      <Stack>
        <Stack.Screen name="signIn" options={{ headerShown: false }} />
        <Stack.Screen name="signUp" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // If user is logged in, show the main app
  return (
    <Stack>
      <Stack.Screen name="(root)" options={{ headerShown: false }} />
      <Stack.Screen name="signIn" options={{ headerShown: false }} />
      <Stack.Screen name="signUp" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar hidden={true} />
      <RootLayoutNav />
    </AuthProvider>
  );
}
