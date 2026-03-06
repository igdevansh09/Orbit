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
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuthStore } from "../../store/authStore";
import { Colors } from "../../constants/colors";

export default function VerifyEmail() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const { verifySignupOtp, resendSignupOtp } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email || "";

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const backgroundGradient = [theme.background, theme.cardBackground];

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
    <LinearGradient colors={backgroundGradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to {email}
            </Text>
          </Animated.View>

          <View style={styles.form}>
            <Animated.View
              entering={FadeInDown.delay(250).springify()}
              style={styles.inputContainer}
            >
              <Ionicons
                name="key-outline"
                size={22}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="000000"
                placeholderTextColor={theme.placeholderText}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={8}
                style={[
                  styles.input,
                  { letterSpacing: 12, fontSize: 22, textAlign: "center" },
                ]}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(350).springify()}>
              <TouchableOpacity
                onPress={handleVerify}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.primary, theme.textPrimary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.white} />
                  ) : (
                    <Text style={styles.buttonText}>Verify Email</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(450).springify()}
              style={styles.resendContainer}
            >
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={loading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    backButton: {
      marginTop: 10,
      marginBottom: 30,
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    header: {
      marginBottom: 40,
    },
    title: {
      fontSize: 34,
      fontWeight: "900",
      color: theme.textPrimary,
      marginBottom: 12,
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      lineHeight: 24,
      fontWeight: "500",
    },
    form: {
      gap: 20,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 64,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputIcon: {
      marginRight: 12,
      opacity: 0.8,
    },
    input: {
      flex: 1,
      color: theme.textDark,
      fontSize: 16,
      fontWeight: "600",
    },
    button: {
      height: 64,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
      shadowColor: theme.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 6,
    },
    buttonText: {
      color: theme.white,
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 1,
    },
    resendContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
      gap: 6,
    },
    resendText: {
      fontSize: 15,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    resendLink: {
      fontSize: 15,
      color: theme.textPrimary,
      fontWeight: "800",
      textDecorationLine: "underline",
    },
  });
