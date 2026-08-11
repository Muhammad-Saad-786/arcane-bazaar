import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaDiscord } from "react-icons/fa";
import useAuthStore from "../stores/useAuthStore";
import Logo from "../components/shared/Logo";
import Button from "../components/ui/Button";
import SEO from "../components/ui/SEO";
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const {
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signInWithDiscord,
    user,
  } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError("");
    const result = await signIn(data.email, data.password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setLoginError(result.error || "Invalid email or password");
    }
    setIsLoading(false);
  };

  return (
    <>
      <SEO
        title="Sign In"
        description="Sign in to your Arcane Bazaar account to buy and sell gaming goods."
      />
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Card */}
          <div className="glass-card p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-display font-extrabold text-white">
                Welcome Back
              </h1>
              <p className="text-text-muted text-sm mt-2">
                Sign in to your Arcane Bazaar account
              </p>
            </div>

            {/* Social Login */}
            <div className="space-y-3 mb-6">
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-arcane-surface border border-arcane-border hover:border-arcane-purple/30 text-white font-medium text-sm transition-all"
              >
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </button>

              <button
                onClick={signInWithDiscord}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 hover:border-[#5865F2]/40 text-white font-medium text-sm transition-all"
              >
                <FaDiscord className="w-5 h-5 text-[#5865F2]" />
                Continue with Discord
              </button>

              <button
                onClick={signInWithFacebook}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 hover:border-[#1877F2]/40 text-white font-medium text-sm transition-all"
              >
                <FaFacebook className="w-5 h-5 text-[#1877F2]" />
                Continue with Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-arcane-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 text-white text-bold">Or</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Login Error */}
              {loginError && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center">
                  {loginError}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="you@example.com"
                    className={`w-full bg-arcane-surface border rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-text-muted outline-none focus:border-arcane-purple/50 focus:ring-2 focus:ring-arcane-purple/20 transition-all text-sm ${
                      errors.email ? "border-danger" : "border-arcane-border"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-danger text-xs mt-1.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter your password"
                    className={`w-full bg-arcane-surface border rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-text-muted outline-none focus:border-arcane-purple/50 focus:ring-2 focus:ring-arcane-purple/20 transition-all text-sm ${
                      errors.password ? "border-danger" : "border-arcane-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white z-10"
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-danger text-xs mt-1.5">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-arcane-purple hover:text-arcane-gold-light transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-text-muted">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-arcane-purple hover:text-arcane-gold-light font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
