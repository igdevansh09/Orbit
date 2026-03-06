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
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { supabase } from "../lib/supabase";
import { Colors } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === "dark" ? "dark" : "light"];

  const backgroundGradient = [theme.background, theme.cardBackground];

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
    <LinearGradient colors={backgroundGradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Your identity has been verified. Please create a strong new
              password.
            </Text>
          </Animated.View>

          <View style={styles.form}>
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.inputContainer}
            >
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
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.inputContainer}
            >
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
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <TouchableOpacity
                onPress={handleUpdate}
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
                    <Text style={styles.buttonText}>Update Password</Text>
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
      justifyContent: "center",
      paddingBottom: 40,
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
      marginTop: 24,
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
