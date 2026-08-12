import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineShieldCheck,
  HiOutlineBadgeCheck,
  HiOutlineClock,
  HiOutlineLockClosed,
  HiOutlineExclamation,
  HiOutlineBan,
  HiOutlineArrowRight,
  HiOutlineClipboardCheck,
} from "react-icons/hi";
import Button from "../../components/ui/Button";
import useAuthStore from "../../stores/useAuthStore";

const expectations = [
  {
    icon: HiOutlineBadgeCheck,
    title: "Professional Conduct",
    desc: "Be clear, polite and honest in listings and chats.",
    iconColor: "text-green-400",
    background: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    icon: HiOutlineClock,
    title: "Reliable Delivery",
    desc: "Deliver on time. Mark orders as delivered only after successful delivery.",
    iconColor: "text-blue-400",
    background: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: HiOutlineLockClosed,
    title: "Platform Integrity",
    desc: "Keep all communication and payments on Arcane Bazaar for safety.",
    iconColor: "text-purple-400",
    background: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
];

const keepInMind = [
  {
    icon: HiOutlineExclamation,
    title: "Refunds",
    desc: "Buyers may receive refunds for false, incomplete or late deliveries.",
    iconColor: "text-yellow-400",
    background: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    icon: HiOutlineBan,
    title: "Account Suspension",
    desc: "Repeated or serious violations may result in temporary or permanent suspension.",
    iconColor: "text-red-400",
    background: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    icon: HiOutlineLockClosed,
    title: "Payout Holds",
    desc: "Funds may be held during confirmed fraud, disputes or security investigations.",
    iconColor: "text-orange-400",
    background: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
];

export default function BeforeSelling() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);

  const isVerifiedSeller =
    profile?.role === "seller" &&
    profile?.verified_seller === true &&
    profile?.kyc_verified === true &&
    profile?.kyc_provider === "persona";

  useEffect(() => {
    if (profile?.banned) {
      navigate("/", { replace: true });
      return;
    }

    if (profile?.role === "admin" || isVerifiedSeller) {
      navigate("/seller-dashboard", { replace: true });
    }
  }, [profile, isVerifiedSeller, navigate]);

  return (
    <div className="min-h-screen bg-arcane-dark pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-arcane-gold/10 flex items-center justify-center mx-auto mb-4">
            <HiOutlineClipboardCheck className="w-8 h-8 text-arcane-gold" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Before You{" "}
            <span className="text-arcane-gold-light">Start Selling</span>
          </h1>

          <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
            Review our seller standards before starting secure identity
            verification through Persona.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <HiOutlineShieldCheck className="w-6 h-6 text-arcane-gold" />
            What We Expect from Sellers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {expectations.map((item) => (
              <div
                key={item.title}
                className={`glass-card p-6 ${item.background} ${item.border}`}
              >
                <item.icon className={`w-8 h-8 ${item.iconColor} mb-3`} />

                <h3 className="text-white font-semibold text-sm mb-1">
                  {item.title}
                </h3>

                <p className="text-text-muted text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <HiOutlineExclamation className="w-6 h-6 text-arcane-gold" />
            What to Keep in Mind
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {keepInMind.map((item) => (
              <div
                key={item.title}
                className={`glass-card p-6 ${item.background} ${item.border}`}
              >
                <item.icon className={`w-8 h-8 ${item.iconColor} mb-3`} />

                <h3 className="text-white font-semibold text-sm mb-1">
                  {item.title}
                </h3>

                <p className="text-text-muted text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            onClick={() => navigate("/verify/seller-details")}
            variant="gold"
            size="lg"
          >
            <HiOutlineShieldCheck className="w-5 h-5" />
            Continue to Verification
            <HiOutlineArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-text-muted text-xs mt-3">
            Secure verification through Persona Sandbox • No real ID required
            during development testing
          </p>
        </motion.div>
      </div>
    </div>
  );
}
