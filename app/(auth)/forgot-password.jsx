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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAuthStore } from "../../store/authStore";
import { Colors } from "../../constants/colors";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);

  const { sendRecoveryCode, verifyRecoveryCode, isLoading } = useAuthStore();
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const backgroundGradient = [theme.background, theme.cardBackground];

  const handleSendCode = async () => {
    if (!email) return Alert.alert("Error", "Please enter your email");
    const res = await sendRecoveryCode(email.trim());
    if (res.success) {
      setStep(2);
      Alert.alert("Code Sent", "Please check your email for the 6-digit code.");
    } else {
      Alert.alert("Error", res.error);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length < 6)
      return Alert.alert("Error", "Enter the 6-digit code");

    const res = await verifyRecoveryCode(email.trim(), code);
    if (res.success) {
      router.replace("/reset-password");
    } else {
      Alert.alert("Invalid Code", res.error);
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
            <Text style={styles.title}>
              {step === 1 ? "Forgot Password?" : "Enter Code"}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? "Don't worry! Enter your email and we'll send you a verification code."
                : `We have sent a 6-digit verification code to ${email}`}
            </Text>
          </Animated.View>

          <View style={styles.form}>
            {step === 1 ? (
              <Animated.View
                entering={FadeInDown.delay(250).springify()}
                style={styles.inputContainer}
              >
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="scholar@nsut.ac.in"
                  placeholderTextColor={theme.placeholderText}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </Animated.View>
            ) : (
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
            )}

            <Animated.View entering={FadeInUp.delay(350).springify()}>
              <TouchableOpacity
                onPress={step === 1 ? handleSendCode : handleVerifyCode}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.primary, theme.textPrimary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.white} />
                  ) : (
                    <Text style={styles.buttonText}>
                      {step === 1 ? "Send Code" : "Verify & Continue"}
                    </Text>
                  )}
                </LinearGradient>
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
  });
