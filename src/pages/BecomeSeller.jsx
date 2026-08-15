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
  HiOutlineCreditCard,
  HiOutlineLockClosed,
  HiOutlineStar,
} from "react-icons/hi";
import useAuthStore from "../stores/useAuthStore";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import SEO from "../components/ui/SEO";
const benefits = [
  {
    icon: HiOutlineGlobe,
    title: "Global Audience",
    desc: "Sell to millions of verified buyers across 100+ countries. Your listings reach gamers worldwide 24/7.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "100% Payment Protection",
    desc: "Our escrow system holds payment until delivery is confirmed. Zero chargebacks. Zero fraud. Guaranteed.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: "Keep More Earnings",
    desc: "Only 5-8% fee per sale. No monthly fees, no hidden costs. Withdraw via PayPal, Crypto, Bank, Skrill & more.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: HiOutlineLightningBolt,
    title: "Start in Minutes",
    desc: "Complete verification in ~5 minutes. List your first offer immediately. Start earning today.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: HiOutlineLockClosed,
    title: "Bank-Level Security",
    desc: "KYC verification via Ondato. 256-bit encryption. Your data and earnings are always protected.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: HiOutlineChartBar,
    title: "Seller Analytics",
    desc: "Real-time dashboard with sales trends, conversion rates, and revenue tracking. Make data-driven decisions.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
];

const feeComparison = [
  {
    platform: "Arcane Bazaar",
    fee: "5-8%",
    features: "Escrow, KYC, Analytics, Bulk Upload",
    color: "text-arcane-gold",
  },
  {
    platform: "PlayerAuctions",
    fee: "5-12.99%",
    features: "Basic escrow, Limited support",
    color: "text-text-muted",
  },
  {
    platform: "Eldorado",
    fee: "5-10%",
    features: "Escrow, KYC, Limited payouts",
    color: "text-text-muted",
  },
  {
    platform: "G2G",
    fee: "4-12.99%",
    features: "Basic protection",
    color: "text-text-muted",
  },
];

const faqs = [
  {
    q: "How do I start selling?",
    a: "Create an account, complete ID verification through Ondato, and list your first offer. The entire process takes about 5 minutes.",
  },
  {
    q: "What can I sell?",
    a: "Game accounts, in-game currency, items, skins, boosting services, gift cards, and digital goods across 135+ supported games.",
  },
  {
    q: "How much does it cost?",
    a: "Arcane Bazaar charges 5-8% per completed sale. There are NO monthly fees, listing fees, or hidden charges.",
  },
  {
    q: "When do I get paid?",
    a: "Payment is released immediately after the buyer confirms delivery. Withdraw anytime to PayPal, Crypto, Bank Transfer, Skrill, or Payoneer.",
  },
  {
    q: "Is my money safe?",
    a: "Yes. All payments are held in escrow until delivery is confirmed. You're protected from chargebacks and payment fraud.",
  },
  {
    q: "How does verification work?",
    a: "You'll verify your identity through Ondato using a passport, ID card, or driver's license. It takes ~5 minutes and is required for all sellers.",
  },
];

export default function BecomeSeller() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleStartVerification = () => {
    if (!user) {
      toast.error("Please log in first");
      navigate("/login");
      return;
    }
    navigate("/verify/before-selling");
  };

  return (
    <>
      <SEO
        title="Become a Seller"
        description="Start earning money selling gaming accounts, currency, and items. Low fees, global audience."
      />
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
              The most trusted marketplace for gaming goods. Reach millions of
              verified buyers, keep more earnings, and get paid instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                onClick={handleStartVerification}
                variant="gold"
                size="lg"
              >
                <HiOutlineShieldCheck className="w-5 h-5" />
                Start Verification
                <HiOutlineArrowRight className="w-5 h-5" />
              </Button>
              <p className="text-text-muted text-sm">
                Secure KYC via Persona • Takes ~5 minutes • No upfront costs
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
                  <div className="text-sm text-text-muted mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why Sell Here */}
        <section className="section-container py-12 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Why Sell on{" "}
              <span className="text-arcane-gold-light">Arcane Bazaar</span>
            </h2>
            <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
              More protection, lower fees, and better tools than any other
              marketplace
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

        {/* Fee Comparison */}
        <section className="section-container py-12 sm:py-20">
          <div className="text-center mb-10 mt-5">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              We Charge <span className="text-arcane-gold-light">Less</span>
            </h2>
            <p className="text-text-secondary mt-3">
              Compare our fees with other platforms
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="glass-card overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-arcane-surface border-b border-arcane-border text-xs text-text-muted uppercase tracking-wider">
                <span>Platform</span>
                <span>Fee per Sale</span>
                <span>Includes</span>
              </div>
              {/* Rows */}
              {feeComparison.map((row) => (
                <div
                  key={row.platform}
                  className={`grid grid-cols-3 gap-4 p-4 border-b border-arcane-border last:border-0 ${row.platform === "Arcane Bazaar" ? "bg-arcane-gold/5" : ""}`}
                >
                  <span
                    className={`text-sm font-semibold ${row.platform === "Arcane Bazaar" ? "text-arcane-gold" : "text-white"}`}
                  >
                    {row.platform === "Arcane Bazaar" && "⭐ "}
                    {row.platform}
                  </span>
                  <span className={`text-sm font-bold ${row.color}`}>
                    {row.fee}
                  </span>
                  <span className="text-xs text-text-muted">
                    {row.features}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-container py-12 sm:py-20">
          <div className="text-center mb-10 sm:mt-5">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Frequently Asked{" "}
              <span className="text-arcane-gold-light">Questions</span>
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
                  <p className="px-5 pb-5 text-text-secondary text-sm">
                    {faq.a}
                  </p>
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
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-arcane-purple/20 via-arcane-dark to-arcane-gold/10 p-8 sm:p-12 sm:mt-7 text-center"
          >
            <div className="absolute inset-0 bg-arcane-purple/5" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
                Ready to Start Earning?
              </h2>
              <p className="text-text-secondary mt-4 max-w-xl mx-auto">
                Complete verification in minutes. List your offers. Reach
                millions of buyers worldwide.
              </p>
              <Button
                onClick={handleStartVerification}
                variant="gold"
                size="lg"
                className="mt-6"
              >
                <HiOutlineShieldCheck className="w-5 h-5" />
                Start Verification Now
                <HiOutlineArrowRight className="w-5 h-5" />
              </Button>
              <p className="text-text-muted text-xs mt-3">
                Free to start • Only pay when you sell • 5-8% fee
              </p>
            </div>
          </motion.div>
        </section>

        <div className="h-20" />
      </div>
    </>
  );
}
