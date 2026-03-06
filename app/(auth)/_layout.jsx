import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/colors";

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: "fade", // Smooth transition between auth screens
      }}
    />
  );
}
