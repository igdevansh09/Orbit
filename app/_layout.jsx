import { useEffect } from "react";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

// 1. ADD YOUR KEY HERE
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing Publishable Key");
}

// Token Cache for Persistence (Keeps user logged in)
const tokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isCallbackPath = segments[0] === "--"; // Expo OAuth callback deep link

    // Add a small delay to ensure routes are fully registered
    const timeout = setTimeout(() => {
      // If this is the OAuth callback path, immediately redirect based on session
      if (isCallbackPath) {
        if (isSignedIn) {
          router.replace("/(tabs)/index");
        } else {
          router.replace("/(auth)/login");
        }
        return;
      }

      if (isSignedIn && inAuthGroup) {
        // User is logged in, redirect to home screen
        router.replace("/(tabs)/index");
      } else if (!isSignedIn && !inAuthGroup) {
        // User is NOT logged in, redirect to login page
        router.replace("/(auth)/login");
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [isSignedIn, isLoaded, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <SafeAreaProvider>
          <RootLayoutNav />
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
