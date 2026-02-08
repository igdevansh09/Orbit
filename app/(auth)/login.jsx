import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { useWarmUpBrowser } from "../../hooks/useWarmUpBrowser";
import styles from "../../assets/styles/login.styles";

// Completes the session if the user manually closes the browser
WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  // Warm up the browser for faster load
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const onGoogleSignIn = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        // Await setting the active session to ensure Clerk updates immediately
        await setActive({ session: createdSessionId });
        // Explicitly navigate to the app's main tabs to avoid transient unmatched routes
        router.replace("/(tabs)/index");
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, [startOAuthFlow, router]);

  return (
    <View style={styles.container}>
      {/* Top Illustration */}
      <View style={styles.topIllustration}>
        <Image
          source={require("../../assets/images/i.png")}
          style={styles.illustrationImage}
          resizeMode="contain"
        />
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Welcome to Orbit 🪐
        </Text>

        <Text style={{ textAlign: "center", color: "#666", marginBottom: 30 }}>
          The Interview & Online Assessment Hub
        </Text>

        {/* The Only Button You Need */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: "#4285F4",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
          onPress={onGoogleSignIn}
        >
          <Ionicons
            name="logo-google"
            size={20}
            color="white"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.buttonText}>Continue with Gmail ID</Text>
        </TouchableOpacity>

        <Text
          style={{
            textAlign: "center",
            marginTop: 15,
            color: "#999",
            fontSize: 12,
          }}
        >
          It will be better if you use your college email ID for a better
          experience!
        </Text>
      </View>
    </View>
  );
}
