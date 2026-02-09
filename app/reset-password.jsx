import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase automatically detects the "access_token" in the URL hash
    // and sets the session for you.
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // You are now in a "Recovery Session".
        // The user is logged in, but must update their password.
        console.log("Recovery session active");
      }
    });
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Password updated!");
      router.replace("/"); // Go to home or login
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Set New Password</Text>
      <TextInput
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 20,
          borderRadius: 5,
        }}
      />
      <TouchableOpacity
        onPress={handleUpdate}
        style={{ backgroundColor: "green", padding: 15, borderRadius: 5 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Update Password
        </Text>
      </TouchableOpacity>
    </View>
  );
}
