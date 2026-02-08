import { View, ActivityIndicator } from "react-native";

export default function Landing() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#4285F4" />
    </View>
  );
}
