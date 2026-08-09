import { create } from "zustand";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (session?.user) {
        set({ session, user: session.user });
        await get().fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error("Auth init error:", error);
    } finally {
      set({ loading: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ session, user: session.user });
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null, profile: null, session: null });
      }
      set({ loading: false });
    });
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Fetch profile error:", error);
      return;
    }
    set({ profile: data });
  },

  // Email Sign Up
  signUp: async (email, password, username) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data?.user?.identities?.length === 0) {
        toast.error("This email is already registered");
        return { success: false, error: "Email already registered" };
      }

      toast.success("Account created! Please check your email to verify.");
      return { success: true, user: data.user };
    } catch (error) {
      set({ error: error.message });
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      set({ loading: false });
    }
  },

  // Email Sign In
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Welcome back!");
      return { success: true, user: data.user };
    } catch (error) {
      set({ error: error.message });
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      set({ loading: false });
    }
  },

  // Google Sign In
  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  },

  // Facebook Sign In
  signInWithFacebook: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  },

  // Discord Sign In
  signInWithDiscord: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return { success: false };
    }
    toast.success("Reset link sent to your email!");
    return { success: true };
  },

  // Reset Password
  resetPassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
      return { success: false };
    }
    toast.success("Password updated!");
    return { success: true };
  },

  // Sign Out
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, session: null });
    toast.success("Logged out");
  },

  // Update Profile
  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return { success: false };
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (error) return { success: false, error: error.message };
    await get().fetchProfile(user.id);
    return { success: true };
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
