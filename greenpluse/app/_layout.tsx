import { Stack, useSegments } from 'expo-router';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// This component handles the authentication state and routing
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const segments = useSegments();

  useEffect(() => {
    // Set initialized to true after the first render
    setInitialized(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('hasOnboarded');
        if (isMounted) {
          setHasOnboarded(value === 'true');
        }
      } catch (error) {
        if (isMounted) {
          setHasOnboarded(false);
        }
      }
    };

    checkOnboarding();

    return () => {
      isMounted = false;
    };
  }, [user, segments]);

  // Show loading indicator while checking auth state
  if (loading || !initialized || hasOnboarded === null) {
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
      <Stack initialRouteName={hasOnboarded ? 'signIn' : 'onboarding'}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="signIn" options={{ headerShown: false }} />
        <Stack.Screen name="signUp" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // If user is logged in but hasn't completed onboarding, keep them on onboarding
  if (!hasOnboarded) {
    return (
      <Stack initialRouteName="onboarding">
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(root)" options={{ headerShown: false }} />
        <Stack.Screen name="signIn" options={{ headerShown: false }} />
        <Stack.Screen name="signUp" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // If user is logged in and has completed onboarding, show the main app
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
