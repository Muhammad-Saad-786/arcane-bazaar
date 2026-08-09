import { motion } from "framer-motion";
import { HiOutlineStar, HiOutlineGift } from "react-icons/hi";
import useLoyaltyStore from "../../stores/useLoyaltyStore";
import GlassCard from "../../components/ui/GlassCard";
import LoyaltyBadge from "../../components/ui/LoyaltyBadge";

const tiers = [
  {
    name: "Bronze",
    icon: "🥉",
    color: "text-amber-600",
    bg: "bg-amber-600/5",
    points: "0",
    benefits: ["Standard support", "Basic marketplace access"],
  },
  {
    name: "Silver",
    icon: "🥈",
    color: "text-gray-300",
    bg: "bg-gray-300/5",
    points: "100",
    benefits: ["Priority support", "Faster withdrawals", "Silver badge"],
  },
  {
    name: "Gold",
    icon: "🥇",
    color: "text-arcane-gold",
    bg: "bg-arcane-gold/5",
    points: "500",
    benefits: [
      "24/7 VIP support",
      "Instant withdrawals",
      "Gold badge",
      "Exclusive deals",
    ],
  },
  {
    name: "Diamond",
    icon: "💎",
    color: "text-cyan-400",
    bg: "bg-cyan-400/5",
    points: "2,000",
    benefits: [
      "Dedicated account manager",
      "Custom offers",
      "Diamond badge",
      "Early access",
    ],
  },
  {
    name: "Elite",
    icon: "👑",
    color: "text-arcane-purple",
    bg: "bg-arcane-purple/5",
    points: "5,000",
    benefits: [
      "Everything in Diamond",
      "Exclusive marketplace",
      "Elite badge",
      "Revenue sharing",
    ],
  },
];

export default function Loyalty() {
  const { getCurrentTier, getPoints, getTierProgress, getNextTier } =
    useLoyaltyStore();
  const currentTier = getCurrentTier();
  const points = getPoints();
  const nextTier = getNextTier();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Loyalty Program
      </h1>

      {/* Current Status */}
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div
            className={`w-20 h-20 rounded-2xl ${currentTier.bg} flex items-center justify-center text-4xl`}
          >
            {currentTier.icon}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className={`text-xl font-bold ${currentTier.color}`}>
                {currentTier.name} Rank
              </span>
            </div>
            <p className="text-3xl font-extrabold text-white mt-1">
              {points.toLocaleString()}
            </p>
            <p className="text-text-muted text-sm">Loyalty Points</p>
            {nextTier && (
              <p className="text-text-muted text-xs mt-2">
                {nextTier.pointsNeeded.toLocaleString()} points to reach{" "}
                {nextTier.name} {nextTier.icon}
              </p>
            )}
          </div>
          <LoyaltyBadge showProgress size="lg" />
        </div>
      </GlassCard>

      {/* All Tiers */}
      <h2 className="text-xl font-display font-extrabold text-white mt-8">
        All Tiers
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiers.map((tier) => (
          <GlassCard
            key={tier.name}
            className={`p-5 ${currentTier.name === tier.name ? "border-arcane-gold/30" : ""}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{tier.icon}</span>
              <div>
                <p className={`font-bold ${tier.color}`}>{tier.name}</p>
                <p className="text-xs text-text-muted">{tier.points}+ points</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {tier.benefits.map((b) => (
                <li
                  key={b}
                  className="text-xs text-text-secondary flex items-center gap-2"
                >
                  <HiOutlineGift className="w-3 h-3 text-arcane-gold flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
}
