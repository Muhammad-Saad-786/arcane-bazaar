import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineLockClosed,
} from "react-icons/hi";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import useAuthStore from "../../stores/useAuthStore";
import { supabase } from "../../lib/supabase";

const verificationSteps = [
  "Confirm your seller type",
  "Continue to Persona Sandbox",
  "Complete the test identity flow",
  "Wait for the secure approval webhook",
];

export default function SellerDetails() {
  const navigate = useNavigate();
  const { user, profile, fetchProfile } = useAuthStore();

  const [sellerType, setSellerType] = useState("individual");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const isVerifiedSeller =
    profile?.role === "seller" &&
    profile?.verified_seller === true &&
    profile?.kyc_verified === true &&
    profile?.kyc_provider === "persona";

  useEffect(() => {
    if (!user) return;

    const checkVerification = async () => {
      setCheckingStatus(true);

      const { data, error } = await supabase
        .from("seller_verifications")
        .select(
          "id, status, provider, provider_status, seller_type, submitted_at",
        )
        .eq("seller_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Verification status error:", error);
      } else if (data) {
        setVerificationStatus(data);

        if (data.seller_type) {
          setSellerType(data.seller_type);
        }
      }

      setCheckingStatus(false);
    };

    checkVerification();
  }, [user]);

  useEffect(() => {
    if (profile?.banned) {
      navigate("/", { replace: true });
      return;
    }

    if (profile?.role === "admin" || isVerifiedSeller) {
      navigate("/seller-dashboard", { replace: true });
    }
  }, [profile, isVerifiedSeller, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error("Please sign in before starting verification");
      navigate("/login");
      return;
    }

    if (!agreed) {
      toast.error("Please accept the Terms and Seller Agreement");
      return;
    }

    if (!["individual", "company"].includes(sellerType)) {
      toast.error("Please select a valid seller type");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "persona-create-inquiry",
        {
          body: {
            sellerType,
          },
        },
      );

      if (error) {
        throw new Error(error.message || "Unable to start verification");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.verificationUrl) {
        throw new Error("Persona verification URL was not returned");
      }

      toast.success("Opening secure Persona verification...");
      window.location.assign(data.verificationUrl);
    } catch (error) {
      console.error("Persona verification error:", error);
      toast.error(error.message || "Unable to start Persona verification");
      setLoading(false);
    }
  };

  const refreshVerificationStatus = async () => {
    if (!user) return;

    setCheckingStatus(true);

    await fetchProfile(user.id);

    const { data, error } = await supabase
      .from("seller_verifications")
      .select(
        "id, status, provider, provider_status, seller_type, submitted_at",
      )
      .eq("seller_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.error("Unable to refresh verification status");
    } else {
      setVerificationStatus(data);

      if (data?.status === "approved") {
        toast.success("Seller verification approved!");
        await fetchProfile(user.id);
        navigate("/seller-dashboard", { replace: true });
        return;
      }

      toast.success("Verification status refreshed");
    }

    setCheckingStatus(false);
  };

  const hasPendingVerification =
    verificationStatus?.status === "pending" &&
    verificationStatus?.provider === "persona";

  return (
    <div className="min-h-screen bg-arcane-dark pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-arcane-gold/10 flex items-center justify-center mx-auto mb-4">
            <HiOutlineShieldCheck className="w-8 h-8 text-arcane-gold" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Seller ID{" "}
            <span className="text-arcane-gold-light">Verification</span>
          </h1>

          <p className="text-text-secondary mt-3">
            Select your seller type and continue to Persona’s secure identity
            verification flow.
          </p>
        </motion.div>

        {checkingStatus ? (
          <div className="glass-card p-8 text-center">
            <div className="w-8 h-8 border-2 border-arcane-gold border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="text-text-muted text-sm mt-4">
              Checking verification status...
            </p>
          </div>
        ) : hasPendingVerification ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
              <HiOutlineShieldCheck className="w-7 h-7 text-amber-400" />
            </div>

            <h2 className="text-xl font-bold text-white text-center mt-4">
              Verification in Progress
            </h2>

            <p className="text-text-muted text-sm text-center mt-2">
              Your Persona verification has been created. Complete the Persona
              flow if it is still open, then refresh your status.
            </p>

            {verificationStatus?.provider_status && (
              <div className="mt-5 p-3 rounded-xl bg-arcane-surface border border-arcane-border text-center">
                <p className="text-text-muted text-xs">Persona status</p>

                <p className="text-arcane-gold font-semibold capitalize mt-1">
                  {verificationStatus.provider_status.replaceAll("_", " ")}
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="gold"
              size="lg"
              className="w-full mt-5"
              onClick={refreshVerificationStatus}
              disabled={checkingStatus}
            >
              Refresh Verification Status
            </Button>

            <button
              type="button"
              onClick={() => setVerificationStatus(null)}
              className="w-full mt-3 text-sm text-text-muted hover:text-white transition-colors"
            >
              Start a new verification attempt
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
          >
            <div className="glass-card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Select Seller Type
                </h2>

                <p className="text-text-muted text-sm mt-1">
                  Select the option that matches how you will sell.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSellerType("individual")}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    sellerType === "individual"
                      ? "border-arcane-gold bg-arcane-gold/10"
                      : "border-arcane-border hover:border-arcane-gold/40"
                  }`}
                >
                  <HiOutlineUser
                    className={`w-7 h-7 mb-3 ${
                      sellerType === "individual"
                        ? "text-arcane-gold"
                        : "text-text-muted"
                    }`}
                  />

                  <h3 className="text-white font-semibold">
                    Individual Seller
                  </h3>

                  <p className="text-text-muted text-xs mt-1 leading-relaxed">
                    Sell gaming accounts, items and services as an individual.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSellerType("company")}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    sellerType === "company"
                      ? "border-arcane-gold bg-arcane-gold/10"
                      : "border-arcane-border hover:border-arcane-gold/40"
                  }`}
                >
                  <HiOutlineOfficeBuilding
                    className={`w-7 h-7 mb-3 ${
                      sellerType === "company"
                        ? "text-arcane-gold"
                        : "text-text-muted"
                    }`}
                  />

                  <h3 className="text-white font-semibold">Business Seller</h3>

                  <p className="text-text-muted text-xs mt-1 leading-relaxed">
                    Sell on behalf of a registered company or organization.
                  </p>
                </button>
              </div>

              <div className="rounded-xl bg-arcane-surface border border-arcane-border p-4">
                <h3 className="text-white font-medium text-sm">
                  Verification process
                </h3>

                <div className="space-y-3 mt-4">
                  {verificationSteps.map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-arcane-gold/10 flex items-center justify-center flex-shrink-0">
                        <HiOutlineCheck className="w-4 h-4 text-arcane-gold" />
                      </div>

                      <p className="text-text-secondary text-sm">
                        {index + 1}. {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
                <HiOutlineLockClosed className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />

                <p className="text-text-secondary text-xs leading-relaxed">
                  Arcane Bazaar does not collect or store your identity
                  document. Persona processes the verification inside its secure
                  flow. Development uses Persona Sandbox test data.
                </p>
              </div>

              <div className="flex items-start gap-3 pt-4 border-t border-arcane-border">
                <input
                  id="seller-agreement"
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-arcane-border bg-arcane-surface"
                />

                <label
                  htmlFor="seller-agreement"
                  className="text-sm text-text-secondary"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-arcane-gold hover:text-arcane-gold-light"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/terms"
                    className="text-arcane-gold hover:text-arcane-gold-light"
                  >
                    Seller Agreement
                  </Link>
                  .
                </label>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                disabled={loading || !agreed}
              >
                {loading ? (
                  "Creating secure verification..."
                ) : (
                  <>
                    <HiOutlineShieldCheck className="w-5 h-5" />
                    Continue to Persona Verification
                    <HiOutlineArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
}
