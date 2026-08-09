import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineBadgeCheck,
  HiOutlineCurrencyDollar,
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineUsers,
} from "react-icons/hi";
import useAuthStore from "../stores/useAuthStore";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

const benefits = [
  {
    icon: HiOutlineCurrencyDollar,
    title: "Earn Money",
    desc: "Turn your gaming accounts into cash",
  },
  {
    icon: HiOutlineUsers,
    title: "Reach Millions",
    desc: "Access our global buyer base",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Secure Payments",
    desc: "Escrow protection on every sale",
  },
  {
    icon: HiOutlineStar,
    title: "Build Reputation",
    desc: "Earn ratings and loyal customers",
  },
];

export default function BecomeSeller() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleBecomeSeller = async () => {
    if (!profile) {
      toast.error("Please log in first");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: "seller" })
      .eq("id", profile.id);

    setLoading(false);

    if (error) {
      toast.error("Failed to switch to seller");
    } else {
      toast.success("You are now a seller!");
      navigate("/seller-dashboard");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-2xl bg-arcane-gold/10 flex items-center justify-center mx-auto mb-6">
            <HiOutlineBadgeCheck className="w-10 h-10 text-arcane-gold" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Become a <span className="text-arcane-gold-light">Seller</span>
          </h1>
          <p className="text-text-secondary mt-4 max-w-lg mx-auto">
            Join thousands of sellers earning money by selling gaming accounts,
            currency, and services.
          </p>
        </motion.div>

        {/* Benefits */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-5 text-center h-full">
                <b.icon className="w-8 h-8 text-arcane-gold mx-auto mb-3" />
                <h3 className="text-white font-semibold text-sm">{b.title}</h3>
                <p className="text-text-muted text-xs mt-1">{b.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white">
            Ready to Start Selling?
          </h2>
          <p className="text-text-muted mt-2">
            Switch to seller mode and list your first item in minutes.
          </p>
          <Button
            onClick={handleBecomeSeller}
            variant="gold"
            size="lg"
            className="mt-6"
            disabled={loading}
          >
            {loading ? "Switching..." : "Become a Seller"}
          </Button>
          {profile?.role === "seller" && (
            <p className="text-success text-sm mt-3">
              You are already a seller!
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
