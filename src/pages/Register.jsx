import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheck,
  HiOutlineX,
} from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaDiscord } from "react-icons/fa";
import useAuthStore from "../stores/useAuthStore";
import Logo from "../components/shared/Logo";
import Button from "../components/ui/Button";
import SEO from "../components/ui/SEO";
// Temp email domains to block
const tempEmailDomains = [
  "temp-mail.org",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "yopmail.com",
  "throwaway.email",
  "sharklasers.com",
  "trashmail.com",
  "tempinbox.com",
  "emailondeck.com",
  "moakt.com",
  "dispostable.com",
  "maildrop.cc",
  "harakirimail.com",
];

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Max 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  email: z
    .string()
    .email("Please enter a valid email")
    .refine((email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      return !tempEmailDomains.includes(domain);
    }, "Temporary email addresses are not allowed"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Must contain at least one special character",
    ),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const {
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithDiscord,
    user,
  } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch("password", "");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user]);

  useEffect(() => {
    setPassword(watchedPassword);
  }, [watchedPassword]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await signUp(data.email, data.password, data.username);
    setIsLoading(false);

    console.log("Register result:", result);

    if (result.success) {
      // Redirect to verification page with email
      navigate("/verify-email", { state: { email: data.email } });
    }
  };

  // Password strength checks
  const passwordChecks = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "One uppercase letter", passed: /[A-Z]/.test(password) },
    { label: "One number", passed: /[0-9]/.test(password) },
    {
      label: "One special character (!@#$%^&*)",
      passed: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const allChecksPassed = passwordChecks.every((check) => check.passed);

  return (
    <>
      <SEO
        title="Create Account"
        description="Join Arcane Bazaar - the global gaming marketplace. Start buying and selling today."
      />
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="glass-card p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-display font-extrabold text-white">
                Create Account
              </h1>
              <p className="text-text-muted text-sm mt-2">
                Join the ultimate gaming marketplace
              </p>
            </div>

            {/* Social Sign Up */}
            <div className="space-y-3 mb-6">
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-arcane-surface border border-arcane-border hover:border-arcane-purple/30 text-white font-medium text-sm transition-all"
              >
                <FcGoogle className="w-5 h-5" /> Continue with Google
              </button>
              <button
                onClick={signInWithDiscord}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 hover:border-[#5865F2]/40 text-white font-medium text-sm transition-all"
              >
                <FaDiscord className="w-5 h-5 text-[#5865F2]" /> Continue with
                Discord
              </button>
              <button
                onClick={signInWithFacebook}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 hover:border-[#1877F2]/40 text-white font-medium text-sm transition-all"
              >
                <FaFacebook className="w-5 h-5 text-[#1877F2]" /> Continue with
                Facebook
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-arcane-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 text-white text-bold">Or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Username
                </label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted z-10" />
                  <input
                    type="text"
                    {...register("username")}
                    placeholder="Your username"
                    className="w-full bg-arcane-surface border border-arcane-border rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-text-muted outline-none focus:border-arcane-purple/50 focus:ring-2 focus:ring-arcane-purple/20 transition-all text-sm"
                  />
                </div>
                {errors.username && (
                  <p className="text-danger text-xs mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

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
                    className="w-full bg-arcane-surface border border-arcane-border rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-text-muted outline-none focus:border-arcane-purple/50 focus:ring-2 focus:ring-arcane-purple/20 transition-all text-sm"
                  />
                </div>
                {errors.email && (
                  <p className="text-danger text-xs mt-1">
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
                    placeholder="Minimum 8 characters"
                    className="w-full bg-arcane-surface border border-arcane-border rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-text-muted outline-none focus:border-arcane-purple/50 focus:ring-2 focus:ring-arcane-purple/20 transition-all text-sm"
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
                  <p className="text-danger text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}

                {/* Password Strength Checks */}
                {password.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-arcane-surface border border-arcane-border space-y-2">
                    <p className="text-xs text-text-muted font-medium">
                      Password Strength
                    </p>
                    {passwordChecks.map((check) => (
                      <div
                        key={check.label}
                        className="flex items-center gap-2"
                      >
                        {check.passed ? (
                          <HiOutlineCheck className="w-4 h-4 text-success flex-shrink-0" />
                        ) : (
                          <HiOutlineX className="w-4 h-4 text-text-muted flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs ${check.passed ? "text-success" : "text-text-muted"}`}
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                    {allChecksPassed && (
                      <p className="text-xs text-success font-medium">
                        Strong password!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register("agreeToTerms")}
                  className="mt-1 w-4 h-4 rounded border-arcane-border bg-arcane-surface text-arcane-purple focus:ring-arcane-purple"
                />
                <label className="text-sm text-text-muted">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-arcane-purple hover:text-arcane-gold-light"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-arcane-purple hover:text-arcane-gold-light"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-danger text-xs">
                  {errors.agreeToTerms.message}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-arcane-purple hover:text-arcane-gold-light font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
