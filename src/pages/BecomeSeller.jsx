import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineGlobe,
  HiOutlineCurrencyDollar,
  HiOutlineLightningBolt,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineClipboardCheck,
  HiOutlineArrowRight,
  HiOutlineBadgeCheck,
  HiOutlineClipboardList,
  HiOutlineExclamation,
  HiOutlineLockClosed,
  HiOutlineClock,
  HiOutlineBan,
} from "react-icons/hi";
import useAuthStore from "../stores/useAuthStore";
import { supabase } from "../lib/supabase";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

const benefits = [
  {
    icon: HiOutlineGlobe,
    title: "Global Reach",
    desc: "Access millions of verified buyers across 100+ countries. Your listings are visible worldwide 24/7.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "TradeShield Protection",
    desc: "Zero chargebacks. Zero payment fraud. Every transaction is protected by our escrow system.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: "Instant Payouts",
    desc: "Withdraw earnings to PayPal, Crypto, Bank Transfer, Skrill, Payoneer, and 20+ payment methods.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: HiOutlineLightningBolt,
    title: "Lightning Fast Setup",
    desc: "Get verified in minutes. List your first offer in under 5 minutes. Start earning immediately.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

const tools = [
  {
    icon: HiOutlineClipboardCheck,
    title: "Bulk Uploads",
    desc: "Upload hundreds of offers in seconds. Import CSV, edit, and publish instantly.",
  },
  {
    icon: HiOutlineChartBar,
    title: "Seller Analytics",
    desc: "Track sales, conversion rates, and revenue in real-time with detailed dashboards.",
  },
  {
    icon: HiOutlineClipboardList,
    title: "Auto-Delivery",
    desc: "Deliver digital goods instantly via API. Zero manual work, 24/7 automation.",
  },
  {
    icon: HiOutlineUsers,
    title: "Influencer Growth",
    desc: "Top streamers drive buyers to your listings. Grow your reach exponentially.",
  },
];

const expectations = [
  {
    icon: HiOutlineBadgeCheck,
    title: "Professional Conduct",
    desc: "Be clear, polite and honest in listings and chats.",
    color: "text-green-400",
  },
  {
    icon: HiOutlineClock,
    title: "Reliable Delivery",
    desc: "Deliver on time. Mark the order as complete only after successful delivery.",
    color: "text-blue-400",
  },
  {
    icon: HiOutlineLockClosed,
    title: "Platform Integrity",
    desc: "Keep all communication and payments on Arcane Bazaar for safety.",
    color: "text-purple-400",
  },
];

const keepInMind = [
  {
    icon: HiOutlineExclamation,
    title: "Refunds",
    desc: "Buyers can get refunds for false, incomplete or late deliveries.",
    color: "text-yellow-400",
  },
  {
    icon: HiOutlineBan,
    title: "Account Suspension",
    desc: "Repeated or serious violations can lead to temporary or permanent suspension.",
    color: "text-red-400",
  },
  {
    icon: HiOutlineLockClosed,
    title: "Payout Holds",
    desc: "Funds may be held during confirmed fraud or security investigations.",
    color: "text-orange-400",
  },
];

const faqs = [
  {
    q: "How do I start selling?",
    a: "Create an account, complete ID verification through Ondato, and list your first offer. Verification takes just a few minutes.",
  },
  {
    q: "What documents do I need for verification?",
    a: "A valid government-issued ID (passport, driver's license, or national ID card). The process is secure and encrypted.",
  },
  {
    q: "How long does verification take?",
    a: "Most verifications are approved within 5-10 minutes. Manual reviews may take up to 24 hours.",
  },
  {
    q: "When do I get paid?",
    a: "Payment is released immediately after the buyer confirms delivery. Withdraw anytime to your preferred method.",
  },
  {
    q: "What are the fees?",
    a: "Arcane Bazaar charges a competitive 5-8% fee per transaction. No hidden costs or monthly fees.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. We use Ondato for KYC verification with bank-level encryption. Your data is never shared.",
  },
];

export default function BecomeSeller() {
  const { profile, user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const handleStartVerification = () => {
    if (!user) {
      toast.error("Please log in first");
      navigate("/login");
      return;
    }
    setShowVerification(true);
    setTimeout(() => {
      document
        .getElementById("verification-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleBeginKYC = async () => {
    if (profile?.role === "seller") {
      navigate("/seller-dashboard");
      return;
    }

    setLoading(true);
    // In production, redirect to Ondato verification URL
    // For now, update role directly
    const { error } = await supabase
      .from("profiles")
      .update({ role: "seller", kyc_verified: false, kyc_provider: "ondato" })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      toast.error("Failed to start verification");
    } else {
      toast.success(
        "Verification process started! You will be redirected to Ondato.",
      );
      // In production: window.location.href = 'ONDA TO_VERIFICATION_URL'
      setTimeout(() => navigate("/seller-dashboard"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-arcane-dark">
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-arcane-purple/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-arcane-purple/3 rounded-full blur-3xl" />

        <div className="relative section-container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.05] tracking-tight"
          >
            Start Making Money
            <br />
            <span className="text-arcane-gold-light">on Arcane Bazaar</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-text-secondary text-lg max-w-2xl mx-auto"
          >
            Reach millions of verified gamers who buy gaming goods daily. Get
            verified in minutes and start earning.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Button onClick={handleStartVerification} variant="gold" size="lg">
              <HiOutlineShieldCheck className="w-5 h-5" />
              Start Verification
              <HiOutlineArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-text-muted text-sm mt-3">
              Secure KYC via Ondato • Takes only a few minutes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-8 sm:gap-12"
          >
            {[
              { value: "135+", label: "Games Supported" },
              { value: "10K+", label: "Active Sellers" },
              { value: "$50M+", label: "Earned by Sellers" },
              { value: "4.8", label: "Seller Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Verification Section */}
      <section
        id="verification-section"
        className="section-container py-12 sm:py-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-10 mt-5">
            <div className="w-16 h-16 rounded-2xl bg-arcane-purple/10 flex items-center justify-center mx-auto mb-4">
              <HiOutlineShieldCheck className="w-8 h-8 text-arcane-purple" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Before You{" "}
              <span className="text-arcane-gold-light">Start Selling</span>
            </h2>
            <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
              Here's what we expect from every seller and what to know before
              starting verification, which only takes a few minutes.
            </p>
          </div>

          {/* What We Expect */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <HiOutlineClipboardList className="w-6 h-6 text-arcane-purple" />
              What We Expect from Sellers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {expectations.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="glass-card p-5 h-full">
                    <item.icon className={`w-8 h-8 ${item.color} mb-3`} />
                    <h4 className="text-white font-semibold text-sm mb-1">
                      {item.title}
                    </h4>
                    <p className="text-text-muted text-xs">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Keep in Mind */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <HiOutlineExclamation className="w-6 h-6 text-arcane-gold" />
              What to Keep in Mind
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {keepInMind.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="glass-card p-5 h-full">
                    <item.icon className={`w-8 h-8 ${item.color} mb-3`} />
                    <h4 className="text-white font-semibold text-sm mb-1">
                      {item.title}
                    </h4>
                    <p className="text-text-muted text-xs">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Start Verification Button */}
          <div className="text-center">
            <Button
              onClick={handleBeginKYC}
              variant="gold"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Starting Verification..."
              ) : (
                <>
                  <HiOutlineShieldCheck className="w-5 h-5" />
                  Begin ID Verification
                </>
              )}
            </Button>
            <p className="text-text-muted text-xs mt-3">
              Powered by <span className="text-white font-medium">Ondato</span>{" "}
              • Secure KYC • Takes ~5 minutes
            </p>
          </div>
        </motion.div>
      </section>

      {/* Benefits Grid */}
      <section className="section-container py-12 sm:py-20">
        <div className="text-center mb-10 mt-3">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Why Sell on{" "}
            <span className="text-arcane-gold-light">Arcane Bazaar</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="glass-card-hover p-6 h-full">
                <div
                  className={`w-12 h-12 rounded-2xl ${benefit.bg} flex items-center justify-center mb-4`}
                >
                  <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section-container py-12 sm:py-20">
        <div className="text-center mb-10 mt-6">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Seller <span className="text-arcane-gold-light">FAQs</span>
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <details className="group glass-card">
                <summary className="p-5 cursor-pointer list-none flex items-center justify-between">
                  <span className="text-white font-medium text-sm sm:text-base pr-4">
                    {faq.q}
                  </span>
                  <span className="text-arcane-purple text-lg flex-shrink-0 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-text-secondary text-sm">{faq.a}</p>
              </details>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-container py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-arcane-purple/20 via-arcane-dark to-arcane-gold/10 p-8 sm:p-12 text-center sm:mt-6 mt-4"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Ready to Start Earning?
          </h2>
          <p className="text-text-secondary mt-4 max-w-xl mx-auto">
            Complete verification in minutes and start selling to millions of
            gamers worldwide.
          </p>
          <Button
            onClick={handleBeginKYC}
            variant="gold"
            size="lg"
            className="mt-6"
            disabled={loading}
          >
            <HiOutlineShieldCheck className="w-5 h-5" />
            Begin ID Verification
          </Button>
        </motion.div>
      </section>

      <div className="h-20" />
    </div>
  );
}
