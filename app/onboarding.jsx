import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { Colors } from "../constants/colors";

export default function Onboarding() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // 1. Pull the action from your centralized store
  const { completeOnboarding } = useAuthStore();

  const handleContinue = async () => {
    try {
      // 2. Fire the action. The store updates memory and storage simultaneously.
      await completeOnboarding();

      // 3. Navigate away. (Note: Once we fix _layout.jsx, this explicit route
      // push might become redundant, but it's safe to leave as a fallback.)
      router.replace("/(auth)/");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.contentWrapper}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.inputBackground },
          ]}
        >
          <Ionicons name="rocket" size={64} color={theme.primary} />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Your Network.{"\n"}Your Orbit.
        </Text>

        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          The exclusive platform for NSUT students to share interview
          experiences, crack placements, and build a developer legacy. No noise.
          Just signal.
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.primary, shadowColor: theme.primary },
          ]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Launch Application</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFF"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 16,
    lineHeight: 48,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 26,
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 48,
  },
  button: {
    flexDirection: "row",
    height: 64,
    width: "100%",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
