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

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Back to Email
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

    // STRICT VALIDATION: Check for NSUT domain
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

    if (!result.success) {
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
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Orbit <Ionicons name="rocket" size={24} color={theme.primary} />
            </Text>
            <Text style={styles.subtitle}>NSUT Exclusive Community</Text>
          </View>

          <View style={styles.formContainer}>
            {/* USERNAME */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
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

            {/* EMAIL (Restored) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NSUT Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
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
              <Text
                style={{
                  fontSize: 10,
                  color: theme.textSecondary,
                  marginTop: 4,
                  marginLeft: 4,
                }}
              >
                * Must be a valid @nsut.ac.in address
              </Text>
            </View>

            {/* BRANCH */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Branch</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="library-outline"
                  size={20}
                  color={theme.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. CSAI, MAC, ECE"
                  placeholderTextColor={theme.placeholderText}
                  value={branch}
                  onChangeText={setBranch}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* PASSWORD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="******"
                  placeholderTextColor={theme.placeholderText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={theme.primary}
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
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up & Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.link}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
