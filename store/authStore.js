import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { decode } from "base64-arraybuffer";
import * as Linking from "expo-linking";
import { Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,
  hasSeenOnboarding: null,

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem("@has_seen_onboarding", "true");
      set({ hasSeenOnboarding: true });
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  },

  registerForPushNotificationsAsync: async (userId) => {
    if (Platform.OS === "web") return;

    if (!Device.isDevice) {
      console.log("Must use physical device for Push Notifications");
      return;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.log(
          "Project ID not found. Did you run 'npx eas build:configure'?",
        );
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      const token = tokenData.data;
      console.log("🔥 Push Token:", token);

      if (token && userId) {
        const { error } = await supabase.from("profiles").upsert({
          id: userId,
          expo_push_token: token,
          updated_at: new Date(),
        });

        if (error) console.error("Error saving token to DB:", error);
      }
    } catch (error) {
      console.error("Error getting push token:", error);
    }
  },

  register: async (
    username,
    email,
    password,
    college,
    branch,
    avatarBase64,
  ) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            username,
            college,
            branch,
          },
        },
      });

      if (error) throw error;

      set({ isLoading: false });
      return { success: true, requiresVerification: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  verifySignupOtp: async (email, token) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      if (error) throw error;

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  resendSignupOtp: async (email) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }

    set({
      session: data.session,
      user: data.user,
      token: data.session.access_token,
      isLoading: false,
    });

    get().registerForPushNotificationsAsync(data.user.id);

    return { success: true };
  },

  checkAuth: async () => {
    try {
      // 1. Restore onboarding status from storage FIRST
      const onboardingStatus = await AsyncStorage.getItem(
        "@has_seen_onboarding",
      );
      set({ hasSeenOnboarding: onboardingStatus === "true" });

      // 2. Initial check on app boot - attempt to restore session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      // 3. Handle session retrieval errors
      if (error) {
        console.warn("⚠️ Session retrieval error:", error);
        await supabase.auth.signOut();
        set({ session: null, user: null, token: null });
      } else if (session) {
        console.log("✅ Session restored from storage");
        set({ session, user: session.user, token: session.access_token });
        get().registerForPushNotificationsAsync(session.user.id);
      } else {
        console.log("ℹ️ No session found in storage");
      }

      // 4. Setup global listener for real-time auth state changes
      // This catches TOKEN_REFRESHED events and keeps the session fresh
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, newSession) => {
        console.log("🛡️ [AuthStore] State Event Detected:", event);

        switch (event) {
          case "SIGNED_IN":
            console.log("✅ User signed in");
            set({
              session: newSession,
              user: newSession?.user || null,
              token: newSession?.access_token || null,
            });
            if (newSession?.user?.id) {
              get().registerForPushNotificationsAsync(newSession.user.id);
            }
            break;

          case "TOKEN_REFRESHED":
            console.log("🔄 Token refreshed successfully");
            set({
              session: newSession,
              user: newSession?.user || null,
              token: newSession?.access_token || null,
            });
            break;

          case "SIGNED_OUT":
          case "USER_DELETED":
            console.log("🚪 User signed out or deleted");
            set({ session: null, user: null, token: null });
            break;

          case "USER_UPDATED":
            if (newSession?.user) {
              console.log("👤 User info updated");
              set({ user: newSession.user });
            }
            break;

          default:
            if (newSession) {
              set({
                session: newSession,
                user: newSession.user,
                token: newSession.access_token,
              });
            }
        }
      });

      // Return cleanup function
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error("❌ Auth initialization failed:", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, token: null });
  },

  refreshSession: async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();

      if (error) {
        console.warn("❌ Session refresh failed:", error);
        // If refresh fails, sign out the user
        await supabase.auth.signOut();
        set({ session: null, user: null, token: null });
        return { success: false, error: error.message };
      }

      if (session) {
        console.log("✅ Session refreshed successfully");
        set({ session, user: session.user, token: session.access_token });
        return { success: true };
      }

      return { success: false, error: "No session returned" };
    } catch (error) {
      console.error("❌ Unexpected error during session refresh:", error);
      return { success: false, error: error.message };
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true });
    try {
      const redirectUrl = Linking.createURL("/reset-password");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  deleteAccount: async () => {
    const { user } = get();
    if (!user) return { success: false, error: "No user logged in" };

    set({ isLoading: true });

    try {
      const userId = user.id;

      const deleteUserFolder = async (bucketName) => {
        const { data: files, error: listError } = await supabase.storage
          .from(bucketName)
          .list(userId);

        if (listError || !files || files.length === 0) return;

        const pathsToDelete = files.map((file) => `${userId}/${file.name}`);

        await supabase.storage.from(bucketName).remove(pathsToDelete);
      };

      await Promise.all([
        deleteUserFolder("avatars"),
        deleteUserFolder("experience-uploads"),
      ]);

      const { error: rpcError } = await supabase.rpc("delete_user");
      if (rpcError) throw rpcError;

      await supabase.auth.signOut();
      set({ session: null, user: null, token: null, isLoading: false });

      return { success: true };
    } catch (error) {
      console.error("Delete account error:", error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  sendRecoveryCode: async (email) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });

      if (error) throw error;
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  verifyRecoveryCode: async (email, code) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (error) throw error;

      set({
        session: data.session,
        user: data.user,
        token: data.session.access_token,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  uploadAvatar: async (base64File) => {
    const { user } = get();
    if (!user) return { success: false, error: "No user logged in" };

    set({ isLoading: true });

    try {
      const oldAvatarUrl = user.user_metadata?.avatar_url;
      if (oldAvatarUrl) {
        const path = oldAvatarUrl.split("/avatars/")[1];
        if (path) {
          await supabase.storage.from("avatars").remove([path]);
        }
      }

      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, decode(base64File), {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const { data: updatedData, error: updateError } =
        await supabase.auth.updateUser({
          data: { avatar_url: publicUrl },
        });

      if (updateError) throw updateError;

      set({ user: updatedData.user, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Avatar upload failed:", error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
}));
