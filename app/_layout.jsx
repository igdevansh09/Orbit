import "react-native-url-polyfill/auto";
import {
  Slot,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { useEffect } from "react";
import {
  View,
  ActivityIndicator,
  useColorScheme,
  AppState,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { Colors } from "../constants/colors";

export default function RootLayout() {
  // 1. Pull ALL state directly from the single source of truth
  const {
    session,
    checkAuth,
    refreshSession,
    hasSeenOnboarding,
    isCheckingAuth,
  } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // 2. Initial Boot: Tell the store to do its job.
  useEffect(() => {
    checkAuth();
  }, []);

  // 6. App State Listener: Refresh session when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state === "active" && session) {
        console.log("📱 App resumed - refreshing session");
        await refreshSession();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [session, refreshSession]);

  // 3. The Master Routing Engine
  useEffect(() => {
    // ABORT routing if the store is still checking, onboarding is unknown, or tree hasn't mounted
    if (
      isCheckingAuth ||
      hasSeenOnboarding === null ||
      !rootNavigationState?.key
    )
      return;

    const inAuthGroup = segments[0] === "(auth)";
    const isResetPage = segments[0] === "reset-password";
    const isVerifyEmailPage = segments[0] === "verify-email";
    const isOnboarding = segments[0] === "onboarding";

    // A. User hasn't seen onboarding
    if (!hasSeenOnboarding && !isOnboarding) {
      router.replace("/onboarding");
      return;
    }

    // B. User saw onboarding, but is NOT logged in
    if (
      hasSeenOnboarding &&
      !session &&
      !inAuthGroup &&
      !isResetPage &&
      !isVerifyEmailPage &&
      !isOnboarding
    ) {
      router.replace("/(auth)");
      return;
    }

    // C. User saw onboarding AND is logged in
    if (hasSeenOnboarding && session && inAuthGroup) {
      router.replace("/(tabs)");
      return;
    }
  }, [
    session,
    segments,
    isCheckingAuth,
    hasSeenOnboarding,
    rootNavigationState?.key,
  ]);

  // 4. Edge-Case Auth Events (Password Recovery Deep Links)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "PASSWORD_RECOVERY") {
          console.log("Password Recovery Event Detected!");
          router.replace("/reset-password");
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 5. Loading State: Block UI until the store has exact answers
  if (
    isCheckingAuth ||
    hasSeenOnboarding === null ||
    !rootNavigationState?.key
  ) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return <Slot />;
}
