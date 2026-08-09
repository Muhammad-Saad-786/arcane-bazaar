import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineStar,
} from "react-icons/hi";
import { supabase } from "../../lib/supabase";
import CurrencySelector from "../ui/CurrencySelector";
import Button from "../ui/Button";

export default function HeroSection() {
  const [stats, setStats] = useState({ listings: 0, games: 0, users: 0 });
  const videoRef = useRef(null);

  useEffect(() => {
    fetchStats();
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const fetchStats = async () => {
    const [{ count: listings }, { count: games }, { count: users }] =
      await Promise.all([
        supabase
          .from("listings")
          .select("*", { count: "exact" })
          .eq("status", "active"),
        supabase
          .from("games")
          .select("*", { count: "exact" })
          .eq("is_active", true),
        supabase.from("profiles").select("*", { count: "exact" }),
      ]);
    setStats({ listings: listings || 0, games: games || 0, users: users || 0 });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          src="/hero-1.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-arcane-dark via-arcane-dark/80 to-arcane-dark/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-arcane-dark via-transparent to-arcane-dark/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full section-container py-20 sm:py-32">
        <div className="max-w-3xl">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold leading-[1.05] tracking-tight"
          >
            Buy & Sell
            <br />
            <span className="text-arcane-gold-light">Gaming Accounts</span>
            <br />
            <span className="text-white">Instantly</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 sm:mt-6 text-text-secondary text-base sm:text-lg max-w-lg leading-relaxed"
          >
            The most trusted marketplace for gaming accounts, currency, items,
            and boosting services across {stats.games}+ popular games.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start gap-3"
          >
            <Link to="/marketplace">
              <Button variant="primary" size="lg">
                <HiOutlineSearch className="w-5 h-5" />
                Browse Marketplace
              </Button>
            </Link>
            <Link to="/sell">
              <Button variant="gold" size="lg">
                <HiOutlineLightningBolt className="w-5 h-5" />
                Start Selling
              </Button>
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 sm:mt-12 flex flex-wrap gap-6 sm:gap-10"
          >
            {[
              {
                label: "Active Listings",
                value: stats.listings.toLocaleString(),
              },
              { label: "Games Supported", value: stats.games },
              { label: "Happy Users", value: stats.users.toLocaleString() },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {stat.value}+
                </div>
                <div className="text-sm text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Currency Selector */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <CurrencySelector />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
