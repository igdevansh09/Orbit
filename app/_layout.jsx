import "react-native-url-polyfill/auto";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, AppState } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { Colors } from "../constants/colors";

export default function RootLayout() {
  const {
    session,
    checkAuth,
    refreshSession,
    hasSeenOnboarding,
    isCheckingAuth,
  } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // 1. THE LOCK: Track if we've completed the initial auth sweep to prevent bouncing
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state === "active" && session) {
        console.log("📱 App resumed - refreshing session");
        await refreshSession();
      }
    });
    return () => subscription.remove();
  }, [session, refreshSession]);

  // 2. THE ROUTER MACHINE
  useEffect(() => {
    // Do not attempt to route if we are still fetching core data from AsyncStorage/Supabase
    if (!isReady || isCheckingAuth || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isOnboarding = segments[0] === "onboarding";
    const isResetPage = segments[0] === "reset-password";
    const isVerifyPage = segments[0] === "verify-email";

    // Priority 1: Onboarding
    if (!hasSeenOnboarding) {
      if (!isOnboarding) router.replace("/onboarding");
      return;
    }

    // Priority 2: Unauthenticated Users
    if (!session) {
      if (!inAuthGroup && !isResetPage && !isVerifyPage && !isOnboarding) {
        router.replace("/(auth)");
      }
      return;
    }

    // Priority 3: Authenticated Users
    if (session && (inAuthGroup || isOnboarding)) {
      router.replace("/(tabs)");
      return;
    }
  }, [session, hasSeenOnboarding, isCheckingAuth, isReady, segments]); // Notice `segments` is required here

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "PASSWORD_RECOVERY") {
          router.replace("/reset-password");
        } else if (event === "SIGNED_OUT") {
          router.replace("/(auth)");
        }
      },
    );
    return () => authListener.subscription.unsubscribe();
  }, []);

  // 3. THE RENDER BLOCK: Hold the screen hostage until state is resolved
  if (!isReady || isCheckingAuth || hasSeenOnboarding === null) {
    return (
      <LinearGradient
        colors={[theme.background, theme.cardBackground]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={theme.textPrimary} />
      </LinearGradient>
    );
  }

  return <Slot />;
}
