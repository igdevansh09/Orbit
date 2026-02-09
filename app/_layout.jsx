import { useEffect } from "react";
import { Stack, useRouter, useSegments, SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { View, useColorScheme } from "react-native";
import { useAuthStore } from "../store/authStore";
import { Colors } from "../constants/colors";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  // Get Auth State
  const { checkAuth, user, isCheckingAuth } = useAuthStore();

  // Load Fonts (Optional - kept from original)
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  // 1. Initialize Auth on App Start
  useEffect(() => {
    checkAuth();
  }, []);

  // 2. Handle Navigation / Protection
  useEffect(() => {
    if (isCheckingAuth) return; // Wait until auth check is done

    const inAuthGroup = segments[0] === "(auth)";
    const isLoggedIn = !!user; // simple boolean check

    if (!isLoggedIn && !inAuthGroup) {
      // If not logged in and not in auth group, go to login
      router.replace("/(auth)");
    } else if (isLoggedIn && inAuthGroup) {
      // If logged in and inside auth group (login/signup), go to home
      router.replace("/(tabs)");
    }
  }, [user, isCheckingAuth, segments]);

  // 3. Hide Splash Screen when ready
  useEffect(() => {
    if (fontsLoaded && !isCheckingAuth) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isCheckingAuth]);

  // Show nothing while loading (Splash screen covers this)
  if (!fontsLoaded || isCheckingAuth) {
    return null;
  }

  // Define status bar style based on theme
  const statusBarStyle = colorScheme === "dark" ? "light" : "dark";
  const backgroundColor = Colors[colorScheme ?? "light"].background;

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
      <StatusBar style={statusBarStyle} />
    </View>
  );
}
