import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../../constants/colors";

export default function AuthLayout() {
  // 1. Get the current theme (Light/Dark)
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // 2. Set the background color of the Stack container
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
