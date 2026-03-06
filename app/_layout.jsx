import "react-native-url-polyfill/auto";
import {
  Slot,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { useEffect } from "react";
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
  const rootNavigationState = useRootNavigationState();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  useEffect(() => {
    checkAuth();
  }, []);

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

  useEffect(() => {
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

    if (!hasSeenOnboarding && !isOnboarding) {
      router.replace("/onboarding");
      return;
    }

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

  // UPGRADED LOADING STATE
  if (
    isCheckingAuth ||
    hasSeenOnboarding === null ||
    !rootNavigationState?.key
  ) {
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
