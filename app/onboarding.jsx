import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";
import { useAuthStore } from "../store/authStore";
import { Colors } from "../constants/colors";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const { completeOnboarding } = useAuthStore();

  // Create a subtle background gradient using your exact theme colors
  const backgroundGradient = [theme.background, theme.cardBackground];

  const handleContinue = async () => {
    try {
      await completeOnboarding();
      router.replace("/(auth)/");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  return (
    <LinearGradient colors={backgroundGradient} style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Animated Icon with a subtle glass/border effect */}
        <Animated.View
          entering={ZoomIn.delay(300).springify().damping(12)}
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons name="rocket" size={64} color={theme.textPrimary} />
        </Animated.View>

        {/* Staggered Text Animations */}
        <Animated.Text
          entering={FadeInDown.delay(500).springify()}
          style={[styles.title, { color: theme.textPrimary }]}
        >
          Your Network.{"\n"}Your Orbit.
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(600).springify()}
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          The exclusive platform for NSUT students to share interview
          experiences, crack placements, and build a developer legacy. No noise.
          Just signal.
        </Animated.Text>

        {/* Animated Button with Theme Gradient */}
        <Animated.View
          entering={FadeInUp.delay(700).springify()}
          style={styles.buttonWrapper}
        >
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            style={[styles.touchableArea, { shadowColor: theme.black }]}
          >
            <LinearGradient
              colors={[theme.primary, theme.textPrimary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={[styles.buttonText, { color: theme.white }]}>
                Launch Application
              </Text>
              <Ionicons
                name="arrow-forward"
                size={22}
                color={theme.white}
                style={{ marginLeft: 8 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: -1.5,
    marginBottom: 20,
    lineHeight: 52,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 56,
    letterSpacing: 0.2,
  },
  buttonWrapper: {
    width: "100%",
    alignItems: "center",
  },
  touchableArea: {
    width: width * 0.85,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    height: 64,
    width: "100%",
    borderRadius: 32, // Pill shape is great for onboarding
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
