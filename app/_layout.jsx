import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";

export default function RootLayout() {
  const { session, user, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // 1. Initialize Auth on App Start
  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setIsReady(true);
    };
    init();
  }, []);

  // 2. Main Routing Logic (The "Auth Guard")
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const isResetPage = segments[0] === "reset-password"; // Check if we are on the reset page

    // LISTENER: Specifically catch the Password Recovery Event
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          // CRITICAL: Force navigation to the reset screen
          console.log("Password Recovery Event Detected!");
          router.replace("/reset-password");
        } else if (event === "SIGNED_OUT") {
          // Handle logout
        }
      },
    );

    // STANDARD REDIRECTS
    if (session && inAuthGroup) {
      // If logged in but on Login/Signup -> Go Home
      router.replace("/(tabs)");
    } else if (!session && !inAuthGroup && !isResetPage) {
      // If NOT logged in, NOT in auth, and NOT resetting password -> Go Login
      // This !isResetPage check is what saves you!
      router.replace("/(auth)");
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [session, segments, isReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Slot />;
}
