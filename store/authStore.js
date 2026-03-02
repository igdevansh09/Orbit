import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { decode } from "base64-arraybuffer";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  register: async (
    username,
    email,
    password,
    college,
    branch,
  ) => {
    set({ isLoading: true });

    try {
      const { error } = await supabase.auth.signUp({
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
      const { error } = await supabase.auth.verifyOtp({
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

    return { success: true };
  },

  checkAuth: async () => {
    try {
      const onboardingStatus = await AsyncStorage.getItem(
        "@has_seen_onboarding",
      );
      set({ hasSeenOnboarding: onboardingStatus === "true" });

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.warn("⚠️ Session retrieval error:", error);
        await supabase.auth.signOut();
        set({ session: null, user: null, token: null });
      } else if (session) {
        console.log("✅ Session restored from storage");
        set({ session, user: session.user, token: session.access_token });
      } else {
        console.log("ℹ️ No session found in storage");
      }

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
          const { error: removeError } = await supabase.storage
            .from("avatars")
            .remove([path]);
          if (removeError) {
            console.error(
              "Storage delete failed. You are missing RLS policies:",
              removeError.message,
            );
          } else {
            console.log("Old avatar deleted successfully from storage.");
          }
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

      const { error: syncError } = await supabase
        .from("experiences")
        .update({ user_avatar: publicUrl })
        .eq("user_id", user.id);

      if (syncError)
        console.warn("Failed to sync avatar to old posts:", syncError);

      set({ user: updatedData.user, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Avatar upload failed:", error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  removeAvatar: async () => {
    const { user } = get();
    if (!user) return { success: false, error: "No user logged in" };

    set({ isLoading: true });
    try {
      const oldAvatarUrl = user.user_metadata?.avatar_url;
      if (oldAvatarUrl) {
        const path = oldAvatarUrl.split("/avatars/")[1];
        if (path) {
          const { error: removeError } = await supabase.storage
            .from("avatars")
            .remove([path]);
          if (removeError) {
            console.error(
              "Storage delete failed. You are missing RLS policies:",
              removeError.message,
            );
          } else {
            console.log("Old avatar deleted successfully from storage.");
          }
        }
      }

      const { data: updatedData, error: updateError } =
        await supabase.auth.updateUser({
          data: { avatar_url: null },
        });

      if (updateError) throw updateError;

      const { error: syncError } = await supabase
        .from("experiences")
        .update({ user_avatar: null })
        .eq("user_id", user.id);

      if (syncError)
        console.warn("Failed to remove avatar from old posts:", syncError);

      set({ user: updatedData.user, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Avatar removal failed:", error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
}));
