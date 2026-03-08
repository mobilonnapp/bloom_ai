import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import SplashOverlay from '../components/SplashOverlay';
import TutorialOverlay from '../components/TutorialOverlay';
import { initFacebook } from '../services/facebook';
import { initRevenueCat } from '../services/revenuecat';

SplashScreen.preventAutoHideAsync();

const TUTORIAL_KEY = '@bloom:tutorial_seen';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Hide the native splash immediately — our custom overlay takes over
    SplashScreen.hideAsync();
    // Initialize Meta (Facebook) SDK
    initFacebook().catch(() => {});
    // Initialize RevenueCat
    initRevenueCat().catch(() => {});
  }, []);

  // After splash ends: check if this is first launch
  const handleSplashDone = async () => {
    setShowSplash(false);
    const seen = await AsyncStorage.getItem(TUTORIAL_KEY);
    if (!seen) setShowTutorial(true);
  };

  const handleTutorialDone = async () => {
    await AsyncStorage.setItem(TUTORIAL_KEY, '1');
    setShowTutorial(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="template/[id]" />
        <Stack.Screen name="upload/[templateId]" />
        <Stack.Screen
          name="processing"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen name="result" />
        <Stack.Screen
          name="upgrade"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="settings"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="about" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="terms" />
      </Stack>

      {/* Tutorial renders under splash so it's revealed when splash fades out */}
      {showTutorial && <TutorialOverlay onDone={handleTutorialDone} />}
      {showSplash && <SplashOverlay onDone={handleSplashDone} />}
    </GestureHandlerRootView>
  );
}
