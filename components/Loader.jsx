import { ActivityIndicator, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/colors";

export default function Loader({ size = "large" }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <LinearGradient
      colors={[theme.background, theme.cardBackground]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <ActivityIndicator size={size} color={theme.textPrimary} />
    </LinearGradient>
  );
}
