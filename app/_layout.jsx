import { Slot, useRouter, useSegments } from "expo-router";
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
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const init = async () => {
      try {
        await checkAuth();

        const value = await AsyncStorage.getItem("@has_seen_onboarding");
        setHasSeenOnboarding(value === "true");
      } catch (error) {
        console.error("Init error:", error);
        setHasSeenOnboarding(false);
      } finally {
        setIsReady(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!isReady || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const isResetPage = segments[0] === "reset-password";
    const isVerifyEmailPage = segments[0] === "verify-email";
    const isOnboarding = segments[0] === "onboarding";

    if (!hasSeenOnboarding && !isOnboarding) {
      router.replace("/onboarding");
      return;
    }

    
    if (hasSeenOnboarding && session && inAuthGroup) {
      router.replace("/(tabs)");
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
  }, [session, segments, isReady, hasSeenOnboarding]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth event:", event);

        if (event === "PASSWORD_RECOVERY") {
          console.log("Password Recovery Event Detected!");
          router.replace("/reset-password");
          return;
        }

        if (event === "SIGNED_IN" && newSession) {
          console.log("User signed in");
        }

        if (event === "SIGNED_OUT") {
          console.log("User signed out");
          router.replace("/(auth)");
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); 

  if (!isReady || hasSeenOnboarding === null) {
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
