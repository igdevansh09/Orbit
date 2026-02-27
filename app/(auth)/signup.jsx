import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { Colors } from "../../constants/colors";
import { getSignupStyles } from "../../assets/styles/signup.styles";
import BranchSelector from "../../components/BranchSelector";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college] = useState("NSUT");
  const [branch, setBranch] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, register } = useAuthStore();
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = useMemo(() => getSignupStyles(theme), [theme]);

  const handleSignUp = async () => {
    if (!username || !email || !password || !branch) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith("@nsut.ac.in")) {
      Alert.alert(
        "Access Denied",
        "You must use your official @nsut.ac.in email.",
      );
      return;
    }

    const result = await register(
      username,
      cleanEmail,
      password,
      college,
      branch,
    );

    if (result.success && result.requiresVerification) {
      Alert.alert(
        "Check Your Email",
        "We've sent a verification code to your email. Please check your inbox.",
        [
          {
            text: "OK",
            onPress: () => {
              router.push({
                pathname: "/verify-email",
                params: { email: cleanEmail },
              });
            },
          },
        ],
      );
    } else if (!result.success) {
      Alert.alert("Registration Failed", result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Join Orbit{" "}
            <Ionicons name="rocket" size={30} color={theme.primary} />
          </Text>
          <Text style={styles.subtitle}>
            The exclusive network for NSUT students and alumni.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person"
                size={22}
                color={theme.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Student Name"
                placeholderTextColor={theme.placeholderText}
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>NSUT Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail"
                size={22}
                color={theme.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="name@nsut.ac.in"
                placeholderTextColor={theme.placeholderText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Replaced the broken TextInput entirely with the BranchSelector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Branch</Text>
            <BranchSelector
              value={branch}
              onChange={(selected) => setBranch(selected)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed"
                size={22}
                color={theme.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.placeholderText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={22}
                  color={theme.placeholderText}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
