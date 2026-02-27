import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ MISSING SUPABASE CREDENTIALS");
}

// Track if we're already attempting a token refresh to prevent race conditions
let isRefreshingToken = false;
let refreshPromise = null;

// Enhanced Network Interceptor with Token Refresh Logic
const customFetch = async (url, options) => {
  try {
    const response = await fetch(url, options);

    // If we get a 401 on a database query, attempt token refresh
    if (response.status === 401 && url.includes("/rest/v1/")) {
      console.warn("🚨 [Network Interceptor] 401 Unauthorized on REST call");

      // Prevent multiple simultaneous refresh attempts
      if (!isRefreshingToken) {
        isRefreshingToken = true;
        refreshPromise = supabase.auth
          .refreshSession()
          .then(({ data, error }) => {
            if (error || !data.session) {
              console.error("❌ Token refresh failed:", error);
              // Sign out only if refresh truly failed
              return supabase.auth.signOut().catch(() => {});
            } else {
              console.log("✅ Token refreshed successfully after 401");
              // Retry the original request with the new token
              const newOptions = { ...options };
              if (newOptions.headers) {
                const authHeader =
                  newOptions.headers.authorization ||
                  newOptions.headers.Authorization;
                if (authHeader) {
                  const newToken = data.session.access_token;
                  newOptions.headers.authorization = `Bearer ${newToken}`;
                }
              }
              return fetch(url, newOptions);
            }
          })
          .catch((err) => {
            console.error("❌ Error during token refresh:", err);
            return response;
          })
          .finally(() => {
            isRefreshingToken = false;
            refreshPromise = null;
          });

        return refreshPromise;
      } else if (refreshPromise) {
        // Wait for the ongoing refresh to complete, then return the original response
        await refreshPromise;
        return response;
      }
    }

    return response;
  } catch (error) {
    console.error("❌ Network fetch error:", error);
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage:
      Platform.OS === "web" && typeof window === "undefined"
        ? null
        : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Add session and flowType for better auth state management
    storageKey: "sb-auth-token",
  },
  global: {
    fetch: customFetch, // <-- Inject the enhanced interceptor
  },
});

// Manage auto-refresh when app comes to foreground/background
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    console.log("📱 App active - starting auto-refresh");
    supabase.auth.startAutoRefresh();
  } else {
    console.log("📱 App inactive - stopping auto-refresh");
    supabase.auth.stopAutoRefresh();
  }
});
