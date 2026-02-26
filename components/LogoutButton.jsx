import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import styles from "../assets/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";

export default function LogoutButton() {
  const { signOut } = useAuth();

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => signOut(), style: "destructive" },
    ]);
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
      <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
}
