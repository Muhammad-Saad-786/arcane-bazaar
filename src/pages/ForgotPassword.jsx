import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineMail,
  HiOutlineArrowLeft,
  HiOutlineCheck,
} from "react-icons/hi";
import useAuthStore from "../stores/useAuthStore";
import Logo from "../components/shared/Logo";
import Button from "../components/ui/Button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await forgotPassword(email);
    if (result.success) setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        <div className="glass-card p-6 sm:p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <HiOutlineCheck className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-xl font-bold text-white">Check Your Email</h1>
              <p className="text-text-muted text-sm mt-2">
                We sent a reset link to {email}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-arcane-purple hover:text-arcane-gold-light mt-4"
              >
                <HiOutlineArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white text-center mb-6">
                Forgot Password
              </h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-glass pl-12"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-arcane-purple hover:text-arcane-gold-light mt-4 text-sm"
              >
                <HiOutlineArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
