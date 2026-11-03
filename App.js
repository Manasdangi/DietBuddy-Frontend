import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import useStore from './src/store/useStore';
import { 
  useFonts, 
  Outfit_400Regular, 
  Outfit_500Medium, 
  Outfit_600SemiBold, 
  Outfit_700Bold, 
  Outfit_800ExtraBold 
} from '@expo-google-fonts/outfit';

export default function App() {
  let [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });
  const hasHydrated = useStore((state) => state.hasHydrated);

  // Start a fresh day's totals if the app was left open past midnight
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') useStore.getState().ensureToday();
    });
    return () => sub.remove();
  }, []);

  // Wait for fonts and saved data, so onboarding doesn't flash for returning users
  if (!fontsLoaded || !hasHydrated) {
    return null; // Or a splash screen
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
