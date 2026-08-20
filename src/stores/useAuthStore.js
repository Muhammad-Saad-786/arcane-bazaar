import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      loading: false, // Default false so cached state renders immediately
      error: null,

      // Initialize auth listener & refresh profile in the background
      initialize: async () => {
        try {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) throw sessionError;

          if (session?.user) {
            set({ session, user: session.user });
            // Background fetch to ensure fresh profile data
            get().fetchProfile(session.user.id);
          } else {
            set({ user: null, profile: null, session: null });
          }
        } catch (error) {
          console.error("Auth init error:", error);
        }

        // Realtime Auth State Listener
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            set({ session, user: session.user });
            await get().fetchProfile(session.user.id);
          } else if (event === "SIGNED_OUT") {
            set({ user: null, profile: null, session: null });
          }
        });
      },

      // Fetch profile + verify seller status from seller_verifications table
      fetchProfile: async (userId) => {
        if (!userId) return;
        try {
          const [profileRes, verificationRes] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", userId).single(),
            supabase
              .from("seller_verifications")
              .select("status")
              .eq("seller_id", userId)
              .eq("status", "approved")
              .maybeSingle(),
          ]);

          if (profileRes.error) {
            console.error("Fetch profile error:", profileRes.error);
            return;
          }

          const isSeller =
            verificationRes.data?.status === "approved" ||
            profileRes.data?.role === "seller" ||
            profileRes.data?.verified_seller === true;

          const updatedProfile = {
            ...profileRes.data,
            is_seller_verified: isSeller,
            role: isSeller ? "seller" : profileRes.data?.role || "buyer",
          };

          set({ profile: updatedProfile });
          return updatedProfile;
        } catch (err) {
          console.error("Error in fetchProfile:", err);
        }
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
            },
          });

          if (error) {
            console.error("SignUp error:", error.message);
            toast.error(error.message);
            return { success: false, error: error.message };
          }

          if (data?.user?.identities?.length === 0) {
            toast.error("This email is already registered");
            return { success: false };
          }

          toast.success("Verification code sent to your email!");
          return { success: true, email: email };
        } catch (error) {
          console.error("SignUp error:", error);
          toast.error("Registration failed");
          return { success: false };
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
          set({ session: data.session, user: data.user });
          await get().fetchProfile(data.user.id);
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
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: window.location.origin + "/auth/callback",
            },
          });
          if (error) {
            console.error("Google sign in error:", error.message);
            toast.error("Failed to sign in with Google: " + error.message);
          }
        } catch (error) {
          console.error("Google sign in error:", error);
          toast.error("Failed to sign in with Google");
        }
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
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
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
        localStorage.removeItem("arcane_auth_storage");
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
    }),
    {
      name: "arcane_auth_storage", // key in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
      }), // Persist user and profile only
    },
  ),
);

export default useAuthStore;
