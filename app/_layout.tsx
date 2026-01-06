import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  MajorMonoDisplay_400Regular
} from '@expo-google-fonts/major-mono-display';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold
} from '@expo-google-fonts/space-mono';
import CustomSplashScreen from '@/components/splash/SplashScreen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'MajorMono': MajorMonoDisplay_400Regular,
    'SpaceMono': SpaceMono_400Regular,
    'SpaceMono-Bold': SpaceMono_700Bold,
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="community" options={{ headerShown: false }} />
        <Stack.Screen name="user/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
      {showSplash && (
        <CustomSplashScreen onComplete={() => setShowSplash(false)} />
      )}
    </>
  );
}