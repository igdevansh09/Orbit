import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl ? "SET" : "MISSING");
console.log("Supabase Key:", supabaseAnonKey ? "SET" : "MISSING");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ MISSING SUPABASE CREDENTIALS");
  console.error("Please create .env file with:");
  console.error("EXPO_PUBLIC_SUPABASE_URL=your-url");
  console.error("EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage:
      Platform.OS === "web" && typeof window === "undefined"
        ? null
        : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Supabase connection error:", error.message);
  } else {
    console.log("✅ Supabase connected successfully");
  }
});

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
