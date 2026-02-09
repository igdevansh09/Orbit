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
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Internal Imports
import { supabase } from "../lib/supabase";
import { Colors } from "../constants/colors"; // Note: Single dot (..) because this file is in app/

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const router = useRouter();

  // --- THEME SELECTOR ---
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const handleUpdate = async () => {
    if (!newPassword) return Alert.alert("Error", "Please enter a password");
    if (newPassword.length < 6)
      return Alert.alert("Error", "Password must be at least 6 characters");
    if (newPassword !== confirmPassword)
      return Alert.alert("Error", "Passwords do not match");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Your password has been updated!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    }
    setLoading(false);
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Your identity has been verified. Please create a strong new
            password.
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {/* New Password */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={theme.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="New Password"
              placeholderTextColor={theme.placeholderText}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={secureText}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Ionicons
                name={secureText ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={theme.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor={theme.placeholderText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={secureText}
              style={styles.input}
            />
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            onPress={handleUpdate}
            disabled={loading}
            style={styles.button}
          >
            {loading ? (
              <ActivityIndicator color={theme.white} />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
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
      justifyContent: "center",
    },
    header: {
      marginBottom: 32,
    },
    title: {
      fontSize: 30,
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
      gap: 16,
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
      marginTop: 24,
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
