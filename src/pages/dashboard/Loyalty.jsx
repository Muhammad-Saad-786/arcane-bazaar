import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineStar,
  HiOutlineGift,
  HiOutlineCheck,
  HiOutlineLockClosed,
} from "react-icons/hi";
import useLoyaltyStore from "../../stores/useLoyaltyStore";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import SEO from "../../components/ui/SEO";
import LoyaltyImage from "/public/icons/pages/points.png";
const tiers = [
  {
    name: "Bronze",
    icon: "🥉",
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    min: 0,
  },
  {
    name: "Silver",
    icon: "🥈",
    color: "text-gray-300",
    bg: "bg-gray-300/10",
    min: 100,
  },
  {
    name: "Gold",
    icon: "🥇",
    color: "text-arcane-gold",
    bg: "bg-arcane-gold/10",
    min: 500,
  },
  {
    name: "Diamond",
    icon: "💎",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    min: 2000,
  },
  {
    name: "Elite",
    icon: "👑",
    color: "text-arcane-purple",
    bg: "bg-arcane-purple/10",
    min: 5000,
  },
];

const achievements = [
  {
    id: "critic",
    title: "Critic",
    desc: "Write reviews for sellers",
    target: 1,
    points: 300,
    icon: "📝",
  },
  {
    id: "trader",
    title: "Master Trader",
    desc: "Place 2 orders",
    target: 2,
    points: 400,
    icon: "🔄",
  },
  {
    id: "speed",
    title: "Speedrunner",
    desc: "Place 2 orders in one month",
    target: 2,
    points: 500,
    icon: "⚡",
  },
  {
    id: "explorer",
    title: "Explorer",
    desc: "Place order in each category",
    target: 1,
    points: 400,
    icon: "🗺️",
  },
  {
    id: "collector",
    title: "Collector",
    desc: "Buy 5 different games",
    target: 5,
    points: 600,
    icon: "🎮",
  },
  {
    id: "veteran",
    title: "Veteran",
    desc: "Member for 6 months",
    target: 1,
    points: 500,
    icon: "⏳",
  },
  {
    id: "spender",
    title: "Big Spender",
    desc: "Spend $500 total",
    target: 1,
    points: 1000,
    icon: "💎",
  },
];

export default function Loyalty() {
  const { getCurrentTier, getPoints, getNextTier, getTierProgress } =
    useLoyaltyStore();
  const { profile } = useAuthStore();
  const currentTier = getCurrentTier();
  const points = getPoints();
  const nextTier = getNextTier();
  const progress = getTierProgress();
  const [activeTab, setActiveTab] = useState("overview");

  // Find current tier index
  const currentTierIndex = tiers.findIndex(
    (t) => t.name.toLowerCase() === (profile?.loyalty_tier || "bronze"),
  );
  const nextTierData =
    currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
  const pointsToNext = nextTierData ? nextTierData.min - points : 0;
  const rewardAmount = Math.floor(points / 10000);

  return (
    <>
      <SEO title="Loyalty Program" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-full mx-auto"
      >
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-arcane-purple/20 via-arcane-dark to-arcane-gold/10 p-6 sm:p-10">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                  Loyalty Program
                </h1>
                <p className="text-text-muted mt-1">
                  Earn points and unlock exclusive rewards
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentTier.bg} ${currentTier.color}`}
              >
                <span className="text-xl">{currentTier.icon}</span>
                <span className="font-semibold">{currentTier.name} Rank</span>
              </div>
            </div>

            {nextTierData && (
              <div className="mt-6 p-4 rounded-xl bg-arcane-dark/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">{currentTier.name}</span>
                  <span className="text-sm text-white">
                    {nextTierData.name}
                  </span>
                </div>
                <div className="w-full h-3 bg-arcane-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-arcane-gold rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-arcane-gold mt-2 font-medium">
                  {pointsToNext.toLocaleString()} points left till{" "}
                  {nextTierData.name} {nextTierData.icon}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-arcane-border pb-2">
          {["overview", "achievements", "tiers"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all hover:cursor-pointer ${
                activeTab === tab
                  ? "bg-arcane-gold text-arcane-dark"
                  : "text-white bg-arcane-dark"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Points Balance */}
            <GlassCard className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <div className="w-32 h-32 sm:w-40 sm:h-40 mb-2">
                  <img
                    src={LoyaltyImage}
                    alt="Loyalty Program"
                    className="w-full h-full object-contain"
                  />
                </div>{" "}
              </div>
              <p className="text-3xl font-extrabold text-white">
                {points.toLocaleString()}
              </p>
              <p className="text-text-muted text-sm">Available Points</p>
              <p className="text-text-muted text-xs mt-2">
                Collect 10,000 points to unlock $1.00 Store Credit
              </p>
              {rewardAmount > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-arcane-gold/10 rounded-full">
                  <HiOutlineGift className="w-4 h-4 text-arcane-gold" />
                  <span className="text-arcane-gold font-medium">
                    ${rewardAmount.toFixed(2)} Store Credit Available
                  </span>
                </div>
              )}
            </GlassCard>

            {/* How it Works */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                How it Works
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    step: "1",
                    title: "Buy & Earn",
                    desc: "Earn points on every purchase across all games",
                  },
                  {
                    step: "2",
                    title: "Complete Tasks",
                    desc: "Unlock achievements for bonus points",
                  },
                  {
                    step: "3",
                    title: "Redeem Rewards",
                    desc: "Convert points to store credit",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="p-4 rounded-xl bg-arcane-surface text-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-arcane-purple/20 text-arcane-purple flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                      {item.step}
                    </div>
                    <h3 className="text-white font-medium text-sm">
                      {item.title}
                    </h3>
                    <p className="text-text-muted text-xs mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Achievements</h2>
              <span className="text-sm text-text-muted">
                0 / {achievements.length} completed
              </span>
            </div>
            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-arcane-surface border border-arcane-border"
                >
                  <div className="w-12 h-12 rounded-xl bg-arcane-elevated flex items-center justify-center text-2xl flex-shrink-0">
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-sm">
                      {ach.title}
                    </h3>
                    <p className="text-text-muted text-xs">{ach.desc}</p>
                    <p className="text-xs text-text-muted mt-1">
                      0 / {ach.target}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-arcane-gold text-sm font-medium">
                      +{ach.points} pts
                    </span>
                    <p className="text-xs text-text-muted">To unlock</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Tiers Tab */}
        {activeTab === "tiers" && (
          <div className="space-y-4">
            {tiers.map((tier, i) => (
              <GlassCard
                key={tier.name}
                className={`p-5 ${currentTier.name === tier.name ? "border-arcane-gold/30" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${tier.bg} flex items-center justify-center text-2xl`}
                    >
                      {tier.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold ${tier.color}`}>{tier.name}</h3>
                      <p className="text-text-muted text-xs">
                        {tier.min.toLocaleString()}+ points required
                      </p>
                    </div>
                  </div>
                  {i <= currentTierIndex ? (
                    <HiOutlineCheck className="w-6 h-6 text-success" />
                  ) : (
                    <HiOutlineLockClosed className="w-5 h-5 text-text-muted" />
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}
