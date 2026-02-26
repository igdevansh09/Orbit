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
import {SafeAreaView} from "react-native-safe-area-context";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>
            {step === 1 ? "Forgot Password?" : "Enter Code"}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Don't worry! Enter your email and we'll send you a verification code."
              : `We have sent a 6-digit verification code to ${email}`}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 1 ? (
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
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
            </View>
          ) : (
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
          )}

          <TouchableOpacity
            onPress={step === 1 ? handleSendCode : handleVerifyCode}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.white} />
            ) : (
              <Text style={styles.buttonText}>
                {step === 1 ? "Send Code" : "Verify & Continue"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
  });
