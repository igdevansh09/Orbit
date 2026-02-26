import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { decode } from "base64-arraybuffer";
import * as Linking from "expo-linking";
import { Platform, Alert } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        set({ session, user: session.user, token: session.access_token });
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

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, token: null });
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
