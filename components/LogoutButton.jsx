import { Text, TouchableOpacity, Alert, useColorScheme } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/colors";

export default function LogoutButton() {
  const { signOut } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => signOut(), style: "destructive" },
    ]);
  };

  return (
    <TouchableOpacity onPress={confirmLogout} activeOpacity={0.8}>
      <LinearGradient
        colors={["#FF3B30", "#D32F2F"]} // Professional destructive gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 16,
          marginTop: 20,
          shadowColor: "#FF3B30",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 6,
        }}
      >
        <Ionicons
          name="log-out-outline"
          size={22}
          color="#ffffff"
          style={{ marginRight: 10 }}
        />
        <Text
          style={{
            color: "#ffffff",
            fontSize: 17,
            fontWeight: "800",
            letterSpacing: 0.5,
          }}
        >
          Logout
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
