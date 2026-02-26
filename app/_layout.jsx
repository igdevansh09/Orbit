import {
  Slot,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { Colors } from "../constants/colors";

export default function RootLayout() {
  const { session, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState(); 
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      try {
        const value = await AsyncStorage.getItem("@has_seen_onboarding");
        setHasSeenOnboarding(value === "true");
      } catch (error) {
        setHasSeenOnboarding(false);
      }
      setIsReady(true);
    };
    init();
  }, []);

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

  useEffect(() => {
    if (!isReady || !rootNavigationState?.key) return;

    const handleRouting = async () => {
      const inAuthGroup = segments[0] === "(auth)";
      const inTabsGroup = segments[0] === "(tabs)";
      const isResetPage = segments[0] === "reset-password";
      const isVerifyEmailPage = segments[0] === "verify-email";
      const isOnboarding = segments[0] === "onboarding";

      let currentOnboardingStatus = hasSeenOnboarding;

      if (currentOnboardingStatus === null) {
        const val = await AsyncStorage.getItem("@has_seen_onboarding");
        currentOnboardingStatus = val === "true";
        if (currentOnboardingStatus) setHasSeenOnboarding(true);
      }

      if (!currentOnboardingStatus && !isOnboarding) {
        router.replace("/onboarding");
      } else if (currentOnboardingStatus && session && inAuthGroup) {
        router.replace("/(tabs)");
      } else if (
        currentOnboardingStatus &&
        !session &&
        !inAuthGroup &&
        !isResetPage &&
        !isVerifyEmailPage &&
        !isOnboarding
      ) {
        router.replace("/(auth)");
      }
    };

    handleRouting();

  }, [session, segments, isReady, hasSeenOnboarding, rootNavigationState?.key]);

  if (!isReady) {
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
