import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import useAuthStore from "../stores/useAuthStore";
import Logo from "../components/shared/Logo";
import Button from "../components/ui/Button";
export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { resetPassword } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    const result = await resetPassword(password);
    if (result.success) navigate("/login");
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
          <h1 className="text-xl font-bold text-white text-center mb-6">
            Reset Password
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                New Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="input-glass pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="input-glass pl-12"
                  required
                />
              </div>
            </div>
            {error && <p className="text-danger text-xs">{error}</p>}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
