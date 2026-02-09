import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { decode } from "base64-arraybuffer";

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  // ... keep register, login, checkAuth, logout as they are ...
  // (Paste the existing functions here if needed, or just append this new one)

  register: async (
    username,
    email,
    password,
    college,
    branch,
    avatarBase64,
  ) => {
    // ... (Keep existing register logic) ...
    // Just ensure the initial upload uses a consistent naming convention if possible,
    // but the update logic below handles cleanup regardless.
    set({ isLoading: true });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          college,
          branch,
        },
      },
    });

    if (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }

    let user = data.user;
    let session = data.session;

    // Upload Initial Avatar
    if (session && user && avatarBase64) {
      const fileName = `${user.id}/${Date.now()}.jpg`; // Use timestamp for uniqueness

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, decode(avatarBase64), {
          contentType: "image/jpeg",
        });

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);

        const { data: updatedData } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl },
        });

        if (updatedData.user) user = updatedData.user;
      }
    }

    if (session) {
      set({ session, user, token: session.access_token, isLoading: false });
    } else {
      set({ isLoading: false });
    }
    return { success: true };
  },

  login: async (email, password) => {
    // ... (Keep existing login logic) ...
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
    // ... (Keep existing checkAuth logic) ...
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        set({ session, user: session.user, token: session.access_token });
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

  // ... inside useAuthStore ...

  // NEW: Send Password Reset Email
  resetPassword: async (email) => {
    set({ isLoading: true });
    try {
      // 1. Get the correct redirect URL for your environment (Expo Go vs Production)
      const redirectUrl = Linking.createURL("/reset-password");
      console.log("Redirecting to:", redirectUrl); // Check your console for this URL!

      // 2. Send the email with this dynamic URL
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      // ... error handling
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // --- NEW: UPLOAD & DELETE OLD AVATAR ---
  uploadAvatar: async (base64File) => {
    const { user } = get();
    if (!user) return { success: false, error: "No user logged in" };

    set({ isLoading: true });

    try {
      // 1. DELETE OLD AVATAR (If exists)
      const oldAvatarUrl = user.user_metadata?.avatar_url;
      if (oldAvatarUrl) {
        // Extract the path from the URL.
        // URL format: .../storage/v1/object/public/avatars/USER_ID/FILENAME.jpg
        // We need: USER_ID/FILENAME.jpg
        const path = oldAvatarUrl.split("/avatars/")[1];
        if (path) {
          await supabase.storage.from("avatars").remove([path]);
          console.log("Old avatar deleted:", path);
        }
      }

      // 2. UPLOAD NEW AVATAR
      // We use a timestamp to force the browser/app to refresh the image
      const fileName = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, decode(base64File), {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 3. GET PUBLIC URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // 4. UPDATE USER METADATA
      const { data: updatedData, error: updateError } =
        await supabase.auth.updateUser({
          data: { avatar_url: publicUrl },
        });

      if (updateError) throw updateError;

      // 5. UPDATE LOCAL STATE
      set({ user: updatedData.user, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error("Avatar upload failed:", error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
}));
