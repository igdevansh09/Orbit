import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { decode } from "base64-arraybuffer";
import * as Linking from "expo-linking";
import { Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// Configure Notification Handler
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

  // --- NEW: Register for Push Notifications ---
  registerForPushNotificationsAsync: async (userId) => {
    if (Platform.OS === "web") return;

    if (!Device.isDevice) {
      console.log("Must use physical device for Push Notifications");
      return;
    }

    try {
      // A. Check existing permission
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // B. If not granted, ASK for it (This triggers the popup!)
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        // Optional: Alert the user or fail silently
        // Alert.alert("Failed", "Push token permission denied!");
        return;
      }

      // C. Get the Project ID from app.json
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.log(
          "Project ID not found. Did you run 'npx eas build:configure'?",
        );
      }

      // D. Get the Token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      const token = tokenData.data;
      console.log("🔥 Push Token:", token);

      // E. Save Token to Supabase 'profiles' table
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

  // --- 1. REGISTER (WITH OTP VERIFICATION) ---
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
      // 1. Sign Up with email confirmation required
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Prevent auto-login
          data: {
            username,
            college,
            branch,
          },
        },
      });

      if (error) throw error;

      // Note: User will NOT be logged in yet - they need to verify email first
      // Session will be null until they verify the OTP
      set({ isLoading: false });
      return { success: true, requiresVerification: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // --- NEW: Verify Signup OTP ---
  verifySignupOtp: async (email, token) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      if (error) throw error;

      // After verification, user can login
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // --- NEW: Resend Signup OTP ---
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

  // --- 2. LOGIN ---
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

    // TRIGGER NOTIFICATION SETUP
    get().registerForPushNotificationsAsync(data.user.id);

    return { success: true };
  },

  // --- 3. CHECK AUTH ---
  checkAuth: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        set({ session, user: session.user, token: session.access_token });
        // TRIGGER NOTIFICATION SETUP
        get().registerForPushNotificationsAsync(session.user.id);
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user || null,
          token: session?.access_token || null,
        });
      });
    } catch (error) {
      console.log("Auth check error:", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // --- 4. LOGOUT ---
  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, token: null });
  },

  // --- 5. RESET PASSWORD (Email) ---
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

  // --- 6. DELETE ACCOUNT ---
  deleteAccount: async () => {
    const { user } = get();
    if (!user) return { success: false, error: "No user logged in" };

    set({ isLoading: true });

    try {
      const userId = user.id;

      // Helper: Delete files in folder
      const deleteUserFolder = async (bucketName) => {
        const { data: files, error: listError } = await supabase.storage
          .from(bucketName)
          .list(userId);

        if (listError || !files || files.length === 0) return;

        const pathsToDelete = files.map((file) => `${userId}/${file.name}`);

        await supabase.storage.from(bucketName).remove(pathsToDelete);
      };

      // Step A: Delete Images
      await Promise.all([
        deleteUserFolder("avatars"),
        deleteUserFolder("experience-uploads"),
      ]);

      // Step B: Delete User (Requires 'delete_user' RPC function in Supabase)
      const { error: rpcError } = await supabase.rpc("delete_user");
      if (rpcError) throw rpcError;

      // Step C: Cleanup
      await supabase.auth.signOut();
      set({ session: null, user: null, token: null, isLoading: false });

      return { success: true };
    } catch (error) {
      console.error("Delete account error:", error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // --- 7. SEND RECOVERY CODE (OTP) ---
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

  // --- 8. VERIFY RECOVERY CODE ---
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

  // --- 9. UPLOAD & UPDATE AVATAR ---
  uploadAvatar: async (base64File) => {
    const { user } = get();
    if (!user) return { success: false, error: "No user logged in" };

    set({ isLoading: true });

    try {
      // A. Delete Old Avatar
      const oldAvatarUrl = user.user_metadata?.avatar_url;
      if (oldAvatarUrl) {
        const path = oldAvatarUrl.split("/avatars/")[1];
        if (path) {
          await supabase.storage.from("avatars").remove([path]);
        }
      }

      // B. Upload New Avatar
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, decode(base64File), {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // C. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // D. Update Auth Metadata
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
