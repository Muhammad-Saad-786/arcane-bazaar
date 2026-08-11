import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineMail,
  HiOutlineCheck,
  HiOutlineArrowLeft,
  HiOutlineRefresh,
} from "react-icons/hi";
import { supabase } from "../lib/supabase";
import Logo from "../components/shared/Logo";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function VerifyEmail() {
  const [code, setCode] = useState(["", "", "", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 7 && value) {
      const finalCode = [...newCode.slice(0, 7), value].join("");
      if (finalCode.length === 8) {
        handleVerify(finalCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 8);
    if (pasted.length === 8) {
      const newCode = pasted.split("");
      setCode(newCode);
      handleVerify(pasted);
    }
  };

  const handleVerify = async (verificationCode) => {
    if (verificationCode.length !== 8) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: "signup",
      });

      console.log("Verify result:", { data, error: verifyError });

      if (verifyError) {
        setError(
          verifyError.message || "Invalid or expired code. Please try again.",
        );
        setCode(["", "", "", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      setVerified(true);
      toast.success("Email verified successfully! 🎉");

      // Redirect to login after short delay
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Email verified! You can now sign in." },
        });
      }, 1500);
    } catch (err) {
      console.error("Verify error:", err);
      setError("Verification failed. Please try again.");
      setCode(["", "", "", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("New code sent to your email!");
      setCode(["", "", "", "", "", "", "", ""]);
      setError("");
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-arcane-dark">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <HiOutlineCheck className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
          <p className="text-text-muted mt-2">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-arcane-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="glass-card p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-arcane-purple/10 flex items-center justify-center mx-auto mb-6">
            <HiOutlineMail className="w-8 h-8 text-arcane-purple" />
          </div>

          <h1 className="text-xl font-bold text-white">Check Your Email</h1>
          <p className="text-text-muted text-sm mt-2">
            Enter the verification code sent to
          </p>
          <p className="text-white font-medium mt-1 break-all">{email}</p>

          {/* 8-Digit Code Input */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-6">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-10 h-12 sm:w-11 sm:h-14 text-center text-lg sm:text-xl font-bold bg-arcane-surface border rounded-xl text-white outline-none transition-all ${
                  error
                    ? "border-danger"
                    : digit
                      ? "border-arcane-purple"
                      : "border-arcane-border"
                } focus:border-arcane-purple focus:ring-2 focus:ring-arcane-purple/20`}
              />
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-danger text-sm mt-3"
            >
              {error}
            </motion.p>
          )}

          <Button
            onClick={() => handleVerify(code.join(""))}
            variant="primary"
            size="lg"
            className="w-full mt-6"
            disabled={loading || code.join("").length !== 8}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              <>
                <HiOutlineCheck className="w-5 h-5" />
                Verify Email
              </>
            )}
          </Button>

          <div className="mt-4 space-y-3">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-arcane-purple hover:text-arcane-gold-light transition-colors disabled:opacity-50 flex items-center gap-1 justify-center w-full"
            >
              <HiOutlineRefresh
                className={`w-4 h-4 ${resending ? "animate-spin" : ""}`}
              />
              {resending ? "Sending..." : "Resend Code"}
            </button>

            <p className="text-text-muted text-xs">
              Check spam folder if you don't see the email
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-white mt-4 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
