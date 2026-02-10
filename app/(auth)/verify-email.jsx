import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Internal Imports
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";

export default function VerifyEmail() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const { verifySignupOtp, resendSignupOtp } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email || "";

  // --- THEME SELECTOR ---
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const handleVerify = async () => {
    if (!code || code.length < 6) {
      return Alert.alert("Error", "Please enter the 6-digit code");
    }

    setLoading(true);
    const result = await verifySignupOtp(email, code);
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "Email verified!", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)"),
        },
      ]);
    } else {
      Alert.alert("Verification Failed", result.error);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    const result = await resendSignupOtp(email);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Success",
        "A new verification code has been sent to your email.",
      );
    } else {
      Alert.alert("Error", result.error);
    }
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to {email}
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {/* OTP INPUT */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="key-outline"
              size={20}
              color={theme.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="00000000"
              placeholderTextColor={theme.placeholderText}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={8}
              style={[styles.input, { letterSpacing: 8, fontSize: 20 }]}
            />
          </View>

          {/* VERIFY BUTTON */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading}
            style={styles.button}
          >
            {loading ? (
              <ActivityIndicator color={theme.white} />
            ) : (
              <Text style={styles.buttonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          {/* RESEND CODE */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={handleResend} disabled={loading}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- DYNAMIC STYLES ---
const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    backButton: {
      marginTop: 20,
      marginBottom: 20,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    header: {
      marginBottom: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.textPrimary,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 24,
    },
    form: {
      gap: 20,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: 16,
      fontWeight: "500",
    },
    button: {
      backgroundColor: theme.primary,
      height: 56,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: {
      color: theme.white,
      fontSize: 16,
      fontWeight: "bold",
    },
    resendContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
      gap: 6,
    },
    resendText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    resendLink: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: "bold",
    },
  });
